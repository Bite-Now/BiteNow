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

class AdminSettingsUpdate(BaseModel):
    admin_name: Optional[str] = None
    email_address: Optional[str] = None
    notify_vendor_email: Optional[bool] = None
    notify_vendor_sms: Optional[bool] = None
    notify_menu_email: Optional[bool] = None
    notify_menu_sms: Optional[bool] = None
    notify_system_email: Optional[bool] = None
    notify_system_sms: Optional[bool] = None

class AdminSettingsSchema(BaseModel):
    admin_name: str
    email_address: str
    notify_vendor_email: bool
    notify_vendor_sms: bool
    notify_menu_email: bool
    notify_menu_sms: bool
    notify_system_email: bool
    notify_system_sms: bool

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
