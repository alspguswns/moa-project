from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Transaction

router = APIRouter()

class ExpenseRequest(BaseModel):
    user_id: int
    type: str
    amount: int
    category: str
    memo: str
    date: str

@router.post("/")
def create_expense(request: ExpenseRequest, db: Session = Depends(get_db)):
    new_transaction = Transaction(
        user_id=request.user_id,
        type=request.type,
        amount=request.amount,
        category=request.category,
        memo=request.memo,
        date=request.date
    )
    db.add(new_transaction)
    db.commit()
    db.refresh(new_transaction)
    return {"message": "저장 완료!", "id": new_transaction.id}

@router.get("/{user_id}")
def get_expenses(user_id: int, db: Session = Depends(get_db)):
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id
    ).all()
    return transactions

@router.delete("/{transaction_id}")
def delete_expense(transaction_id: int, db: Session = Depends(get_db)):
    transaction = db.query(Transaction).filter(
        Transaction.id == transaction_id
    ).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="해당 내역을 찾을 수 없어요!")
    db.delete(transaction)
    db.commit()
    return {"message": "삭제 완료!"}

@router.get("/summary/{user_id}")
def get_summary(user_id: int, db: Session = Depends(get_db)):
    from datetime import datetime
    current_month = datetime.now().strftime("%Y-%m")

    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.date.like(f"{current_month}%")
    ).all()

    total_income = sum(t.amount for t in transactions if t.type == "수입")
    total_expense = sum(t.amount for t in transactions if t.type == "지출")

    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "balance": total_income - total_expense
    }

@router.get("/category/{user_id}")
def get_category_stats(user_id: int, db: Session = Depends(get_db)):
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.type == "지출"
    ).all()

    stats = {}
    for t in transactions:
        if t.category not in stats:
            stats[t.category] = 0
        stats[t.category] += t.amount

    return stats

@router.get("/monthly/{user_id}/{month}")
def get_monthly(user_id: int, month: str, db: Session = Depends(get_db)):
    transactions = db.query(Transaction).filter(
        Transaction.user_id == user_id,
        Transaction.date.like(f"{month}%")
    ).all()
    return transactions