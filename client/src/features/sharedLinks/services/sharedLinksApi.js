// Real HTTP client for the Shared Links screen. Every function here talks
// to the FastAPI backend in `server/src/shared_links/` - there is no mock
// data or in-memory fallback anywhere in this file.

import { ApiError, createApiRequest } from "../../../services/apiClient";
import { uploadFile as uploadFileToFilesModule } from "../../myFiles/services/filesApi";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const { request } = createApiRequest(API_BASE_URL);

// Frontend sort keys (used by the existing <select> in SharedLinksTable)
// mapped onto the backend's SortField enum values.
const SORT_MAP = {
  newest: "newest",
  oldest: "oldest",
  "most-viewed": "views",
  "most-downloaded": "downloads",
  alphabetical: "alphabetical",
};

// ---------------------------------------------------------------------------
// Mapping backend <-> frontend shapes
// ---------------------------------------------------------------------------

// Maps SharedLinkRead (backend, snake_case + nested `file`) onto the flat
// camelCase shape the existing UI components (TableRow, StatCard, etc.)
// already render.
function adaptLink(raw) {
  return {
    id: raw.id,
    fileName: raw.file.file_name,
    fileType: raw.file.file_type,
    shareUrl: raw.share_url,
    createdAt: raw.created_at,
    expiresAt: raw.expires_at,
    views: raw.views,
    downloads: raw.downloads,
    access: raw.access,
    status: raw.status,
    passwordProtected: raw.password_protected,
    allowDownload: raw.allow_download,
    recipientEmail: raw.recipient_email,
  };
}

// ---------------------------------------------------------------------------
// File upload (delegates to the Files module - see services/filesApi.js -
// so there's exactly one place that knows how to upload a file, not two)
// ---------------------------------------------------------------------------

async function uploadFile(file) {
  return uploadFileToFilesModule({ file });
}

// ---------------------------------------------------------------------------
// Shared links CRUD
// ---------------------------------------------------------------------------

export async function listSharedLinks({ search, status, sortBy, page, pageSize }) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (status && status !== "all") params.set("status", status);
  params.set("sort", SORT_MAP[sortBy] || "newest");
  params.set("page", String(page));
  params.set("page_size", String(pageSize));

  const res = await request(`/shared-links?${params.toString()}`);
  return {
    links: res.data.map(adaptLink),
    pagination: res.pagination, // { page, page_size, total_items, total_pages, has_next, has_previous }
  };
}

export async function createSharedLink({ file, fileId, recipientEmail, access, expiresAt, password, allowDownload }) {
  const resolvedFileId = fileId || (await uploadFile(file)).id;

  const res = await request("/shared-links", {
    method: "POST",
    json: {
      file_id: resolvedFileId,
      recipient_email: recipientEmail,
      permission: access,
      expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
      password: password ? password : null,
      allow_download: !!allowDownload,
    },
  });
  return adaptLink(res.data);
}

export async function updateSharedLink(id, { access, expiresAt, password, removePassword, allowDownload }) {
  const body = {
    permission: access,
    allow_download: allowDownload,
  };
  if (expiresAt) body.expires_at = new Date(expiresAt).toISOString();
  if (removePassword) {
    body.remove_password = true;
  } else if (password) {
    body.password = password;
  }

  const res = await request(`/shared-links/${id}`, { method: "PATCH", json: body });
  return adaptLink(res.data);
}

export async function toggleSharedLink(id) {
  const res = await request(`/shared-links/${id}/toggle`, { method: "POST" });
  return adaptLink(res.data);
}

export async function revokeSharedLink(id) {
  const res = await request(`/shared-links/${id}/revoke`, { method: "POST" });
  return adaptLink(res.data);
}

export async function deleteSharedLink(id) {
  await request(`/shared-links/${id}`, { method: "DELETE" });
}

// ---------------------------------------------------------------------------
// Analytics (stat cards + activity chart)
// ---------------------------------------------------------------------------

export async function getStats() {
  const res = await request("/analytics/stats");
  return {
    activeLinks: res.data.active_links,
    totalViews: res.data.total_views,
    totalDownloads: res.data.total_downloads,
    expiringSoon: res.data.expiring_soon,
    totalFiles: res.data.total_files || 0,
    totalStorageBytes: res.data.total_storage_bytes || 0,
  };
}

export async function getMonthlyActivity() {
  const res = await request("/analytics/monthly-activity");
  return res.data.map((point) => ({
    label: point.label,
    created: point.created,
    access: point.access_events,
  }));
}

export async function fetchAnalyticsOverview() {
  const res = await request("/analytics/overview");
  return res.data;
}

export { ApiError };
