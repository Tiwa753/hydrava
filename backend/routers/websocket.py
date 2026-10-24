import asyncio
from typing import Optional, Set
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from database import SessionLocal
from routers.dashboard import compute_dashboard_data

router = APIRouter(tags=["websocket"])


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: Set[WebSocket] = set()
        self._broadcast_task: Optional[asyncio.Task] = None

    def _get_dashboard_json(self) -> str:
        db = SessionLocal()
        try:
            response_data = compute_dashboard_data(db)
            return response_data.model_dump_json()
        finally:
            db.close()

    async def _broadcast_loop(self) -> None:
        while True:
            await asyncio.sleep(4)
            if not self.active_connections:
                continue
            try:
                message = self._get_dashboard_json()
                disconnected: Set[WebSocket] = set()
                for ws in list(self.active_connections):
                    try:
                        await ws.send_text(message)
                    except Exception:
                        disconnected.add(ws)
                for ws in disconnected:
                    self.active_connections.discard(ws)
            except Exception as e:
                print(f"[WebSocket Broadcast] Error: {e}")

    async def connect(self, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.add(websocket)

        # Start shared background broadcast loop if not running
        if self._broadcast_task is None or self._broadcast_task.done():
            self._broadcast_task = asyncio.create_task(self._broadcast_loop())

        # Send initial data immediately to the newly connected client
        try:
            initial_data = self._get_dashboard_json()
            await websocket.send_text(initial_data)
        except Exception as e:
            print(f"[WebSocket Connect] Error sending initial payload: {e}")

    def disconnect(self, websocket: WebSocket) -> None:
        self.active_connections.discard(websocket)


manager = ConnectionManager()


@router.websocket("/ws/dashboard")
async def websocket_dashboard_endpoint(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive and accept incoming messages (ping/text)
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
