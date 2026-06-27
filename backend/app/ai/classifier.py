"""
简单的任务归属推断：基于窗口标题关键词匹配到已知项目和任务。
Phase 1 使用规则匹配 + 历史确认数据频率统计。
"""

import re
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import TimeEntry, Task, Project


async def suggest_task(
    db: AsyncSession,
    window_title: str,
    app_name: str,
) -> dict | None:
    """Given a window title and app name, suggest the most likely task."""

    # 1. Exact match on previously confirmed (window_title, task) pairs
    result = await db.execute(
        select(TimeEntry.task_id, func.count(TimeEntry.id).label("cnt"))
        .where(
            TimeEntry.window_title == window_title,
            TimeEntry.task_id.isnot(None),
        )
        .group_by(TimeEntry.task_id)
        .order_by(func.count(TimeEntry.id).desc())
        .limit(1)
    )
    row = result.first()
    if row:
        return {"task_id": str(row.task_id), "confidence": "high", "reason": "exact_match"}

    # 2. Domain-based matching for GitHub
    gh_match = re.search(r"github\.com/([^/\s]+)/([^/\s]+)", window_title)
    if gh_match:
        repo = f"{gh_match.group(1)}/{gh_match.group(2)}"
        result = await db.execute(
            select(Task)
            .where(Task.title.ilike(f"%{repo}%"))
            .limit(1)
        )
        task = result.scalar_one_or_none()
        if task:
            return {"task_id": str(task.id), "confidence": "medium", "reason": f"github_repo:{repo}"}

    # 3. Match by app name + project name
    result = await db.execute(
        select(Project).where(Project.name.ilike(f"%{app_name}%")).limit(1)
    )
    project = result.scalar_one_or_none()
    if project:
        result = await db.execute(
            select(Task).where(Task.project_id == project.id, Task.status != "done").limit(1)
        )
        task = result.scalar_one_or_none()
        if task:
            return {"task_id": str(task.id), "confidence": "low", "reason": f"app_project:{project.name}"}

    return None
