from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.modules.auth.schemas import StaffCreate, UserSchema
from app.modules.auth.models import User, StaffAssignment
from app.core.dependencies import require_owner
from app.core.clerk import create_user

router = APIRouter(prefix="/owner/staff", tags=["owner", "staff"])

@router.get("", response_model=List[UserSchema])
async def get_staff(
    owner: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db)
):
    if not owner.canteen_id:
        raise HTTPException(status_code=400, detail="Owner has no canteen assigned")
        
    result = await db.execute(
        select(User)
        .join(StaffAssignment, User.id == StaffAssignment.staff_id)
        .where(StaffAssignment.canteen_id == owner.canteen_id)
    )
    return result.scalars().all()

@router.post("", response_model=UserSchema)
async def add_staff(
    payload: StaffCreate,
    owner: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db)
):
    if not owner.canteen_id:
        raise HTTPException(status_code=400, detail="Owner has no canteen assigned")
        
    try:
        # Create clerk user
        clerk_user = await create_user(
            email_address=payload.email,
            password="TemporaryPassword123!", # Should be generated securely and emailed
            public_metadata={
                "role": "STAFF",
                "canteen_id": str(owner.canteen_id)
            }
        )
        
        # Staff record inserted into Supabase via Webhook ideally, 
        # but the PRD says "Create staff assignment linked to owner's canteen" 
        # so we will wait for the webhook, or we can create it directly.
        # Direct creation is safer here to ensure StaffAssignment is linked immediately.
        
        staff_user = User(
            clerk_user_id=clerk_user.id,
            email=payload.email,
            full_name=payload.full_name,
            role="STAFF",
            canteen_id=owner.canteen_id
        )
        db.add(staff_user)
        await db.flush()
        
        assignment = StaffAssignment(
            staff_id=staff_user.id,
            canteen_id=owner.canteen_id,
            assigned_by=owner.id
        )
        db.add(assignment)
        await db.commit()
        await db.refresh(staff_user)
        
        return staff_user
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{staff_id}/deactivate")
async def deactivate_staff(
    staff_id: UUID,
    owner: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(User).join(StaffAssignment)
        .where(User.id == staff_id, StaffAssignment.canteen_id == owner.canteen_id)
    )
    staff = result.scalars().first()
    
    if not staff:
        raise HTTPException(status_code=404, detail="Staff not found")
        
    staff.is_active = False
    await db.commit()
    return {"message": "Staff deactivated"}

@router.delete("/{staff_id}")
async def remove_staff(
    staff_id: UUID,
    owner: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(StaffAssignment).where(
            StaffAssignment.staff_id == staff_id, 
            StaffAssignment.canteen_id == owner.canteen_id
        )
    )
    assignment = result.scalars().first()
    
    if not assignment:
        raise HTTPException(status_code=404, detail="Staff assignment not found")
        
    await db.delete(assignment)
    await db.commit()
    return {"message": "Staff assignment removed"}
