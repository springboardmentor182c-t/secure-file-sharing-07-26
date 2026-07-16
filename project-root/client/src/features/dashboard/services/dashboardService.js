import {
  analyticsAPI,
  filesAPI,
  notificationsAPI,
  sharesAPI,
} from '../../../utils/api';

export async function fetchDashboardData() {
  const [analyticsResponse, filesResponse, sharesResponse, notificationsResponse] =
    await Promise.all([
      analyticsAPI.summary(),
      filesAPI.list(),
      sharesAPI.list(),
      notificationsAPI.list(),
    ]);

  return {
    analytics: analyticsResponse.data,
    files: filesResponse.data.files || [],
    notifications: notificationsResponse.data || [],
    shares: sharesResponse.data || [],
  };
}
