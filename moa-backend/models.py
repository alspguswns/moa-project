from sqlalchemy import Column, Integer, String, Text, Boolean, Float
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    nickname = Column(String)
    seeds = Column(Integer, default=0)  # 씨앗 재화

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    type = Column(String)
    amount = Column(Integer)
    category = Column(String)
    memo = Column(String)
    date = Column(String)

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)

class Wishlist(Base):
    __tablename__ = "wishlists"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    name = Column(String)
    price = Column(Integer)
    priority = Column(Integer)
    memo = Column(String)

class AICharacter(Base):
    __tablename__ = "ai_characters"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, unique=True)
    name = Column(String, default="MOA")
    style = Column(String, default="친근하고 귀엽게")
    profile_url = Column(String, default="")
    system_prompt = Column(Text, default="")
    # 게이미피케이션 상태값
    hunger = Column(Integer, default=80)       # 배고픔 0~100
    mood = Column(Integer, default=80)         # 기분 0~100
    exp = Column(Integer, default=0)           # 경험치
    stage = Column(String, default="알")       # 알/유체/아성체/성체/특수
    last_updated = Column(String, default="")  # 마지막 상태 계산일

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    date = Column(String)          # YYYY-MM-DD
    streak = Column(Integer, default=1)  # 연속 출석일

class Quest(Base):
    __tablename__ = "quests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    date = Column(String)                        # YYYY-MM-DD (일간)
    q_record = Column(Boolean, default=False)    # 소비 기록
    q_check = Column(Boolean, default=False)     # 수입/지출 확인
    q_category = Column(Boolean, default=False)  # 카테고리 정리
    q_feed = Column(Boolean, default=False)      # 캐릭터 돌보기

class Achievement(Base):
    __tablename__ = "achievements"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    key = Column(String)       # 업적 고유 키 (예: "first_record")
    unlocked_at = Column(String, default="")

class ShopItem(Base):
    __tablename__ = "shop_items"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    item_type = Column(String)   # feed / toy / background
    effect_type = Column(String) # hunger / mood / both
    effect_value = Column(Integer)
    price = Column(Integer)
    description = Column(String, default="")

class Inventory(Base):
    __tablename__ = "inventory"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer)
    item_id = Column(Integer)    # ShopItem.id
    quantity = Column(Integer, default=0)