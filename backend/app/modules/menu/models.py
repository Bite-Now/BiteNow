import uuid
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Text, Integer, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.core.database import Base

class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    canteen_id = Column(UUID(as_uuid=True), ForeignKey("canteens.id"), nullable=False)
    name = Column(Text, nullable=False)
    category = Column(Text, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    image_url = Column(Text, nullable=True)
    is_batchable = Column(Boolean, default=True)
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class DailySpecial(Base):
    __tablename__ = "daily_specials"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    canteen_id = Column(UUID(as_uuid=True), ForeignKey("canteens.id"), nullable=False)
    name = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    image_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
