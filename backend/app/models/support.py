from sqlalchemy import Column, String
from app.models.base import Base, Direction, SQLEnum, uuid


class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    type = Column(SQLEnum(Direction), nullable=False)
    color = Column(String)


class PaymentMethod(Base):
    __tablename__ = "payment_methods"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False, unique=True)


class CalendarSync(Base):
    __tablename__ = "calendar_syncs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    provider = Column(SQLEnum, nullable=False)
    account_id = Column(String, nullable=False)
    enabled = Column(String, default=False)
    last_sync_at = Column(String)
    auth_data = Column(String)


class CustomFieldTemplate(Base):
    __tablename__ = "custom_field_templates"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    fields = Column(String, nullable=False)
