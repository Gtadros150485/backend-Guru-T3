from datetime import datetime

from sqlalchemy.orm import relationship
from sqlalchemy import Column, Integer, ForeignKey, Float, DateTime, String

from app.db.session import Base


class Order(Base):
    __tablename__ = 'orders'
    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey('clients.id'), nullable=False)
    client = relationship('client', back_populates='orders')
    items = relationship(
        'Nomenclature',
        secondary='order_item_association',
        back_populates='orders'
    )
    total_amount = Column(Float, default=0.0)
    status = Column(String(50), default='pending')
    order_date = Column(DateTime, default=datetime.datetime.utcnow)


