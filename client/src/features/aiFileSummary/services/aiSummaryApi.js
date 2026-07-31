const API_BASE_URL = import.meta.env.VITE_API_URL;

/**
 * Fetches all available files, so the AI Summary page can show
 * a real, dynamic list instead of hardcoded data.
 */
export async function listFiles() {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_BASE_URL}/ai-summary/files`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch files");
  }

  return response.json(); // array of { id, file_name, file_extension, file_size, uploaded_at }
}

/**
 * Triggers AI summary generation for a file.
 * Backend responds immediately with status "pending" (runs in background).
 */
export async function generateSummary(fileId) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_BASE_URL}/ai-summary/files/${fileId}/summary`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to start summary generation");
  }

  return response.json(); // { status, message }
}

/**
 * Fetches the current status/result of a file's summary.
 * Used for polling while status is "pending".
 */
export async function fetchSummary(fileId) {
  const token = localStorage.getItem("access_token");

  const response = await fetch(
    `${API_BASE_URL}/ai-summary/files/${fileId}/summary`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch summary");
  }

  return response.json(); // { status, summary, model_used, generated_at }
}