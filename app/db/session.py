from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine

from app.core.config import settings
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,
    echo=False,
    future=True,
)

Sessionlocal = sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

AsyncSessionLocal = sessionmaker(autocommit=False, autoflush=False, class_=AsyncSession)
Base = declarative_base()
def get_db():
    db = Sessionlocal()
    try:
        yield db
    finally:
        db.close()

async def get_async_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

