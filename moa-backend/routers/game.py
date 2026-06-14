from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import get_db
from models import User, AICharacter, Attendance, Quest, Achievement, ShopItem
from datetime import date, datetime, timedelta

router = APIRouter()

# ──────────────────────────────────────────
# 헬퍼: 캐릭터 상태 하루 단위 감소 적용
# ──────────────────────────────────────────
def apply_daily_decay(character: AICharacter):
    today = date.today().isoformat()
    if character.last_updated == today:
        return  # 오늘 이미 계산됨
    if character.last_updated:
        try:
            last = date.fromisoformat(character.last_updated)
            days = (date.today() - last).days
        except:
            days = 1
    else:
        days = 0

    if days > 0:
        character.hunger = max(0, character.hunger - 20 * days)
        character.mood   = max(0, character.mood   - 10 * days)

    character.last_updated = today

# ──────────────────────────────────────────
# 헬퍼: 경험치 → 성장 단계 업데이트
# ──────────────────────────────────────────
def update_stage(character: AICharacter):
    exp = character.exp
    if exp >= 700:
        character.stage = "성체"
    elif exp >= 300:
        character.stage = "아성체"
    elif exp >= 100:
        character.stage = "유체"
    else:
        character.stage = "알"

# ──────────────────────────────────────────
# 헬퍼: 씨앗 지급
# ──────────────────────────────────────────
def give_seeds(user: User, amount: int):
    user.seeds = (user.seeds or 0) + amount

# ──────────────────────────────────────────
# 헬퍼: 업적 해금
# ──────────────────────────────────────────
def unlock_achievement(user_id: int, key: str, db: Session):
    exists = db.query(Achievement).filter(
        Achievement.user_id == user_id,
        Achievement.key == key
    ).first()
    if not exists:
        ach = Achievement(
            user_id=user_id,
            key=key,
            unlocked_at=date.today().isoformat()
        )
        db.add(ach)
        return True
    return False

# ──────────────────────────────────────────
# 출석 체크
# ──────────────────────────────────────────
ATTENDANCE_REWARDS = [20, 22, 24, 28, 40, 60, 80]  # 7일 보상

@router.post("/attendance/{user_id}")
def check_attendance(user_id: int, db: Session = Depends(get_db)):
    today = date.today().isoformat()
    yesterday = (date.today() - timedelta(days=1)).isoformat()

    existing = db.query(Attendance).filter(
        Attendance.user_id == user_id,
        Attendance.date == today
    ).first()
    if existing:
        return {"message": "오늘 이미 출석했어요!", "already": True, "streak": existing.streak}

    last = db.query(Attendance).filter(
        Attendance.user_id == user_id
    ).order_by(Attendance.date.desc()).first()

    streak = 1
    if last and last.date == yesterday:
        streak = last.streak + 1

    attendance = Attendance(user_id=user_id, date=today, streak=streak)
    db.add(attendance)

    # 씨앗 보상 (7일 사이클)
    reward_idx = (streak - 1) % 7
    seeds_reward = ATTENDANCE_REWARDS[reward_idx]
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        give_seeds(user, seeds_reward)

    # 경험치 보상 (7일 연속 시)
    character = db.query(AICharacter).filter(AICharacter.user_id == user_id).first()
    if character and streak % 7 == 0:
        character.exp += 80
        update_stage(character)

    # 업적 체크
    new_achievements = []
    if unlock_achievement(user_id, "first_attendance", db):
        new_achievements.append("첫 방문")
        if user: give_seeds(user, 30)
    if streak >= 2 and unlock_achievement(user_id, "streak_2", db):
        new_achievements.append("다시 왔어요")
        if user: give_seeds(user, 50)
    if streak >= 3 and unlock_achievement(user_id, "streak_3", db):
        new_achievements.append("사흘의 약속")
        if user: give_seeds(user, 80)
    if streak >= 7 and unlock_achievement(user_id, "streak_7", db):
        new_achievements.append("일주일 동행")
        if user: give_seeds(user, 200)

    db.commit()

    return {
        "message": f"{streak}일 연속 출석! 씨앗 {seeds_reward}개 획득!",
        "already": False,
        "streak": streak,
        "seeds_reward": seeds_reward,
        "new_achievements": new_achievements
    }

@router.get("/attendance/{user_id}")
def get_attendance(user_id: int, db: Session = Depends(get_db)):
    today = date.today().isoformat()
    today_record = db.query(Attendance).filter(
        Attendance.user_id == user_id,
        Attendance.date == today
    ).first()

    last = db.query(Attendance).filter(
        Attendance.user_id == user_id
    ).order_by(Attendance.date.desc()).first()

    return {
        "checked_today": today_record is not None,
        "streak": last.streak if last else 0,
        "today": today
    }

