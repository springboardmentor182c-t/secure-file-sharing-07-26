import { CARD_BASE_CLASS } from '../constants/dashboardConstants';

function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200 ${className}`} />;
}

export default function LoadingSkeleton() {
  return (
    <main className="min-h-screen bg-[#F8FAFC] p-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <Skeleton className="h-14 w-full" />
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className={`${CARD_BASE_CLASS} p-5`}>
              <Skeleton className="h-10 w-10" />
              <Skeleton className="mt-7 h-8 w-20" />
              <Skeleton className="mt-3 h-4 w-28" />
            </div>
          ))}
        </div>
        <Skeleton className="h-72 w-full" />
      </div>
    </main>
  );
}
