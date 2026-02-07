from fastapi import Depends, HTTPException
from sqlalchemy.orm import Session

from app.api.v1.endpoints.users import router
from app.db.session import get_db
from app.models import Nomenclature
from app.schemas.add_item import AddItemRequest




@router.post("/orders/add-item")
def add_item_to_order(
    data: AddItemRequest,
    db: Session = Depends(get_db)
):
    product = db.query(Nomenclature).filter(
        Nomenclature.id == data.nomenclature_id
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.quantity < data.quantity:
        raise HTTPException(
            status_code=409,
            detail="Not enough product in stock"
        )

    order_item = db.query(OrderItem).filter(
        OrderItem.order_id == data.order_id,
        OrderItem.nomenclature_id == data.nomenclature_id
    ).first()

    if order_item:
        order_item.quantity += data.quantity
    else:
        order_item = OrderItem(
            order_id=data.order_id,
            nomenclature_id=data.nomenclature_id,
            quantity=data.quantity,
            price_at_order_time=product.price
        )
        db.add(order_item)

    product.quantity -= data.quantity

    db.commit()

    return {"status": "ok"}
