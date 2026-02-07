from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base, TimestampMixin


class Category(Base, TimestampMixin):
    __tablename__ = 'categories'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    parent_id = Column(Integer, ForeignKey('categories.id'), nullable=True)

    parent = relationship('Category', remote_side=[id], back_populates='children')
    children = relationship('Category', back_populates='parent', cascade='all, delete-orphan')
    items = relationship('Nomenclature', back_populates='category')