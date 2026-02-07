from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.user import UserCreate, UserResponse

router = APIRouter()
@router.get("/", response_model=List[UserResponse])
async def get_users():
    return []

@router.post("/", response_model=UserResponse)
async def create_user(user: UserCreate):
    return user

