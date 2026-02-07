# app/core/config.py
from pydantic_settings import BaseSettings
from typing import Optional
from functools import lru_cache

class Settings(BaseSettings):
    PROJECT_NAME: str = "It guru"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: Optional[str] = None

    # Security
    SECRET_KEY: str = "your-secret-key-here"  # Change in production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ASYNC_DATABASE_URL: Optional[str] = None
    ASYNC_SECRET_KEY: Optional[str] = None
    ASYNC_ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"

@lru_cache(maxsize=None)
def get_settings():
    return Settings()

settings = Settings()