from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import Wishlist

router = APIRouter()

class WishlistRequest(BaseModel):
    user_id: int
    name: str
    price: int
    priority: int = 1
    memo: str = ""

@router.get("/{user_id}")
def get_wishlist(user_id: int, db: Session = Depends(get_db)):
    items = db.query(Wishlist).filter(Wishlist.user_id == user_id).order_by(Wishlist.priority).all()
    return items

@router.post("/")
def add_wishlist(request: WishlistRequest, db: Session = Depends(get_db)):
    item = Wishlist(
        user_id=request.user_id,
        name=request.name,
        price=request.price,
        priority=request.priority,
        memo=request.memo
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.delete("/{item_id}")
def delete_wishlist(item_id: int, db: Session = Depends(get_db)):
    item = db.query(Wishlist).filter(Wishlist.id == item_id).first()
    if item:
        db.delete(item)
        db.commit()
    return {"message": "삭제 완료!"}