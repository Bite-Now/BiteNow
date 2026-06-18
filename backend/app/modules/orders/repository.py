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
        Catches IntegrityError if idempotency_key or order_number is duplicated.
        """
        from sqlalchemy import func
        max_retries = 3
        for attempt in range(max_retries):
            try:
                # Try to fetch existing first (rare, but good for concurrency)
                existing = await self.get_order_by_idempotency_key(idempotency_key)
                if existing:
                    return existing

                # Generate order_number
                stmt_max = select(func.max(Order.order_number)).where(Order.canteen_id == canteen_id)
                max_res = await self.session.execute(stmt_max)
                max_num = max_res.scalar() or 0
                next_order_number = max_num + 1

                order = Order(
                    student_id=student_id,
                    canteen_id=canteen_id,
                    status=status,
                    total_amount=total_amount,
                    idempotency_key=idempotency_key,
                    order_number=next_order_number
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
                
                # Check if it was uq_canteen_order_number
                if 'uq_canteen_order_number' in str(e.orig):
                    if attempt < max_retries - 1:
                        print(f"Retrying order generation due to uq_canteen_order_number conflict... (Attempt {attempt + 1})")
                        continue

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

    async def create_notification(self, user_id: UUID, title: str, message: str):
        from .models import Notification
        notification = Notification(user_id=user_id, title=title, message=message)
        self.session.add(notification)
        await self.session.commit()
        return notification

    async def get_notifications(self, user_id: UUID):
        from .models import Notification
        stmt = select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def mark_notification_read(self, notification_id: UUID, user_id: UUID):
        from .models import Notification
        stmt = select(Notification).where(Notification.id == notification_id, Notification.user_id == user_id)
        result = await self.session.execute(stmt)
        notification = result.scalars().first()
        if notification:
            notification.is_read = True
            await self.session.commit()
        return notification

    async def auto_collect_stale_orders(self):
        from datetime import datetime, timedelta, timezone
        from sqlalchemy import update, and_
        five_minutes_ago = datetime.now(timezone.utc) - timedelta(minutes=5)
        stmt = (
            update(Order)
            .where(
                and_(
                    Order.status == "READY",
                    Order.updated_at < five_minutes_ago
                )
            )
            .values(status="COLLECTED")
        )
        await self.session.execute(stmt)
        await self.session.commit()
