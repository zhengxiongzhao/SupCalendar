from pydantic import BaseModel
from app.models.base import Direction


class CategoryCreate(BaseModel):
    name: str
    type: Direction
    color: str | None = None


class CategoryResponse(BaseModel):
    id: str
    name: str
    type: Direction
    color: str | None


class PaymentMethodCreate(BaseModel):
    name: str


class PaymentMethodResponse(BaseModel):
    id: str
    name: str
