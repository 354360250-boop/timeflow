from datetime import datetime
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.models import FocusSession
from app.api.schemas import FocusStart, FocusEnd, FocusRate, FocusSessionOut

router = APIRouter()


@router.post("/start", response_model=FocusSessionOut)
async def start_focus_session(body: FocusStart, db: AsyncSession = Depends(get_db)):
    session = FocusSession(
        task_id=body.task_id,
        mode=body.mode,
        planned_duration=body.planned_duration,
        started_at=datetime.utcnow(),
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


@router.post("/{session_id}/end", response_model=FocusSessionOut)
async def end_focus_session(session_id: UUID, body: FocusEnd, db: AsyncSession = Depends(get_db)):
    session = await db.get(FocusSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Focus session not found")
    if session.ended_at:
        raise HTTPException(status_code=400, detail="Session already ended")

    now = datetime.utcnow()
    session.ended_at = now
    session.actual_duration = int((now - session.started_at).total_seconds())
    session.interruption_count = body.interruption_count
    await db.commit()
    await db.refresh(session)
    return session


@router.post("/{session_id}/rate", response_model=FocusSessionOut)
async def rate_focus_session(session_id: UUID, body: FocusRate, db: AsyncSession = Depends(get_db)):
    session = await db.get(FocusSession, session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Focus session not found")

    session.self_rating = body.self_rating
    await db.commit()
    await db.refresh(session)
    return session


@router.get("/sessions", response_model=list[FocusSessionOut])
async def list_focus_sessions(
    date: str | None = None,
    db: AsyncSession = Depends(get_db),
):
    query = select(FocusSession).order_by(FocusSession.started_at.desc())

    if date:
        start = datetime.fromisoformat(f"{date}T00:00:00+00:00")
        end = datetime.fromisoformat(f"{date}T23:59:59+00:00")
        query = query.where(FocusSession.started_at >= start, FocusSession.started_at <= end)

    result = await db.execute(query.limit(100))
    return result.scalars().all()


@router.get("/stats")
async def focus_stats(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(
            func.count(FocusSession.id).label("total_sessions"),
            func.coalesce(func.sum(FocusSession.actual_duration), 0).label("total_seconds"),
            func.coalesce(func.avg(FocusSession.self_rating), 0).label("avg_rating"),
        )
    )
    row = result.one()
    return {
        "total_sessions": row.total_sessions,
        "total_minutes": row.total_seconds // 60,
        "avg_rating": round(float(row.avg_rating), 1),
    }
