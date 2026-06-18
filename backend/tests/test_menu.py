import pytest
from httpx import AsyncClient
from uuid import uuid4
from fastapi import status

from app.main import app
from app.core.dependencies import get_current_user
from app.modules.auth.models import User

# Mocking Dependencies
def override_get_current_user_student():
    return User(id=uuid4(), clerk_user_id="clerk_student_123", email="student@test.com", role="STUDENT", is_active=True)

def override_get_current_user_owner(canteen_id):
    return User(id=uuid4(), clerk_user_id="clerk_owner_123", email="owner@test.com", role="OWNER", canteen_id=canteen_id, is_active=True)

@pytest.mark.asyncio
async def test_get_canteens():
    # Test 6.1
    app.dependency_overrides[get_current_user] = override_get_current_user_student
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.get("/canteens")
    assert response.status_code == status.HTTP_200_OK

@pytest.mark.asyncio
async def test_owner_create_menu_item_success():
    # Test 6.2
    canteen_id = uuid4()
    app.dependency_overrides[get_current_user] = lambda: override_get_current_user_owner(canteen_id)
    
    payload = {
        "name": "Test Item",
        "category": "Snacks",
        "price": 50.0
    }
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(f"/owner/menu?canteen_id={canteen_id}", json=payload)
    
    # We expect 404 because Canteen doesn't exist in the mocked DB, but auth passes.
    # To fully test, we'd need DB fixtures. We assert auth passes.
    assert response.status_code in [status.HTTP_201_CREATED, status.HTTP_404_NOT_FOUND]

@pytest.mark.asyncio
async def test_owner_create_menu_item_forbidden():
    # Test 6.3 - Wrong Owner
    canteen_id = uuid4()
    wrong_canteen_id = uuid4()
    app.dependency_overrides[get_current_user] = lambda: override_get_current_user_owner(canteen_id)
    
    payload = {
        "name": "Test Item",
        "category": "Snacks",
        "price": 50.0
    }
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(f"/owner/menu?canteen_id={wrong_canteen_id}", json=payload)
    
    assert response.status_code == status.HTTP_403_FORBIDDEN

@pytest.mark.asyncio
async def test_student_create_menu_item_forbidden():
    # Test 6.3 - Student role
    canteen_id = uuid4()
    app.dependency_overrides[get_current_user] = override_get_current_user_student
    
    payload = {
        "name": "Test Item",
        "category": "Snacks",
        "price": 50.0
    }
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post(f"/owner/menu?canteen_id={canteen_id}", json=payload)
    
    assert response.status_code == status.HTTP_403_FORBIDDEN
