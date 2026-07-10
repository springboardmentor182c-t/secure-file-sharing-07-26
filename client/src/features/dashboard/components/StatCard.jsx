import { CARD_BASE_CLASS } from '../constants/dashboardConstants';

const toneStyles = {
  primary: 'bg-blue-50 text-[#315BFF]',
  success: 'bg-emerald-50 text-emerald-600',
  warning: 'bg-amber-50 text-amber-600',
  danger: 'bg-rose-50 text-rose-600',
  info: 'bg-sky-50 text-sky-600',
};

const iconPaths = {
  file: ['M7 3.5h6l4 4V20a.5.5 0 0 1-.5.5h-9A.5.5 0 0 1 7 20v-16Z', 'M13 3.5V8h4'],
  share: ['M8.5 12.5 15.5 8.5', 'M8.5 11.5 15.5 15.5', 'M6.5 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z', 'M17.5 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z', 'M17.5 19.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z'],
  clock: ['M12 7v5l3 2', 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'],
  alert: ['M12 8v5', 'M12 17h.01', 'M10.4 4.8 3.7 17.3A2 2 0 0 0 5.5 20h13a2 2 0 0 0 1.8-2.7L13.6 4.8a1.8 1.8 0 0 0-3.2 0Z'],
};

function CardIcon({ name }) {
  const paths = iconPaths[name] ?? iconPaths.file;

  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      {paths.map((path) => (
        <path key={path} d={path} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      ))}
    </svg>
  );
}

export default function StatCard({ stat }) {
  return (
    <article className={`${CARD_BASE_CLASS} min-h-40 p-5`}>
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${toneStyles[stat.tone] ?? toneStyles.primary}`}>
          <CardIcon name={stat.icon} />
        </div>
      </div>
      <p className="mt-7 text-3xl font-semibold tracking-tight text-[#0F172A]">{stat.value}</p>
      <h3 className="mt-2 text-sm font-semibold text-[#64748B]">{stat.label}</h3>
      <p className="mt-3 text-xs font-medium text-emerald-600">{stat.trend}</p>
    </article>
  );
}
