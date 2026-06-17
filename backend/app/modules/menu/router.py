from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_owner
from app.modules.auth.models import User
from app.modules.menu.repository import MenuRepository
from app.modules.menu.service import MenuService
from app.modules.menu.schemas import (
    CanteenResponse, MenuAggregatedResponse, DailySpecialResponse,
    MenuItemCreate, MenuItemUpdate, MenuItemResponse,
    DailySpecialCreate, DailySpecialUpdate
)

router = APIRouter(tags=["Menu"])

def get_menu_service(db: AsyncSession = Depends(get_db)) -> MenuService:
    repository = MenuRepository(db)
    return MenuService(repository)

# Public / Generic Endpoints (Accessible to any authenticated user)
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

# Owner Protected Endpoints
owner_router = APIRouter(prefix="/owner", tags=["Owner Menu"], dependencies=[Depends(require_owner)])

@owner_router.post("/menu", response_model=MenuItemResponse, status_code=status.HTTP_201_CREATED)
async def create_menu_item(
    canteen_id: UUID,
    data: MenuItemCreate,
    service: MenuService = Depends(get_menu_service),
    current_user: User = Depends(get_current_user)
):
    """Create a new menu item."""
    return await service.create_menu_item(canteen_id, data, current_user)

@owner_router.patch("/menu/{item_id}", response_model=MenuItemResponse)
async def update_menu_item(
    item_id: UUID,
    data: MenuItemUpdate,
    service: MenuService = Depends(get_menu_service),
    current_user: User = Depends(get_current_user)
):
    """Update a menu item."""
    return await service.update_menu_item(item_id, data, current_user)

@owner_router.delete("/menu/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_menu_item(
    item_id: UUID,
    service: MenuService = Depends(get_menu_service),
    current_user: User = Depends(get_current_user)
):
    """Delete a menu item."""
    await service.delete_menu_item(item_id, current_user)

@owner_router.post("/specials", response_model=DailySpecialResponse, status_code=status.HTTP_201_CREATED)
async def create_daily_special(
    canteen_id: UUID,
    data: DailySpecialCreate,
    service: MenuService = Depends(get_menu_service),
    current_user: User = Depends(get_current_user)
):
    """Create a new daily special."""
    return await service.create_daily_special(canteen_id, data, current_user)

@owner_router.patch("/specials/{special_id}", response_model=DailySpecialResponse)
async def update_daily_special(
    special_id: UUID,
    data: DailySpecialUpdate,
    service: MenuService = Depends(get_menu_service),
    current_user: User = Depends(get_current_user)
):
    """Update a daily special."""
    return await service.update_daily_special(special_id, data, current_user)

@owner_router.delete("/specials/{special_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_daily_special(
    special_id: UUID,
    service: MenuService = Depends(get_menu_service),
    current_user: User = Depends(get_current_user)
):
    """Delete a daily special."""
    await service.delete_daily_special(special_id, current_user)

# Add owner_router to main router to simplify registering in main.py
router.include_router(owner_router)
