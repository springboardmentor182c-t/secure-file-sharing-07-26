const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export async function getNotifications() {
  const response = await fetch(`${API_BASE_URL}/notifications/`);

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return await response.json();
}