import { CARD_BASE_CLASS, FOCUS_RING_CLASS, NOTIFICATION_TONE_STYLES } from '../constants/dashboardConstants';

export default function NotificationsPreview({ notifications }) {
  function handleViewAll() {
    // TODO: Route to the notification module when that teammate-owned page is ready.
    console.info('Dashboard notifications preview clicked');
  }

  return (
    <section className={`${CARD_BASE_CLASS} p-5`} aria-labelledby="notifications-preview-heading">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="notifications-preview-heading" className="text-base font-semibold text-[#0F172A]">
            Notifications
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">Recent alerts and reminders</p>
        </div>
        <button
          type="button"
          onClick={handleViewAll}
          className={`rounded-lg px-2.5 py-1.5 text-sm font-semibold text-[#4F46E5] transition hover:bg-indigo-50 ${FOCUS_RING_CLASS}`}
        >
          View all
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {notifications.map((notification) => (
          <article key={notification.id} className="flex gap-3 rounded-lg border border-[#E2E8F0] p-3">
            <span
              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                NOTIFICATION_TONE_STYLES[notification.type] ?? NOTIFICATION_TONE_STYLES.info
              }`}
              aria-hidden="true"
            >
              i
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <h3 className="text-sm font-semibold text-[#0F172A]">{notification.title}</h3>
                <span className="text-xs text-[#64748B]">{notification.time}</span>
              </div>
              <p className="mt-1 text-sm text-[#64748B]">{notification.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
