import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CARD_BASE_CLASS, DASHBOARD_THEME } from '../constants/dashboardConstants';

export default function UploadTrendChart({ data }) {
  return (
    <section className={`${CARD_BASE_CLASS} p-5`} aria-labelledby="upload-trend-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="upload-trend-heading" className="text-base font-semibold text-[#0F172A]">
            Upload Trend
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">Uploads and shares across the last 7 days</p>
        </div>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#2563EB]">
          Weekly
        </span>
      </div>

      <div className="mt-5 h-72" role="img" aria-label="Line chart showing upload and sharing trend for this week">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="uploadGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor={DASHBOARD_THEME.primary} stopOpacity={0.28} />
                <stop offset="95%" stopColor={DASHBOARD_THEME.primary} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="sharedGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor={DASHBOARD_THEME.info} stopOpacity={0.2} />
                <stop offset="95%" stopColor={DASHBOARD_THEME.info} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" vertical={false} />
            <XAxis axisLine={false} dataKey="day" tick={{ fill: DASHBOARD_THEME.muted, fontSize: 12 }} tickLine={false} />
            <YAxis axisLine={false} tick={{ fill: DASHBOARD_THEME.muted, fontSize: 12 }} tickLine={false} />
            <Tooltip
              contentStyle={{
                border: `1px solid ${DASHBOARD_THEME.border}`,
                borderRadius: 8,
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
              }}
            />
            <Area
              dataKey="uploads"
              fill="url(#uploadGradient)"
              name="Uploads"
              stroke={DASHBOARD_THEME.primary}
              strokeWidth={2.5}
              type="monotone"
            />
            <Area
              dataKey="shared"
              fill="url(#sharedGradient)"
              name="Shared"
              stroke={DASHBOARD_THEME.info}
              strokeWidth={2}
              type="monotone"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
