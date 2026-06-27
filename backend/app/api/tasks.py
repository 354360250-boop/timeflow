from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.models import Task, Project
from app.api.schemas import TaskCreate, TaskUpdate, TaskOut, ProjectCreate, ProjectOut

router = APIRouter()


@router.post("", response_model=TaskOut, status_code=201)
async def create_task(body: TaskCreate, db: AsyncSession = Depends(get_db)):
    task = Task(**body.model_dump())
    db.add(task)
    await db.commit()
    await db.refresh(task)
    return task


@router.get("", response_model=list[TaskOut])
async def list_tasks(
    status: str | None = Query(None, pattern="^(todo|in_progress|done)$"),
    project_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(Task).order_by(Task.priority.asc(), Task.created_at.desc())
    if status:
        query = query.where(Task.status == status)
    if project_id:
        query = query.where(Task.project_id == project_id)
    result = await db.execute(query.limit(200))
    return result.scalars().all()


@router.get("/{task_id}", response_model=TaskOut)
async def get_task(task_id: UUID, db: AsyncSession = Depends(get_db)):
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskOut)
async def update_task(task_id: UUID, body: TaskUpdate, db: AsyncSession = Depends(get_db)):
    task = await db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    for key, val in body.model_dump(exclude_unset=True).items():
        setattr(task, key, val)
    await db.commit()
    await db.refresh(task)
    return task


# ── Projects ──

@router.post("/projects", response_model=ProjectOut, status_code=201)
async def create_project(body: ProjectCreate, db: AsyncSession = Depends(get_db)):
    project = Project(**body.model_dump())
    db.add(project)
    await db.commit()
    await db.refresh(project)
    return project


@router.get("/projects", response_model=list[ProjectOut])
async def list_projects(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).order_by(Project.name))
    return result.scalars().all()
