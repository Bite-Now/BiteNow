from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.orm import selectinload
from typing import List, Optional
from uuid import UUID

from app.modules.auth.models import Canteen
from app.modules.menu.models import MenuItem, DailySpecial
from app.modules.menu.schemas import MenuItemCreate, MenuItemUpdate, DailySpecialCreate, DailySpecialUpdate

class MenuRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_active_canteens(self) -> List[Canteen]:
        stmt = select(Canteen).where(Canteen.is_active == True)
        result = await self.db.execute(stmt)
        return result.scalars().all()
        
    async def get_canteen_by_id(self, canteen_id: UUID) -> Optional[Canteen]:
        stmt = select(Canteen).where(Canteen.id == canteen_id, Canteen.is_active == True)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_menu_items_by_canteen(self, canteen_id: UUID) -> List[MenuItem]:
        stmt = select(MenuItem).where(MenuItem.canteen_id == canteen_id)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_daily_specials_by_canteen(self, canteen_id: UUID) -> List[DailySpecial]:
        stmt = select(DailySpecial).where(DailySpecial.canteen_id == canteen_id)
        result = await self.db.execute(stmt)
        return result.scalars().all()

    async def get_menu_item_by_id(self, item_id: UUID) -> Optional[MenuItem]:
        stmt = select(MenuItem).where(MenuItem.id == item_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_daily_special_by_id(self, special_id: UUID) -> Optional[DailySpecial]:
        stmt = select(DailySpecial).where(DailySpecial.id == special_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    # OWNER Mutations
    async def create_menu_item(self, canteen_id: UUID, data: MenuItemCreate) -> MenuItem:
        new_item = MenuItem(canteen_id=canteen_id, **data.model_dump())
        self.db.add(new_item)
        await self.db.flush()
        await self.db.commit()
        await self.db.refresh(new_item)
        return new_item

    async def update_menu_item(self, item: MenuItem, data: MenuItemUpdate) -> MenuItem:
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(item, key, value)
        await self.db.flush()
        await self.db.commit()
        await self.db.refresh(item)
        return item

    async def delete_menu_item(self, item: MenuItem) -> None:
        await self.db.delete(item)
        await self.db.flush()
        await self.db.commit()

    async def create_daily_special(self, canteen_id: UUID, data: DailySpecialCreate) -> DailySpecial:
        new_special = DailySpecial(canteen_id=canteen_id, **data.model_dump())
        self.db.add(new_special)
        await self.db.flush()
        await self.db.commit()
        await self.db.refresh(new_special)
        return new_special

    async def update_daily_special(self, special: DailySpecial, data: DailySpecialUpdate) -> DailySpecial:
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(special, key, value)
        await self.db.flush()
        await self.db.commit()
        await self.db.refresh(special)
        return special

    async def delete_daily_special(self, special: DailySpecial) -> None:
        await self.db.delete(special)
        await self.db.flush()
        await self.db.commit()
