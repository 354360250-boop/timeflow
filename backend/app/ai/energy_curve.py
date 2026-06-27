"""
精力曲线建模模块。
将每天划分为 48 个 30 分钟时间槽，基于专注会话的自评分数计算每个槽的预期专注质量。
"""

from datetime import datetime, time, timedelta
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import FocusSession


# 默认精力曲线：上午高、午后低谷、傍晚回升
DEFAULT_CURVE = [
    1.5, 1.2, 1.0, 0.8, 0.6, 0.5, 0.5, 0.5,  # 00:00-04:00
    0.5, 0.6, 0.8, 1.0, 1.2, 1.5, 2.0, 2.5,  # 04:00-08:00
    3.0, 3.5, 3.8, 4.0, 4.2, 4.0, 3.8, 3.5,  # 08:00-12:00
    3.0, 2.5, 2.0, 1.8, 2.0, 2.5, 3.0, 3.5,  # 12:00-16:00
    3.8, 4.0, 3.8, 3.5, 3.0, 2.5, 2.0, 1.8,  # 16:00-20:00
    1.5, 1.2, 1.0, 0.8, 0.8, 0.8, 1.0, 1.5,  # 20:00-00:00
]

SLOT_MINUTES = 30
SLOTS_PER_DAY = 48


def get_slot_index(t: datetime) -> int:
    """Return the 30-minute slot index (0-47) for a given datetime."""
    minutes = t.hour * 60 + t.minute
    return min(minutes // SLOT_MINUTES, SLOTS_PER_DAY - 1)


async def compute_energy_curve(
    db: AsyncSession,
    days: int = 30,
) -> list[float]:
    """Compute personalized energy curve from recent focus sessions with ratings."""

    cutoff = datetime.utcnow() - timedelta(days=days)

    result = await db.execute(
        select(FocusSession.started_at, FocusSession.self_rating).where(
            FocusSession.self_rating.isnot(None),
            FocusSession.started_at >= cutoff,
        )
    )
    rows = result.all()

    if len(rows) < 10:
        return DEFAULT_CURVE

    slot_scores: dict[int, list[float]] = {i: [] for i in range(SLOTS_PER_DAY)}

    for started_at, rating in rows:
        idx = get_slot_index(started_at)
        slot_scores[idx].append(float(rating))

    curve = []
    for i in range(SLOTS_PER_DAY):
        scores = slot_scores[i]
        if scores:
            curve.append(round(sum(scores) / len(scores), 1))
        else:
            curve.append(round(DEFAULT_CURVE[i], 1))

    return curve
