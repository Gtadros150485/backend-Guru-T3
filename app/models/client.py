from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin


class Client(Base, TimestampMixin):
    """Клиенты"""
    __tablename__ = 'clients'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    address = Column(String(500), nullable=True)
    email = Column(String(255), nullable=True, unique=True, index=True)
    phone = Column(String(50), nullable=True)

    # Связь с заказами
    orders = relationship('order', back_populates='client', cascade='all, delete-orphan')