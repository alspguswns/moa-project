from sqlalchemy import Column, Integer, String, Text
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    nickname = Column(String)

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