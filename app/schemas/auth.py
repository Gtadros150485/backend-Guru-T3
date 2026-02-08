from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, validator, ConfigDict


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: str


class TokenPayload(BaseModel):
    sub: Optional[int] = None
    exp: Optional[datetime] = None


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserBase(BaseModel):
    email: EmailStr
    is_active: bool = True


class UserCreate(UserBase):
    username: str
    full_name: str
    password: str

    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v
    
    @validator('username')
    def username_length(cls, v):
        if len(v) < 3:
            raise ValueError('Username must be at least 3 characters long')
        return v


class UserInDB(UserBase):
    id: int
    hashed_password: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    username: str
    full_name: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    username: str  # Can be either username or email
    password: str
    remember_me: bool = False