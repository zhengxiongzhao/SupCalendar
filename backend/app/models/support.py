from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.models.base import Base, SQLEnum, uuid


class Category(Base):
    __tablename__ = "categories"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, default="default", nullable=False)
    name = Column(String, nullable=False)

    records = relationship(
        "PaymentRecord", secondary="record_categories", back_populates="categories"
    )


class PaymentMethod(Base):
    __tablename__ = "payment_methods"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, default="default", nullable=False)
    name = Column(String, nullable=False)

    records = relationship(
        "PaymentRecord",
        secondary="record_payment_methods",
        back_populates="payment_methods",
    )


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
