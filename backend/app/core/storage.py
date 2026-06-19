import logging
import mimetypes
import uuid
import io
import asyncio
from typing import Optional

from fastapi import UploadFile, HTTPException
from PIL import Image

from app.core.supabase_client import supabase

logger = logging.getLogger(__name__)

VALID_IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024  # 2 MB

async def upload_image_or_400(file: UploadFile) -> tuple[str, str]:
    """
    Validates and uploads an image file to Supabase storage.
    Returns (public_url, filename). Raises HTTPException on any failure.
    """
    if file.content_type not in VALID_IMAGE_CONTENT_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Invalid file type. Only JPG, PNG, and WebP are allowed."
        )

    file_bytes = await file.read()

    if len(file_bytes) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"Image too large. Maximum allowed size is {MAX_IMAGE_SIZE_BYTES // (1024 * 1024)}MB."
        )

    # Validate the actual file content, not just the client-supplied Content-Type header,
    # since that header can be spoofed.
    def verify_image_sync(data_bytes: bytes):
        img = Image.open(io.BytesIO(data_bytes))
        img.verify()
        
    try:
        await asyncio.to_thread(verify_image_sync, file_bytes)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid or corrupted image file.")

    ext = mimetypes.guess_extension(file.content_type) or ".jpg"
    filename = f"{uuid.uuid4()}{ext}"

    try:
        supabase.storage.from_("BiteNowImage").upload(
            file=file_bytes,
            path=filename,
            file_options={"content-type": file.content_type}
        )
        public_url = supabase.storage.from_("BiteNowImage").get_public_url(filename)
        return public_url, filename
    except Exception as e:
        logger.error(f"Supabase upload error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to upload image to storage")

async def cleanup_orphaned_image(filename: Optional[str]) -> None:
    """Best-effort deletion of an uploaded image if a subsequent step fails."""
    if not filename:
        return
    try:
        supabase.storage.from_("BiteNowImage").remove([filename])
    except Exception as delete_err:
        logger.error(f"Failed to clean up orphaned image '{filename}': {delete_err}", exc_info=True)
