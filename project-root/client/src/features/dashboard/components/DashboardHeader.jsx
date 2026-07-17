import { CARD_BASE_CLASS } from '../constants/dashboardConstants';

function formatToday() {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

export default function DashboardHeader({ user }) {
  return (
    <header className={`${CARD_BASE_CLASS} p-5 sm:p-6`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#4F46E5]">TrustShare Dashboard</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-[#0F172A] sm:text-3xl">
            {user.greeting}, {user.name}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B] sm:text-base">{user.subtitle}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:justify-end">
          <time className="rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-sm font-medium text-[#0F172A]">
            {formatToday()}
          </time>
          <span className="inline-flex items-center gap-2 rounded-full border border-green-100 bg-green-50 px-3 py-2 text-sm font-semibold text-[#16A34A]">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#16A34A]" />
            {user.securityBadge}
          </span>
        </div>
      </div>
    </header>
  );
}
