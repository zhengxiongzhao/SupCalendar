from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.support import (
    CategoryCreate,
    PaymentMethodCreate,
    CategoryResponse,
    PaymentMethodResponse,
)
from app.models.support import Category, PaymentMethod

router = APIRouter(prefix="/support", tags=["support"])


@router.post("/categories", response_model=CategoryResponse)
def create_category(data: CategoryCreate, db: Session = Depends(get_db)):
    db_category = Category(name=data.name, type=data.type, color=data.color)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.get("/categories", response_model=list[CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()


@router.post("/payment-methods", response_model=PaymentMethodResponse)
def create_payment_method(data: PaymentMethodCreate, db: Session = Depends(get_db)):
    db_method = PaymentMethod(name=data.name)
    db.add(db_method)
    db.commit()
    db.refresh(db_method)
    return db_method


@router.get("/payment-methods", response_model=list[PaymentMethodResponse])
def get_payment_methods(db: Session = Depends(get_db)):
    return db.query(PaymentMethod).all()
