from fastapi import APIRouter

from .schemas import Notification


router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"]
)


@router.get("/", response_model=list[Notification])
def get_notifications():
    return [
        {
            "id": 1,
            "title": "Failed login attempt detected",
            "message": "A suspicious login attempt was detected on your account.",
            "time": "8 min ago",
            "type": "Security",
            "icon": "🔒",
            "color": "red",
        },
        {
            "id": 2,
            "title": "File shared with you",
            "message": "A new file has been shared with you by another user.",
            "time": "1 hr ago",
            "type": "Share",
            "icon": "📁",
            "color": "blue",
        },
        {
            "id": 3,
            "title": "Upload completed",
            "message": "Your file upload has been completed successfully.",
            "time": "2 hr ago",
            "type": "Upload",
            "icon": "⬆️",
            "color": "green",
        },
    ]