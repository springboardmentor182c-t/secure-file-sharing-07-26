import { FOCUS_RING_CLASS } from '../constants/dashboardConstants';

function SearchIcon() {
  return (
    <svg aria-hidden="true" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path d="m21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  );
}

export default function DashboardHeader({ user }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#E2E8F0] bg-white/90 px-4 py-4 backdrop-blur lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="md:hidden">
          <p className="text-sm font-semibold text-[#315BFF]">TrustShare</p>
          <h1 className="text-xl font-semibold text-[#0F172A]">{user.greeting}</h1>
        </div>

        <label className="relative w-full max-w-2xl">
          <span className="sr-only">Search dashboard</span>
          <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </span>
          <input
            className={`h-12 w-full rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] pl-12 pr-16 text-sm text-[#0F172A] placeholder:text-slate-400 ${FOCUS_RING_CLASS}`}
            placeholder="Search files, people, activity..."
            type="search"
          />
          <kbd className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-400 sm:block">
            ⌘K
          </kbd>
        </label>

        <div className="flex items-center justify-end gap-3">
          <button aria-label="Toggle theme" className={`rounded-full p-2 text-[#64748B] hover:bg-slate-100 ${FOCUS_RING_CLASS}`} type="button">
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M20 14.5A7.5 7.5 0 0 1 9.5 4 8.3 8.3 0 1 0 20 14.5Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            </svg>
          </button>
          <button aria-label="Open notifications" className={`relative rounded-full p-2 text-[#64748B] hover:bg-slate-100 ${FOCUS_RING_CLASS}`} type="button">
            <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
              <path d="M10 21h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            </svg>
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#315BFF] text-[10px] font-bold text-white">
              5
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
