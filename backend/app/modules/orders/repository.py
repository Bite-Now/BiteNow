from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy import select, exc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from .models import Order, OrderItem
from fastapi import HTTPException

class OrderRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_order(
        self,
        student_id: UUID,
        canteen_id: UUID,
        idempotency_key: UUID,
        total_amount: float,
        status: str,
        items_data: List[Dict[str, Any]]
    ) -> Optional[Order]:
        """
        Create a new order and its items.
        Catches IntegrityError if idempotency_key is duplicated.
        """
        try:
            # Try to fetch existing first (rare, but good for concurrency)
            existing = await self.get_order_by_idempotency_key(idempotency_key)
            if existing:
                return existing

            order = Order(
                student_id=student_id,
                canteen_id=canteen_id,
                status=status,
                total_amount=total_amount,
                idempotency_key=idempotency_key
            )
            self.session.add(order)
            await self.session.flush() # flush to get order.id

            for item in items_data:
                order_item = OrderItem(
                    order_id=order.id,
                    menu_item_id=item["menu_item_id"],
                    quantity=item["quantity"],
                    unit_price=item["unit_price"]
                )
                self.session.add(order_item)
            
            await self.session.commit()
            
            # Refresh to load items
            return await self.get_order_by_id(order.id)
            
        except exc.IntegrityError as e:
            await self.session.rollback()
            print(f"[ERROR] IntegrityError in create_order: {e}")
            # Try to fetch if it was idempotency_key
            existing = await self.get_order_by_idempotency_key(idempotency_key)
            if existing:
                return existing
            # If not idempotency_key (e.g. FK failure), raise it or return None
            raise HTTPException(status_code=500, detail=f"Database integrity error: {str(e.orig)}")

    async def get_order_by_idempotency_key(self, idempotency_key: UUID) -> Optional[Order]:
        stmt = select(Order).where(Order.idempotency_key == idempotency_key)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_order_by_id(self, order_id: UUID) -> Optional[Order]:
        # Using selectinload is normally used for relationship, but we don't have relationship defined on Order model for items.
        # Let's just fetch items separately or define the relationship.
        # Actually, let's fetch items explicitly and attach them for response purposes if needed,
        # or we can define a relationship. For simplicity, let's just fetch the order, then fetch items.
        stmt = select(Order).where(Order.id == order_id)
        result = await self.session.execute(stmt)
        order = result.scalars().first()
        if order:
            items_stmt = select(OrderItem).where(OrderItem.order_id == order_id)
            items_result = await self.session.execute(items_stmt)
            order.items = items_result.scalars().all()
        return order

    async def get_orders_by_student(self, student_id: UUID) -> List[Order]:
        stmt = select(Order).where(Order.student_id == student_id).order_by(Order.created_at.desc())
        result = await self.session.execute(stmt)
        orders = list(result.scalars().all())
        
        # In a real app with SQLAlchemy 2.0 relationships, we'd use selectinload.
        # But here we'll just fetch items for all orders manually or define the relationship.
        for order in orders:
            items_stmt = select(OrderItem).where(OrderItem.order_id == order.id)
            items_result = await self.session.execute(items_stmt)
            order.items = items_result.scalars().all()
        return orders

    async def get_orders_by_canteen(self, canteen_id: UUID, statuses: Optional[List[str]] = None) -> List[Order]:
        stmt = select(Order).where(Order.canteen_id == canteen_id)
        if statuses:
            stmt = stmt.where(Order.status.in_(statuses))
        stmt = stmt.order_by(Order.created_at.desc())
        
        result = await self.session.execute(stmt)
        orders = list(result.scalars().all())
        
        for order in orders:
            items_stmt = select(OrderItem).where(OrderItem.order_id == order.id)
            items_result = await self.session.execute(items_stmt)
            order.items = items_result.scalars().all()
        return orders

    async def update_order_status(self, order_id: UUID, status: str) -> Optional[Order]:
        order = await self.get_order_by_id(order_id)
        if order:
            order.status = status
            await self.session.commit()
        return order
