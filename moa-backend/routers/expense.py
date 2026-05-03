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