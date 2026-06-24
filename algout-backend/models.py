# models.py
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from database import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    total_sorts_completed = Column(Integer, default=0)
    total_graph_algorithms = Column(Integer, default=0)

class SortHistory(Base):
    __tablename__ = 'sort_history'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    algorithm_name = Column(String(50), nullable=False)
    array_size = Column(Integer)
    time_ms = Column(Float)
    timestamp = Column(DateTime, server_default=func.now())

class GraphAlgorithm(Base):
    __tablename__ = 'graph_algorithms'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    algorithm_name = Column(String(50), nullable=False)
    graph_data = Column(JSONB)
    execution_time_ms = Column(Float)
    completed_at = Column(DateTime, server_default=func.now())
