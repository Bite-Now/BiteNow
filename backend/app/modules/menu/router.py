import logging
import mimetypes
import uuid
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, status, File, UploadFile, Form, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from PIL import Image
import io
import asyncio

from app.core.supabase_client import supabase
from app.core.database import get_db
from app.core.storage import upload_image_or_400, cleanup_orphaned_image
from app.core.dependencies import get_current_user, require_staff
from app.modules.auth.models import User
from app.modules.menu.repository import MenuRepository
from app.modules.menu.service import MenuService
from app.modules.menu.schemas import (
    CanteenResponse, MenuAggregatedResponse, DailySpecialResponse,
    MenuItemCreate, MenuItemUpdate, MenuItemResponse,
    DailySpecialCreate, DailySpecialUpdate
)

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Menu"])

VALID_IMAGE_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024  # 5 MB


def get_menu_service(db: AsyncSession = Depends(get_db)) -> MenuService:
    repository = MenuRepository(db)
    return MenuService(repository)


# ---------------------------------------------------------------------------
# Shared image upload helpers moved to app.core.storage


# ---------------------------------------------------------------------------
# Public / Generic Endpoints (Accessible to any authenticated user)
# ---------------------------------------------------------------------------

@router.get("/canteens", response_model=List[CanteenResponse])
async def list_canteens(
    service: MenuService = Depends(get_menu_service),
    current_user: User = Depends(get_current_user)
):
    """List all active canteens."""
    return await service.get_canteens()


@router.get("/canteens/{canteen_id}/menu", response_model=MenuAggregatedResponse)
async def get_menu(
    canteen_id: UUID,
    service: MenuService = Depends(get_menu_service),
    current_user: User = Depends(get_current_user)
):
    """Fetch a canteen's menu grouped by category along with daily specials."""
    return await service.get_canteen_menu(canteen_id)


@router.get("/canteens/{canteen_id}/specials", response_model=List[DailySpecialResponse])
async def get_specials(
    canteen_id: UUID,
    service: MenuService = Depends(get_menu_service),
    current_user: User = Depends(get_current_user)
):
    """Fetch daily specials for a specific canteen."""
    return await service.get_canteen_specials(canteen_id)


# ---------------------------------------------------------------------------
# Owner Protected Endpoints
# ---------------------------------------------------------------------------

owner_router = APIRouter(prefix="/owner", tags=["Owner Menu"], dependencies=[Depends(require_staff)])


@owner_router.post(
    "/canteens/{canteen_id}/menu",
    response_model=MenuItemResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_menu_item(
    canteen_id: UUID,
    name: str = Form(...),
    price: float = Form(...),
    description: Optional[str] = Form(None),
    category: Optional[str] = Form(None),
    is_available: bool = Form(True),
    image_url: Optional[str] = Form(None),
    file: UploadFile = File(None),
    service: MenuService = Depends(get_menu_service),
    current_user: User = Depends(get_current_user)
):
    """Create a new menu item."""
    # NOTE: Confirm MenuService.create_menu_item verifies current_user owns/manages
    # canteen_id before inserting. If it does not, this endpoint currently allows
    # any staff user to create items under any canteen.
    new_image_url = image_url
    new_filename = None

    if file:
        new_image_url, new_filename = await upload_image_or_400(file)

    data = MenuItemCreate(
        name=name,
        description=description,
        price=price,
        category=category,
        image_url=new_image_url,
        is_available=is_available
    )

    try:
        return await service.create_menu_item(canteen_id, data, current_user)
    except Exception:
        # Rollback: delete the newly uploaded image if database insert fails
        await cleanup_orphaned_image(new_filename)
        raise


@owner_router.patch("/menu/{item_id}", response_model=MenuItemResponse)
async def update_menu_item(
    item_id: UUID,
    data: MenuItemUpdate,
    service: MenuService = Depends(get_menu_service),
    current_user: User = Depends(get_current_user)
):
    """Update a menu item."""
    # NOTE: Confirm MenuService.update_menu_item verifies the item belongs to a
    # canteen owned/managed by current_user before updating (and returns 403/404
    # otherwise). Without that check this is an IDOR vulnerability.
    return await service.update_menu_item(item_id, data, current_user)


@owner_router.delete("/menu/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_menu_item(
    item_id: UUID,
    service: MenuService = Depends(get_menu_service),
    current_user: User = Depends(get_current_user)
):
    """Delete a menu item."""
    # NOTE: Same ownership check requirement as update_menu_item above.
    await service.delete_menu_item(item_id, current_user)


@owner_router.post(
    "/canteens/{canteen_id}/specials",
    response_model=DailySpecialResponse,
    status_code=status.HTTP_201_CREATED
)
async def create_daily_special(
    canteen_id: UUID,
    name: str = Form(...),
    price: float = Form(...),
    description: Optional[str] = Form(None),
    is_available: bool = Form(True),
    image_url: Optional[str] = Form(None),
    file: UploadFile = File(None),
    service: MenuService = Depends(get_menu_service),
    current_user: User = Depends(get_current_user)
):
    """Create a new daily special."""
    # NOTE: Confirm MenuService.create_daily_special verifies current_user owns/manages
    # canteen_id before inserting.
    new_image_url = image_url
    new_filename = None

    if file:
        new_image_url, new_filename = await upload_image_or_400(file)

    data = DailySpecialCreate(
        name=name,
        description=description,
        price=price,
        is_available=is_available,
        image_url=new_image_url
    )

    try:
        return await service.create_daily_special(canteen_id, data, current_user)
    except Exception:
        await cleanup_orphaned_image(new_filename)
        raise


@owner_router.patch("/specials/{special_id}", response_model=DailySpecialResponse)
async def update_daily_special(
    special_id: UUID,
    data: DailySpecialUpdate,
    service: MenuService = Depends(get_menu_service),
    current_user: User = Depends(get_current_user)
):
    """Update a daily special."""
    # NOTE: Same ownership check requirement as update_menu_item above.
    return await service.update_daily_special(special_id, data, current_user)


@owner_router.delete("/specials/{special_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_daily_special(
    special_id: UUID,
    service: MenuService = Depends(get_menu_service),
    current_user: User = Depends(get_current_user)
):
    """Delete a daily special."""
    # NOTE: Same ownership check requirement as update_menu_item above.
    await service.delete_daily_special(special_id, current_user)


# Add owner_router to main router to simplify registering in main.py
router.include_router(owner_router)