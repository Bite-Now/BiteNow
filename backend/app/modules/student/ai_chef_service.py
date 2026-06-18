import json
import uuid
import asyncio
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from groq import AsyncGroq
from app.core.config import settings
from app.modules.menu.models import MenuItem

class AIChefService:
    def __init__(self, db: AsyncSession):
        self.db = db
        # Initialize Groq client
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)

    async def get_pre_filtered_items(self, budget: float) -> List[MenuItem]:
        """Fetch up to 50 popular/available menu items under budget."""
        stmt = (
            select(MenuItem)
            .where(MenuItem.price <= budget)
            .where(MenuItem.is_available == True)
            .limit(50)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def generate_ai_combos(self, budget: float) -> List[Dict[str, Any]]:
        menu_items = await self.get_pre_filtered_items(budget)
        
        if not menu_items:
            raise ValueError("No items available under budget")

        # Prepare JSON context for the LLM
        items_context = [
            {
                "id": str(item.id),
                "name": item.name,
                "price": float(item.price),
                "category": item.category,
                "canteen_id": str(item.canteen_id),
                "image_url": item.image_url
            }
            for item in menu_items
        ]

        prompt = f"""
You are an expert AI Chef. The user has a budget of ₹{budget}.
Here is a JSON list of available menu items:
{json.dumps(items_context)}

Your task is to create exactly 10 delicious and culturally cohesive meal combinations from this list.
Rules:
1. Each combo must mathematically cost less than or equal to the budget.
2. Combos can be a single main course, or a main course + side/beverage.
3. Do NOT mix weird cuisines (e.g., don't pair Pizza with Indian Curry).
4. If it's a single item like "Roti" or "Naan", DO NOT suggest it alone. It must be paired with a curry/dal. If you can't, pick something else.
5. Items in a combo MUST come from the same canteen_id.
6. Return pure JSON matching this exact schema:
[
  {{
    "label": "The Safe Bet",
    "name": "Combo Name (e.g. Kadai Paneer & 2x Roti)",
    "matchScore": 95,
    "items": [
      {{"id": "item_id", "name": "Item Name", "price": 120.0, "quantity": 1, "canteen_id": "canteen_id", "image_url": "image_url"}}
    ]
  }}
]
Do not include markdown blocks, just the raw JSON array.
"""

        try:
            # Enforce a strict timeout of 2.5 seconds using asyncio.wait_for
            chat_completion = await asyncio.wait_for(
                self.client.chat.completions.create(
                    messages=[
                        {
                            "role": "system",
                            "content": "You are a JSON-only API. You must output a raw JSON array and nothing else."
                        },
                        {
                            "role": "user",
                            "content": prompt,
                        }
                    ],
                    model="llama-3.3-70b-versatile",
                    temperature=0.7,
                ),
                timeout=6.0
            )
            
            response_text = chat_completion.choices[0].message.content.strip()
            
            # Cleanup any markdown if the model hallucinated it
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
                
            combos = json.loads(response_text)
            
            formatted_cards = []
            seen_items = set()
            
            for combo in combos:
                # Deduplication logic: check if any item in this combo was already used
                combo_item_ids = [item["id"] for item in combo.get("items", [])]
                
                if any(item_id in seen_items for item_id in combo_item_ids):
                    continue # Skip this combo, it's a duplicate
                
                # Mark these items as seen
                seen_items.update(combo_item_ids)
                
                total_price = sum(item["price"] * item.get("quantity", 1) for item in combo.get("items", []))
                image = combo["items"][0].get("image_url", "") if combo.get("items") else ""
                
                formatted_cards.append({
                    "id": f"mystery_{uuid.uuid4()}",
                    "label": combo.get("label", "AI Special"),
                    "name": combo.get("name", "Combo"),
                    "price": float(total_price),
                    "image": image,
                    "matchScore": combo.get("matchScore", 90),
                    "source": "AI Chef",
                    "time": "15 min",
                    "items": combo.get("items", [])
                })
                
                # Stop once we have 5 perfectly unique combos
                if len(formatted_cards) == 5:
                    break
                
            return formatted_cards

        except Exception as e:
            # Re-raise so the router catches it and uses the fallback
            raise e
