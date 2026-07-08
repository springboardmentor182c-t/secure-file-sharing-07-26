import { CARD_BASE_CLASS } from '../constants/dashboardConstants';

function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

export default function LoadingSkeleton() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] px-4 py-6 text-[#0F172A] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <section className={`${CARD_BASE_CLASS} p-6`} aria-label="Loading dashboard header">
          <SkeletonBlock className="h-4 w-40" />
          <SkeletonBlock className="mt-4 h-8 w-72 max-w-full" />
          <SkeletonBlock className="mt-3 h-4 w-[32rem] max-w-full" />
        </section>

        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6" aria-label="Loading dashboard statistics">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className={`${CARD_BASE_CLASS} p-5`}>
              <div className="flex justify-between gap-4">
                <div className="flex-1">
                  <SkeletonBlock className="h-4 w-24" />
                  <SkeletonBlock className="mt-4 h-7 w-20" />
                </div>
                <SkeletonBlock className="h-10 w-10" />
              </div>
              <SkeletonBlock className="mt-5 h-4 w-32" />
            </div>
          ))}
        </section>

        <section className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2" aria-label="Loading dashboard charts">
          <div className={`${CARD_BASE_CLASS} p-5`}>
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="mt-5 h-72 w-full" />
          </div>
          <div className={`${CARD_BASE_CLASS} p-5`}>
            <SkeletonBlock className="h-5 w-40" />
            <SkeletonBlock className="mt-5 h-72 w-full" />
          </div>
        </section>
      </div>
    </main>
  );
}
