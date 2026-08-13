import asyncio
import json
import logging
from typing import Dict, Set, Any
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self):
        # Maps user_id (as str) -> Set of active WebSocket connections
        self.active_user_connections: Dict[str, Set[WebSocket]] = {}
        # Maps channel_name (e.g. 'share:{token}') -> Set of active WebSocket connections
        self.channel_connections: Dict[str, Set[WebSocket]] = {}
        # All connected sockets
        self.all_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket, user_id: str | None = None):
        await websocket.accept()
        self.all_connections.add(websocket)
        if user_id:
            user_id_str = str(user_id)
            if user_id_str not in self.active_user_connections:
                self.active_user_connections[user_id_str] = set()
            self.active_user_connections[user_id_str].add(websocket)
            logger.info(f"WebSocket connected for user {user_id_str}. Total user sockets: {len(self.active_user_connections[user_id_str])}")

    def disconnect(self, websocket: WebSocket, user_id: str | None = None):
        self.all_connections.discard(websocket)
        if user_id:
            user_id_str = str(user_id)
            if user_id_str in self.active_user_connections:
                self.active_user_connections[user_id_str].discard(websocket)
                if not self.active_user_connections[user_id_str]:
                    del self.active_user_connections[user_id_str]
        # Remove from any channels
        for ch, sockets in list(self.channel_connections.items()):
            sockets.discard(websocket)
            if not sockets:
                del self.channel_connections[ch]

    async def subscribe_channel(self, websocket: WebSocket, channel: str):
        if channel not in self.channel_connections:
            self.channel_connections[channel] = set()
        self.channel_connections[channel].add(websocket)

    async def unsubscribe_channel(self, websocket: WebSocket, channel: str):
        if channel in self.channel_connections:
            self.channel_connections[channel].discard(websocket)

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.warning(f"Error sending message to websocket: {e}")

    async def emit_to_user(self, user_id: Any, event: str, data: Any = None):
        """Sends an event payload to all active WebSocket connections for a user."""
        user_id_str = str(user_id)
        sockets = self.active_user_connections.get(user_id_str, set())
        if not sockets:
            return
        payload = {
            "type": "event",
            "event": event,
            "data": data or {},
            "timestamp": asyncio.get_event_loop().time()
        }
        text = json.dumps(payload)
        stale = set()
        for ws in sockets:
            try:
                await ws.send_text(text)
            except Exception:
                stale.add(ws)
        for s in stale:
            sockets.discard(s)

    async def emit_to_channel(self, channel: str, event: str, data: Any = None):
        """Sends an event payload to all subscribers of a specific channel."""
        sockets = self.channel_connections.get(channel, set())
        if not sockets:
            return
        payload = {
            "type": "event",
            "channel": channel,
            "event": event,
            "data": data or {},
            "timestamp": asyncio.get_event_loop().time()
        }
        text = json.dumps(payload)
        stale = set()
        for ws in sockets:
            try:
                await ws.send_text(text)
            except Exception:
                stale.add(ws)
        for s in stale:
            sockets.discard(s)

    async def broadcast_all(self, event: str, data: Any = None):
        """Broadcasts an event to all connected sockets in the application."""
        payload = {
            "type": "event",
            "event": event,
            "data": data or {},
            "timestamp": asyncio.get_event_loop().time()
        }
        text = json.dumps(payload)
        stale = set()
        for ws in self.all_connections:
            try:
                await ws.send_text(text)
            except Exception:
                stale.add(ws)
        for s in stale:
            self.all_connections.discard(s)


manager = ConnectionManager()


def emit_sync(user_id: Any, event: str, data: Any = None):
    """Safe synchronous helper to schedule an emit in the running event loop."""
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(manager.emit_to_user(user_id, event, data))
    except RuntimeError:
        # If no loop is running in thread, pass or create task in background
        pass


def broadcast_sync(event: str, data: Any = None):
    """Safe synchronous helper to broadcast to all connected clients."""
    try:
        loop = asyncio.get_running_loop()
        loop.create_task(manager.broadcast_all(event, data))
    except RuntimeError:
        pass
