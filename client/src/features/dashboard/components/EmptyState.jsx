import { CARD_BASE_CLASS } from '../constants/dashboardConstants';

export default function EmptyState({
  title = 'No dashboard data yet',
  description = 'Your secure file activity will appear here once files are uploaded, shared, or reviewed.',
}) {
  return (
    <section className="min-h-screen bg-[#F8FAFC] px-4 py-10 text-[#0F172A] sm:px-6 lg:px-8">
      <div className={`${CARD_BASE_CLASS} mx-auto flex max-w-xl flex-col items-center px-6 py-12 text-center`}>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-[#4F46E5]">
          <svg aria-hidden="true" className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M7 4h6l4 4v12H7V4Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            <path d="M13 4v4h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
          </svg>
        </div>
        <h1 className="mt-4 text-xl font-semibold text-[#0F172A]">{title}</h1>
        <p className="mt-2 text-sm leading-6 text-[#64748B]">{description}</p>
      </div>
    </section>
  );
}
