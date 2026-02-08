from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category: str = Field(..., min_length=1, max_length=100)
    vendor: str = Field(..., min_length=1, max_length=100)
    article: str = Field(..., min_length=1, max_length=100)
    rating: float = Field(default=0.0, ge=0, le=5)
    price: float = Field(..., gt=0)
    image_url: Optional[str] = None
    description: Optional[str] = None
    quantity: int = Field(default=0, ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    vendor: Optional[str] = Field(None, min_length=1, max_length=100)
    article: Optional[str] = Field(None, min_length=1, max_length=100)
    rating: Optional[float] = Field(None, ge=0, le=5)
    price: Optional[float] = Field(None, gt=0)
    image_url: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[int] = Field(None, ge=0)


class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OrderBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)


class OrderCreate(OrderBase):
    pass


class OrderResponse(BaseModel):
    id: int
    product_id: int
    product_name: str
    vendor: str
    article: str
    quantity: int
    price: float
    total_amount: float
    status: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
