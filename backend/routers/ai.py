from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import Transaction, Wishlist
from openai import OpenAI
from datetime import date
from collections import defaultdict
import os
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
router = APIRouter()  # ← 이 줄 추가

@router.get("/{user_id}")
def analyze(user_id: int, db: Session = Depends(get_db)):
    transactions = db.query(Transaction).filter(Transaction.user_id == user_id).all()
    wishlist = db.query(Wishlist).filter(Wishlist.user_id == user_id).order_by(Wishlist.priority).all()

    if not transactions:
        return {
            "message": "아직 소비 내역이 없어요! 기록을 시작해봐요 🐷",
            "category_summary": {},
            "this_month_total": 0,
            "last_month_total": 0
        }

    today = date.today()
    this_month = f"{today.year}-{str(today.month).zfill(2)}"
    last_month_date = date(today.year, today.month - 1, 1) if today.month > 1 else date(today.year - 1, 12, 1)
    last_month = f"{last_month_date.year}-{str(last_month_date.month).zfill(2)}"

    this_month_data = [t for t in transactions if t.date.startswith(this_month) and t.type == "지출"]
    last_month_data = [t for t in transactions if t.date.startswith(last_month) and t.type == "지출"]

    this_month_total = sum(t.amount for t in this_month_data)
    last_month_total = sum(t.amount for t in last_month_data)

    category_summary = defaultdict(int)
    for t in this_month_data:
        category_summary[t.category] += t.amount

    summary = "\n".join([
        f"{t.date} {t.category} {t.type} {t.amount}원 ({t.memo})"
        for t in transactions[-20:]
    ])

    # 위시리스트 1순위 항목
    top_wish = wishlist[0] if wishlist else None
    wish_text = f"\n\n사용자의 위시리스트 1순위: {top_wish.name} ({top_wish.price:,}원)" if top_wish else ""

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "너는 귀엽고 친근한 가계부 도우미야. 사용자의 소비 내역을 분석해서 2~3문장으로 짧고 따뜻하게 피드백해줘. 위시리스트 1순위 항목이 있으면 현재 소비 패턴으로 얼마나 걸릴지도 알려줘. 이모지도 써줘."
            },
            {
                "role": "user",
                "content": f"이번달 총 지출: {this_month_total}원, 지난달 총 지출: {last_month_total}원\n내역:\n{summary}{wish_text}\n\n분석해줘!"
            }
        ],
        max_tokens=500
    )

    return {
        "message": response.choices[0].message.content,
        "category_summary": dict(category_summary),
        "this_month_total": this_month_total,
        "last_month_total": last_month_total
    }