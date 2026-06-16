from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
from datetime import datetime, timezone

from app.core.database import get_db
from app.modules.auth.schemas import VendorApplicationSchema, UserSchema
from app.modules.auth.models import VendorApplication, User, Canteen
from app.core.dependencies import require_admin
from app.core.clerk import create_user

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/vendor-applications", response_model=List[VendorApplicationSchema])
async def list_vendor_applications(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(VendorApplication).order_by(VendorApplication.submitted_at.desc()))
    return result.scalars().all()

@router.get("/vendor-applications/{application_id}", response_model=VendorApplicationSchema)
async def get_vendor_application(
    application_id: UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(VendorApplication).where(VendorApplication.id == application_id))
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app

@router.patch("/vendor-applications/{application_id}/approve")
async def approve_vendor_application(
    application_id: UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(VendorApplication).where(VendorApplication.id == application_id))
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if app.status != "PENDING":
        raise HTTPException(status_code=400, detail="Application already processed")
        
    try:
        # Create Canteen first so we have the UUID
        canteen = Canteen(
            name=app.canteen_name,
            slug=app.canteen_name.lower().replace(" ", "-"),
            is_active=True
        )
        db.add(canteen)
        await db.flush() # flush to get canteen.id
        
        # Create Clerk User
        clerk_user = await create_user(
            email_address=app.email,
            password="TemporaryPassword123!", # Should use Clerk email invitations
            public_metadata={
                "role": "OWNER",
                "canteen_id": str(canteen.id)
            }
        )
        
        # Create DB User
        owner = User(
            clerk_user_id=clerk_user.id,
            email=app.email,
            full_name=app.full_name,
            role="OWNER",
            canteen_id=canteen.id
        )
        db.add(owner)
        await db.flush()
        
        canteen.owner_id = owner.id
        
        app.status = "APPROVED"
        app.reviewed_at = datetime.now(timezone.utc)
        app.reviewed_by = admin.id
        
        await db.commit()
        return {"message": "Vendor approved successfully"}
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/vendor-applications/{application_id}/reject")
async def reject_vendor_application(
    application_id: UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(VendorApplication).where(VendorApplication.id == application_id))
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    app.status = "REJECTED"
    app.reviewed_at = datetime.now(timezone.utc)
    app.reviewed_by = admin.id
    
    await db.commit()
    return {"message": "Vendor rejected"}

@router.get("/users", response_model=List[UserSchema])
async def list_users(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User))
    return result.scalars().all()

@router.patch("/users/{user_id}/activate")
async def activate_user(
    user_id: UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_active = True
    await db.commit()
    return {"message": "User activated"}

@router.patch("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_active = False
    await db.commit()
    return {"message": "User deactivated"}
