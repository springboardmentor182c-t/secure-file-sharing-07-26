import { CARD_BASE_CLASS } from '../constants/dashboardConstants';

export default function TeamActivity({ teamActivity }) {
  return (
    <section className={`${CARD_BASE_CLASS} p-5`} aria-labelledby="team-activity-heading">
      <div>
        <h2 id="team-activity-heading" className="text-base font-semibold text-[#0F172A]">
          Team Activity
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">Latest collaboration updates from your workspace</p>
      </div>

      <div className="mt-5 space-y-4">
        {teamActivity.map((activity) => (
          <article key={activity.id} className="flex items-center gap-3 rounded-lg bg-[#F8FAFC] p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-sm font-semibold text-[#4F46E5]">
              {activity.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-[#0F172A]">
                {activity.name} <span className="font-normal text-[#64748B]">{activity.action}</span>
              </p>
              <p className="mt-1 truncate text-sm text-[#64748B]">{activity.file}</p>
            </div>
            <time className="shrink-0 text-xs text-[#64748B]">{activity.time}</time>
          </article>
        ))}
      </div>
    </section>
  );
}
