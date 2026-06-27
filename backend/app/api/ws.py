import json
import asyncio
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


class ConnectionManager:
    def __init__(self):
        self.active: dict[str, WebSocket] = {}

    async def connect(self, websocket: WebSocket, client_id: str):
        await websocket.accept()
        self.active[client_id] = websocket

    def disconnect(self, client_id: str):
        self.active.pop(client_id, None)

    async def send(self, client_id: str, data: dict):
        ws = self.active.get(client_id)
        if ws:
            await ws.send_text(json.dumps(data))

    async def broadcast(self, data: dict):
        for ws in self.active.values():
            await ws.send_text(json.dumps(data))


manager = ConnectionManager()


@router.websocket("/timer")
async def timer_ws(websocket: WebSocket):
    client_id = str(id(websocket))
    await manager.connect(websocket, client_id)

    try:
        while True:
            raw = await websocket.receive_text()
            msg = json.loads(raw)
            msg_type = msg.get("type")

            if msg_type == "subscribe_timer":
                await manager.send(client_id, {"type": "subscribed"})

            elif msg_type == "activity_ping":
                data = msg.get("data", {})
                await manager.broadcast({
                    "type": "activity_update",
                    "client_id": client_id,
                    "window_title": data.get("window_title", ""),
                    "app_name": data.get("app_name", ""),
                })

    except WebSocketDisconnect:
        manager.disconnect(client_id)
