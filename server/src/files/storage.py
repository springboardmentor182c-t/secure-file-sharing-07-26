"""
Storage abstraction for uploaded file bytes.

`StorageBackend` is the interface the rest of the Files module codes
against. `LocalStorageBackend` is the only implementation today (files
live under a configurable directory on disk), but swapping to S3 or Azure
Blob later means writing one new class here that implements the same
three methods (`save`, `read`, `delete`) - nothing in `service.py` or
`controller.py` needs to change, only which backend `get_storage_backend()`
returns.
"""
import abc
import os
import uuid

from src.files.constants import StorageProvider

FILES_STORAGE_DIR = os.getenv("FILES_STORAGE_DIR", "./storage/files")


class StorageBackend(abc.ABC):
    provider: StorageProvider

    @abc.abstractmethod
    def save(self, *, owner_id: uuid.UUID, stored_filename: str, data: bytes) -> str:
        """Persist `data` and return a `file_path` that `read`/`delete` can use later."""

    @abc.abstractmethod
    def read(self, file_path: str) -> bytes:
        """Return the raw (still-encrypted, if applicable) bytes at `file_path`."""

    @abc.abstractmethod
    def delete(self, file_path: str) -> None:
        """Remove the object at `file_path`. Safe to call if it's already gone."""


class LocalStorageBackend(StorageBackend):
    """Stores files on local disk under `FILES_STORAGE_DIR`, one subdirectory
    per owner so a directory listing never mixes users' files together."""

    provider = StorageProvider.LOCAL

    def __init__(self, root_dir: str = FILES_STORAGE_DIR):
        self.root_dir = os.path.abspath(root_dir)

    def _owner_dir(self, owner_id: uuid.UUID) -> str:
        owner_dir = os.path.join(self.root_dir, str(owner_id))
        os.makedirs(owner_dir, exist_ok=True)
        return owner_dir

    def _safe_path(self, file_path: str) -> str:
        # Defense in depth against path traversal: resolve and verify the
        # final path is still inside root_dir before ever touching disk.
        full_path = os.path.abspath(os.path.join(self.root_dir, file_path))
        if os.path.commonpath([full_path, self.root_dir]) != self.root_dir:
            raise ValueError("Resolved storage path escapes the storage root")
        return full_path

    def save(self, *, owner_id: uuid.UUID, stored_filename: str, data: bytes) -> str:
        owner_dir = self._owner_dir(owner_id)
        relative_path = os.path.join(str(owner_id), stored_filename)
        full_path = self._safe_path(relative_path)
        with open(full_path, "wb") as f:
            f.write(data)
        return relative_path

    def read(self, file_path: str) -> bytes:
        full_path = self._safe_path(file_path)
        with open(full_path, "rb") as f:
            return f.read()

    def delete(self, file_path: str) -> None:
        full_path = self._safe_path(file_path)
        if os.path.exists(full_path):
            os.remove(full_path)


_backend: StorageBackend | None = None


def get_storage_backend() -> StorageBackend:
    """Single place the rest of the module asks for "the current storage
    backend" - swap the class returned here to migrate to S3/Azure."""
    global _backend
    if _backend is None:
        _backend = LocalStorageBackend()
    return _backend
