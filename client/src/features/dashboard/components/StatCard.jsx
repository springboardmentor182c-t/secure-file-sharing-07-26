import { CARD_BASE_CLASS, STAT_TONE_STYLES } from '../constants/dashboardConstants';

const iconPaths = {
  files: ['M7 3.5h6.25L18 8.25V20a.5.5 0 0 1-.5.5h-11A.5.5 0 0 1 6 20V4a.5.5 0 0 1 .5-.5Z', 'M13 3.5V8h5'],
  share: ['M8.5 12.5 15.5 8.5', 'M8.5 11.5 15.5 15.5', 'M6.5 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z', 'M17.5 9.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z', 'M17.5 19.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z'],
  storage: ['M4.5 7c0-1.38 3.36-2.5 7.5-2.5S19.5 5.62 19.5 7s-3.36 2.5-7.5 2.5S4.5 8.38 4.5 7Z', 'M4.5 7v5c0 1.38 3.36 2.5 7.5 2.5s7.5-1.12 7.5-2.5V7', 'M4.5 12v5c0 1.38 3.36 2.5 7.5 2.5s7.5-1.12 7.5-2.5v-5'],
  active: ['M6.5 12.5 10 16l7.5-8', 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'],
  requests: ['M8 7h8', 'M8 12h5', 'M8 17h8', 'M5 4.5h14A1.5 1.5 0 0 1 20.5 6v12a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18V6A1.5 1.5 0 0 1 5 4.5Z'],
  shield: ['M12 3.5 18.5 6v5.25c0 4.04-2.63 7.52-6.5 8.75-3.87-1.23-6.5-4.71-6.5-8.75V6L12 3.5Z', 'M9.5 12.25 11.25 14 15 10'],
};

function StatIcon({ name }) {
  const paths = iconPaths[name] ?? iconPaths.files;

  return (
    <svg aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      {paths.map((path) => (
        <path key={path} d={path} strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
      ))}
    </svg>
  );
}

export default function StatCard({ stat }) {
  const tone = STAT_TONE_STYLES[stat.tone] ?? STAT_TONE_STYLES.primary;

  return (
    <article className={`${CARD_BASE_CLASS} p-5 transition hover:-translate-y-0.5 hover:shadow-soft`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#64748B]">{stat.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-[#0F172A]">{stat.value}</p>
        </div>
        <div className={`rounded-lg p-2.5 ${tone.icon}`}>
          <StatIcon name={stat.icon} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone.trend}`}>{stat.trend}</span>
        <span className="text-sm text-[#64748B]">{stat.description}</span>
      </div>
    </article>
  );
}
