from fastapi import HTTPException, status
from typing import List, Dict
from uuid import UUID
from itertools import groupby
from operator import attrgetter

from app.modules.auth.models import Canteen, User
from app.modules.menu.models import MenuItem, DailySpecial
from app.modules.menu.repository import MenuRepository
from app.modules.menu.schemas import (
    MenuItemCreate, MenuItemUpdate, DailySpecialCreate, DailySpecialUpdate,
    CanteenResponse, MenuItemResponse, DailySpecialResponse, MenuAggregatedResponse
)

class MenuService:
    def __init__(self, repository: MenuRepository):
        self.repository = repository

    async def get_canteens(self) -> List[CanteenResponse]:
        canteens = await self.repository.get_active_canteens()
        return [CanteenResponse.model_validate(c) for c in canteens]

    async def get_canteen_menu(self, canteen_id: UUID) -> MenuAggregatedResponse:
        canteen = await self.repository.get_canteen_by_id(canteen_id)
        if not canteen:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Canteen not found")

        items = await self.repository.get_menu_items_by_canteen(canteen_id)
        specials = await self.repository.get_daily_specials_by_canteen(canteen_id)

        # Group items by category
        grouped_menu: Dict[str, List[MenuItemResponse]] = {}
        for item in items:
            cat = item.category
            if cat not in grouped_menu:
                grouped_menu[cat] = []
            grouped_menu[cat].append(MenuItemResponse.model_validate(item))

        return MenuAggregatedResponse(
            canteen=CanteenResponse.model_validate(canteen),
            specials=[DailySpecialResponse.model_validate(s) for s in specials],
            menu=grouped_menu
        )

    async def get_canteen_specials(self, canteen_id: UUID) -> List[DailySpecialResponse]:
        canteen = await self.repository.get_canteen_by_id(canteen_id)
        if not canteen:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Canteen not found")
        specials = await self.repository.get_daily_specials_by_canteen(canteen_id)
        return [DailySpecialResponse.model_validate(s) for s in specials]

    # Owner Methods
    def _verify_owner(self, current_user: User, canteen_id: UUID):
        if current_user.role == "ADMIN":
            return
        if not current_user.canteen_id or current_user.canteen_id != canteen_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only modify your own canteen")

    async def create_menu_item(self, canteen_id: UUID, data: MenuItemCreate, current_user: User) -> MenuItemResponse:
        self._verify_owner(current_user, canteen_id)
        canteen = await self.repository.get_canteen_by_id(canteen_id)
        if not canteen:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Canteen not found")
            
        item = await self.repository.create_menu_item(canteen_id, data)
        return MenuItemResponse.model_validate(item)

    async def update_menu_item(self, item_id: UUID, data: MenuItemUpdate, current_user: User) -> MenuItemResponse:
        item = await self.repository.get_menu_item_by_id(item_id)
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
        self._verify_owner(current_user, item.canteen_id)
        
        updated_item = await self.repository.update_menu_item(item, data)
        return MenuItemResponse.model_validate(updated_item)

    async def delete_menu_item(self, item_id: UUID, current_user: User) -> None:
        item = await self.repository.get_menu_item_by_id(item_id)
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Menu item not found")
        self._verify_owner(current_user, item.canteen_id)
        
        await self.repository.delete_menu_item(item)

    async def create_daily_special(self, canteen_id: UUID, data: DailySpecialCreate, current_user: User) -> DailySpecialResponse:
        self._verify_owner(current_user, canteen_id)
        canteen = await self.repository.get_canteen_by_id(canteen_id)
        if not canteen:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Canteen not found")
            
        special = await self.repository.create_daily_special(canteen_id, data)
        return DailySpecialResponse.model_validate(special)

    async def update_daily_special(self, special_id: UUID, data: DailySpecialUpdate, current_user: User) -> DailySpecialResponse:
        special = await self.repository.get_daily_special_by_id(special_id)
        if not special:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Daily special not found")
        self._verify_owner(current_user, special.canteen_id)
        
        updated_special = await self.repository.update_daily_special(special, data)
        return DailySpecialResponse.model_validate(updated_special)

    async def delete_daily_special(self, special_id: UUID, current_user: User) -> None:
        special = await self.repository.get_daily_special_by_id(special_id)
        if not special:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Daily special not found")
        self._verify_owner(current_user, special.canteen_id)
        
        await self.repository.delete_daily_special(special)
