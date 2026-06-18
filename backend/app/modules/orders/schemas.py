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
    order_number: Optional[int] = None
    status: str
    total_amount: Decimal
    created_at: datetime
    items: Optional[List[OrderItemResponse]] = []

    model_config = ConfigDict(from_attributes=True)

class MockFailureRequest(BaseModel):
    canteen_id: UUID
    items: List[OrderCreateItem]

class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    message: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TopItem(BaseModel):
    name: str
    orders: int

class TrendDataPoint(BaseModel):
    name: str
    earnings: float
    orders: int

class DashboardStatsResponse(BaseModel):
    earnings: str
    orders_completed: int
    orders_pending: int
    batching_efficiency: str
    top_items: List[TopItem]
    monthly_data: List[TrendDataPoint]
    yearly_data: List[TrendDataPoint]
