import { CARD_BASE_CLASS } from '../constants/dashboardConstants';

export default function TeamActivity({ teamActivity }) {
  return (
    <section className={`${CARD_BASE_CLASS} p-5`} aria-labelledby="team-activity-heading">
      <h2 id="team-activity-heading" className="text-base font-semibold text-[#0F172A]">
        Team Activity
      </h2>
      <div className="mt-4 space-y-3">
        {teamActivity.map((activity) => (
          <article key={activity.id} className="flex items-center gap-3 rounded-2xl bg-[#F8FAFC] p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-bold text-[#315BFF]">
              {activity.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#0F172A]">
                {activity.name} <span className="font-normal text-[#64748B]">{activity.action}</span>
              </p>
              <p className="truncate text-xs text-[#64748B]">{activity.file}</p>
            </div>
            <time className="text-xs text-[#94A3B8]">{activity.time}</time>
          </article>
        ))}
      </div>
    </section>
  );
}
