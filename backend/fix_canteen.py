import asyncio
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import AsyncSessionLocal
from app.modules.auth.models import User, Canteen
import uuid

async def main():
    async with AsyncSessionLocal() as db:
        # Get users with OWNER role
        res = await db.execute(select(User).where(User.role == 'OWNER'))
        owners = res.scalars().all()
        
        for owner in owners:
            if not owner.canteen_id:
                print(f"Assigning canteen for {owner.email}...")
                
                # Check if they already own a canteen (edge case)
                canteen_res = await db.execute(select(Canteen).where(Canteen.owner_id == owner.id))
                existing = canteen_res.scalars().first()
                
                if existing:
                    owner.canteen_id = existing.id
                    print(f"  Linked to existing canteen: {existing.name}")
                else:
                    new_canteen = Canteen(
                        name=f"{owner.full_name or 'Owner'}'s Canteen",
                        slug=f"canteen-{str(uuid.uuid4())[:8]}",
                        owner_id=owner.id,
                        is_active=True,
                        is_open=True
                    )
                    db.add(new_canteen)
                    await db.flush()
                    owner.canteen_id = new_canteen.id
                    print(f"  Created new canteen: {new_canteen.name}")
                    
        await db.commit()
        print("Done!")

if __name__ == '__main__':
    asyncio.run(main())
