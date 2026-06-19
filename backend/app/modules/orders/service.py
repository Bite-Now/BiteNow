from typing import List, Optional
from uuid import UUID
from fastapi import HTTPException, status
from app.modules.orders.repository import OrderRepository
from app.modules.menu.repository import MenuRepository
from app.modules.orders.schemas import OrderCreateRequest
from app.modules.orders.models import Order
from decimal import Decimal

class OrderService:
    def __init__(self, order_repo: OrderRepository, menu_repo: MenuRepository):
        self.order_repo = order_repo
        self.menu_repo = menu_repo

    async def validate_order(self, request: OrderCreateRequest) -> List[dict]:
        """
        Validates the items exist and belong to the correct canteen.
        Returns a list of enriched item dictionaries with prices.
        """
        enriched_items = []
        for item in request.items:
            # We also need to consider Daily Specials, but for simplicity we assume items are just MenuItems.
            # If BiteNow supports DailySpecials in cart, we'd need to know the type or query both.
            # Let's assume they are MenuItems for now.
            menu_item = await self.menu_repo.get_menu_item_by_id(item.menu_item_id)
            if not menu_item:
                # Might be a daily special? Let's check.
                special = await self.menu_repo.get_daily_special_by_id(item.menu_item_id)
                if special:
                    if special.canteen_id != request.canteen_id:
                        raise HTTPException(status_code=400, detail=f"Item {item.menu_item_id} belongs to a different canteen")
                    enriched_items.append({
                        "menu_item_id": item.menu_item_id,
                        "quantity": item.quantity,
                        "unit_price": special.price
                    })
                    continue
                raise HTTPException(status_code=400, detail=f"Menu item {item.menu_item_id} not found")
            
            if menu_item.canteen_id != request.canteen_id:
                raise HTTPException(status_code=400, detail=f"Item {item.menu_item_id} belongs to a different canteen")
            
            enriched_items.append({
                "menu_item_id": item.menu_item_id,
                "quantity": item.quantity,
                "unit_price": menu_item.price
            })
            
        return enriched_items

    def calculate_total(self, enriched_items: List[dict]) -> Decimal:
        total = Decimal("0.00")
        for item in enriched_items:
            total += Decimal(str(item["unit_price"])) * item["quantity"]
        return total

    async def create_paid_order(self, student_id: UUID, request: OrderCreateRequest) -> Order:
        enriched_items = await self.validate_order(request)
        total_amount = self.calculate_total(enriched_items)
        
        order = await self.order_repo.create_order(
            student_id=student_id,
            canteen_id=request.canteen_id,
            idempotency_key=request.idempotency_key,
            total_amount=float(total_amount),
            status="PAID",
            items_data=enriched_items
        )
        if not order:
            raise HTTPException(status_code=500, detail="Failed to create order")
            
        # Notify staff and vendor
        student_name = await self.order_repo.get_student_name(student_id)
        title = "New Order!"
        message = f"A new order has arrived from {student_name}."
        
        target_user_ids = await self.order_repo.get_canteen_staff_and_owner_ids(request.canteen_id)
        for uid in target_user_ids:
            await self.order_repo.create_notification(uid, title, message)
            
        return order

    async def auto_collect_stale_orders(self):
        await self.order_repo.auto_collect_stale_orders()

    async def _populate_names(self, orders: List[Order]) -> List[Order]:
        canteen_cache = {}
        item_cache = {}
        for order in orders:
            if order.canteen_id not in canteen_cache:
                canteen = await self.menu_repo.get_canteen_by_id(order.canteen_id)
                canteen_cache[order.canteen_id] = canteen.name if canteen else "Unknown Canteen"
            order.canteen_name = canteen_cache[order.canteen_id]
            
            for item in getattr(order, 'items', []):
                if item.menu_item_id not in item_cache:
                    menu_item = await self.menu_repo.get_menu_item_by_id(item.menu_item_id)
                    if not menu_item:
                        special = await self.menu_repo.get_daily_special_by_id(item.menu_item_id)
                        item_cache[item.menu_item_id] = special.name if special else "Unknown Item"
                    else:
                        item_cache[item.menu_item_id] = menu_item.name
                item.menu_item_name = item_cache[item.menu_item_id]
        return orders

    async def get_student_orders(self, student_id: UUID) -> List[Order]:
        await self.auto_collect_stale_orders()
        orders = await self.order_repo.get_orders_by_student(student_id)
        return await self._populate_names(orders)

    async def get_staff_orders(self, canteen_id: UUID) -> List[Order]:
        await self.auto_collect_stale_orders()
        orders = await self.order_repo.get_orders_by_canteen(canteen_id, statuses=["PAID", "READY"])
        return await self._populate_names(orders)

    async def get_owner_orders(self, canteen_id: UUID) -> List[Order]:
        await self.auto_collect_stale_orders()
        orders = await self.order_repo.get_orders_by_canteen(canteen_id)
        return await self._populate_names(orders)

    async def get_order_by_id(self, order_id: UUID) -> Optional[Order]:
        order = await self.order_repo.get_order_by_id(order_id)
        if order:
            await self._populate_names([order])
        return order

    async def mark_ready(self, order_id: UUID) -> Order:
        order = await self.order_repo.update_order_status(order_id, "READY")
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        
        # Create notification
        canteen = await self.menu_repo.get_canteen_by_id(order.canteen_id) if hasattr(self.menu_repo, 'get_canteen_by_id') else None
        canteen_name = canteen.name if canteen else "the Canteen"
        
        title = "Order Ready"
        message = f"Your order #{order.order_number} is ready for pickup from {canteen_name}."
        await self.order_repo.create_notification(order.student_id, title, message)
        
        return order

    async def get_notifications(self, student_id: UUID):
        return await self.order_repo.get_notifications(student_id)

    async def mark_notification_read(self, notification_id: UUID, student_id: UUID):
        notification = await self.order_repo.mark_notification_read(notification_id, student_id)
        if not notification:
            raise HTTPException(status_code=404, detail="Notification not found")
        return notification

    async def delete_notifications(self, notification_ids: List[UUID], user_id: UUID):
        await self.order_repo.delete_notifications(notification_ids, user_id)
        return {"success": True, "deleted_count": len(notification_ids)}
