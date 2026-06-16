from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.modules.auth.schemas import VendorApplicationCreate, VendorApplicationSchema
from app.modules.auth.models import VendorApplication, User
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
        phone=payload.phone,
        status="PENDING"
    )
    db.add(application)
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
