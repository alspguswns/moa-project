import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, expense, ai, wishlist, character, game

Base.metadata.create_all(bind=engine)

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

@app.get("/")
def read_root():
    return {"message": "MOA 백엔드 서버 작동중!"}