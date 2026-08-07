// Real HTTP client for the AI Smart Folder Recommendation feature. Talks
// only to the FastAPI backend (server/src/ai_recommendation/) - the React
// app NEVER calls Gemini directly, and no API key ever reaches the
// browser. Reuses the same shared fetch wrapper + X-User-Id identity as
// every other feature (see services/apiClient.js).

import { createApiRequest } from "../../../services/apiClient";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const { request } = createApiRequest(API_BASE_URL);

/**
 * Ask the backend which folder a file should go into. Does NOT upload or
 * save the file - the existing `POST /files` endpoint remains solely
 * responsible for persisting uploads.
 *
 * @param {File} file - the browser File object the user selected.
 * @returns {Promise<{
 *   recommended_folder: string,
 *   folder_id: string|null,
 *   is_new_folder_suggestion: boolean,
 *   confidence: number,
 *   reason: string,
 *   source: "ai"|"fallback",
 *   available_folders: string[],
 * }>}
 */
export async function recommendFolder(file) {
  const formData = new FormData();
  formData.append("upload", file);
  const res = await request("/api/ai/recommend-folder", { method: "POST", formData });
  return res.data;
}
