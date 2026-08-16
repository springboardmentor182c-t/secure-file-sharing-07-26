// HTTP client for the AI Smart Folder Recommendation feature. Talks to the
// new, additive `POST /api/ai/recommend-folder` backend endpoint.
// Reuses the same base URL + X-User-Id auth bootstrap as every other
// feature (see services/apiClient.js / services/currentUser.js) - no
// separate auth mechanism, no changes to those shared files.

import { createApiRequest } from "../../../services/apiClient";

export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const { authHeaders } = createApiRequest(API_BASE_URL);

/**
 * Requests an AI folder recommendation for a not-yet-uploaded file.
 * Never throws for "normal" AI-unavailable situations - the backend always
 * returns a 200 with a `source: "fallback"` payload in that case. This can
 * still reject on genuine network failure, which callers should treat as
 * "recommendation unavailable" rather than an upload-blocking error.
 *
 * @param {File} file
 * @param {string|null} currentFolderId
 * @returns {Promise<import("../types").AIRecommendation>}
 */
export async function getRecommendation(file, currentFolderId) {
  const headers = await authHeaders();
  const formData = new FormData();
  formData.append("upload", file);
  if (currentFolderId) formData.append("current_folder_id", currentFolderId);

  const res = await fetch(`${API_BASE_URL}/api/ai/recommend-folder`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    let message = `Request failed with status ${res.status}`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      // not JSON - keep the generic message
    }
    throw new Error(message);
  }

  const body = await res.json();
  return body.data;
}
