from sqlalchemy import Table, Column, Integer, ForeignKey, Float

from .base import Base

order_item_association = Table(
    'order_item_association',
    Base.metadata,
    Column('id', Integer, primary_key=True,index=True),
    Column('order_id', Integer, ForeignKey('orders.id'), nullable=False),
    Column('item_id', Integer, ForeignKey('nomenclature.id'), nullable=False),
    Column('quantity', Integer, nullable=False, default=1),
    Column('price_at_order', Float, nullable=False),
)