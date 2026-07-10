import axios from 'axios';
import { mockDashboardData } from '../data/mockDashboardData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const dashboardClient = axios.create({
  baseURL: `${API_BASE_URL}/api/v1/dashboard`,
  timeout: 5000,
});

function cloneMockDashboardData() {
  return JSON.parse(JSON.stringify(mockDashboardData));
}

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
    dashboardClient.get('/summary'),
    dashboardClient.get('/recent-files'),
    dashboardClient.get('/recent-activity'),
    dashboardClient.get('/notifications'),
    dashboardClient.get('/storage'),
    dashboardClient.get('/security-status'),
    dashboardClient.get('/charts'),
    dashboardClient.get('/team-activity'),
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

export async function fetchDashboardData({ useMockFallback = true } = {}) {
  try {
    return await getDashboardFromApi();
  } catch (error) {
    if (!useMockFallback) {
      throw error;
    }

    console.warn('FastAPI dashboard service unavailable. Using local dashboard mock data.', error);
    return cloneMockDashboardData();
  }
}
