// client/src/features/analytics/services/analyticsService.js

import { analyticsAPI } from "../../../utils/api";

export async function getAnalyticsSummary(days = 30, userId = null) {
  const response = await analyticsAPI.summary(days, userId);
  return response.data;
}

export async function exportAnalyticsPDF(tab = "analytics", days = 30) {
  const response =
    tab === "security"
      ? await analyticsAPI.exportSecurity(days)
      : await analyticsAPI.exportFileAnalytics(days);

  const disposition = response.headers["content-disposition"] || "";
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match ? match[1] : `trustshare-${tab}-report.pdf`;

  const blob = new Blob([response.data], { type: "application/pdf" });
  const url  = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);

  return true;
}