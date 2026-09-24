from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from database import engine, Base, get_db
from model import Users, UserRole, Tasks, Interviews
from schema import (
    UserOut, TaskCreate, TaskOut, TaskStatusUpdate,
    InterviewCreate, InterviewOut, LoginRequest, TokenResponse,
    UserCreate, UserAdminOut,
)
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, require_role, CurrentUser,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev only; restrict to your frontend's URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.on_event("startup")
async def startup():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


# ---------- Auth ----------

@app.post("/auth/login", response_model=TokenResponse)
async def login(credentials: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Users).where(Users.email == credentials.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(user_id=user.id, role=user.role.value, name=user.name)
    return TokenResponse(access_token=token, id=user.id, name=user.name, role=user.role)


# ---------- Employer ----------

@app.get("/users/virtual-hr", response_model=list[UserOut])
async def get_virtual_hr_users(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_role(UserRole.EMPLOYER)),
):
    result = await db.execute(select(Users).where(Users.role == UserRole.VIRTUAL_HR))
    return result.scalars().all()


@app.post("/tasks", response_model=TaskOut)
async def create_tasks(
    task: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_role(UserRole.EMPLOYER)),
):
    new_task = Tasks(
        title=task.title,
        description=task.description,
        assigned_by=current_user.id,  # from the token, never trusted from the client
        assigned_to=task.assigned_to,
    )
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    return new_task


# ---------- Shared (both roles see their own tasks) ----------

@app.get("/tasks", response_model=list[TaskOut])
async def get_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    query = select(Tasks)
    if current_user.role == UserRole.EMPLOYER:
        query = query.where(Tasks.assigned_by == current_user.id)
    elif current_user.role == UserRole.VIRTUAL_HR:
        query = query.where(Tasks.assigned_to == current_user.id)
    # admin sees everything: no filter added
    result = await db.execute(query)
    return result.scalars().all()


@app.get("/interviews", response_model=list[InterviewOut])
async def get_interviews(
    task_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(get_current_user),
):
    query = select(Interviews)
    if current_user.role == UserRole.VIRTUAL_HR:
        query = query.where(Interviews.scheduled_by == current_user.id)
    elif current_user.role == UserRole.EMPLOYER:
        query = query.join(Tasks, Tasks.id == Interviews.task_id).where(
            Tasks.assigned_by == current_user.id
        )
    # admin sees every interview: no filter added
    if task_id is not None:
        query = query.where(Interviews.task_id == task_id)
    result = await db.execute(query)
    return result.scalars().all()


# ---------- Virtual HR ----------

@app.patch("/tasks/{task_id}/status", response_model=TaskOut)
async def update_task_status(
    task_id: int,
    update: TaskStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_role(UserRole.VIRTUAL_HR)),
):
    task = await db.scalar(select(Tasks).where(Tasks.id == task_id))
    if task is None:
        raise HTTPException(status_code=404, detail="Item not found")
    if task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="This task isn't assigned to you")

    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(task, field, value)
    await db.commit()
    await db.refresh(task)
    return task


@app.post("/interviews", response_model=InterviewOut)
async def create_interview(
    interview: InterviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_role(UserRole.VIRTUAL_HR)),
):
    new_interview = Interviews(
        task_id=interview.task_id,
        scheduled_by=current_user.id,  # from the token, never trusted from the client
        scheduled_time=interview.scheduled_time,
        candidate_name=interview.candidate_name,
        mode=interview.mode,
    )
    db.add(new_interview)
    await db.commit()
    await db.refresh(new_interview)
    return new_interview


# ---------- Admin ----------

@app.post("/admin/users", response_model=UserAdminOut)
async def create_user(
    new_user: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_role(UserRole.ADMIN)),
):
    existing = await db.scalar(select(Users).where(Users.email == new_user.email))
    if existing:
        raise HTTPException(status_code=400, detail="A user with this email already exists")

    user = Users(
        name=new_user.name,
        email=new_user.email,
        password_hash=hash_password(new_user.password),
        role=new_user.role,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@app.get("/admin/users", response_model=list[UserAdminOut])
async def list_users(
    db: AsyncSession = Depends(get_db),
    current_user: CurrentUser = Depends(require_role(UserRole.ADMIN)),
):
    result = await db.execute(select(Users))
    return result.scalars().all()