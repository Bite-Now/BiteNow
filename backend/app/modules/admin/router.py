from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from uuid import UUID
from datetime import datetime, timezone
import csv
import io
import json
import asyncio
from groq import AsyncGroq

from app.core.config import settings
from app.core.database import get_db
from app.modules.auth.schemas import VendorApplicationSchema, UserSchema
from app.modules.admin.schemas import (
    CanteenAggregateSchema, BulkUploadPreviewResponse, BulkUploadPublishRequest,
    BulkUploadPreviewItem, AdminSettingsSchema, AdminSettingsUpdate
)
from app.modules.auth.models import VendorApplication, User, Canteen, AdminSettings
from app.modules.menu.models import MenuItem
from sqlalchemy import func
from app.core.dependencies import require_admin
from app.core.clerk import create_user

router = APIRouter(prefix="/admin", tags=["admin"])

@router.get("/canteens", response_model=List[CanteenAggregateSchema])
async def list_canteens_for_admin(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    # Join Canteen with User (owner) and MenuItem
    stmt = (
        select(
            Canteen.id,
            Canteen.name,
            Canteen.is_active,
            User.full_name.label("owner_name"),
            func.count(MenuItem.id).label("total_menu_items")
        )
        .outerjoin(User, Canteen.owner_id == User.id)
        .outerjoin(MenuItem, Canteen.id == MenuItem.canteen_id)
        .group_by(Canteen.id, User.full_name)
    )
    result = await db.execute(stmt)
    
    canteens = []
    for row in result.all():
        canteens.append(CanteenAggregateSchema(
            id=row.id,
            name=row.name,
            is_active=row.is_active,
            owner_name=row.owner_name,
            total_menu_items=row.total_menu_items
        ))
    
    return canteens

@router.get("/vendor-applications", response_model=List[VendorApplicationSchema])
async def list_vendor_applications(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(VendorApplication).order_by(VendorApplication.submitted_at.desc()))
    return result.scalars().all()

@router.get("/vendor-applications/{application_id}", response_model=VendorApplicationSchema)
async def get_vendor_application(
    application_id: UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(VendorApplication).where(VendorApplication.id == application_id))
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    return app

@router.patch("/vendor-applications/{application_id}/approve")
async def approve_vendor_application(
    application_id: UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(VendorApplication).where(VendorApplication.id == application_id))
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    if app.status != "PENDING":
        raise HTTPException(status_code=400, detail="Application already processed")
        
    try:
        slug = app.canteen_name.lower().replace(" ", "-")
        # Check if canteen slug already exists
        result = await db.execute(select(Canteen).where(Canteen.slug == slug))
        existing_canteen = result.scalars().first()
        if existing_canteen:
            raise HTTPException(status_code=400, detail="A canteen with this name already exists")

        # Create Canteen first so we have the UUID
        canteen = Canteen(
            name=app.canteen_name,
            slug=slug,
            is_active=True
        )
        db.add(canteen)
        await db.flush() # flush to get canteen.id
        
        import uuid
        
        # Check if user already exists
        result = await db.execute(select(User).where(User.email == app.email))
        owner = result.scalars().first()
        
        if owner:
            owner.role = "OWNER"
            owner.canteen_id = canteen.id
        else:
            # Create DB User placeholder
            owner = User(
                clerk_user_id=f"pending_{uuid.uuid4()}",
                email=app.email,
                full_name=app.full_name,
                role="OWNER",
                canteen_id=canteen.id,
                is_active=False
            )
            db.add(owner)
            
        await db.flush()
        
        canteen.owner_id = owner.id
        
        app.status = "APPROVED"
        app.reviewed_at = datetime.now(timezone.utc)
        app.reviewed_by = admin.id
        
        # Send Clerk Invitation
        try:
            from app.core.clerk import clerk_client
            clerk_client.invitations.create(
                request={
                    "email_address": app.email,
                    "public_metadata": {
                        "role": "OWNER",
                        "canteen_id": str(canteen.id)
                    }
                }
            )
        except Exception as clerk_err:
            print(f"[WARN] Clerk invitation failed (user might already exist in Clerk): {clerk_err}")
        
        await db.commit()
        return {"message": "Vendor approved and invitation sent successfully"}
    except HTTPException:
        await db.rollback()
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        await db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/vendor-applications/{application_id}/reject")
async def reject_vendor_application(
    application_id: UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(VendorApplication).where(VendorApplication.id == application_id))
    app = result.scalars().first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
        
    app.status = "REJECTED"
    app.reviewed_at = datetime.now(timezone.utc)
    app.reviewed_by = admin.id
    
    await db.commit()
    return {"message": "Vendor rejected"}

@router.get("/users", response_model=List[UserSchema])
async def list_users(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User))
    return result.scalars().all()

