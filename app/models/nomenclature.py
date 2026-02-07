from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin


class Nomenclature(Base, TimestampMixin):
    __tablename__ = 'nomenclature'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    quantity = Column(Integer, default=0, nullable=False)
    price = Column(Float, nullable=False)

    category_id = Column(Integer, ForeignKey('categories.id'), nullable=True)
    category = relationship('Category', back_populates='items')
    orders = relationship('Order', secondary='order_item_association', back_populates='items')