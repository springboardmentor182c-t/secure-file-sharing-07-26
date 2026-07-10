import { CARD_BASE_CLASS, DASHBOARD_QUICK_ACTIONS, FOCUS_RING_CLASS } from '../constants/dashboardConstants';

export default function QuickActions() {
  function handleAction(actionId) {
    console.info(`Dashboard quick action selected: ${actionId}`);
  }

  return (
    <section className={`${CARD_BASE_CLASS} p-5`} aria-labelledby="quick-actions-heading">
      <h2 id="quick-actions-heading" className="text-base font-semibold text-[#0F172A]">
        Quick Actions
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {DASHBOARD_QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            className={`rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-left transition hover:border-blue-200 hover:bg-white ${FOCUS_RING_CLASS}`}
            onClick={() => handleAction(action.id)}
            type="button"
          >
            <span className="text-sm font-semibold text-[#0F172A]">{action.label}</span>
            <span className="mt-1 block text-xs text-[#64748B]">{action.description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
