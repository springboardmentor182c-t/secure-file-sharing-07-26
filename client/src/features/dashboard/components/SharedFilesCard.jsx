import { CARD_BASE_CLASS } from '../constants/dashboardConstants';

export default function SharedFilesCard({ sharedFiles }) {
  return (
    <section className={`${CARD_BASE_CLASS} p-5`} aria-labelledby="shared-files-heading">
      <h2 id="shared-files-heading" className="text-base font-semibold text-[#0F172A]">
        Shared Files
      </h2>
      <p className="mt-2 text-3xl font-semibold text-[#0F172A]">{sharedFiles.total}</p>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {sharedFiles.items.map((item) => (
          <div key={item.id} className="rounded-2xl bg-[#F8FAFC] p-4">
            <p className="text-lg font-semibold text-[#0F172A]">{item.value}</p>
            <p className="mt-1 text-sm font-medium text-[#64748B]">{item.label}</p>
            <p className="mt-1 text-xs text-[#94A3B8]">{item.helper}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
