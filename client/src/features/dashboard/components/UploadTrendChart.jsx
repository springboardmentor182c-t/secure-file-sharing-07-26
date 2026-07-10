import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CARD_BASE_CLASS } from '../constants/dashboardConstants';

export default function UploadTrendChart({ data }) {
  return (
    <section className={`${CARD_BASE_CLASS} p-5`} aria-labelledby="upload-trend-heading">
      <h2 id="upload-trend-heading" className="text-base font-semibold text-[#0F172A]">
        Upload Trend
      </h2>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="uploads" x1="0" x2="0" y1="0" y2="1">
                <stop offset="5%" stopColor="#315BFF" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#315BFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#E2E8F0" strokeDasharray="4 4" vertical={false} />
            <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
            <Tooltip contentStyle={{ borderRadius: 14, border: '1px solid #E2E8F0' }} />
            <Area dataKey="uploads" type="monotone" stroke="#315BFF" strokeWidth={2.5} fill="url(#uploads)" />
            <Area dataKey="shared" type="monotone" stroke="#8B5CF6" strokeWidth={2} fill="transparent" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
