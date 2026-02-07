from sqlalchemy import Column, DateTime, func, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import declared_attr

from app.db.session import Base

class TimestampMixin:
    @declared_attr
    def created_at(cls):
        return Column(DateTime, default=func.now())

    @declared_attr
    def updated_at(cls):
        return Column(DateTime, default=func.now(), onupdate=func.now())


class BaseModel(TimestampMixin):
    __abstract__ = True
    id = Column(Integer, primary_key=True, autoincrement=True)
    created_at = Column(DateTime, default=func.now())