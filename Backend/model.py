from enum import Enum
from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Enum as SQLEnum
from database import Base
from datetime import datetime


class UserRole(str, Enum):
    EMPLOYER = "employer"
    VIRTUAL_HR = "virtual_hr"
    ADMIN = "admin"


class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class InterviewStatus(str, Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class InterviewMode(str, Enum):
    VOICE = "voice"
    CHAT = "chat"
    VIDEO = "video"


def _enum(e):
    return SQLEnum(e, values_callable=lambda x: [i.value for i in x])


class Users(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password_hash = Column(String(225), nullable=False)
    role = Column(_enum(UserRole), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Tasks(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    assigned_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(_enum(TaskStatus), default=TaskStatus.PENDING)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Interviews(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"))
    scheduled_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    candidate_name = Column(String(150), nullable=False)
    scheduled_time = Column(DateTime, nullable=False)
    status = Column(_enum(InterviewStatus), default=InterviewStatus.SCHEDULED)
    mode = Column(_enum(InterviewMode), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)