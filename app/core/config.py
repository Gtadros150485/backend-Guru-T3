import json
from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field, validator


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = Field(default="postgresql://postgres:password@localhost:5432/dbname")
    ASYNC_DATABASE_URL: str = Field(default="postgresql+asyncpg://postgres:password@localhost:5432/dbname")

    # PostgreSQL separate variables
    POSTGRES_SERVER: str = Field(default="localhost")
    POSTGRES_USER: str = Field(default="postgres")
    POSTGRES_PASSWORD: str = Field(default="password")
    POSTGRES_DB: str = Field(default="dbname")
    POSTGRES_PORT: str = Field(default="5432")

    # API
    API_V1_STR: str = Field(default="/api/v1")
    PROJECT_NAME: str = Field(default="IT Guru T3")

    # JWT
    SECRET_KEY: str = Field(default="your-very-secret-key-change-this-in-production")
    ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30)
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7)

    # CORS
    BACKEND_CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173", "http://localhost:8000"])

    # Redis
    REDIS_HOST: str = Field(default="redis")
    REDIS_PORT: str = Field(default="6379")

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v.replace("'", '"'))
            except json.JSONDecodeError:
                if "," in v:
                    return [origin.strip() for origin in v.split(",")]
                return [v.strip()]
        return v

    @validator("DATABASE_URL", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: dict) -> str:
        if isinstance(v, str):
            return v
        return f"postgresql://{values.get('POSTGRES_USER')}:{values.get('POSTGRES_PASSWORD')}@{values.get('POSTGRES_SERVER')}:{values.get('POSTGRES_PORT')}/{values.get('POSTGRES_DB')}"

    @validator("ASYNC_DATABASE_URL", pre=True)
    def assemble_async_db_connection(cls, v: Optional[str], values: dict) -> str:
        if isinstance(v, str):
            return v
        return f"postgresql+asyncpg://{values.get('POSTGRES_USER')}:{values.get('POSTGRES_PASSWORD')}@{values.get('POSTGRES_SERVER')}:{values.get('POSTGRES_PORT')}/{values.get('POSTGRES_DB')}"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()