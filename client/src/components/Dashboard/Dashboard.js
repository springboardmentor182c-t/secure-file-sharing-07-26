import "./Dashboard.css";
import SummaryCard from "./SummaryCard";
import FileActivity from "./FileActivity";
import StorageChart from "./StorageChart";
import RecentFiles from "./RecentFiles";
import RecentActivity from "./RecentActivity";
import QuickActions from "./QuickActions";
import useDashboard from "./hooks/useDashboard";

export default function Dashboard() {
  const { dashboard, loading } = useDashboard();

  if (loading) {
    return <h2>Loading...</h2>;
  }

  if (!dashboard) {
    return <h2>Unable to load dashboard.</h2>;
  }

  const {
    summary,
    weekly_activity,
    storage_by_type,
    recent_files,
    recent_activity,
  } = dashboard;

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>

      <div className="summary-grid">
        <SummaryCard
          title="Total Files"
          value={summary.total_files}
          subtitle={`+${summary.new_files_this_week} this week`}
        />

        <SummaryCard
          title="Storage Used"
          value={summary.storage_used}
          subtitle={`${summary.storage_limit} Available`}
        />

        <SummaryCard
          title="Active Shares"
          value={summary.active_shares}
          subtitle={`+${summary.new_shares_today} today`}
        />

        <SummaryCard
          title="Security Events"
          value={summary.security_events}
          subtitle={`${summary.critical_events} Critical`}
        />
      </div>

      <div className="dashboard-middle">
        <FileActivity activity={weekly_activity} />
        <StorageChart
          data={storage_by_type}
          total={summary.storage_used}
        />
      </div>

      <div className="dashboard-bottom">
        <RecentFiles files={recent_files} />

        <div className="dashboard-side">
          <QuickActions />
          <RecentActivity activities={recent_activity} />
        </div>
      </div>
    </div>
  );
}