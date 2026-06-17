import asyncio
import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

load_dotenv()

async def main():
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        db_url = db_url.replace("postgres://", "postgresql+asyncpg://").replace("postgresql://", "postgresql+asyncpg://")
    
    engine = create_async_engine(db_url, connect_args={"statement_cache_size": 0})
    async with engine.connect() as conn:
        try:
            await conn.execute(text("DROP TABLE IF EXISTS alembic_version;"))
            await conn.commit()
            print("Dropped alembic_version successfully.")
        except Exception as e:
            print(f"Error dropping alembic_version: {e}")
            
    await engine.dispose()

asyncio.run(main())
