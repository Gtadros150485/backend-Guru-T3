from app.models.base import BaseModel


class AddItemRequest(BaseModel):
    order_id: int
    nomenclature_id: int
    quantity: int 