# Импортируем все модели для удобства
from .base import Base, TimestampMixin
from .category import Category
from .nomenclature import Nomenclature
from .client import Client
from .order import Order
from .association import order_item_association

# Для Alembic autogenerate
__all__ = [
    'Base',
    'Category',
    'Nomenclature',
    'Client',
    'Order',
    'order_item_association',
    'TimestampMixin'
]