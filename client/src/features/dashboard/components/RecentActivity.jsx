import { CARD_BASE_CLASS } from '../constants/dashboardConstants';

const avatarColors = ['bg-indigo-50 text-indigo-600', 'bg-emerald-50 text-emerald-600', 'bg-blue-50 text-blue-600', 'bg-slate-100 text-slate-600', 'bg-violet-50 text-violet-600'];

export default function RecentActivity({ activities }) {
  return (
    <section className={`${CARD_BASE_CLASS} overflow-hidden`} aria-labelledby="recent-activity-heading">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
        <h2 id="recent-activity-heading" className="text-base font-semibold text-[#0F172A]">
          Recent Activity
        </h2>
        <button className="text-sm font-semibold text-[#315BFF]" type="button">
          All activity →
        </button>
      </div>

      <ol className="space-y-1 p-5">
        {activities.map((activity, index) => (
          <li key={activity.id} className="flex items-start gap-4 rounded-2xl p-2 transition hover:bg-[#F8FAFC]">
            <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColors[index % avatarColors.length]}`}>
              {activity.initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-[#0F172A]">
                {activity.title.split(activity.file)[0]}
                <span className="font-semibold text-[#315BFF]">{activity.file}</span>
              </p>
              <p className="mt-1 text-xs text-[#94A3B8]">{activity.time}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
