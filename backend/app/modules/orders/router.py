from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_strict_student, require_staff, require_owner
from app.modules.auth.models import User, Canteen, StaffAssignment
from app.modules.orders.schemas import OrderCreateRequest, OrderResponse, MockFailureRequest
from app.modules.orders.repository import OrderRepository
from app.modules.orders.service import OrderService
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

@payments_router.post("/mock-success", response_model=OrderResponse)
async def mock_payment_success(
    request: OrderCreateRequest,
    user: User = Depends(require_strict_student),
    service: OrderService = Depends(get_order_service)
):
    """
    Simulates a successful payment and creates the PAID order statelessly.
    """
    return await service.create_paid_order(user.id, request)

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

from app.modules.orders.schemas import OrderCreateRequest, OrderResponse, MockFailureRequest, NotificationResponse

# -----------------
# Notifications
# -----------------
notifications_router = APIRouter(prefix="/notifications", tags=["Notifications"])

@notifications_router.get("", response_model=List[NotificationResponse])
async def get_my_notifications(
    user: User = Depends(require_strict_student),
    service: OrderService = Depends(get_order_service)
):
    return await service.get_notifications(user.id)

@notifications_router.patch("/{notification_id}/read", response_model=NotificationResponse)
async def read_notification(
    notification_id: UUID,
    user: User = Depends(require_strict_student),
    service: OrderService = Depends(get_order_service)
):
    return await service.mark_notification_read(notification_id, user.id)
