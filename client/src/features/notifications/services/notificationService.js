export async function getNotifications() {
  const response = await fetch(
    "http://127.0.0.1:8000/notifications/"
  );

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return await response.json();
}