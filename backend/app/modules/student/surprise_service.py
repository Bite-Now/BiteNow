from typing import List, Dict, Any, Optional
import random
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc, extract

import uuid
from datetime import datetime, timedelta, timezone
from app.modules.orders.models import Order, OrderItem
from app.modules.menu.models import MenuItem, DailySpecial

def map_category(category_name: str) -> str:
    """
    Maps a free-text category from the database into one of three strict buckets:
    'MAIN', 'BEVERAGE', or 'SIDE'.
    """
    if not category_name:
        return "MAIN"
        
    cat = category_name.lower()
    
    beverage_keywords = ["drink", "beverage", "shake", "coffee", "tea", "soda", "juice", "cooler", "mocktail"]
    if any(keyword in cat for keyword in beverage_keywords):
        return "BEVERAGE"
        
    side_keywords = ["side", "fries", "snack", "chips", "starter", "appetizer", "dessert", "sweet", "ice cream", "brownie", "cake", "cookie", "pastry"]
    if any(keyword in cat for keyword in side_keywords):
        return "SIDE"
        
    # Default to MAIN for things like Burger, Pizza, Wrap, Bowl, Thali, Rice, etc.
    return "MAIN"

class SurpriseService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_user_history_pool(self, user_id: uuid.UUID, budget: float) -> List[Dict[str, Any]]:
        """Fetch the most frequently ordered items for a user, under budget."""
        stmt = (
            select(MenuItem, func.sum(OrderItem.quantity).label('frequency'))
            .join(OrderItem, OrderItem.menu_item_id == MenuItem.id)
            .join(Order, Order.id == OrderItem.order_id)
            .where(Order.student_id == user_id)
            .where(MenuItem.price <= budget)
            .where(MenuItem.is_available == True)
            .group_by(MenuItem.id)
            .order_by(desc('frequency'))
            .limit(20)
        )
        result = await self.db.execute(stmt)
        return [{"item": row[0], "frequency": row[1]} for row in result.all()]

    async def get_trending_pool(self, budget: float) -> List[Dict[str, Any]]:
        """Fetch the most globally ordered items in the last 7 days, under budget."""
        seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
        stmt = (
            select(MenuItem, func.sum(OrderItem.quantity).label('frequency'))
            .join(OrderItem, OrderItem.menu_item_id == MenuItem.id)
            .join(Order, Order.id == OrderItem.order_id)
            .where(Order.created_at >= seven_days_ago)
            .where(Order.status.in_(["PAID", "PREPARING", "READY", "PICKED_UP"]))
            .where(MenuItem.price <= budget)
            .where(MenuItem.is_available == True)
            .group_by(MenuItem.id)
            .order_by(desc('frequency'))
            .limit(20)
        )
        result = await self.db.execute(stmt)
        return [{"item": row[0], "frequency": row[1]} for row in result.all()]

    async def get_specials_pool(self, budget: float) -> List[DailySpecial]:
        """Fetch all daily specials under budget."""
        stmt = (
            select(DailySpecial)
            .where(DailySpecial.price <= budget)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_menu_pool(self, budget: float) -> List[MenuItem]:
        """Fetch all available menu items under budget."""
        stmt = (
            select(MenuItem)
            .where(MenuItem.price <= budget)
            .where(MenuItem.is_available == True)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def generate_surprises(self, user_id: uuid.UUID, budget: float) -> List[Dict[str, Any]]:
        # 1. Fetch pools
        user_history = await self.get_user_history_pool(user_id, budget)
        trending = await self.get_trending_pool(budget)
        specials = await self.get_specials_pool(budget)
        menu_pool = await self.get_menu_pool(budget)
        
        # Helper to categorize
        mains = []
        beverages = []
        sides = []
        for item in menu_pool:
            cat = map_category(item.category)
            if cat == "MAIN": mains.append(item)
            elif cat == "BEVERAGE": beverages.append(item)
            elif cat == "SIDE": sides.append(item)
            
        history_ids = {h["item"].id for h in user_history}
        novelty_mains = [m for m in mains if m.id not in history_ids]
        
        cards = []
        
        def format_item(item, match_score, label):
            return {
                "id": f"mystery_{uuid.uuid4()}",
                "label": label,
                "name": item.name,
                "price": float(item.price),
                "image": item.image_url,
                "matchScore": match_score,
                "source": "BiteNow",
                "time": "10-15 min",
                "items": [{"id": str(item.id), "name": item.name, "price": float(item.price), "quantity": 1, "canteen_id": str(item.canteen_id)}]
            }

        def format_combo(main_item, add_on, match_score, label):
            total = float(main_item.price) + float(add_on.price)
            return {
                "id": f"mystery_{uuid.uuid4()}",
                "label": label,
                "name": f"{main_item.name} & {add_on.name}",
                "price": total,
                "image": main_item.image_url,
                "matchScore": match_score,
                "source": "BiteNow Combo",
                "time": "15 min",
                "items": [
                    {"id": str(main_item.id), "name": main_item.name, "price": float(main_item.price), "quantity": 1, "canteen_id": str(main_item.canteen_id)},
                    {"id": str(add_on.id), "name": add_on.name, "price": float(add_on.price), "quantity": 1, "canteen_id": str(add_on.canteen_id)}
                ]
            }

        # Card 1: The Safe Bet
        history_mains = [h["item"] for h in user_history if map_category(h["item"].category) == "MAIN"]
        if history_mains:
            cards.append(format_item(history_mains[0], 98, "The Safe Bet"))
        elif mains:
            cards.append(format_item(random.choice(mains), 85, "The Safe Bet"))
            
        # Card 2: The Steal
        if specials:
            cards.append(format_item(random.choice(specials), 95, "The Steal"))
        elif mains:
            cards.append(format_item(random.choice(mains), 88, "The Steal"))
            
        # Card 3: The Big Combo
        if mains:
            # Try to build a combo
            combo_built = False
            for _ in range(5): # try 5 times to find a valid combo
                main_item = random.choice(mains)
                rem = budget - float(main_item.price)
                if rem > 0:
                    valid_addons = [a for a in beverages + sides if float(a.price) <= rem and a.canteen_id == main_item.canteen_id]
                    if valid_addons:
                        addon = random.choice(valid_addons)
                        cards.append(format_combo(main_item, addon, 92, "The Big Combo"))
                        combo_built = True
                        break
            if not combo_built:
                cards.append(format_item(random.choice(mains), 89, "The Big Combo"))
                
        # Card 4: Trending Now
        trending_mains = [t["item"] for t in trending if map_category(t["item"].category) == "MAIN"]
        if trending_mains:
            cards.append(format_item(trending_mains[0], 96, "Trending Now"))
        elif mains:
            cards.append(format_item(random.choice(mains), 90, "Trending Now"))
            
        # Card 5: Blind Spot
        if novelty_mains:
            cards.append(format_item(random.choice(novelty_mains), 91, "Blind Spot"))
        elif mains:
            cards.append(format_item(random.choice(mains), 87, "Blind Spot"))

        # Fallback if we don't have exactly 5 cards due to empty DB
        while len(cards) < 5:
            if mains:
                cards.append(format_item(random.choice(mains), random.randint(80, 85), "Chef's Pick"))
            else:
                break
                
        return cards[:5]
