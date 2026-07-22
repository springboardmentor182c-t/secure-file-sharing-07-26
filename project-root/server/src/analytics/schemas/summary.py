# server/src/analytics/schemas/summary.py

from pydantic import BaseModel
from typing import Any, Dict

from .storage   import StorageResponse
from .uploads   import UploadAnalyticsResponse
from .downloads import DownloadAnalyticsResponse
from .deletes   import DeleteAnalyticsResponse
from .sharing   import SharingAnalyticsResponse
from .security  import SecurityAnalyticsResponse
from .activity  import RecentActivityResponse, SystemStatsResponse


class AnalyticsSummaryResponse(BaseModel):
    storage:         StorageResponse
    uploads:         UploadAnalyticsResponse
    downloads:       DownloadAnalyticsResponse
    deletes:         DeleteAnalyticsResponse
    sharing:         SharingAnalyticsResponse
    security:        SecurityAnalyticsResponse
    recent_activity: RecentActivityResponse
    system_stats:    SystemStatsResponse
    ui_config:       Dict[str, Any] = {}