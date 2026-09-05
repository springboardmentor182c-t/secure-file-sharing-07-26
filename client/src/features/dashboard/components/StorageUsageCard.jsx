import { CARD_BASE_CLASS } from '../constants/dashboardConstants';

export default function StorageUsageCard({ storage }) {
  return (
    <section className={`${CARD_BASE_CLASS} p-5`} aria-labelledby="storage-usage-heading">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="storage-usage-heading" className="text-base font-semibold text-[#0F172A]">
            Storage Usage
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">Encrypted workspace storage overview</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-[#4F46E5]">
          {storage.percentage}%
        </span>
      </div>

      <div className="mt-5">
        <div className="flex items-end justify-between gap-4">
          <p className="text-3xl font-semibold tracking-tight text-[#0F172A]">{storage.usedLabel}</p>
          <p className="text-sm text-[#64748B]">of {storage.totalLabel}</p>
        </div>
        <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100" aria-label={`${storage.percentage}% storage used`}>
          <div className="h-full rounded-full bg-[#4F46E5]" style={{ width: `${storage.percentage}%` }} />
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {storage.breakdown.map((item) => (
          <div key={item.id}>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 font-medium text-[#0F172A]">
                <span className={`h-2.5 w-2.5 rounded-full ${item.colorClass}`} aria-hidden="true" />
                {item.label}
              </div>
              <span className="text-[#64748B]">{item.valueLabel}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full rounded-full ${item.colorClass}`} style={{ width: `${item.percentage}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
