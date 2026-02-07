# app/api/v1/api.py
from fastapi import APIRouter
from app.api.v1 import auth, users

api_router = APIRouter()
