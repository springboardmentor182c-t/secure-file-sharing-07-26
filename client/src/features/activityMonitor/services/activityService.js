const API_URL = "http://127.0.0.1:8000/api/v1/activity-monitor";

export async function getAuditLogs() {
  const response = await fetch(`${API_URL}/audit`);
  if (!response.ok) throw new Error("Failed to fetch audit logs");
  return response.json();
}

export async function getLoginHistory() {
  const response = await fetch(`${API_URL}/login-history`);
  if (!response.ok) throw new Error("Failed to fetch login history");
  return response.json();
}

export async function getSecurityEvents() {
  const response = await fetch(`${API_URL}/security-events`);
  if (!response.ok) throw new Error("Failed to fetch security events");
  return response.json();
}