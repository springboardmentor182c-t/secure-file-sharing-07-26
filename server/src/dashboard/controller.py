from fastapi import APIRouter

from .models import DashboardResponse
from .service import get_dashboard_data

router = APIRouter()


@router.get("/", response_model=DashboardResponse)
def dashboard():
    return get_dashboard_data()