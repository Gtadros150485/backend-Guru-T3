from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, validator

from app.models.user import User


class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str =  'bearer'

class TokenPayload(BaseModel):
    sub: Optional[int] = None
    exp: Optional[datetime] = None


class UserCreate(Token):
    password: str

    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v
class UserInDB(User):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
class UserResponse(UserInDB):
    pass

class LoginRequest(BaseModel):
    username: str
    password: str
    remember_me: bool = False

class RefreshTokenRequest(BaseModel):
    refresh_token: str

