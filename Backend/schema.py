from pydantic import BaseModel
from datetime import datetime
from model import TaskStatus, InterviewStatus, InterviewMode, UserRole


class UserOut(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class TaskCreate(BaseModel):
    title: str
    description: str
    assigned_to: int
    # NOTE: assigned_by is intentionally NOT here anymore — the backend fills
    # it in from the logged-in employer's token, so it can't be spoofed.


class TaskOut(BaseModel):
    id: int
    title: str
    description: str
    assigned_by: int
    assigned_to: int
    status: TaskStatus
    created_at: datetime

    class Config:
        from_attributes = True


class TaskStatusUpdate(BaseModel):
    status: TaskStatus


class InterviewCreate(BaseModel):
    task_id: int
    candidate_name: str
    scheduled_time: datetime
    mode: InterviewMode
    # scheduled_by is filled in from the token too, same reasoning as above.


class InterviewOut(BaseModel):
    id: int
    task_id: int
    scheduled_by: int
    candidate_name: str
    scheduled_time: datetime
    status: InterviewStatus
    mode: InterviewMode
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    id: int
    name: str
    role: UserRole


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    role: UserRole


class UserAdminOut(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True