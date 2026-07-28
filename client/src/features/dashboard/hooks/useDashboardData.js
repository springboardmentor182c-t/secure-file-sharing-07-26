import { useCallback, useEffect, useMemo, useState } from 'react';
import { fetchDashboardData } from '../services/dashboardApi';

function hasDashboardContent(data) {
  return Boolean(
    data &&
      (data.stats?.length ||
        data.recentFiles?.length ||
        data.activities?.length ||
        data.notifications?.length ||
        data.teamActivity?.length),
  );
}

export function useDashboardData() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = useCallback(async (canUpdate = () => true) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchDashboardData();
      if (canUpdate()) {
        setDashboardData(data);
      }
    } catch (requestError) {
      if (canUpdate()) {
        setError(requestError);
        setDashboardData(null);
      }
    } finally {
      if (canUpdate()) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    loadDashboard(() => isMounted);

    return () => {
      isMounted = false;
    };
  }, [loadDashboard]);

  const isEmpty = useMemo(() => !isLoading && !error && !hasDashboardContent(dashboardData), [
    dashboardData,
    error,
    isLoading,
  ]);

  return {
    dashboardData,
    isLoading,
    error,
    isEmpty,
    refetch: loadDashboard,
  };
}
