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
import { FOCUS_RING_CLASS, NAV_ITEMS } from './constants/dashboardConstants';
import { useDashboardData } from './hooks/useDashboardData';

const navIconPaths = {
  grid: ['M4 4h6v6H4V4Z', 'M14 4h6v6h-6V4Z', 'M4 14h6v6H4v-6Z', 'M14 14h6v6h-6v-6Z'],
  file: ['M7 3.5h6l4 4V20H7V3.5Z', 'M13 3.5V8h4'],
  share: ['M8.5 12.5 15.5 8.5', 'M8.5 11.5 15.5 15.5', 'M6.5 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z', 'M17.5 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z', 'M17.5 19.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z'],
  pulse: ['M4 12h4l2-6 4 12 2-6h4'],
  bell: ['M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9', 'M10 21h4'],
  chart: ['M5 19V9', 'M12 19V5', 'M19 19v-7'],
  shield: ['M12 3.5 18.5 6v5.25c0 4.04-2.63 7.52-6.5 8.75-3.87-1.23-6.5-4.71-6.5-8.75V6L12 3.5Z'],
  settings: ['M12 15.2A3.2 3.2 0 1 0 12 8.8a3.2 3.2 0 0 0 0 6.4Z', 'M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 3.1-.2-.1a1.7 1.7 0 0 0-1.9-.1 1.7 1.7 0 0 0-.9 1.6V22h-3.6v-.3a1.7 1.7 0 0 0-.9-1.6 1.7 1.7 0 0 0-1.9.1l-.2.1-1.8-3.1.1-.1A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.4-1.1H3v-3.6h.2a1.7 1.7 0 0 0 1.4-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-3.1.2.1a1.7 1.7 0 0 0 1.9.1 1.7 1.7 0 0 0 .9-1.6V2h3.6v.3a1.7 1.7 0 0 0 .9 1.6 1.7 1.7 0 0 0 1.9-.1l.2-.1 1.8 3.1-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.4 1.1h.2v3.6h-.2A1.7 1.7 0 0 0 19.4 15Z'],
};

function NavIcon({ name }) {
  const paths = navIconPaths[name] ?? navIconPaths.grid;

  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {paths.map((path) => (
        <path key={path} d={path} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      ))}
    </svg>
  );
}

function Sidebar({ notificationCount, sharedFileCount, user }) {
  return (
    <aside className="border-b border-[#E2E8F0] bg-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-80 lg:shrink-0 lg:flex-col lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between gap-4 px-5 py-5 lg:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#315BFF] text-white">
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 3.5 18.5 6v5.25c0 4.04-2.63 7.52-6.5 8.75-3.87-1.23-6.5-4.71-6.5-8.75V6L12 3.5Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            </svg>
          </span>
          <div>
            <p className="text-lg font-bold text-[#0F172A]">TrustShare</p>
            <p className="text-xs font-bold uppercase tracking-wide text-[#315BFF]">Beta</p>
          </div>
        </div>
      </div>

      <nav aria-label="Dashboard navigation" className="flex gap-2 overflow-x-auto px-4 pb-4 lg:block lg:space-y-2 lg:overflow-visible lg:px-5">
        {NAV_ITEMS.map((item) => {
          const badge = item.id === 'shared' ? sharedFileCount : item.id === 'notifications' ? notificationCount : null;

          return (
            <button
              key={item.id}
              className={`flex min-w-fit items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition lg:w-full ${
                item.active ? 'bg-gradient-to-r from-[#2863FF] to-[#4828F4] text-white shadow-soft' : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A]'
              } ${FOCUS_RING_CLASS}`}
              type="button"
            >
              <NavIcon name={item.icon} />
              <span className="flex-1 text-left">{item.label}</span>
              {badge > 0 && <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-[#315BFF]">{badge}</span>}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto hidden border-t border-[#E2E8F0] p-6 lg:block">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#315BFF] text-sm font-bold text-white">{user.initials}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-[#0F172A]">{user.name}</p>
            <p className="truncate text-xs text-[#64748B]">{user.email}</p>
          </div>
        </div>
        <button className="mt-4 text-sm font-medium text-[#64748B]" type="button">
          Sign out
        </button>
      </div>
    </aside>
  );
}

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
    <main className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <div className="lg:flex">
        <Sidebar
          notificationCount={dashboardData.notifications.length}
          sharedFileCount={dashboardData.sharedFiles.total}
          user={dashboardData.user}
        />
        <div className="min-w-0 flex-1">
          <DashboardHeader user={dashboardData.user} />
          <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 lg:px-8">
            <section className="hidden md:block">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#315BFF]">Secure Dashboard</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#0F172A]">{dashboardData.user.greeting}</h1>
              <p className="mt-2 text-sm text-[#64748B]">{dashboardData.user.subtitle}</p>
            </section>

            <DashboardStats stats={dashboardData.stats} />
            <QuickActions />
            <RecentFilesTable files={dashboardData.recentFiles} />
            <StorageUsageCard storage={dashboardData.storage} />
            <RecentActivity activities={dashboardData.activities} />
            <SecurityStatusCard security={dashboardData.security} />

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <UploadTrendChart data={dashboardData.uploadTrend} />
              <FileTypeChart data={dashboardData.fileTypes} />
            </div>
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              <SharedFilesCard sharedFiles={dashboardData.sharedFiles} />
              <NotificationsPreview notifications={dashboardData.notifications} />
            </div>
            <TeamActivity teamActivity={dashboardData.teamActivity} />
          </div>
        </div>
      </div>
    </main>
  );
}
