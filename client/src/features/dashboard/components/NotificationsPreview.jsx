import { CARD_BASE_CLASS } from '../constants/dashboardConstants';

export default function NotificationsPreview({ notifications }) {
  return (
    <section className={`${CARD_BASE_CLASS} p-5`} aria-labelledby="notifications-heading">
      <h2 id="notifications-heading" className="text-base font-semibold text-[#0F172A]">
        Notifications
      </h2>
      <div className="mt-4 space-y-3">
        {notifications.map((notification) => (
          <article key={notification.id} className="rounded-2xl bg-[#F8FAFC] p-4">
            <div className="flex items-start justify-between gap-4">
              <h3 className="text-sm font-semibold text-[#0F172A]">{notification.title}</h3>
              <time className="shrink-0 text-xs text-[#94A3B8]">{notification.time}</time>
            </div>
            <p className="mt-1 text-sm text-[#64748B]">{notification.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
