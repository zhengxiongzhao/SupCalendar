from datetime import datetime
from sqlalchemy import Column, String, DateTime, Float, ForeignKey, JSON
from app.models.base import Base, RecordType, PeriodType, Direction, SQLEnum, uuid


class BaseRecord(Base):
    __tablename__ = "records"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    type = Column(SQLEnum(RecordType), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    __mapper_args__ = {"polymorphic_on": "type", "polymorphic_identity": "base"}


class SimpleRecord(BaseRecord):
    __tablename__ = "simple_records"

    record_id = Column(String, ForeignKey("records.id"), primary_key=True)
    name = Column(String, nullable=False)
    time = Column(DateTime, nullable=False)
    period = Column(SQLEnum(PeriodType), nullable=False)
    description = Column(String)

    __mapper_args__ = {"polymorphic_identity": RecordType.SIMPLE}


class PaymentRecord(BaseRecord):
    __tablename__ = "payment_records"

    record_id = Column(String, ForeignKey("records.id"), primary_key=True)
    name = Column(String, nullable=False)
    description = Column(String)
    direction = Column(SQLEnum(Direction), nullable=False)
    category = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    payment_method = Column(String, nullable=False)
    period = Column(SQLEnum(PeriodType), nullable=False)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime)
    notes = Column(String)
    currency = Column(String(3), default="CNY")

    __mapper_args__ = {"polymorphic_identity": RecordType.PAYMENT}


class CustomRecord(BaseRecord):
    __tablename__ = "custom_records"

    record_id = Column(String, ForeignKey("records.id"), primary_key=True)
    template_id = Column(String, ForeignKey("custom_field_templates.id"))
    custom_fields = Column(JSON, nullable=False)

    __mapper_args__ = {"polymorphic_identity": RecordType.CUSTOM}
