# app/main.py
from starlette.middleware.cors import CORSMiddleware

from app.core.database import engine, create_tables
from app.api.v1.api import api_router
from app.models import Base
import app
from fastapi import FastAPI
from app.api.v1.api import  api_router
from app.core.config import settings
app.include_router(api_router, prefix=settings.API_V1_STR)
create_tables()
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Include API router


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    pass

@app.get("/")
async def root():
    return {"message": "Welcome to Unicorn API"}

