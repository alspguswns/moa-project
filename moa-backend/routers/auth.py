from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from database import get_db
from models import User

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SECRET_KEY = "moa-secret-key-2026"
ALGORITHM = "HS256"

class SignupRequest(BaseModel):
    email: str
    password: str
    nickname: str

class LoginRequest(BaseModel):
    email: str
    password: str

def create_token(email: str):
    expire = datetime.utcnow() + timedelta(hours=24)
    return jwt.encode({"sub": email, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)

@router.post("/signup")
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="이미 사용중인 이메일이에요!")

    hashed_password = pwd_context.hash(request.password)
    new_user = User(
        email=request.email,
        password=hashed_password,
        nickname=request.nickname
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_token(new_user.email)
    return {"message": "회원가입 성공!", "token": token, "nickname": new_user.nickname}

@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(status_code=400, detail="이메일 또는 비밀번호가 틀렸어요!")

    if not pwd_context.verify(request.password, user.password):
        raise HTTPException(status_code=400, detail="이메일 또는 비밀번호가 틀렸어요!")

    token = create_token(user.email)
    return {"message": "로그인 성공!", "token": token, "nickname": user.nickname}