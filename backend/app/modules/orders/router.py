from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_strict_student, require_staff, require_owner
from app.modules.auth.models import User, Canteen, StaffAssignment
from app.modules.orders.schemas import (
    OrderCreateRequest, OrderResponse, MockFailureRequest, NotificationResponse, DashboardStatsResponse
)
from app.modules.orders.service import OrderService
from app.modules.orders.analytics_service import AnalyticsService, get_analytics_service
from app.modules.orders.repository import OrderRepository
from app.modules.menu.repository import MenuRepository
from sqlalchemy import select

router = APIRouter(prefix="/orders", tags=["Orders"])
payments_router = APIRouter(prefix="/payments", tags=["Payments"])

def get_order_service(db: AsyncSession = Depends(get_db)) -> OrderService:
    order_repo = OrderRepository(db)
    menu_repo = MenuRepository(db)
    return OrderService(order_repo, menu_repo)

# -----------------
# Mock Payment
# -----------------

@payments_router.post("/mock-success")
async def mock_payment_success(
    request: OrderCreateRequest,
    user: User = Depends(require_strict_student),
    service: OrderService = Depends(get_order_service),
    db: AsyncSession = Depends(get_db)
):
    """
    Simulates a successful payment and creates the PAID order statelessly.
    Also returns updated monthly spending for the student wallet.
    """
    from sqlalchemy import func as sqlfunc, extract
    from datetime import datetime, timezone
    from app.modules.orders.models import Order as OrderModel

    order = await service.create_paid_order(user.id, request)

    # Calculate updated monthly spending
    now = datetime.now(timezone.utc)
    stmt = (
        select(sqlfunc.coalesce(sqlfunc.sum(OrderModel.total_amount), 0))
        .where(
            OrderModel.student_id == user.id,
            extract("month", OrderModel.created_at) == now.month,
            extract("year", OrderModel.created_at) == now.year,
            OrderModel.status.in_(["PAID", "PREPARING", "READY", "PICKED_UP"])
        )
    )
    result = await db.execute(stmt)
    total_spent = float(result.scalar())

    # Return order data + wallet update
    order_data = OrderResponse.model_validate(order).model_dump()
    order_data["total_spent_this_month"] = total_spent
    return order_data

@payments_router.post("/mock-failed")
async def mock_payment_failed(
    request: MockFailureRequest,
    user: User = Depends(require_strict_student)
):
    """
    Simulates a failed payment. Does not save any records.
    """
    return {
        "success": False,
        "message": "Payment cancelled. Order not placed."
    }

# -----------------
# Student Orders
# -----------------

@router.get("", response_model=List[OrderResponse])
async def get_my_orders(
    user: User = Depends(require_strict_student),
    service: OrderService = Depends(get_order_service)
):
    """Fetch the student's own orders."""
    return await service.get_student_orders(user.id)

@router.get("/{order_id}", response_model=OrderResponse)
async def get_my_order(
    order_id: UUID,
    user: User = Depends(require_strict_student),
    service: OrderService = Depends(get_order_service)
):
    """Fetch a specific order."""
    order = await service.get_order_by_id(order_id)
    if not order or order.student_id != user.id:
        raise HTTPException(status_code=404, detail="Order not found")
    return order

# -----------------
# Staff Orders
# -----------------
staff_router = APIRouter(prefix="/staff/orders", tags=["Staff Orders"])

@staff_router.get("", response_model=List[OrderResponse])
async def get_staff_orders(
    user: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
    service: OrderService = Depends(get_order_service)
):
    # Use canteen_id directly from the User model
    if not user.canteen_id:
        raise HTTPException(status_code=403, detail="Not assigned to any canteen")
        
    return await service.get_staff_orders(user.canteen_id)

@staff_router.patch("/{order_id}/ready", response_model=OrderResponse)
async def ready_staff_order(
    order_id: UUID,
    user: User = Depends(require_staff),
    db: AsyncSession = Depends(get_db),
    service: OrderService = Depends(get_order_service)
):
    # Use canteen_id directly from the User model
    if not user.canteen_id:
        raise HTTPException(status_code=403, detail="Not assigned to any canteen")
        
    order = await service.get_order_by_id(order_id)
    if not order or order.canteen_id != user.canteen_id:
        raise HTTPException(status_code=404, detail="Order not found")
        
    return await service.mark_ready(order_id)

# -----------------
# Owner Orders
# -----------------
owner_router = APIRouter(prefix="/owner/orders", tags=["Owner Orders"])

@owner_router.get("", response_model=List[OrderResponse])
async def get_owner_orders(
    user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
    service: OrderService = Depends(get_order_service)
):
    # Find canteen_id for owner
    stmt = select(Canteen).where(Canteen.owner_id == user.id)
    res = await db.execute(stmt)
    canteen = res.scalars().first()
    if not canteen:
        raise HTTPException(status_code=403, detail="No canteen owned")
        
    return await service.get_owner_orders(canteen.id)

@owner_router.patch("/{order_id}/ready", response_model=OrderResponse)
async def ready_owner_order(
    order_id: UUID,
    user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
    service: OrderService = Depends(get_order_service)
):
    # Find canteen_id for owner
    stmt = select(Canteen).where(Canteen.owner_id == user.id)
    res = await db.execute(stmt)
    canteen = res.scalars().first()
    if not canteen:
        raise HTTPException(status_code=403, detail="No canteen owned")
        
    order = await service.get_order_by_id(order_id)
    if not order or order.canteen_id != canteen.id:
        raise HTTPException(status_code=404, detail="Order not found")
        
    return await service.mark_ready(order_id)

# -----------------
# Dashboard Analytics
# -----------------
dashboard_router = APIRouter(prefix="/owner/dashboard", tags=["Owner Dashboard"])

@dashboard_router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    user: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db),
    analytics_service: AnalyticsService = Depends(get_analytics_service)
):
    stmt = select(Canteen).where(Canteen.owner_id == user.id)
    res = await db.execute(stmt)
    canteen = res.scalars().first()
    if not canteen:
        raise HTTPException(status_code=403, detail="No canteen owned")
        
    return await analytics_service.get_vendor_dashboard_stats(canteen.id)

from app.modules.orders.schemas import OrderCreateRequest, OrderResponse, MockFailureRequest, NotificationResponse

# -----------------
# Notifications
# -----------------
notifications_router = APIRouter(prefix="/notifications", tags=["Notifications"])

@notifications_router.get("", response_model=List[NotificationResponse])
async def get_my_notifications(
    user: User = Depends(get_current_user),
    service: OrderService = Depends(get_order_service)
):
    return await service.get_notifications(user.id)

@notifications_router.patch("/{notification_id}/read", response_model=NotificationResponse)
async def read_notification(
    notification_id: UUID,
    user: User = Depends(get_current_user),
    service: OrderService = Depends(get_order_service)
):
    return await service.mark_notification_read(notification_id, user.id)

@notifications_router.delete("/bulk")
async def bulk_delete_notifications(
    notification_ids: List[UUID],
    user: User = Depends(get_current_user),
    service: OrderService = Depends(get_order_service)
):
    return await service.delete_notifications(notification_ids, user.id)
