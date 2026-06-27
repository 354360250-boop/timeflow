from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.models import TimeEntry
from app.api.schemas import TimeEntryStart, TimeEntryManual, TimeEntryOut

router = APIRouter()


@router.post("/start", response_model=TimeEntryOut)
async def start_time_entry(body: TimeEntryStart, db: AsyncSession = Depends(get_db)):
    entry = TimeEntry(
        task_id=body.task_id,
        project_id=body.project_id,
        start_time=datetime.utcnow(),
        track_mode=body.track_mode,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.post("/{entry_id}/stop", response_model=TimeEntryOut)
async def stop_time_entry(entry_id: UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TimeEntry).where(TimeEntry.id == entry_id))
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Time entry not found")
    if entry.end_time:
        raise HTTPException(status_code=400, detail="Time entry already stopped")

    now = datetime.utcnow()
    entry.end_time = now
    entry.duration_seconds = int((now - entry.start_time).total_seconds())
    await db.commit()
    return entry


@router.post("/manual", response_model=TimeEntryOut)
async def create_manual_entry(body: TimeEntryManual, db: AsyncSession = Depends(get_db)):
    duration = int((body.end_time - body.start_time).total_seconds())
    entry = TimeEntry(
        task_id=body.task_id,
        project_id=body.project_id,
        start_time=body.start_time,
        end_time=body.end_time,
        duration_seconds=duration,
        track_mode="manual",
        plan_mark=body.plan_mark,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.get("", response_model=list[TimeEntryOut])
async def list_time_entries(
    date: str | None = None,
    task_id: UUID | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(TimeEntry).order_by(TimeEntry.start_time.desc())

    if date:
        start = datetime.fromisoformat(f"{date}T00:00:00+00:00")
        end = datetime.fromisoformat(f"{date}T23:59:59+00:00")
        query = query.where(TimeEntry.start_time >= start, TimeEntry.start_time <= end)

    if task_id:
        query = query.where(TimeEntry.task_id == task_id)

    result = await db.execute(query.limit(200))
    return result.scalars().all()


@router.get("/current", response_model=TimeEntryOut | None)
async def get_current_entry(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(TimeEntry).where(TimeEntry.end_time.is_(None)).order_by(TimeEntry.start_time.desc()).limit(1)
    )
    return result.scalar_one_or_none()
