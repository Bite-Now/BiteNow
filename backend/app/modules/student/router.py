from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, extract
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone
from fastapi import Query

from app.core.database import get_db
from app.core.dependencies import require_strict_student
from app.modules.auth.models import User, Wallet, Canteen
from app.modules.orders.models import Order
from app.modules.student.surprise_service import SurpriseService
from app.modules.student.ai_chef_service import AIChefService

router = APIRouter(prefix="/student", tags=["Student"])


# ----- Schemas -----

class WalletResponse(BaseModel):
    monthly_budget_limit: int
    total_spent_this_month: float
    remaining_balance: float
    transactions: List[dict]
    canteen_breakdown: List[dict]

class UpdateLimitRequest(BaseModel):
    monthly_budget_limit: int


# ----- Helpers -----

async def _get_or_create_wallet(db: AsyncSession, user_id) -> Wallet:
    """Get wallet for user, or create one with default limit if missing."""
    result = await db.execute(select(Wallet).where(Wallet.user_id == user_id))
    wallet = result.scalars().first()
    if not wallet:
        wallet = Wallet(user_id=user_id)
        db.add(wallet)
        await db.commit()
        await db.refresh(wallet)
    return wallet


async def _get_monthly_spending(db: AsyncSession, user_id) -> float:
    """Sum of total_amount for all orders this month for the student."""
    now = datetime.now(timezone.utc)
    stmt = (
        select(func.coalesce(func.sum(Order.total_amount), 0))
        .where(
            Order.student_id == user_id,
            extract("month", Order.created_at) == now.month,
            extract("year", Order.created_at) == now.year,
            Order.status.in_(["PAID", "PREPARING", "READY", "PICKED_UP"])
        )
    )
    result = await db.execute(stmt)
    return float(result.scalar())


async def _get_recent_transactions(db: AsyncSession, user_id, limit: int = 20) -> List[dict]:
    """Fetch recent orders as transaction records."""
    stmt = (
        select(Order, Canteen.name.label("canteen_name"))
        .outerjoin(Canteen, Order.canteen_id == Canteen.id)
        .where(Order.student_id == user_id)
        .order_by(Order.created_at.desc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    rows = result.all()

    transactions = []
    for order, canteen_name in rows:
        transactions.append({
            "id": str(order.id),
            "amount": float(order.total_amount),
            "canteenId": canteen_name or "Unknown",
            "category": "Food",
            "timestamp": order.created_at.isoformat() if order.created_at else None,
            "status": order.status,
        })
    return transactions


async def _get_canteen_breakdown(db: AsyncSession, user_id) -> List[dict]:
    """Group spending by canteen for the current month."""
    now = datetime.now(timezone.utc)
    stmt = (
        select(
            Canteen.name,
            func.coalesce(func.sum(Order.total_amount), 0).label("total")
        )
        .join(Canteen, Order.canteen_id == Canteen.id)
        .where(
            Order.student_id == user_id,
            extract("month", Order.created_at) == now.month,
            extract("year", Order.created_at) == now.year,
            Order.status.in_(["PAID", "PREPARING", "READY", "PICKED_UP"])
        )
        .group_by(Canteen.name)
        .order_by(func.sum(Order.total_amount).desc())
    )
    result = await db.execute(stmt)
    return [{"name": name, "value": float(total)} for name, total in result.all()]


# ----- Endpoints -----

@router.get("/wallet", response_model=WalletResponse)
async def get_wallet(
    user: User = Depends(require_strict_student),
    db: AsyncSession = Depends(get_db)
):
    """Get the student's wallet data with live spending stats."""
    wallet = await _get_or_create_wallet(db, user.id)
    spent = await _get_monthly_spending(db, user.id)
    transactions = await _get_recent_transactions(db, user.id)
    canteen_breakdown = await _get_canteen_breakdown(db, user.id)

    return WalletResponse(
        monthly_budget_limit=wallet.monthly_budget_limit,
        total_spent_this_month=spent,
        remaining_balance=max(0, wallet.monthly_budget_limit - spent),
        transactions=transactions,
        canteen_breakdown=canteen_breakdown,
    )


@router.patch("/wallet/limit", response_model=WalletResponse)
async def update_wallet_limit(
    request: UpdateLimitRequest,
    user: User = Depends(require_strict_student),
    db: AsyncSession = Depends(get_db)
):
    """Update the student's monthly budget limit."""
    if request.monthly_budget_limit <= 0:
        raise HTTPException(status_code=400, detail="Budget limit must be positive")

    wallet = await _get_or_create_wallet(db, user.id)
    wallet.monthly_budget_limit = request.monthly_budget_limit
    await db.commit()
    await db.refresh(wallet)

    spent = await _get_monthly_spending(db, user.id)
    transactions = await _get_recent_transactions(db, user.id)
    canteen_breakdown = await _get_canteen_breakdown(db, user.id)

    return WalletResponse(
        monthly_budget_limit=wallet.monthly_budget_limit,
        total_spent_this_month=spent,
        remaining_balance=max(0, wallet.monthly_budget_limit - spent),
        transactions=transactions,
        canteen_breakdown=canteen_breakdown,
    )

@router.get("/surprise")
async def get_surprise(
    budget: float = Query(..., gt=0, description="The maximum budget for the surprise meal"),
    user: User = Depends(require_strict_student),
    db: AsyncSession = Depends(get_db)
):
    """Get 5 curated surprise meal options based on budget."""
    # Attempt AI Generation first
    try:
        ai_service = AIChefService(db)
        cards = await ai_service.generate_ai_combos(budget)
        if len(cards) >= 1:
            return {"combos": cards}
    except Exception as e:
        print(f"AI Chef Generation failed, falling back to programmatic engine: {e}")
        
    # Fallback to programmatic engine
    service = SurpriseService(db)
    cards = await service.generate_surprises(user.id, budget)
    return {"combos": cards}
