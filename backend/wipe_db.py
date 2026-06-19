import asyncio
from sqlalchemy.ext.asyncio import create_async_engine
from app.core.config import settings

async def wipe():
    db_url = settings.DATABASE_URL
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://")
    engine = create_async_engine(db_url)
    async with engine.begin() as conn:
        from sqlalchemy import text
        # Find all tables in public schema except alembic_version
        result = await conn.execute(text("SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename != 'alembic_version'"))
        tables = [row[0] for row in result.all()]
        if tables:
            truncate_query = 'TRUNCATE TABLE ' + ', '.join(tables) + ' CASCADE;'
            print(f'Running: {truncate_query}')
            await conn.execute(text(truncate_query))
            print('All tables truncated successfully.')
        else:
            print('No tables found.')
    await engine.dispose()

if __name__ == '__main__':
    asyncio.run(wipe())
