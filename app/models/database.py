# app/models/database.py
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=True,  # Set to False in production
    future=True,
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()


# Async dependency
async def get_async_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# Keep the sync version if you need it for migrations or other sync operations
def get_db():
    # This is for sync operations (like Alembic migrations)
    from sqlalchemy.orm import Session
    from sqlalchemy import create_engine

    sync_engine = create_engine(
        str(settings.DATABASE_URL).replace('+asyncpg', ''),  # Remove asyncpg
        pool_pre_ping=True
    )
    SyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=sync_engine)

    db = SyncSessionLocal()
    try:
        yield db
    finally:
        db.close()