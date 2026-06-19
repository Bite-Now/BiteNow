from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional, Dict
from datetime import datetime
from uuid import UUID

# Canteen Schemas
class CanteenResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    is_open: bool
    image_url: Optional[str] = None
    description: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


# Menu Item Schemas
class MenuItemBase(BaseModel):
    name: str = Field(..., min_length=1)
    category: str = Field(..., min_length=1)
    price: float = Field(..., gt=0)
    image_url: Optional[str] = None
    is_batchable: bool = True
    is_available: bool = True

class MenuItemCreate(MenuItemBase):
    pass

class MenuItemUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    category: Optional[str] = Field(None, min_length=1)
    price: Optional[float] = Field(None, gt=0)
    image_url: Optional[str] = None
    is_batchable: Optional[bool] = None
    is_available: Optional[bool] = None

class MenuItemResponse(MenuItemBase):
    id: UUID
    canteen_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Daily Special Schemas
class DailySpecialBase(BaseModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    price: float = Field(..., gt=0)
    image_url: Optional[str] = None
    is_available: bool = True

class DailySpecialCreate(DailySpecialBase):
    pass

class DailySpecialUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    image_url: Optional[str] = None
    is_available: Optional[bool] = None

class DailySpecialResponse(DailySpecialBase):
    id: UUID
    canteen_id: UUID
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# Aggregated Response Schema
class MenuAggregatedResponse(BaseModel):
    canteen: CanteenResponse
    specials: List[DailySpecialResponse]
    menu: Dict[str, List[MenuItemResponse]]