# ──────────────────────────────────────────
# 퀘스트
# ──────────────────────────────────────────
@router.get("/quest/{user_id}")
def get_quest(user_id: int, db: Session = Depends(get_db)):
    today = date.today().isoformat()
    quest = db.query(Quest).filter(
        Quest.user_id == user_id,
        Quest.date == today
    ).first()
    if not quest:
        quest = Quest(user_id=user_id, date=today)
        db.add(quest)
        db.commit()
        db.refresh(quest)
    return {
        "q_record": quest.q_record,
        "q_check": quest.q_check,
        "q_category": quest.q_category,
        "q_feed": quest.q_feed,
        "all_done": all([quest.q_record, quest.q_check, quest.q_category, quest.q_feed])
    }

class QuestCompleteRequest(BaseModel):
    quest_type: str  # record / check / category / feed

@router.post("/quest/{user_id}")
def complete_quest(user_id: int, request: QuestCompleteRequest, db: Session = Depends(get_db)):
    today = date.today().isoformat()
    quest = db.query(Quest).filter(
        Quest.user_id == user_id,
        Quest.date == today
    ).first()
    if not quest:
        quest = Quest(user_id=user_id, date=today)
        db.add(quest)

    user = db.query(User).filter(User.id == user_id).first()
    character = db.query(AICharacter).filter(AICharacter.user_id == user_id).first()

    seeds_reward = 0
    exp_reward = 0
    mood_reward = 0
    already_done = False
    message = ""

    if request.quest_type == "record":
        if quest.q_record:
            already_done = True
        else:
            quest.q_record = True
            seeds_reward = 45
            exp_reward = 5
            message = "오늘의 소비 기록 완료! 씨앗 45개 획득!"
    elif request.quest_type == "check":
        if quest.q_check:
            already_done = True
        else:
            quest.q_check = True
            seeds_reward = 36
            mood_reward = 5
            message = "수입/지출 확인 완료! 씨앗 36개 획득!"
    elif request.quest_type == "category":
        if quest.q_category:
            already_done = True
        else:
            quest.q_category = True
            seeds_reward = 20
            exp_reward = 5
            message = "카테고리 정리 완료! 씨앗 20개 획득!"
    elif request.quest_type == "feed":
        if quest.q_feed:
            already_done = True
        else:
            quest.q_feed = True
            seeds_reward = 10
            mood_reward = 10
            message = "캐릭터 돌보기 완료! 씨앗 10개 획득!"

    if already_done:
        return {"message": "이미 완료한 퀘스트예요!", "already_done": True}

    if user and seeds_reward:
        give_seeds(user, seeds_reward)
    if character:
        apply_daily_decay(character)
        character.exp += exp_reward
        character.mood = min(100, character.mood + mood_reward)
        update_stage(character)

    # 전체 퀘스트 완료 업적
    new_achievements = []
    all_done = all([quest.q_record, quest.q_check, quest.q_category, quest.q_feed])
    if all_done:
        if unlock_achievement(user_id, "perfect_day", db):
            new_achievements.append("완벽한 하루")
            if user: give_seeds(user, 150)

    db.commit()
    return {
        "message": message,
        "already_done": False,
        "seeds_reward": seeds_reward,
        "new_achievements": new_achievements,
        "all_done": all_done
    }

# ──────────────────────────────────────────
# 캐릭터 상태 조회/업데이트
# ──────────────────────────────────────────
@router.get("/character-status/{user_id}")
def get_character_status(user_id: int, db: Session = Depends(get_db)):
    character = db.query(AICharacter).filter(AICharacter.user_id == user_id).first()
    if not character:
        character = AICharacter(user_id=user_id, last_updated=date.today().isoformat())
        db.add(character)

    apply_daily_decay(character)
    update_stage(character)
    db.commit()

    user = db.query(User).filter(User.id == user_id).first()
    seeds = user.seeds if user else 0

    return {
        "name": character.name,
        "stage": character.stage,
        "hunger": character.hunger,
        "mood": character.mood,
        "exp": character.exp,
        "seeds": seeds,
        "stage_next_exp": {"알": 100, "유체": 300, "아성체": 700, "성체": 700}.get(character.stage, 700)
    }

# ──────────────────────────────────────────
# 상점 — 아이템 목록
# ──────────────────────────────────────────
DEFAULT_SHOP_ITEMS = [
    {"name": "작은 먹이",     "item_type": "feed", "effect_type": "hunger", "effect_value": 15,  "price": 20,  "description": "배고픔 +15"},
    {"name": "기본 먹이",     "item_type": "feed", "effect_type": "hunger", "effect_value": 30,  "price": 35,  "description": "배고픔 +30"},
    {"name": "든든한 먹이",   "item_type": "feed", "effect_type": "hunger", "effect_value": 50,  "price": 60,  "description": "배고픔 +50"},
    {"name": "특별 간식",     "item_type": "feed", "effect_type": "both",   "effect_value": 30,  "price": 80,  "description": "배고픔 +30, 기분 +10"},
    {"name": "오늘의 도시락", "item_type": "feed", "effect_type": "both",   "effect_value": 70,  "price": 110, "description": "배고픔 +70, 기분 +15"},
    {"name": "작은 공",       "item_type": "toy",  "effect_type": "mood",   "effect_value": 15,  "price": 100, "description": "기분 +15"},
    {"name": "낡은 인형",     "item_type": "toy",  "effect_type": "mood",   "effect_value": 20,  "price": 130, "description": "기분 +20"},
    {"name": "말랑 쿠션",     "item_type": "toy",  "effect_type": "mood",   "effect_value": 25,  "price": 160, "description": "기분 +25"},
    {"name": "반짝 장난감",   "item_type": "toy",  "effect_type": "mood",   "effect_value": 35,  "price": 220, "description": "기분 +35"},
    {"name": "특별 장난감 상자","item_type":"toy",  "effect_type": "mood",   "effect_value": 50,  "price": 320, "description": "기분 +50"},
]

