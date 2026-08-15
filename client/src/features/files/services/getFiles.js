const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function getFiles(search = "") {
  const token = localStorage.getItem("access_token");
  const url = new URL(`${API_BASE_URL}/files`);

  if (search) {
    url.searchParams.set("search", search);
  }

  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch files");
  }

  return response.json();
}
