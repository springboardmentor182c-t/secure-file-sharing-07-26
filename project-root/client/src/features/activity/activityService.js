const API_BASE_URL = "http://127.0.0.1:8000/api/activity";

export async function getActivities() {
  const response = await fetch(`${API_BASE_URL}/`);

  if (!response.ok) {
    throw new Error("Failed to fetch activities");
  }

  return response.json();
}

export async function getUserActivities(userId) {
  const response = await fetch(`${API_BASE_URL}/user/${userId}`);

  if (!response.ok) {
    throw new Error("Failed to fetch user activities");
  }

  return response.json();
}

export async function addActivity(activityData) {
  const response = await fetch(`${API_BASE_URL}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(activityData),
  });

  if (!response.ok) {
    throw new Error("Failed to add activity");
  }

  return response.json();
}