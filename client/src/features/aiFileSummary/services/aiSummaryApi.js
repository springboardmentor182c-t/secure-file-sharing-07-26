// AI Summary API client. Talks to server/src/ai_summary/controller.py.
// Reuses the same request helper (X-User-Id auth header, base URL, error
// handling) as services/filesApi.js in the myFiles module, so summaries
// are scoped to the same "current user" as the rest of the app.

import { createApiRequest } from "../../../services/apiClient";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const { request } = createApiRequest(API_BASE_URL);

/**
 * Triggers AI summary generation for a file.
 * Backend responds immediately with status "pending" (runs in background).
 */
export async function generateSummary(fileId) {
  return request(`/ai-summary/files/${fileId}/summary`, { method: "POST" });
}

/**
 * Fetches the current status/result of a file's summary.
 * Used for polling while status is "pending".
 */
export async function fetchSummary(fileId) {
  return request(`/ai-summary/files/${fileId}/summary`, { method: "GET" });
}