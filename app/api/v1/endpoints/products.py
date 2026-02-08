from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
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
def get_products(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    search: Optional[str] = None,
    sort_by: Optional[str] = None,
    sort_order: Optional[str] = Query("asc", regex="^(asc|desc)$"),
    db: Session = Depends(get_async_db),
    current_user = Depends(get_current_user)
):
    query = db.query(Product)
    
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Product.name.ilike(search_filter)) |
            (Product.vendor.ilike(search_filter)) |
            (Product.article.ilike(search_filter)) |
            (Product.category.ilike(search_filter))
        )
    
    if sort_by:
        if hasattr(Product, sort_by):
            column = getattr(Product, sort_by)
            if sort_order == "desc":
                query = query.order_by(column.desc())
            else:
                query = query.order_by(column.asc())
    
    products = query.offset(skip).limit(limit).all()
    return products


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    db: Session = Depends(get_async_db),
    current_user = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.post("/", response_model=ProductResponse)
def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_async_db),
    current_user = Depends(get_current_user)
):
    existing = db.query(Product).filter(Product.article == product_data.article).first()
    if existing:
        raise HTTPException(status_code=400, detail="Product with this article already exists")
    
    product = Product(**product_data.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    product_data: ProductUpdate,
    db: Session = Depends(get_async_db),
    current_user = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_data.model_dump(exclude_unset=True)
    
    if "article" in update_data:
        existing = db.query(Product).filter(
            Product.article == update_data["article"],
            Product.id != product_id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Product with this article already exists")
    
    for field, value in update_data.items():
        setattr(product, field, value)
    
    db.commit()
    db.refresh(product)
    return product


@router.delete("/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_async_db),
    current_user = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.delete(product)
    db.commit()
    return {"message": "Product deleted successfully"}


@router.post("/orders", response_model=OrderResponse)
def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_async_db),
    current_user = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == order_data.product_id).first()
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
    db.commit()
    db.refresh(order)
    return order


@router.get("/orders/", response_model=List[OrderResponse])
def get_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_async_db),
    current_user = Depends(get_current_user)
):
    orders = db.query(Order).offset(skip).limit(limit).all()
    return orders
