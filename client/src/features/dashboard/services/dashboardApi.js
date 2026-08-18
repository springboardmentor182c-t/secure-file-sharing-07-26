import axios from "axios";

import { mockDashboardData } from "../data/mockDashboardData";
import { API_URL } from "../../../config";

const dashboardClient = axios.create({
  baseURL: `${API_URL}/api/v1/dashboard`,
  timeout: 5000,
});

async function getDashboardFromApi() {
  const [
    summaryResponse,
    recentFilesResponse,
    recentActivityResponse,
    notificationsResponse,
    storageResponse,
    securityStatusResponse,
    chartsResponse,
    teamActivityResponse,
  ] = await Promise.all([
    dashboardClient.get("/summary"),
    dashboardClient.get("/recent-files"),
    dashboardClient.get("/recent-activity"),
    dashboardClient.get("/notifications"),
    dashboardClient.get("/storage"),
    dashboardClient.get("/security-status"),
    dashboardClient.get("/charts"),
    dashboardClient.get("/team-activity"),
  ]);

  return {
    user: summaryResponse.data.user,
    stats: summaryResponse.data.stats,
    sharedFiles: summaryResponse.data.sharedFiles,
    recentFiles: recentFilesResponse.data,
    activities: recentActivityResponse.data,
    notifications: notificationsResponse.data,
    storage: storageResponse.data,
    security: securityStatusResponse.data,
    uploadTrend: chartsResponse.data.uploadTrend,
    fileTypes: chartsResponse.data.fileTypes,
    teamActivity: teamActivityResponse.data,
  };
}

export async function fetchDashboardData() {
  return getDashboardFromApi();
}

export async function fetchDashboardDataFromApiOnly() {
  return getDashboardFromApi();
}