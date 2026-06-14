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
router = APIRouter()

@router.get("/{user_id}")
def analyze(user_id: int, db: Session = Depends(get_db)):
    transactions = db.query(Transaction).filter(Transaction.user_id == user_id).all()
    wishlist = db.query(Wishlist).filter(Wishlist.user_id == user_id).order_by(Wishlist.priority).all()

    if not transactions:
        return {
            "message": "아직 소비 내역이 없어요! 기록을 시작해봐요 🐷",
            "category_summary": {},
            "this_month_total": 0,
            "last_month_total": 0,
            "consumer_type": None,
            "wish_prediction": None
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

    # 위시리스트 전체
    wish_text = ""
    if wishlist:
        wish_text = "\n\n위시리스트: " + ", ".join([f"{w.name} ({w.price:,}원)" for w in wishlist[:3]])

    # 위시리스트 달성 예측 계산 (전체)
    income_list = [t for t in transactions if t.date.startswith(this_month) and t.type == "수입"]
    this_month_income = sum(t.amount for t in income_list)
    monthly_saving = this_month_income - this_month_total

    wish_prediction = None
    if wishlist and this_month_total > 0:
        predictions = []
        for wish in wishlist:
            if monthly_saving > 0:
                months_needed = round(wish.price / monthly_saving, 1)
            else:
                months_needed = None
            predictions.append({
                "name": wish.name,
                "price": wish.price,
                "monthly_saving": monthly_saving,
                "months_needed": months_needed
            })
        wish_prediction = predictions

    # GPT — 소비 처방전 + 소비 유형 분석 동시에
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": """너는 귀엽고 친근한 가계부 도우미야.
아래 형식으로 정확하게 JSON만 반환해줘. 다른 말은 하지 마.

{
  "message": "2~3문장 소비 처방전 (이모지 포함, 따뜻하게)",
  "consumer_type": {
    "type": "유형 이름 (예: 카페 의존형, 충동형 쇼퍼, 식비 절약왕, 균형 소비형, 알뜰 생활러)",
    "description": "한 줄 설명",
    "emoji": "어울리는 이모지 1개"
  }
}"""
            },
            {
                "role": "user",
                "content": f"이번달 총 지출: {this_month_total}원, 지난달 총 지출: {last_month_total}원\n카테고리별: {dict(category_summary)}\n내역:\n{summary}{wish_text}"
            }
        ],
        max_tokens=500
    )

    import json
    try:
        result = json.loads(response.choices[0].message.content)
        message = result.get("message", "")
        consumer_type = result.get("consumer_type", None)
    except:
        message = response.choices[0].message.content
        consumer_type = None

    return {
        "message": message,
        "category_summary": dict(category_summary),
        "this_month_total": this_month_total,
        "last_month_total": last_month_total,
        "consumer_type": consumer_type,
        "wish_prediction": wish_prediction
    }