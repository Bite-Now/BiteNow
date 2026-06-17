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
        return order

    async def get_student_orders(self, student_id: UUID) -> List[Order]:
        return await self.order_repo.get_orders_by_student(student_id)

    async def get_staff_orders(self, canteen_id: UUID) -> List[Order]:
        return await self.order_repo.get_orders_by_canteen(canteen_id, statuses=["PAID", "COMPLETED"])

    async def get_owner_orders(self, canteen_id: UUID) -> List[Order]:
        return await self.order_repo.get_orders_by_canteen(canteen_id)

    async def get_order_by_id(self, order_id: UUID) -> Optional[Order]:
        return await self.order_repo.get_order_by_id(order_id)

    async def mark_completed(self, order_id: UUID) -> Order:
        order = await self.order_repo.update_order_status(order_id, "COMPLETED")
        if not order:
            raise HTTPException(status_code=404, detail="Order not found")
        return order
