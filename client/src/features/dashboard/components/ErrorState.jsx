import { CARD_BASE_CLASS, FOCUS_RING_CLASS } from '../constants/dashboardConstants';

export default function ErrorState({ message = 'Unable to load dashboard data.', onRetry }) {
  return (
    <section className="min-h-screen bg-[#F8FAFC] px-4 py-10 text-[#0F172A] sm:px-6 lg:px-8">
      <div className={`${CARD_BASE_CLASS} mx-auto flex max-w-xl flex-col items-center px-6 py-12 text-center`}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-[#DC2626]">
          <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M12 8v5" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            <path d="M12 17h.01" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.4" />
            <path d="M10.3 4.8 3.7 17.2A2 2 0 0 0 5.45 20h13.1a2 2 0 0 0 1.75-2.8L13.7 4.8a1.93 1.93 0 0 0-3.4 0Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          </svg>
        </div>
        <h1 className="mt-4 text-xl font-semibold text-[#0F172A]">Dashboard unavailable</h1>
        <p className="mt-2 text-sm leading-6 text-[#64748B]">{message}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={`mt-6 rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 ${FOCUS_RING_CLASS}`}
          >
            Retry
          </button>
        )}
      </div>
    </section>
  );
}
