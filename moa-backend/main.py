import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, expense, ai, wishlist, character, game, friends

Base.metadata.create_all(bind=engine)

# 기존 DB에 새 컬럼/테이블 추가 (없을 때만 실행)
def run_migrations():
    from sqlalchemy import text
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE users ADD COLUMN invite_code TEXT UNIQUE"))
            conn.commit()
        except Exception:
            pass  # 이미 존재하면 무시
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS friendships (
                    id INTEGER PRIMARY KEY,
                    user_id INTEGER,
                    friend_id INTEGER,
                    created_at TEXT
                )
            """))
            conn.commit()
        except Exception:
            pass

run_migrations()

app = FastAPI()

_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:5174")
origins = [o.strip() for o in _origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth")
app.include_router(expense.router, prefix="/expense")
app.include_router(ai.router, prefix="/ai")
app.include_router(wishlist.router, prefix="/wishlist")
app.include_router(character.router, prefix="/character")
app.include_router(game.router, prefix="/game")
app.include_router(friends.router, prefix="/friends")

@app.get("/")
def read_root():
    return {"message": "MOA 백엔드 서버 작동중!"}