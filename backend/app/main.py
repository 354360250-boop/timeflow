import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.responses import FileResponse
from app.config import settings
from app.db.database import init_db
from app.api import time_entries, focus_sessions, tasks, reports, ws


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="TimeFlow", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(time_entries.router, prefix="/api/time-entries", tags=["time-entries"])
app.include_router(focus_sessions.router, prefix="/api/focus", tags=["focus"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(reports.router, prefix="/api/reports", tags=["reports"])
app.include_router(ws.router, prefix="/ws", tags=["websocket"])


@app.get("/api/health")
async def health():
    return {"status": "ok"}


# ── Production: serve frontend SPA ──
STATIC_DIR = os.path.join(os.path.dirname(__file__), "..", "static")
if os.path.isdir(STATIC_DIR):
    app.mount("/assets", StaticFiles(directory=os.path.join(STATIC_DIR, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        file_path = os.path.join(STATIC_DIR, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(STATIC_DIR, "index.html"))
