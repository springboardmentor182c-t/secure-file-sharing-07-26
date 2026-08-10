import json
import logging
from typing import Optional
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from src.auth.dependencies import decode_token
from src.realtime.manager import manager

logger = logging.getLogger(__name__)
router = APIRouter()


@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: Optional[str] = Query(None)
):
    user_id = None
    # Verify JWT token if provided in query param
    if token:
        try:
            payload = decode_token(token)
            if payload and "sub" in payload:
                user_id = str(payload["sub"])
        except Exception as e:
            logger.debug(f"WebSocket auth token validation failed: {e}")

    await manager.connect(websocket, user_id=user_id)

    try:
        # Send connection confirmation
        await websocket.send_text(json.dumps({
            "type": "connection_established",
            "authenticated": bool(user_id),
            "user_id": user_id,
            "message": "Connected to SecureShare Realtime Hub"
        }))

        while True:
            raw_data = await websocket.receive_text()
            try:
                data = json.loads(raw_data)
                msg_type = data.get("type")

                # Handle ping/pong for keeping connection alive
                if msg_type == "ping":
                    await websocket.send_text(json.dumps({"type": "pong", "timestamp": data.get("timestamp")}))
                
                # Handle late authentication message
                elif msg_type == "auth":
                    auth_token = data.get("token")
                    if auth_token:
                        try:
                            payload = decode_token(auth_token)
                            if payload and "sub" in payload:
                                new_user_id = str(payload["sub"])
                                if user_id != new_user_id:
                                    # Register with new user_id
                                    manager.disconnect(websocket, user_id)
                                    user_id = new_user_id
                                    await manager.connect(websocket, user_id=user_id)
                                await websocket.send_text(json.dumps({
                                    "type": "auth_success",
                                    "user_id": user_id
                                }))
                        except Exception as ex:
                            await websocket.send_text(json.dumps({
                                "type": "auth_error",
                                "message": str(ex)
                            }))

                # Handle channel subscription (e.g. public share activity)
                elif msg_type == "subscribe":
                    channel = data.get("channel")
                    if channel:
                        await manager.subscribe_channel(websocket, channel)
                        await websocket.send_text(json.dumps({
                            "type": "subscribed",
                            "channel": channel
                        }))

                elif msg_type == "unsubscribe":
                    channel = data.get("channel")
                    if channel:
                        await manager.unsubscribe_channel(websocket, channel)

            except json.JSONDecodeError:
                pass

    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id=user_id)
    except Exception as e:
        logger.warning(f"WebSocket error: {e}")
        manager.disconnect(websocket, user_id=user_id)
