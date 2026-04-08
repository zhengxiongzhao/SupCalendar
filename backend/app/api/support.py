from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.support import (
    CategoryCreate,
    CategoryUpdate,
    PaymentMethodCreate,
    PaymentMethodUpdate,
    CategoryResponse,
    PaymentMethodResponse,
)
from app.models.support import Category, PaymentMethod
from app.models.record import PaymentRecord

router = APIRouter(prefix="/support", tags=["support"])


@router.post("/categories", response_model=CategoryResponse)
def create_category(data: CategoryCreate, db: Session = Depends(get_db)):
    user_id = data.user_id or "default"
    db_category = Category(name=data.name, user_id=user_id)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category


@router.get("/categories", response_model=list[CategoryResponse])
def get_categories(user_id: str = "default", db: Session = Depends(get_db)):
    return db.query(Category).filter(Category.user_id == user_id).all()


@router.put("/categories/{category_id}", response_model=CategoryResponse)
def update_category(
    category_id: str, data: CategoryUpdate, db: Session = Depends(get_db)
):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="分类不存在")

    if data.name is not None:
        category.name = data.name

    db.commit()
    db.refresh(category)
    return category


@router.delete("/categories/{category_id}")
def delete_category(category_id: str, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="分类不存在")

    if category.records:
        raise HTTPException(
            status_code=400,
            detail=f"分类「{category.name}」被 {len(category.records)} 条记录使用，无法删除",
        )

    db.delete(category)
    db.commit()
    return {"message": "分类已删除"}


@router.post("/payment-methods", response_model=PaymentMethodResponse)
def create_payment_method(data: PaymentMethodCreate, db: Session = Depends(get_db)):
    user_id = data.user_id or "default"
    existing = (
        db.query(PaymentMethod)
        .filter(PaymentMethod.name == data.name, PaymentMethod.user_id == user_id)
        .first()
    )
    if existing:
        return existing

    db_method = PaymentMethod(name=data.name, user_id=user_id)
    db.add(db_method)
    db.commit()
    db.refresh(db_method)
    return db_method


@router.get("/payment-methods", response_model=list[PaymentMethodResponse])
def get_payment_methods(user_id: str = "default", db: Session = Depends(get_db)):
    return db.query(PaymentMethod).filter(PaymentMethod.user_id == user_id).all()


@router.put("/payment-methods/{method_id}", response_model=PaymentMethodResponse)
def update_payment_method(
    method_id: str, data: PaymentMethodUpdate, db: Session = Depends(get_db)
):
    method = db.query(PaymentMethod).filter(PaymentMethod.id == method_id).first()
    if not method:
        raise HTTPException(status_code=404, detail="付款方式不存在")

    if data.name is not None:
        method.name = data.name

    db.commit()
    db.refresh(method)
    return method


@router.delete("/payment-methods/{method_id}")
def delete_payment_method(method_id: str, db: Session = Depends(get_db)):
    method = db.query(PaymentMethod).filter(PaymentMethod.id == method_id).first()
    if not method:
        raise HTTPException(status_code=404, detail="付款方式不存在")

    if method.records:
        raise HTTPException(
            status_code=400,
            detail=f"付款方式「{method.name}」被 {len(method.records)} 条记录使用，无法删除",
        )

    db.delete(method)
    db.commit()
    return {"message": "付款方式已删除"}


@router.post("/categories/auto-create")
def auto_create_category(data: CategoryCreate, db: Session = Depends(get_db)):
    user_id = data.user_id or "default"
    existing = (
        db.query(Category)
        .filter(Category.name == data.name, Category.user_id == user_id)
        .first()
    )
    if existing:
        return existing

    return create_category(data, db)


@router.post("/payment-methods/auto-create")
def auto_create_payment_method(
    data: PaymentMethodCreate, db: Session = Depends(get_db)
):
    return create_payment_method(data, db)
