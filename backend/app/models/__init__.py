import uuid
import json
from datetime import datetime
from sqlalchemy import String, Integer, Float, Text, DateTime, ForeignKey, JSON, TypeDecorator
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.database import Base

# ── Cross-database UUID adapter ──
class GUID(TypeDecorator):
    """Platform-agnostic UUID: CHAR(36) on SQLite, native UUID on PG."""
    impl = String(36)
    cache_ok = True

    def process_bind_param(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, uuid.UUID):
            return str(value)
        return value

    def process_result_value(self, value, dialect):
        if value is None:
            return None
        if isinstance(value, uuid.UUID):
            return value
        return uuid.UUID(value)


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    color: Mapped[str | None] = mapped_column(String(7))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    archived_at: Mapped[datetime | None] = mapped_column(DateTime)

    tasks: Mapped[list["Task"]] = relationship(back_populates="project", cascade="all, delete-orphan")
    time_entries: Mapped[list["TimeEntry"]] = relationship(back_populates="project")


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID | None] = mapped_column(GUID, ForeignKey("projects.id"))
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    priority: Mapped[int] = mapped_column(Integer, default=2)
    estimated_hours: Mapped[float | None] = mapped_column(Float)
    status: Mapped[str] = mapped_column(String(20), default="todo")
    tags: Mapped[list | None] = mapped_column(JSON)                     # was ARRAY(String)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped[Project | None] = relationship(back_populates="tasks")
    time_entries: Mapped[list["TimeEntry"]] = relationship(back_populates="task")
    focus_sessions: Mapped[list["FocusSession"]] = relationship(back_populates="task")


class TimeEntry(Base):
    __tablename__ = "time_entries"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    task_id: Mapped[uuid.UUID | None] = mapped_column(GUID, ForeignKey("tasks.id"))
    project_id: Mapped[uuid.UUID | None] = mapped_column(GUID, ForeignKey("projects.id"))
    start_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    end_time: Mapped[datetime | None] = mapped_column(DateTime)
    duration_seconds: Mapped[int | None] = mapped_column(Integer)
    track_mode: Mapped[str] = mapped_column(String(10), nullable=False)
    plan_mark: Mapped[str | None] = mapped_column(String(20))
    window_title: Mapped[str | None] = mapped_column(Text)
    app_name: Mapped[str | None] = mapped_column(String(255))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    task: Mapped[Task | None] = relationship(back_populates="time_entries")
    project: Mapped[Project | None] = relationship(back_populates="time_entries")


class FocusSession(Base):
    __tablename__ = "focus_sessions"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    task_id: Mapped[uuid.UUID | None] = mapped_column(GUID, ForeignKey("tasks.id"))
    mode: Mapped[str] = mapped_column(String(20), nullable=False)
    planned_duration: Mapped[int] = mapped_column(Integer, nullable=False)
    actual_duration: Mapped[int | None] = mapped_column(Integer)
    interruption_count: Mapped[int] = mapped_column(Integer, default=0)
    self_rating: Mapped[int | None] = mapped_column(Integer)
    started_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime)

    task: Mapped[Task | None] = relationship(back_populates="focus_sessions")


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id: Mapped[uuid.UUID] = mapped_column(GUID, primary_key=True, default=uuid.uuid4)
    window_title: Mapped[str] = mapped_column(Text, nullable=False)
    app_name: Mapped[str] = mapped_column(String(255), nullable=False)
    captured_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
