import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { CARD_BASE_CLASS } from '../constants/dashboardConstants';

export default function StorageUsageCard({ storage }) {
  return (
    <section className={`${CARD_BASE_CLASS} p-5`} aria-labelledby="storage-heading">
      <div className="flex items-start justify-between gap-4">
        <h2 id="storage-heading" className="text-base font-semibold text-[#0F172A]">
          Storage Usage
        </h2>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-[#315BFF]">{storage.planLabel}</span>
      </div>

      <div className="mt-5 grid grid-cols-1 items-center gap-6 md:grid-cols-[160px_1fr]">
        <div className="relative h-36">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={storage.breakdown} dataKey="percentage" innerRadius={48} outerRadius={64} paddingAngle={3} stroke="none">
                {storage.breakdown.map((item) => (
                  <Cell key={item.id} fill={item.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold text-[#0F172A]">{storage.percentage}%</span>
            <span className="text-xs text-[#64748B]">of {storage.totalLabel}</span>
          </div>
        </div>

        <div className="space-y-3">
          {storage.breakdown.map((item) => (
            <div key={item.id} className="grid grid-cols-[1fr_auto] items-center gap-4 text-sm">
              <div className="flex items-center gap-3 text-[#64748B]">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.label}
              </div>
              <span className="font-medium text-[#64748B]">{item.valueLabel}</span>
            </div>
          ))}
          <div className="border-t border-[#E2E8F0] pt-3 text-sm text-[#64748B]">
            <strong className="font-semibold text-[#0F172A]">{storage.usedLabel}</strong> used · {storage.freeLabel}
          </div>
        </div>
      </div>
    </section>
  );
}
