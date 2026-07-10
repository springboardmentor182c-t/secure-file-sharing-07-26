import { CARD_BASE_CLASS, STATUS_BADGE_STYLES } from '../constants/dashboardConstants';

const typeStyles = {
  PDF: 'bg-rose-50 text-rose-500',
  ZIP: 'bg-amber-50 text-amber-500',
  PNG: 'bg-purple-50 text-purple-500',
  MP4: 'bg-pink-50 text-pink-500',
};

function FileIcon({ type }) {
  return (
    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${typeStyles[type] ?? 'bg-blue-50 text-blue-500'}`}>
      <svg aria-hidden="true" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path d="M7 3.5h6l4 4V20H7V3.5Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
        <path d="M13 3.5V8h4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" />
      </svg>
    </span>
  );
}

export default function RecentFilesTable({ files }) {
  return (
    <section className={`${CARD_BASE_CLASS} overflow-hidden`} aria-labelledby="recent-files-heading">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
        <h2 id="recent-files-heading" className="text-base font-semibold text-[#0F172A]">
          Recent Files
        </h2>
        <button className="text-sm font-semibold text-[#315BFF]" type="button">
          View all →
        </button>
      </div>

      <div className="grid grid-cols-1 gap-x-8 gap-y-1 p-5 lg:grid-cols-2">
        {files.map((file) => (
          <article key={file.id} className="group flex items-center gap-4 rounded-2xl p-3 transition hover:bg-[#F8FAFC]">
            <FileIcon type={file.type} />
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-semibold text-[#0F172A]">{file.name}</h3>
              <p className="mt-1 text-xs text-[#64748B]">
                {file.size} · {file.lastModified}
              </p>
            </div>
            <span className={`hidden rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset sm:inline-flex ${STATUS_BADGE_STYLES[file.status] ?? STATUS_BADGE_STYLES.Private}`}>
              {file.status}
            </span>
            <svg aria-label="Encrypted file" className="h-4 w-4 shrink-0 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M7 11V8a5 5 0 0 1 10 0v3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
              <path d="M6 11h12v9H6v-9Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
            </svg>
          </article>
        ))}
      </div>
    </section>
  );
}
