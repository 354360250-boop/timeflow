from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func, case
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.models import TimeEntry, FocusSession

router = APIRouter()


@router.get("/daily")
async def daily_report(
    date: str = Query(..., description="ISO date, e.g. 2026-06-27"),
    db: AsyncSession = Depends(get_db),
):
    start = datetime.fromisoformat(f"{date}T00:00:00+00:00")
    end = datetime.fromisoformat(f"{date}T23:59:59+00:00")

    # Total time tracked
    time_result = await db.execute(
        select(func.coalesce(func.sum(TimeEntry.duration_seconds), 0)).where(
            TimeEntry.start_time >= start, TimeEntry.start_time <= end
        )
    )
    total_seconds = time_result.scalar()

    # Focus sessions today
    focus_result = await db.execute(
        select(
            func.count(FocusSession.id),
            func.coalesce(func.sum(FocusSession.actual_duration), 0),
        ).where(FocusSession.started_at >= start, FocusSession.started_at <= end)
    )
    sessions, focus_seconds = focus_result.one()

    # Per-project breakdown
    project_result = await db.execute(
        select(
            TimeEntry.project_id,
            func.sum(TimeEntry.duration_seconds),
        )
        .where(TimeEntry.start_time >= start, TimeEntry.start_time <= end, TimeEntry.project_id.isnot(None))
        .group_by(TimeEntry.project_id)
    )
    projects = [{"project_id": str(pid), "seconds": int(s)} for pid, s in project_result.all()]

    # Timeline entries
    timeline_result = await db.execute(
        select(TimeEntry)
        .where(TimeEntry.start_time >= start, TimeEntry.start_time <= end)
        .order_by(TimeEntry.start_time.asc())
        .limit(50)
    )
    timeline = [
        {
            "id": str(e.id),
            "task_id": str(e.task_id) if e.task_id else None,
            "start_time": e.start_time.isoformat(),
            "end_time": e.end_time.isoformat() if e.end_time else None,
            "duration_seconds": e.duration_seconds,
            "track_mode": e.track_mode,
        }
        for e in timeline_result.scalars().all()
    ]

    return {
        "date": date,
        "total_seconds": int(total_seconds),
        "focus_sessions": sessions,
        "focus_seconds": int(focus_seconds),
        "projects": projects,
        "timeline": timeline,
    }


@router.get("/weekly")
async def weekly_report(
    start: str = Query(..., description="ISO date of Monday, e.g. 2026-06-22"),
    db: AsyncSession = Depends(get_db),
):
    week_start = datetime.fromisoformat(f"{start}T00:00:00+00:00")
    week_end = week_start + timedelta(days=7)

    # Daily totals
    daily_query = select(
        func.date(TimeEntry.start_time).label("day"),
        func.coalesce(func.sum(TimeEntry.duration_seconds), 0).label("total_seconds"),
    ).where(
        TimeEntry.start_time >= week_start, TimeEntry.start_time < week_end
    ).group_by(func.date(TimeEntry.start_time)).order_by("day")

    daily_result = await db.execute(daily_query)
    daily = [{"day": str(d), "seconds": int(s)} for d, s in daily_result.all()]

    # Focus score per day
    focus_query = select(
        func.date(FocusSession.started_at).label("day"),
        func.coalesce(func.avg(FocusSession.self_rating), 0).label("avg_rating"),
    ).where(
        FocusSession.started_at >= week_start, FocusSession.started_at < week_end
    ).group_by(func.date(FocusSession.started_at)).order_by("day")

    focus_result = await db.execute(focus_query)
    focus_scores = [{"day": str(d), "avg_rating": round(float(r), 1)} for d, r in focus_result.all()]

    # Per-project totals
    project_query = select(
        TimeEntry.project_id,
        func.sum(TimeEntry.duration_seconds),
    ).where(
        TimeEntry.start_time >= week_start, TimeEntry.start_time < week_end,
        TimeEntry.project_id.isnot(None),
    ).group_by(TimeEntry.project_id)

    project_result = await db.execute(project_query)
    projects = [{"project_id": str(pid), "seconds": int(s)} for pid, s in project_result.all()]

    return {
        "week_start": start,
        "week_end": (week_end - timedelta(days=1)).strftime("%Y-%m-%d"),
        "daily": daily,
        "focus_scores": focus_scores,
        "projects": projects,
        "total_seconds": sum(d["seconds"] for d in daily),
    }
