export default function FolderCard({ title, subtitle, color }) {
  return (
    <article className={`rounded-3xl border border-[#E2E8F0] bg-gradient-to-br ${color} p-5 shadow-sm shadow-slate-100`}>
      <div className="flex items-center justify-between gap-3">
        <div className="rounded-2xl bg-white/80 p-3 text-[#3730A3] shadow-sm shadow-slate-100">📁</div>
        <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#475569] shadow-sm shadow-slate-100">
          Folder
        </span>
      </div>
      <h3 className="mt-5 text-lg font-semibold text-[#0F172A]">{title}</h3>
      <p className="mt-2 text-sm text-[#475569]">{subtitle}</p>
    </article>
  );
}
