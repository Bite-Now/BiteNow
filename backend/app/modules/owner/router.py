import logging
import mimetypes
import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from uuid import UUID

from app.core.database import get_db
from app.modules.auth.schemas import StaffCreate, UserSchema, CanteenUpdate
from app.modules.auth.models import User, StaffAssignment, Canteen
from app.core.dependencies import require_owner
from app.core.clerk import create_user, clerk_client
from app.core.supabase_client import supabase
from app.core.storage import upload_image_or_400, cleanup_orphaned_image

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/owner/staff", tags=["owner", "staff"])
canteen_router = APIRouter(prefix="/owner/canteen", tags=["owner", "canteen"])

VALID_IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


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
    name: str = Form(None),
    description: str = Form(None),
    is_open: bool = Form(None),
    image_url: str = Form(None),
    file: UploadFile = File(None),
    owner: User = Depends(require_owner),
    db: AsyncSession = Depends(get_db)
):
    if not owner.canteen_id:
        raise HTTPException(status_code=400, detail="Owner has no canteen assigned")

    result = await db.execute(select(Canteen).where(Canteen.id == owner.canteen_id))
    canteen = result.scalars().first()

    if not canteen:
        raise HTTPException(status_code=404, detail="Canteen not found")

    old_image_url = canteen.image_url
    new_image_url = image_url
    new_filename = None

    if file:
        new_image_url, new_filename = await upload_image_or_400(file)

    if name is not None:
        canteen.name = name
    if description is not None:
        canteen.description = description
    if new_image_url is not None:
        canteen.image_url = new_image_url
    if is_open is not None:
        canteen.is_open = is_open

    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        # If DB update fails, delete the new image to prevent orphans
        if file and new_filename:
            await cleanup_orphaned_image(new_filename)
        logger.error(f"Database update failed for canteen {owner.canteen_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Database update failed")

    # If DB update succeeded and we uploaded a new file, delete the old file
    if file and old_image_url and "supabase.co" in old_image_url:
        old_filename = old_image_url.split('/')[-1]
        await cleanup_orphaned_image(old_filename)

    return {"message": "Canteen settings updated successfully"}


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
        # Check if user already exists
        result = await db.execute(select(User).where(User.email == payload.email))
        staff_user = result.scalars().first()

        if staff_user:
            # Never let an invite silently demote/reassign an existing owner
            if staff_user.role == "OWNER":
                raise HTTPException(status_code=400, detail="Cannot invite an existing owner as staff.")

            # Already active staff at this canteen - nothing to do
            if staff_user.role == "STAFF" and staff_user.canteen_id == owner.canteen_id and staff_user.is_active:
                raise HTTPException(status_code=400, detail="User is already staff for this canteen")

            # Already staff at a DIFFERENT canteen - block silent poaching/reassignment
            if staff_user.role == "STAFF" and staff_user.canteen_id and staff_user.canteen_id != owner.canteen_id:
                raise HTTPException(
                    status_code=400,
                    detail="This user is already staff at a different canteen."
                )

            # Either new staff, or a previously-deactivated staff member being reactivated/re-invited
            staff_user.role = "STAFF"
            staff_user.canteen_id = owner.canteen_id
            staff_user.is_active = True
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
            logger.warning(f"Clerk invitation failed (user might already exist in Clerk): {clerk_err}")

        await db.commit()
        await db.refresh(staff_user)

        return staff_user

    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        logger.error(f"Failed to add staff member: {e}", exc_info=True)
        await db.rollback()
        raise HTTPException(status_code=500, detail="Failed to add staff member")


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

    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to deactivate staff {staff_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to deactivate staff")

    return {"message": "Staff deactivated"}


@router.post("/{staff_id}/resend")
async def resend_invitation(
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

    if staff.is_active or not staff.clerk_user_id.startswith("pending_"):
        raise HTTPException(status_code=400, detail="Staff is already active. Cannot resend invitation.")

    try:
        clerk_client.invitations.create(
            request={
                "email_address": staff.email,
                "public_metadata": {
                    "role": "STAFF",
                    "canteen_id": str(owner.canteen_id)
                }
            }
        )
    except Exception as clerk_err:
        logger.error(f"Clerk invitation resend failed: {clerk_err}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to resend invitation via Clerk")

    return {"message": "Invitation resent successfully"}

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

    # Find user
    user_result = await db.execute(select(User).where(User.id == staff_id))
    staff_user = user_result.scalars().first()

    clerk_user_id = staff_user.clerk_user_id if staff_user else None

    # Always delete the assignment
    await db.delete(assignment)
    
    if staff_user:
        if clerk_user_id and clerk_user_id.startswith("pending_"):
            # Pending user with no activity can be safely deleted
            await db.delete(staff_user)
        else:
            # Active user should be demoted, not deleted
            staff_user.role = "CUSTOMER"
            staff_user.canteen_id = None

    try:
        await db.commit()
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to remove staff {staff_id}: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to remove staff member")

    # Only touch Clerk AFTER the DB transaction has successfully committed
    if clerk_user_id:
        try:
            if clerk_user_id.startswith("pending_"):
                # Can't delete pending user directly by ID from Clerk if it doesn't exist,
                # but we can try just in case, or revoke invitation.
                pass
            else:
                # For active user, we should update their public metadata to remove role
                clerk_client.users.update_metadata(
                    user_id=clerk_user_id,
                    public_metadata={}
                )
        except Exception as e:
            logger.error(f"Failed to update clerk user {clerk_user_id}: {e}", exc_info=True)

    return {"message": "Staff removed successfully"}