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
    WEEK = "week"
    MONTH = "month"
    QUARTER = "quarter"
    HALF_YEAR = "half-year"
    YEAR = "year"


class Direction(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"


class CalendarProvider(str, Enum):
    ICLOUD = "icloud"
    GOOGLE = "google"
