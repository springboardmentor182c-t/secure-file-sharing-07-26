// Real HTTP client for the My Files screen. Talks to the FastAPI backend
// in `server/src/files/`. No mock data anywhere in this file.
//
// Shares the same "current user" bootstrap as Shared Links
// (services/currentUser.js), so both screens act as the same identity.

import { ApiError, createApiRequest } from "../../../services/apiClient";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const { request, authHeaders } = createApiRequest(API_BASE_URL);

// ---------------------------------------------------------------------------
// Files
// ---------------------------------------------------------------------------

export async function uploadFile({ file, folderId, category }) {
  const formData = new FormData();
  formData.append("upload", file);
  if (folderId) formData.append("folder_id", folderId);
  if (category) formData.append("category", category);
  const res = await request("/files", { method: "POST", formData });
  return res.data;
}

export async function listFiles({ search, category, folderId, starred, sortBy, page, pageSize, trashed }) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);
  if (category && category !== "All") params.set("category", category);
  if (folderId) params.set("folder_id", folderId);
  if (starred) params.set("starred", "true");
  params.set("sort", sortBy || "newest");
  params.set("page", String(page));
  params.set("page_size", String(pageSize));

  const path = trashed ? "/files/trash" : "/files";
  const res = await request(`${path}?${params.toString()}`);
  return { files: res.data, pagination: res.pagination };
}

export async function getFile(fileId) {
  const res = await request(`/files/${fileId}`);
  return res.data;
}

export async function renameFile(fileId, name) {
  const res = await request(`/files/${fileId}/rename`, { method: "PATCH", json: { name } });
  return res.data;
}

export async function moveFile(fileId, folderId) {
  const res = await request(`/files/${fileId}/move`, { method: "PATCH", json: { folder_id: folderId } });
  return res.data;
}

export async function setFileCategory(fileId, category) {
  const res = await request(`/files/${fileId}/category`, { method: "PATCH", json: { category } });
  return res.data;
}

export async function toggleStar(fileId) {
  const res = await request(`/files/${fileId}/star`, { method: "POST" });
  return res.data;
}

export async function trashFile(fileId) {
  const res = await request(`/files/${fileId}`, { method: "DELETE" });
  return res.data;
}

export async function restoreFile(fileId) {
  const res = await request(`/files/${fileId}/restore`, { method: "POST" });
  return res.data;
}

export async function permanentlyDeleteFile(fileId) {
  await request(`/files/${fileId}/permanent`, { method: "DELETE" });
}

export async function downloadFile(fileId, filename) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE_URL}/files/${fileId}/download`, { headers });
  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      // response wasn't JSON - keep the generic message
    }
    throw new ApiError(message, res.status);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function getStorageStats() {
  const res = await request("/files/storage-stats");
  return res.data;
}

// ---------------------------------------------------------------------------
// Folders
// ---------------------------------------------------------------------------

export async function listFolders() {
  const res = await request("/folders");
  return res.data;
}

export async function createFolder(name, parentId) {
  const res = await request("/folders", { method: "POST", json: { name, parent_id: parentId || null } });
  return res.data;
}

export async function renameFolder(folderId, name) {
  const res = await request(`/folders/${folderId}`, { method: "PATCH", json: { name } });
  return res.data;
}

export async function deleteFolder(folderId) {
  await request(`/folders/${folderId}`, { method: "DELETE" });
}

export { ApiError };
