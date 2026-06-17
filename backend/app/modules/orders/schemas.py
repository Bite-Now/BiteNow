from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from uuid import UUID
from datetime import datetime
from decimal import Decimal

class OrderCreateItem(BaseModel):
    menu_item_id: UUID
    quantity: int

class OrderCreateRequest(BaseModel):
    canteen_id: UUID
    items: List[OrderCreateItem]
    idempotency_key: UUID

class OrderItemResponse(BaseModel):
    id: UUID
    menu_item_id: UUID
    quantity: int
    unit_price: Decimal

    model_config = ConfigDict(from_attributes=True)

class OrderResponse(BaseModel):
    id: UUID
    student_id: UUID
    canteen_id: UUID
    status: str
    total_amount: Decimal
    created_at: datetime
    items: Optional[List[OrderItemResponse]] = []

    model_config = ConfigDict(from_attributes=True)

class MockFailureRequest(BaseModel):
    canteen_id: UUID
    items: List[OrderCreateItem]
