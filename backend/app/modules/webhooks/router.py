from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.security import verify_webhook_signature
from app.modules.auth.models import User

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

@router.post("/clerk")
async def clerk_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    payload = await request.body()
    headers = dict(request.headers)
    
    if not verify_webhook_signature(payload, headers):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid signature")
        
    data = await request.json()
    event_type = data.get("type")
    user_data = data.get("data", {})
    
    clerk_id = user_data.get("id")
    if not clerk_id:
        return {"message": "Ignored"}
        
    if event_type == "user.created":
        # Check if already exists (Admin flow creates via API)
        result = await db.execute(select(User).where(User.clerk_user_id == clerk_id))
        if not result.scalars().first():
            email = user_data.get("email_addresses", [{}])[0].get("email_address", "")
            first_name = user_data.get("first_name", "")
            last_name = user_data.get("last_name", "")
            
            # Use public metadata if available (for Staff/Owner created by API)
            public_metadata = user_data.get("public_metadata", {})
            role = public_metadata.get("role", "STUDENT")
            canteen_id = public_metadata.get("canteen_id")
            
            user = User(
                clerk_user_id=clerk_id,
                email=email,
                full_name=f"{first_name} {last_name}".strip(),
                role=role,
                canteen_id=canteen_id
            )
            db.add(user)
            await db.flush()  # Flush to get user.id
            
            if role == "STUDENT":
                from app.modules.auth.models import Wallet
                wallet = Wallet(user_id=user.id)
                db.add(wallet)
                
            await db.commit()
            
    elif event_type == "user.updated":
        result = await db.execute(select(User).where(User.clerk_user_id == clerk_id))
        user = result.scalars().first()
        if user:
            email = user_data.get("email_addresses", [{}])[0].get("email_address", "")
            first_name = user_data.get("first_name", "")
            last_name = user_data.get("last_name", "")
            public_metadata = user_data.get("public_metadata", {})
            
            user.email = email
            user.full_name = f"{first_name} {last_name}".strip()
            if "role" in public_metadata:
                user.role = public_metadata["role"]
            if "canteen_id" in public_metadata:
                user.canteen_id = public_metadata["canteen_id"]
                
            await db.commit()
            
    elif event_type == "user.deleted":
        result = await db.execute(select(User).where(User.clerk_user_id == clerk_id))
        user = result.scalars().first()
        if user:
            user.is_active = False
            await db.commit()

    return {"message": "Webhook processed"}
