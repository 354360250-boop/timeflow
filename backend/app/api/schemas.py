from datetime import datetime, timezone
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


# ── Task ──

class TaskCreate(BaseModel):
    title: str = Field(..., max_length=500)
    project_id: Optional[UUID] = None
    priority: int = Field(default=2, ge=0, le=3)
    estimated_hours: Optional[float] = None
    tags: Optional[list[str]] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    project_id: Optional[UUID] = None
    priority: Optional[int] = None
    estimated_hours: Optional[float] = None
    status: Optional[str] = None
    tags: Optional[list[str]] = None


class TaskOut(BaseModel):
    id: UUID
    project_id: Optional[UUID]
    title: str
    priority: int
    estimated_hours: Optional[float]
    status: str
    tags: Optional[list[str]]
    created_at: datetime

    model_config = {"from_attributes": True}


# ── TimeEntry ──

class TimeEntryStart(BaseModel):
    task_id: Optional[UUID] = None
    project_id: Optional[UUID] = None
    track_mode: str = "manual"


class TimeEntryManual(BaseModel):
    task_id: Optional[UUID] = None
    project_id: Optional[UUID] = None
    start_time: datetime
    end_time: datetime
    track_mode: str = "manual"
    plan_mark: Optional[str] = None


class TimeEntryOut(BaseModel):
    id: UUID
    task_id: Optional[UUID]
    project_id: Optional[UUID]
    start_time: datetime
    end_time: Optional[datetime]
    duration_seconds: Optional[int]
    track_mode: str
    plan_mark: Optional[str]
    window_title: Optional[str]
    app_name: Optional[str]

    model_config = {"from_attributes": True}


# ── FocusSession ──

class FocusStart(BaseModel):
    task_id: Optional[UUID] = None
    mode: str = Field(..., pattern="^(pomodoro|deep_work|free)$")
    planned_duration: int = Field(..., gt=0)


class FocusEnd(BaseModel):
    interruption_count: int = 0


class FocusRate(BaseModel):
    self_rating: int = Field(..., ge=1, le=5)


class FocusSessionOut(BaseModel):
    id: UUID
    task_id: Optional[UUID]
    mode: str
    planned_duration: int
    actual_duration: Optional[int]
    interruption_count: int
    self_rating: Optional[int]
    started_at: datetime
    ended_at: Optional[datetime]

    model_config = {"from_attributes": True}


# ── Activity ──

class ActivityReport(BaseModel):
    window_title: str
    app_name: str


# ── Project ──

class ProjectCreate(BaseModel):
    name: str
    color: Optional[str] = None


class ProjectOut(BaseModel):
    id: UUID
    name: str
    color: Optional[str]
    created_at: datetime

    model_config = {"from_attributes": True}
