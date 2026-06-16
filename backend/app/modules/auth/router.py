from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel

from app.modules.auth.schemas import UserSchema
from app.core.dependencies import get_current_user, get_current_user_clerk_id
from app.modules.auth.models import User
from app.core.database import get_db

router = APIRouter(prefix="/auth", tags=["auth"])

@router.get("/me", response_model=UserSchema)
async def get_me(user: User = Depends(get_current_user)):
    return user

class SyncUserRequest(BaseModel):
    clerk_id: str
    email: str | None = None
    full_name: str | None = None

@router.post("/sync", response_model=UserSchema)
async def sync_user(
    data: SyncUserRequest,
    db: AsyncSession = Depends(get_db),
    # Ensure they have a valid clerk token before allowing sync!
    current_clerk_id: str = Depends(get_current_user_clerk_id)
):
    if data.clerk_id != current_clerk_id:
        raise HTTPException(status_code=403, detail="Clerk ID mismatch")
        
    # This endpoint allows the frontend to manually sync the user 
    # to avoid infinite loops if the Clerk webhook is delayed or not configured.
    result = await db.execute(select(User).where(User.clerk_user_id == data.clerk_id))
    user = result.scalars().first()
    
    if user:
        return user
        
    # Create new user
    new_user = User(
        clerk_user_id=data.clerk_id,
        email=data.email or f"{data.clerk_id}@placeholder.com",
        full_name=data.full_name or "New User",
        role="STUDENT"
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user
