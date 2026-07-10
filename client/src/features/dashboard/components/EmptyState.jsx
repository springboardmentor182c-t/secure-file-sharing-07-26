import { CARD_BASE_CLASS } from '../constants/dashboardConstants';

export default function EmptyState() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-6">
      <section className={`${CARD_BASE_CLASS} max-w-md p-8 text-center`}>
        <h1 className="text-xl font-semibold text-[#0F172A]">No dashboard data yet</h1>
        <p className="mt-2 text-sm text-[#64748B]">Your secure file activity will appear here once data is available.</p>
      </section>
    </main>
  );
}
