from sqlalchemy import Column, Integer, String
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

    id = Column(Integer, primary_key = True, index=True)
    name = Column(String)