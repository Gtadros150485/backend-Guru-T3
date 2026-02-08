from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, desc, asc
from typing import List, Optional
from app.db.session import get_async_db
from app.models.product import Product, Order
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductResponse,
    OrderCreate,
    OrderResponse
)
from app.auth.dependencies import get_current_user

router = APIRouter()


@router.get("/", response_model=List[ProductResponse])
async def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = Query("asc", pattern="^(asc|desc)$"),
    db: AsyncSession = Depends(get_async_db),
    current_user = Depends(get_current_user)
):
    stmt = select(Product)
    
    if search:
        search_filter = f"%{search}%"
        stmt = stmt.where(
            or_(
                Product.name.ilike(search_filter),
                Product.vendor.ilike(search_filter),
                Product.article.ilike(search_filter),
                Product.category.ilike(search_filter)
            )
        )
    
    if sort_by:
        if hasattr(Product, sort_by):
            column = getattr(Product, sort_by)
            if sort_order == "desc":
                stmt = stmt.order_by(desc(column))
            else:
                stmt = stmt.order_by(asc(column))
    
    stmt = stmt.offset(skip).limit(limit)
    result = await db.execute(stmt)
    products = result.scalars().all()
    return products


@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user = Depends(get_current_user)
):
    stmt = select(Product).where(Product.id == product_id)
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductResponse)
async def create_product(
    product_data: ProductCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user = Depends(get_current_user)
):
    stmt = select(Product).where(Product.article == product_data.article)
    result = await db.execute(stmt)
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Product with this article already exists")
    
    product = Product(**product_data.model_dump())
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: AsyncSession = Depends(get_async_db),
    current_user = Depends(get_current_user)
):
    stmt = select(Product).where(Product.id == product_id)
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_data.model_dump(exclude_unset=True)
    
    if "article" in update_data:
        stmt = select(Product).where(
            Product.article == update_data["article"],
            Product.id != product_id
        )
        result = await db.execute(stmt)
        existing = result.scalar_one_or_none()
        if existing:
            raise HTTPException(status_code=400, detail="Product with this article already exists")
    
    for field, value in update_data.items():
        setattr(product, field, value)
    
    await db.commit()
    await db.refresh(product)
    return product


@router.delete("/{product_id}")
async def delete_product(
    product_id: int,
    db: AsyncSession = Depends(get_async_db),
    current_user = Depends(get_current_user)
):
    stmt = select(Product).where(Product.id == product_id)
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    await db.delete(product)
    await db.commit()
    return {"message": "Product deleted successfully"}


@router.post("/orders", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    db: AsyncSession = Depends(get_async_db),
    current_user = Depends(get_current_user)
):
    stmt = select(Product).where(Product.id == order_data.product_id)
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    if product.quantity < order_data.quantity:
        raise HTTPException(status_code=400, detail="Insufficient product quantity")
    
    total_amount = product.price * order_data.quantity
    
    order = Order(
        product_id=product.id,
        product_name=product.name,
        vendor=product.vendor,
        article=product.article,
        quantity=order_data.quantity,
        price=product.price,
        total_amount=total_amount,
        status="pending"
    )
    
    product.quantity -= order_data.quantity
    
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return order


@router.get("/orders/", response_model=List[OrderResponse])
async def get_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_async_db),
    current_user = Depends(get_current_user)
):
    stmt = select(Order).offset(skip).limit(limit)
    result = await db.execute(stmt)
    orders = result.scalars().all()
    return orders
