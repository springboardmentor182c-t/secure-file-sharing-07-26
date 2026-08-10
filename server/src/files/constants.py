"""Constants/config for the Files module. Every limit is env-configurable."""
import enum
import os

MAX_UPLOAD_SIZE_BYTES = int(os.getenv("MAX_UPLOAD_SIZE_MB", "200")) * 1024 * 1024

# Extensions (without the dot, lowercase) accepted for upload. Configurable
# via env so an ops/admin can tighten or loosen this without a code change.
_DEFAULT_ALLOWED_EXTENSIONS = (
    "pdf,doc,docx,xls,xlsx,ppt,pptx,txt,csv,md,rtf,odt,ods,odp,"
    "jpg,jpeg,png,gif,webp,svg,bmp,tiff,"
    "zip,tar,gz,rar,7z,"
    "json,xml,yaml,yml,sql,log,"
    "mp3,wav,mp4,mov,avi,mkv"
)
ALLOWED_EXTENSIONS = {
    ext.strip().lower()
    for ext in os.getenv("ALLOWED_FILE_EXTENSIONS", _DEFAULT_ALLOWED_EXTENSIONS).split(",")
    if ext.strip()
}

DEFAULT_PAGE_SIZE = 10
MAX_PAGE_SIZE = 100

# Files "expiring soon"-style windows aren't relevant here, but a file
# recently moved to Trash is only kept for this many days before it's
# eligible for permanent cleanup (see service.purge_expired_trash).
TRASH_RETENTION_DAYS = int(os.getenv("TRASH_RETENTION_DAYS", "30"))


class FileCategory(str, enum.Enum):
    FINANCE = "Finance"
    LEGAL = "Legal"
    DESIGN = "Design"
    ENGINEERING = "Engineering"
    MARKETING = "Marketing"
    MEDIA = "Media"
    OTHER = "Other"


class SortField(str, enum.Enum):
    NEWEST = "newest"
    OLDEST = "oldest"
    NAME = "name"
    SIZE = "size"
    SIZE_DESC = "size_desc"


class StorageProvider(str, enum.Enum):
    LOCAL = "local"
    S3 = "s3"
    AZURE_BLOB = "azure_blob"


class EncryptionStatus(str, enum.Enum):
    ENCRYPTED = "aes-256-gcm"
    UNENCRYPTED = "unencrypted"
