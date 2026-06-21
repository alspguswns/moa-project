from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import User, Friendship, AICharacter, Achievement, Transaction
from datetime import date
import secrets, string

router = APIRouter()

def _gen_code():
    chars = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(chars) for _ in range(6))

def _ensure_code(user: User, db: Session) -> str:
    if not user.invite_code:
        while True:
            code = _gen_code()
            if not db.query(User).filter(User.invite_code == code).first():
                break
        user.invite_code = code
        db.commit()
    return user.invite_code

def _user_summary(uid: int, db: Session) -> dict:
    user = db.query(User).filter(User.id == uid).first()
    char = db.query(AICharacter).filter(AICharacter.user_id == uid).first()
    ach_count = db.query(Achievement).filter(Achievement.user_id == uid).count()

    month_prefix = date.today().strftime("%Y-%m")
    txs = db.query(Transaction).filter(
        Transaction.user_id == uid,
        Transaction.type == "지출",
        Transaction.date.like(f"{month_prefix}%")
    ).all()

    total = sum(t.amount for t in txs)
    cats: dict = {}
    for t in txs:
        cats[t.category] = cats.get(t.category, 0) + t.amount

    return {
        "nickname": user.nickname if user else "?",
        "seeds": user.seeds or 0,
        "character": {
            "name": char.name if char else "MOA",
            "stage": char.stage if char else "알",
            "exp": char.exp if char else 0,
            "profile_url": char.profile_url if char else "",
        },
        "achievements_count": ach_count,
        "this_month_total": total,
        "categories": cats,
    }

# ── 내 초대 코드 조회 ──────────────────────────────
@router.get("/my-code/{user_id}")
def get_my_code(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(404, "유저를 찾을 수 없어요")
    return {"invite_code": _ensure_code(user, db)}

# ── 친구 추가 ──────────────────────────────────────
class AddFriendReq(BaseModel):
    user_id: int
    invite_code: str

@router.post("/add")
def add_friend(req: AddFriendReq, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == req.user_id).first()
    if not user:
        raise HTTPException(404, "유저를 찾을 수 없어요")

    friend = db.query(User).filter(User.invite_code == req.invite_code.upper().strip()).first()
    if not friend:
        raise HTTPException(404, "해당 초대 코드를 가진 유저가 없어요")
    if friend.id == req.user_id:
        raise HTTPException(400, "자기 자신을 추가할 수 없어요")

    already = db.query(Friendship).filter(
        Friendship.user_id == req.user_id,
        Friendship.friend_id == friend.id
    ).first()
    if already:
        raise HTTPException(400, "이미 친구예요!")

    today = date.today().isoformat()
    db.add(Friendship(user_id=req.user_id, friend_id=friend.id, created_at=today))
    db.add(Friendship(user_id=friend.id, friend_id=req.user_id, created_at=today))
    db.commit()
    return {"message": f"{friend.nickname}님과 친구가 됐어요!", "friend_nickname": friend.nickname}

# ── 친구 목록 ──────────────────────────────────────
@router.get("/list/{user_id}")
def get_friends(user_id: int, db: Session = Depends(get_db)):
    rows = db.query(Friendship).filter(Friendship.user_id == user_id).all()
    result = []
    for f in rows:
        friend = db.query(User).filter(User.id == f.friend_id).first()
        char = db.query(AICharacter).filter(AICharacter.user_id == f.friend_id).first()
        if friend:
            result.append({
                "id": friend.id,
                "nickname": friend.nickname,
                "character_name": char.name if char else "MOA",
                "character_stage": char.stage if char else "알",
                "character_profile": char.profile_url if char else "",
            })
    return result

# ── 친구 삭제 ──────────────────────────────────────
@router.delete("/{user_id}/{friend_id}")
def remove_friend(user_id: int, friend_id: int, db: Session = Depends(get_db)):
    db.query(Friendship).filter(
        Friendship.user_id == user_id, Friendship.friend_id == friend_id
    ).delete()
    db.query(Friendship).filter(
        Friendship.user_id == friend_id, Friendship.friend_id == user_id
    ).delete()
    db.commit()
    return {"message": "친구를 삭제했어요"}

# ── 비교 데이터 ────────────────────────────────────
@router.get("/compare/{user_id}/{friend_id}")
def compare(user_id: int, friend_id: int, db: Session = Depends(get_db)):
    return {
        "me": _user_summary(user_id, db),
        "friend": _user_summary(friend_id, db),
    }
