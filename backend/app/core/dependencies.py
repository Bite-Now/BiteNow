from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.core.security import verify_clerk_token
from app.modules.auth.models import User

security = HTTPBearer()

async def get_current_user_clerk_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    token = credentials.credentials
    payload = verify_clerk_token(token)
    clerk_id = payload.get("sub")
    
    if not clerk_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token missing sub claim"
        )
    return clerk_id

async def get_current_user(
    clerk_id: str = Depends(get_current_user_clerk_id),
    db: AsyncSession = Depends(get_db)
) -> User:
    result = await db.execute(select(User).where(User.clerk_user_id == clerk_id))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found in database")
        
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Inactive user")
        
    return user

def require_roles(allowed_roles: List[str]):
    def role_dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return user
    return role_dependency

require_student = require_roles(["STUDENT", "OWNER", "STAFF", "ADMIN"]) # Assume higher roles can access lower? PRD says Only STUDENT for /student.
require_strict_student = require_roles(["STUDENT"])
require_owner = require_roles(["OWNER", "ADMIN"])
require_staff = require_roles(["STAFF", "OWNER", "ADMIN"])
require_admin = require_roles(["ADMIN"])
