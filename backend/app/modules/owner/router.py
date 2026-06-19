from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.modules.auth.schemas import StaffCreate, UserSchema, CanteenUpdate
from app.modules.auth.models import User, StaffAssignment, Canteen
from app.core.dependencies import require_owner
from app.core.clerk import create_user

router = APIRouter(prefix="/owner/staff", tags=["owner", "staff"])
canteen_router = APIRouter(prefix="/owner/canteen", tags=["owner", "canteen"])

@canteen_router.get("", response_model=dict)
async def get_canteen(
    owner: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db)
):
    if not owner.canteen_id:
        raise HTTPException(status_code=400, detail="Owner has no canteen assigned")
        
    result = await db.execute(select(Canteen).where(Canteen.id == owner.canteen_id))
    canteen = result.scalars().first()
    
    if not canteen:
        raise HTTPException(status_code=404, detail="Canteen not found")
        
    return {
        "id": canteen.id,
        "name": canteen.name,
        "description": canteen.description,
        "image_url": canteen.image_url,
        "is_open": canteen.is_open
    }

@canteen_router.patch("", response_model=dict)
async def update_canteen(
    data: CanteenUpdate,
    owner: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db)
):
    if not owner.canteen_id:
        raise HTTPException(status_code=400, detail="Owner has no canteen assigned")
        
    result = await db.execute(select(Canteen).where(Canteen.id == owner.canteen_id))
    canteen = result.scalars().first()
    
    if not canteen:
        raise HTTPException(status_code=404, detail="Canteen not found")
        
    if data.name is not None:
        canteen.name = data.name
    if data.description is not None:
        canteen.description = data.description
    if data.image_url is not None:
        canteen.image_url = data.image_url
    if data.is_open is not None:
        canteen.is_open = data.is_open
        
    await db.commit()
    await db.refresh(canteen)
    return {"message": "Canteen updated successfully"}

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

@router.post("/invite", response_model=UserSchema)
async def add_staff(
    payload: StaffCreate,
    owner: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db)
):
    if not owner.canteen_id:
        raise HTTPException(status_code=400, detail="Owner has no canteen assigned")
        
    try:
        from app.core.clerk import clerk_client
        import uuid
        
        # Check if user already exists
        result = await db.execute(select(User).where(User.email == payload.email))
        staff_user = result.scalars().first()
        
        if staff_user:
            if staff_user.role == "STAFF" and staff_user.canteen_id == owner.canteen_id:
                raise HTTPException(status_code=400, detail="User is already staff for this canteen")
            
            # Update existing user
            staff_user.role = "STAFF"
            staff_user.canteen_id = owner.canteen_id
        else:
            staff_user = User(
                clerk_user_id=f"pending_{uuid.uuid4()}",
                email=payload.email,
                full_name=payload.full_name,
                role="STAFF",
                canteen_id=owner.canteen_id,
                is_active=False
            )
            db.add(staff_user)
            
        await db.flush()
        
        # Check assignment
        assignment_result = await db.execute(
            select(StaffAssignment).where(
                StaffAssignment.staff_id == staff_user.id,
                StaffAssignment.canteen_id == owner.canteen_id
            )
        )
        assignment = assignment_result.scalars().first()
        if not assignment:
            assignment = StaffAssignment(
                staff_id=staff_user.id,
                canteen_id=owner.canteen_id,
                assigned_by=owner.id
            )
            db.add(assignment)
        
        try:
            clerk_client.invitations.create(
                request={
                    "email_address": payload.email,
                    "public_metadata": {
                        "role": "STAFF",
                        "canteen_id": str(owner.canteen_id)
                    }
                }
            )
        except Exception as clerk_err:
            print(f"[WARN] Clerk invitation failed (user might already exist in Clerk): {clerk_err}")
        
        await db.commit()
        await db.refresh(staff_user)
        
        return staff_user
        
    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        await db.rollback()
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
        
    # Find user to delete from clerk if exists
    user_result = await db.execute(select(User).where(User.id == staff_id))
    staff_user = user_result.scalars().first()
    
    await db.delete(assignment)
    if staff_user:
        await db.delete(staff_user)
        if staff_user.clerk_user_id:
            try:
                from app.core.clerk import clerk_client
                clerk_client.users.delete(user_id=staff_user.clerk_user_id)
            except Exception as e:
                print(f"[ERROR] Failed to delete clerk user: {e}")
                
    await db.commit()
    return {"message": "Staff removed successfully"}
