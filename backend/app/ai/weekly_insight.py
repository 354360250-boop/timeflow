"""
周报 AI 洞察生成。
Phase 1 使用规则模板生成一句话总结，后续可替换为 LLM 生成。
"""

from datetime import datetime, timedelta
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import TimeEntry, FocusSession


async def generate_weekly_insight(
    db: AsyncSession,
    week_start: str,
) -> dict:
    """Generate a weekly insight based on tracked data."""

    start = datetime.fromisoformat(f"{week_start}T00:00:00+00:00")
    end = start + timedelta(days=7)
    prev_start = start - timedelta(days=7)

    # This week total seconds
    this_week = await db.execute(
        select(func.coalesce(func.sum(TimeEntry.duration_seconds), 0)).where(
            TimeEntry.start_time >= start, TimeEntry.start_time < end
        )
    )
    this_seconds = this_week.scalar() or 0

    # Last week total seconds
    prev_week = await db.execute(
        select(func.coalesce(func.sum(TimeEntry.duration_seconds), 0)).where(
            TimeEntry.start_time >= prev_start, TimeEntry.start_time < start
        )
    )
    prev_seconds = prev_week.scalar() or 0

    # Weekly focus avg rating
    focus_result = await db.execute(
        select(
            func.coalesce(func.avg(FocusSession.self_rating), 0),
            func.count(FocusSession.id),
        ).where(
            FocusSession.started_at >= start, FocusSession.started_at < end,
            FocusSession.self_rating.isnot(None),
        )
    )
    avg_rating, focus_count = focus_result.one()

    insights = []

    # Trend insight
    if prev_seconds > 0:
        change_pct = round((this_seconds - prev_seconds) / prev_seconds * 100)
        if change_pct > 10:
            insights.append(f"本周工作时长较上周增长 {change_pct}%，势头不错")
        elif change_pct < -10:
            insights.append(f"本周工作时长较上周减少 {abs(change_pct)}%，注意节奏")

    # Focus quality
    if focus_count >= 3:
        if avg_rating >= 4.0:
            insights.append(f"专注质量优秀，平均 {round(float(avg_rating), 1)} 分")
        elif avg_rating < 2.5:
            insights.append(f"专注质量偏低（{round(float(avg_rating), 1)} 分），试试调整工作时间段")

    if not insights:
        insights.append("数据积累中，再追踪几天就能看到洞察了")

    return {
        "week_start": week_start,
        "total_hours": round(this_seconds / 3600, 1),
        "insights": insights,
        "avg_focus_rating": round(float(avg_rating), 1) if focus_count > 0 else None,
    }
