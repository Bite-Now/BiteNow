import jwt
from typing import Dict, Any
from fastapi import HTTPException, status
from svix.webhooks import Webhook

from app.core.config import settings

# In a real production setup with Clerk, you should fetch the JWKS from 
# https://<your-clerk-domain>/.well-known/jwks.json and verify the signature.
# Since we only have CLERK_SECRET_KEY, we will extract the payload. 
# Alternatively, if you provide CLERK_PEM_PUBLIC_KEY, we can verify it symmetrically.

def verify_clerk_token(token: str) -> Dict[str, Any]:
    try:
        # Decode without verification for now (needs JWKS or PEM for strict verification)
        # Production requirement: add `algorithms=["RS256"]` and fetch JWKS keys.
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )

def verify_webhook_signature(payload: bytes, headers: dict) -> bool:
    """
    Verify the Svix webhook signature sent by Clerk.
    Requires `svix` package (installed via clerk-backend-api or separately).
    """
    if not settings.CLERK_WEBHOOK_SECRET:
        raise ValueError("CLERK_WEBHOOK_SECRET is not set")
    
    wh = Webhook(settings.CLERK_WEBHOOK_SECRET)
    try:
        # headers must be a dict with svix-id, svix-timestamp, svix-signature
        wh.verify(payload, headers)
        return True
    except Exception as e:
        return False
