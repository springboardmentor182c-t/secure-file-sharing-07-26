export default function FolderCard({ id, title, subtitle, color, onDelete }) {
  const gradientColor = color || 'from-[#E0F2FE] to-[#DBEAFE]';

  return (
    <article className={`group relative rounded-3xl border border-[#E2E8F0] bg-gradient-to-br ${gradientColor} p-5 shadow-sm shadow-slate-100 transition hover:-translate-y-0.5 hover:shadow-md`}>
      <div className="flex items-center justify-between gap-3">
        <div className="rounded-2xl bg-white/80 p-3 text-[#3730A3] shadow-sm shadow-slate-100">📁</div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#475569] shadow-sm shadow-slate-100">
            Folder
          </span>
          {onDelete && id && (
            <button
              type="button"
              onClick={() => onDelete(id)}
              className="rounded-full p-1 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600"
              title="Delete Folder"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-[#0F172A]">{title}</h3>
      <p className="mt-2 text-sm text-[#475569]">{subtitle}</p>
    </article>
  );
}
