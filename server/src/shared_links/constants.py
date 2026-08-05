"""Shared enums/constants for the Shared Links module."""
import enum


class LinkStatus(str, enum.Enum):
    ACTIVE = "active"
    DISABLED = "disabled"
    EXPIRED = "expired"
    REVOKED = "revoked"


class LinkPermission(str, enum.Enum):
    VIEW = "view"
    DOWNLOAD = "download"
    EDIT = "edit"


class NotificationType(str, enum.Enum):
    INFO = "info"
    WARNING = "warning"
    EXPIRED = "expired"


class SortField(str, enum.Enum):
    NEWEST = "newest"
    OLDEST = "oldest"
    VIEWS = "views"
    DOWNLOADS = "downloads"
    EXPIRATION = "expiration"
    ALPHABETICAL = "alphabetical"


DEFAULT_PAGE_SIZE = 10
MAX_PAGE_SIZE = 100
