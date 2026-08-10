const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function getRecentFiles() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/files/recent`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error fetching recent files:", err);
    return [];
  }
}