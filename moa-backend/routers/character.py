from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import AICharacter, Transaction
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class CharacterRequest(BaseModel):
    user_id: int
    name: str
    style: str
    profile_url: str = ""
    system_prompt: str = ""

class ChatRequest(BaseModel):
    user_id: int
    message: str

@router.get("/{user_id}")
def get_character(user_id: int, db: Session = Depends(get_db)):
    character = db.query(AICharacter).filter(AICharacter.user_id == user_id).first()
    if not character:
        return {"name": "MOA", "style": "친근하고 귀엽게", "profile_url": "", "system_prompt": ""}
    return character

@router.post("/save")
def save_character(request: CharacterRequest, db: Session = Depends(get_db)):
    character = db.query(AICharacter).filter(AICharacter.user_id == request.user_id).first()
    if character:
        character.name = request.name
        character.style = request.style
        character.profile_url = request.profile_url
        character.system_prompt = request.system_prompt
    else:
        character = AICharacter(
            user_id=request.user_id,
            name=request.name,
            style=request.style,
            profile_url=request.profile_url,
            system_prompt=request.system_prompt
        )
        db.add(character)
    db.commit()
    db.refresh(character)
    return character

@router.post("/chat")
def chat(request: ChatRequest, db: Session = Depends(get_db)):
    character = db.query(AICharacter).filter(AICharacter.user_id == request.user_id).first()
    transactions = db.query(Transaction).filter(Transaction.user_id == request.user_id).all()

    name = character.name if character else "MOA"
    style = character.style if character else "친근하고 귀엽게"
    custom_prompt = character.system_prompt if character else ""

    expense_summary = "\n".join([
        f"{t.date} {t.category} {t.type} {t.amount}원 ({t.memo})"
        for t in transactions[-20:]
    ]) if transactions else "소비 내역 없음"

    system_content = f"""너의 이름은 {name}이야. 말투는 {style} 스타일로 해줘.
사용자의 가계부 도우미야. 소비 내역을 알고 있고 질문에 답해줘.
답변은 3~4문장으로 간결하게 해줘.
{f'추가 지침: {custom_prompt}' if custom_prompt else ''}
사용자 최근 소비 내역:
{expense_summary}"""

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": system_content},
            {"role": "user", "content": request.message}
        ],
        max_tokens=300
    )

    return {"message": response.choices[0].message.content, "name": name}