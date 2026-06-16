from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from uuid import UUID

class UserSchema(BaseModel):
    id: UUID
    clerk_user_id: str
    email: EmailStr
    full_name: Optional[str]
    role: str
    canteen_id: Optional[UUID]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class VendorApplicationCreate(BaseModel):
    full_name: str
    email: EmailStr
    canteen_name: str
    phone: str

class VendorApplicationSchema(VendorApplicationCreate):
    id: UUID
    status: str
    submitted_at: datetime
    reviewed_at: Optional[datetime]
    reviewed_by: Optional[UUID]

    class Config:
        from_attributes = True

class StaffCreate(BaseModel):
    full_name: str
    email: EmailStr