@router.get("/shop")
def get_shop_items(db: Session = Depends(get_db)):
    items = db.query(ShopItem).all()
    if not items:
        for item_data in DEFAULT_SHOP_ITEMS:
            item = ShopItem(**item_data)
            db.add(item)
        db.commit()
        items = db.query(ShopItem).all()
    return items

class BuyRequest(BaseModel):
    user_id: int
    item_id: int

@router.post("/shop/buy")
def buy_item(request: BuyRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == request.user_id).first()
    item = db.query(ShopItem).filter(ShopItem.id == request.item_id).first()
    character = db.query(AICharacter).filter(AICharacter.user_id == request.user_id).first()

    if not user or not item:
        raise HTTPException(status_code=404, detail="유저 또는 아이템을 찾을 수 없어요!")
    if (user.seeds or 0) < item.price:
        raise HTTPException(status_code=400, detail="씨앗이 부족해요!")

    user.seeds -= item.price

    if character:
        apply_daily_decay(character)
        if item.effect_type == "hunger":
            character.hunger = min(100, character.hunger + item.effect_value)
        elif item.effect_type == "mood":
            character.mood = min(100, character.mood + item.effect_value)
        elif item.effect_type == "both":
            if item.item_type == "feed":
                character.hunger = min(100, character.hunger + item.effect_value)
                character.mood   = min(100, character.mood + 10)
            else:
                character.mood   = min(100, character.mood + item.effect_value)

        # 퀘스트 — 캐릭터 돌보기 자동 완료
        today = date.today().isoformat()
        quest = db.query(Quest).filter(Quest.user_id == request.user_id, Quest.date == today).first()
        if quest and not quest.q_feed and item.item_type in ["feed", "toy"]:
            quest.q_feed = True
            give_seeds(user, 10)

    # 업적
    new_achievements = []
    if unlock_achievement(request.user_id, "first_buy", db):
        new_achievements.append("첫 구매")
        give_seeds(user, 50)

    db.commit()

    return {
        "message": f"{item.name} 사용 완료!",
        "remaining_seeds": user.seeds,
        "new_achievements": new_achievements,
        "character": {
            "hunger": character.hunger if character else 0,
            "mood": character.mood if character else 0
        }
    }

# ──────────────────────────────────────────
# 씨앗 잔액 조회
# ──────────────────────────────────────────
@router.get("/seeds/{user_id}")
def get_seeds(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="유저를 찾을 수 없어요!")
    return {"seeds": user.seeds or 0}

# ──────────────────────────────────────────
# 업적 목록 조회
# ──────────────────────────────────────────
ACHIEVEMENT_INFO = {
    "first_attendance": {"name": "첫 방문", "desc": "첫 출석 체크", "reward": 30},
    "streak_2":         {"name": "다시 왔어요", "desc": "2일 연속 출석", "reward": 50},
    "streak_3":         {"name": "사흘의 약속", "desc": "3일 연속 출석", "reward": 80},
    "streak_7":         {"name": "일주일 동행", "desc": "7일 연속 출석", "reward": 200},
    "first_record":     {"name": "첫 기록", "desc": "첫 지출/수입 기록", "reward": 50},
    "first_buy":        {"name": "첫 구매", "desc": "상점 첫 구매", "reward": 50},
    "perfect_day":      {"name": "완벽한 하루", "desc": "일간 퀘스트 전부 완료", "reward": 150},
    "stage_유체":       {"name": "부화 성공", "desc": "유체 단계 도달", "reward": 100},
    "stage_아성체":     {"name": "자라나는 중", "desc": "아성체 단계 도달", "reward": 200},
    "stage_성체":       {"name": "어엿한 친구", "desc": "성체 단계 도달", "reward": 400},
}

@router.get("/achievements/{user_id}")
def get_achievements(user_id: int, db: Session = Depends(get_db)):
    unlocked = db.query(Achievement).filter(Achievement.user_id == user_id).all()
    unlocked_keys = {a.key: a.unlocked_at for a in unlocked}

    result = []
    for key, info in ACHIEVEMENT_INFO.items():
        result.append({
            "key": key,
            "name": info["name"],
            "desc": info["desc"],
            "reward": info["reward"],
            "unlocked": key in unlocked_keys,
            "unlocked_at": unlocked_keys.get(key, "")
        })
    return result