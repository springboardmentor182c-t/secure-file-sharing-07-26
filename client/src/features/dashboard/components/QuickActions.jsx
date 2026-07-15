import {
  CARD_BASE_CLASS,
  DASHBOARD_QUICK_ACTIONS,
  FOCUS_RING_CLASS,
} from '../constants/dashboardConstants';

const actionIconPaths = {
  upload: ['M12 16V4', 'M7.5 8.5 12 4l4.5 4.5', 'M5 16.5V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5'],
  folder: ['M3.5 6.5A1.5 1.5 0 0 1 5 5h4l2 2h8a1.5 1.5 0 0 1 1.5 1.5v8A1.5 1.5 0 0 1 19 18H5a1.5 1.5 0 0 1-1.5-1.5v-10Z'],
  share: ['M8.5 12.5 15.5 8.5', 'M8.5 11.5 15.5 15.5', 'M6.5 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z', 'M17.5 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z', 'M17.5 19.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z'],
  clock: ['M12 7v5l3 2', 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'],
  lock: [
  'M7 11V8a5 5 0 0 1 10 0v3',
  'M6 11h12v9H6z',
],
shield: [
  'M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6l7-3Z',
],
};

function ActionIcon({ name }) {
  const paths = actionIconPaths[name] ?? actionIconPaths.upload;

  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {paths.map((path) => (
        <path key={path} d={path} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      ))}
    </svg>
  );
}

export default function QuickActions() {
  function handleAction(actionId) {
    // TODO: Connect to the assigned feature modules when upload, folder, sharing, and files pages are available.
    alert(`Selected action: ${actionId}`);
  }

  return (
    <section className={`${CARD_BASE_CLASS} p-5`} aria-labelledby="quick-actions-heading">
      <div>
        <h2 id="quick-actions-heading" className="text-base font-semibold text-[#0F172A]">
          Quick Actions
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">UI placeholders for teammate-owned workflows</p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {DASHBOARD_QUICK_ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            aria-label={action.ariaLabel}
            onClick={() => handleAction(action.id)}
            className={`group rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] p-4 text-left transition hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-white hover:shadow-sm ${FOCUS_RING_CLASS}`}
          >
            <span className="inline-flex rounded-lg bg-white p-2 text-[#4F46E5] shadow-sm ring-1 ring-[#E2E8F0] transition group-hover:bg-indigo-50">
              <ActionIcon name={action.icon} />
            </span>
            <span className="mt-3 block text-sm font-semibold text-[#0F172A]">{action.label}</span>
            <span className="mt-1 block text-sm text-[#64748B]">{action.description}</span>
             {action.icon === 'lock' && (
  <span className="mt-2 inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
    AES-256 Protected
  </span>
)}

{action.icon === 'shield' && (
  <span className="mt-2 inline-block rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700">
    Secure Authentication
  </span>
)}
          </button>
        ))}
      </div>
    </section>
  );
}
