from pydantic import BaseModel


class CategoryCreate(BaseModel):
    name: str
    user_id: str = "default"


class CategoryUpdate(BaseModel):
    name: str | None = None


class CategoryResponse(BaseModel):
    id: str
    user_id: str
    name: str

    class Config:
        from_attributes = True


class PaymentMethodCreate(BaseModel):
    name: str
    user_id: str = "default"


class PaymentMethodUpdate(BaseModel):
    name: str | None = None


class PaymentMethodResponse(BaseModel):
    id: str
    user_id: str
    name: str

    class Config:
        from_attributes = True
