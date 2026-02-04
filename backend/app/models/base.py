from enum import Enum
from datetime import datetime
from sqlalchemy import (
    Column,
    String,
    DateTime,
    Float,
    Boolean,
    ForeignKey,
    Enum as SQLEnum,
)
from sqlalchemy.ext.declarative import declarative_base
import uuid

Base = declarative_base()


class RecordType(str, Enum):
    SIMPLE = "simple"
    PAYMENT = "payment"
    CUSTOM = "custom"


class PeriodType(str, Enum):
    NATURAL_MONTH = "natural-month"
    MEMBERSHIP_MONTH = "membership-month"
    QUARTER = "quarter"
    YEAR = "year"


class Direction(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"


class CalendarProvider(str, Enum):
    ICLOUD = "icloud"
    GOOGLE = "google"
