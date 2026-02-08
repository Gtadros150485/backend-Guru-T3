from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.database import get_db
from app.models.user import User
from app.schemas.auth import (
    Token,
    LoginRequest,
    UserCreate,
    UserResponse,
    RefreshTokenRequest
)
from app.auth.password import verify_password, get_password_hash
from app.auth.jwt_handler import jwt_handler
from app.auth.dependencies import get_current_user
from app.core.config import settings

router = APIRouter()


@router.post("/login", response_model=Token)
def login(
        login_data: LoginRequest,
        db: Session = Depends(get_db)
) -> Any:
    user = db.query(User).filter(
        or_(
            User.username == login_data.username,
            User.email == login_data.username
        )
    ).first()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    refresh_token_expires = timedelta(
        days=settings.REFRESH_TOKEN_EXPIRE_DAYS
    ) if login_data.remember_me else timedelta(days=1)

    access_token = jwt_handler.create_access_token(
        data={"sub": user.id},
        expires_delta=access_token_expires
    )

    refresh_token = jwt_handler.create_refresh_token(
        data={"sub": user.id},
        expires_delta=refresh_token_expires
    )

    user.refresh_token = refresh_token
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


@router.post("/refresh", response_model=Token)
def refresh_token(
        refresh_data: RefreshTokenRequest,
        db: Session = Depends(get_db)
) -> Any:
    payload = jwt_handler.verify_token(refresh_data.refresh_token)

    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    user = db.query(User).filter(
        User.id == user_id,
        User.is_active == True,
        User.refresh_token == refresh_data.refresh_token
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    access_token = jwt_handler.create_access_token(
        data={"sub": user.id}
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_data.refresh_token,  # Same refresh token
        "token_type": "bearer"
    }


@router.post("/register", response_model=UserResponse)
def register(
        user_data: UserCreate,
        db: Session = Depends(get_db)
) -> Any:
    existing_user = db.query(User).filter(
        or_(
            User.email == user_data.email,
            User.username == user_data.username
        )
    ).first()

    if existing_user:
        if existing_user.email == user_data.email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )

    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hashed_password,
        is_active=True,
        is_superuser=False
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/logout")
def logout(
        current_user: User = Depends(get_current_user),
        db: Session = Depends(get_db)
) -> Any:

    current_user.refresh_token = None
    db.commit()

    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
        current_user: User = Depends(get_current_user)
) -> Any:

    return current_user