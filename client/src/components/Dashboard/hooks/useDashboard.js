import { useEffect, useState } from "react";

const API_URL =
  process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000";

export default function useDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await fetch(`${API_URL}/dashboard/`);

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard");
        }

        const data = await response.json();

        console.log("Dashboard API:", data);

        setDashboard({
          summary: data.summary || {
            total_files: 0,
            storage_used: "0 GB",
            active_shares: 0,
            security_events: 0,
          },

          weekly_activity: data.weekly_activity || {
            days: [],
            uploads: [],
            downloads: [],
          },

          storage_by_type: data.storage_by_type || [],

          recent_files: data.recent_files || [],

          recent_activity: data.recent_activity || [],
        });
      } catch (err) {
        console.error(err);

        setDashboard({
          summary: {
            total_files: 0,
            storage_used: "0 GB",
            active_shares: 0,
            security_events: 0,
          },

          weekly_activity: {
            days: [],
            uploads: [],
            downloads: [],
          },

          storage_by_type: [],

          recent_files: [],

          recent_activity: [],
        });
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  return { dashboard, loading };
}