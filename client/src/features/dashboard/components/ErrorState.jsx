import { CARD_BASE_CLASS, FOCUS_RING_CLASS } from '../constants/dashboardConstants';

export default function ErrorState({ message, onRetry }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-6">
      <section className={`${CARD_BASE_CLASS} max-w-md p-8 text-center`}>
        <h1 className="text-xl font-semibold text-[#0F172A]">Dashboard unavailable</h1>
        <p className="mt-2 text-sm text-[#64748B]">{message}</p>
        <button className={`mt-5 rounded-2xl bg-[#315BFF] px-5 py-2.5 text-sm font-semibold text-white ${FOCUS_RING_CLASS}`} onClick={onRetry} type="button">
          Retry
        </button>
      </section>
    </main>
  );
}
