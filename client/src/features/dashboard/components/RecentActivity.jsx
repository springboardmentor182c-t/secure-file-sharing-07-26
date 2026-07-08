import { ACTIVITY_TONE_STYLES, CARD_BASE_CLASS } from '../constants/dashboardConstants';

export default function RecentActivity({ activities }) {
  return (
    <section className={`${CARD_BASE_CLASS} p-5`} aria-labelledby="recent-activity-heading">
      <div>
        <h2 id="recent-activity-heading" className="text-base font-semibold text-[#0F172A]">
          Recent Activity
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">Secure file events from today</p>
      </div>

      <ol className="mt-5 space-y-4">
        {activities.map((activity, index) => (
          <li key={activity.id} className="relative flex gap-3">
            {index !== activities.length - 1 && (
              <span className="absolute left-3 top-7 h-[calc(100%+0.5rem)] w-px bg-[#E2E8F0]" aria-hidden="true" />
            )}
            <span
              className={`relative z-10 mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                ACTIVITY_TONE_STYLES[activity.type] ?? ACTIVITY_TONE_STYLES.upload
              }`}
              aria-hidden="true"
            >
              {index + 1}
            </span>
            <div>
              <p className="text-sm font-medium leading-5 text-[#0F172A]">{activity.title}</p>
              <p className="mt-1 text-xs text-[#64748B]">{activity.time}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
