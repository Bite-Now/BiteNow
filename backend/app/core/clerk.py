from clerk_backend_api import Clerk
from app.core.config import settings
from typing import Dict, Any

clerk_client = Clerk(bearer_auth=settings.CLERK_SECRET_KEY)

async def update_user_metadata(user_id: str, metadata: Dict[str, Any]):
    """
    Update public metadata for a clerk user
    """
    res = clerk_client.users.update(
        user_id=user_id,
        public_metadata=metadata
    )
    return res

async def create_user(email_address: str, password: str, public_metadata: Dict[str, Any]):
    """
    Create a new user in clerk with specific metadata
    """
    res = clerk_client.users.create(
        email_address=[email_address],
        password=password,
        public_metadata=public_metadata,
        skip_password_checks=True
    )
    return res
