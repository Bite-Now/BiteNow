from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.modules.auth.schemas import VendorApplicationCreate, VendorApplicationSchema
from app.modules.auth.models import VendorApplication, User
from app.modules.orders.models import Notification
from app.core.dependencies import get_current_user

router = APIRouter(prefix="/vendor", tags=["vendor"])

@router.post("/apply", response_model=VendorApplicationSchema)
async def apply_for_vendor(
    payload: VendorApplicationCreate,
    db: AsyncSession = Depends(get_db)
):
    application = VendorApplication(
        full_name=payload.full_name,
        email=payload.email,
        canteen_name=payload.canteen_name,
        location=payload.location,
        phone=payload.phone,
        status="PENDING"
    )
    db.add(application)
    
    # Notify Admins
    admin_result = await db.execute(select(User.id).where(User.role == "ADMIN"))
    admin_ids = admin_result.scalars().all()
    for admin_id in admin_ids:
        notification = Notification(
            user_id=admin_id,
            title="New Vendor Request",
            message=f"{payload.full_name} has requested to join as {payload.canteen_name}."
        )
        db.add(notification)
        
    await db.commit()
    await db.refresh(application)
    return application

@router.get("/application-status", response_model=VendorApplicationSchema)
async def get_application_status(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # This assumes the user's email matches the vendor application email
    result = await db.execute(
        select(VendorApplication)
        .where(VendorApplication.email == user.email)
        .order_by(VendorApplication.submitted_at.desc())
    )
    application = result.scalars().first()
    
    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Vendor application not found")
        
    return application
