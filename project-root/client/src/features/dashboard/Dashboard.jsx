import DashboardHeader from './components/DashboardHeader';
import DashboardStats from './components/DashboardStats';
import EmptyState from './components/EmptyState';
import ErrorState from './components/ErrorState';
import FileTypeChart from './components/FileTypeChart';
import LoadingSkeleton from './components/LoadingSkeleton';
import NotificationsPreview from './components/NotificationsPreview';
import QuickActions from './components/QuickActions';
import RecentActivity from './components/RecentActivity';
import RecentFilesTable from './components/RecentFilesTable';
import SecurityStatusCard from './components/SecurityStatusCard';
import SharedFilesCard from './components/SharedFilesCard';
import StorageUsageCard from './components/StorageUsageCard';
import TeamActivity from './components/TeamActivity';
import UploadTrendChart from './components/UploadTrendChart';
import { useDashboardData } from './hooks/useDashboardData';

export default function Dashboard() {
  const { dashboardData, error, isEmpty, isLoading, refetch } = useDashboardData();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return <ErrorState message={error.message} onRetry={refetch} />;
  }

  if (isEmpty) {
    return <EmptyState />;
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-6 text-[#0F172A] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader user={dashboardData.user} />
        <DashboardStats stats={dashboardData.stats} />

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <UploadTrendChart data={dashboardData.uploadTrend} />
              <FileTypeChart data={dashboardData.fileTypes} />
            </div>
            <RecentFilesTable files={dashboardData.recentFiles} />
          </div>

          <aside className="space-y-6" aria-label="Storage and security overview">
            <StorageUsageCard storage={dashboardData.storage} />
            <SecurityStatusCard security={dashboardData.security} />
          </aside>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <QuickActions />
          <RecentActivity activities={dashboardData.activities} />
          <NotificationsPreview notifications={dashboardData.notifications} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SharedFilesCard sharedFiles={dashboardData.sharedFiles} />
          <TeamActivity teamActivity={dashboardData.teamActivity} />
        </div>
      </div>
    </main>
  );
}