@router.patch("/users/{user_id}/activate")
async def activate_user(
    user_id: UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_active = True
    await db.commit()
    return {"message": "User activated"}

@router.patch("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.is_active = False
    await db.commit()
    return {"message": "User deactivated"}

# --- Bulk Upload Endpoints ---

async def _suggest_categories_batch(items: List[dict]) -> dict:
    if not items:
        return {}

    # Initialize client
    client = AsyncGroq(api_key=settings.GROQ_API_KEY)

    prompt = f"""
You are an expert AI categorizer for a university canteen.
Categorize the following menu items into exactly one short category name (e.g., 'Beverages', 'Snacks & Fast Food', 'Meals', 'Desserts', 'Miscellaneous').
Respond ONLY with a JSON dictionary where the keys are the item names and the values are the suggested category names. Do not include markdown blocks or any other text.
Items:
{json.dumps(items)}
"""
    try:
        chat_completion = await asyncio.wait_for(
            client.chat.completions.create(
                messages=[
                    {
                        "role": "system",
                        "content": "You are a JSON-only API. You must output a raw JSON dictionary mapping names to categories and nothing else."
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama-3.3-70b-versatile",
                temperature=0.3,
            ),
            timeout=8.0
        )
        
        response_text = chat_completion.choices[0].message.content.strip()
        
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
            
        categories = json.loads(response_text)
        return categories
    except Exception as e:
        print(f"[ERROR] Groq API failed for bulk upload: {e}")
        return {}

@router.post("/bulk-upload/preview", response_model=BulkUploadPreviewResponse)
async def bulk_upload_preview(
    file: UploadFile = File(...),
    admin: User = Depends(require_admin)
):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are supported for now")
        
    content = await file.read()
    text = content.decode("utf-8")
    
    reader = csv.DictReader(io.StringIO(text))
    items = []
    total_errors = 0
    
    # First pass: parse rows and collect items that need AI categorization
    rows_data = []
    items_to_categorize = []
    
    for row in reader:
        name = row.get("name", "").strip()
        price_str = row.get("price", "").strip()
        category = row.get("category", "").strip()
        description = row.get("description", "").strip()
        image_url = row.get("image_url", "").strip()
        
        row_dict = {
            "name": name,
            "price_str": price_str,
            "category": category,
            "description": description,
            "image_url": image_url
        }
        rows_data.append(row_dict)
        
        if not category and name:
            items_to_categorize.append({"name": name, "description": description})
            
    # Call AI batch categorization
    ai_categories = await _suggest_categories_batch(items_to_categorize)
    
    # Second pass: build response
    for row_dict in rows_data:
        errors = []
        name = row_dict["name"]
        price_str = row_dict["price_str"]
        category = row_dict["category"]
        description = row_dict["description"]
        image_url = row_dict["image_url"]
        
        if not name:
            errors.append("Name is required")
            
        price = None
        if not price_str:
            errors.append("Price is required")
        else:
            try:
                price = float(price_str)
                if price < 0:
                    errors.append("Price must be positive")
            except ValueError:
                errors.append("Price must be a valid number")
                
        ai_suggested_category = None
        if not category and name:
            ai_suggested_category = ai_categories.get(name)
            
        if errors:
            total_errors += len(errors)
            
        items.append(BulkUploadPreviewItem(
            name=name,
            description=description if description else None,
            price=price,
            category_name=category if category else None,
            ai_suggested_category=ai_suggested_category,
            image_url=image_url if image_url else None,
            errors=errors
        ))
        
    return BulkUploadPreviewResponse(items=items, total_errors=total_errors)

@router.post("/bulk-upload/publish")
async def bulk_upload_publish(
    payload: BulkUploadPublishRequest,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    # Verify canteen exists
    canteen_result = await db.execute(select(Canteen).where(Canteen.id == payload.canteen_id))
    if not canteen_result.scalars().first():
        raise HTTPException(status_code=404, detail="Canteen not found")

    items_to_insert = []
    for item in payload.items:
        items_to_insert.append(MenuItem(
            canteen_id=payload.canteen_id,
            name=item.name,
            description=item.description,
            price=item.price,
            category=item.category_name,
            image_url=item.image_url,
            is_available=True
        ))
        
    if items_to_insert:
        db.add_all(items_to_insert)
        await db.commit()
        
    return {"message": f"Successfully published {len(items_to_insert)} items"}

# --- System Settings Endpoints ---

@router.get("/settings", response_model=AdminSettingsSchema)
async def get_admin_settings(
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(AdminSettings).where(AdminSettings.user_id == admin.id))
    settings = result.scalars().first()
    
    if not settings:
        # Create default settings if they don't exist
        settings = AdminSettings(user_id=admin.id, notification_matrix={"email": True, "sms": False})
        db.add(settings)
        await db.commit()
        await db.refresh(settings)
        
    matrix = settings.notification_matrix or {}
    
    return {
        "admin_name": admin.full_name or "",
        "email_address": admin.email or "",
        "notify_vendor_email": matrix.get("notify_vendor_email", True),
        "notify_vendor_sms": matrix.get("notify_vendor_sms", False),
        "notify_menu_email": matrix.get("notify_menu_email", True),
        "notify_menu_sms": matrix.get("notify_menu_sms", False),
        "notify_system_email": matrix.get("notify_system_email", True),
        "notify_system_sms": matrix.get("notify_system_sms", False)
    }

@router.patch("/settings", response_model=AdminSettingsSchema)
async def update_admin_settings(
    payload: AdminSettingsUpdate,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db)
):
    # Update User table immediately
    if payload.admin_name is not None:
        admin.full_name = payload.admin_name
    if payload.email_address is not None:
        admin.email = payload.email_address

    result = await db.execute(select(AdminSettings).where(AdminSettings.user_id == admin.id))
    settings = result.scalars().first()
    
    if not settings:
        settings = AdminSettings(user_id=admin.id, notification_matrix={})
        db.add(settings)
        
    matrix = settings.notification_matrix or {}
    if payload.notify_vendor_email is not None: matrix["notify_vendor_email"] = payload.notify_vendor_email
    if payload.notify_vendor_sms is not None: matrix["notify_vendor_sms"] = payload.notify_vendor_sms
    if payload.notify_menu_email is not None: matrix["notify_menu_email"] = payload.notify_menu_email
    if payload.notify_menu_sms is not None: matrix["notify_menu_sms"] = payload.notify_menu_sms
    if payload.notify_system_email is not None: matrix["notify_system_email"] = payload.notify_system_email
    if payload.notify_system_sms is not None: matrix["notify_system_sms"] = payload.notify_system_sms
    
    # Needs to be re-assigned for sqlalchemy to detect JSON change
    settings.notification_matrix = dict(matrix)
    
    await db.commit()
    await db.refresh(admin)
    await db.refresh(settings)
    
    return {
        "admin_name": admin.full_name or "",
        "email_address": admin.email or "",
        "notify_vendor_email": matrix.get("notify_vendor_email", True),
        "notify_vendor_sms": matrix.get("notify_vendor_sms", False),
        "notify_menu_email": matrix.get("notify_menu_email", True),
        "notify_menu_sms": matrix.get("notify_menu_sms", False),
        "notify_system_email": matrix.get("notify_system_email", True),
        "notify_system_sms": matrix.get("notify_system_sms", False)
    }
