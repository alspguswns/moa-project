from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from passlib.context import CryptContext
from database import get_db
from models import User

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class SignupRequest(BaseModel):
    email: str
    password: str
    nickname: str

@router.post("/signup")
def signup(request: SignupRequest, db: Session = Depends(get_db)):
    # 이미 가입된 이메일인지 확인
    existing_user = db.query(User).filter(User.email == request.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="이미 사용중인 이메일이에요!")

    # 비밀번호 암호화
    hashed_password = pwd_context.hash(request.password)

    # 유저 저장
    new_user = User(
        email=request.email,
        password=hashed_password,
        nickname=request.nickname
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "회원가입 성공!", "nickname": new_user.nickname}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth")

@app.get("/")
def read_root():
    return {"message": "MOA 백엔드 서버 작동중!"}