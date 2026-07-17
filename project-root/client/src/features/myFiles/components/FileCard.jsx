const iconMap = {
  document: '📄',
  video: '🎬',
  spreadsheet: '📊',
};

function Tag({ label }) {
  return (
    <span className="inline-flex rounded-full bg-[#EEF2FF] px-2.5 py-1 text-xs font-semibold text-[#3730A3]">
      {label}
    </span>
  );
}

export default function FileCard({ file }) {
  return (
    <article className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm shadow-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-[#EEF2FF] text-xl">{iconMap[file.icon] ?? '📄'}</div>
        <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#475569]">
          {file.category}
        </span>
      </div>

      <div className="mt-5 space-y-3">
        <h3 className="text-base font-semibold text-[#0F172A]">{file.name}</h3>
        <div className="flex flex-wrap gap-2">
          {file.tags.map((tag) => (
            <Tag key={tag} label={tag} />
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 text-sm text-[#64748B]">
        <p>{file.size}</p>
        <p>{file.modified}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-[#475569] ${
          file.encrypted ? 'bg-[#ECFDF5] text-[#166534]' : 'bg-[#F8FAFC] text-[#64748B]'
        }`}>
          {file.encrypted ? '🔒 Encrypted' : '🔓 Unencrypted'}
        </span>
        <button type="button" className="text-sm font-semibold text-[#4F46E5] transition hover:text-[#3730A3]">
          Details
        </button>
      </div>
    </article>
  );
}
