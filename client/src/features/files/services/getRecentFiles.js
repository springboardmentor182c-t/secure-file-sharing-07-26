const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function getRecentFiles() {
  const token = localStorage.getItem("access_token");

  const response = await fetch(`${API_BASE_URL}/api/files/recent`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch recent files");
  }

  return response.json();
}