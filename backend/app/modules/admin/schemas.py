from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime

class CanteenAggregateSchema(BaseModel):
    id: UUID
    name: str
    is_active: bool
    owner_name: Optional[str]
    total_menu_items: int

class AdminSettingsBase(BaseModel):
    notification_matrix: Dict[str, Any]

class AdminSettingsUpdate(AdminSettingsBase):
    pass

class AdminSettingsSchema(AdminSettingsBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class BulkUploadPreviewItem(BaseModel):
    name: str
    description: Optional[str] = None
    price: Optional[float] = None
    category_name: Optional[str] = None
    ai_suggested_category: Optional[str] = None
    image_url: Optional[str] = None
    errors: List[str] = []

class BulkUploadPreviewResponse(BaseModel):
    items: List[BulkUploadPreviewItem]
    total_errors: int

class BulkUploadPublishItem(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    category_name: str
    image_url: Optional[str] = None

class BulkUploadPublishRequest(BaseModel):
    canteen_id: UUID
    items: List[BulkUploadPublishItem]
