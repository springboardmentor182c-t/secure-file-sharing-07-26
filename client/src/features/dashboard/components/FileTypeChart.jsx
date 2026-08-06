import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CARD_BASE_CLASS, DASHBOARD_THEME, FILE_TYPE_COLORS } from '../constants/dashboardConstants';

export default function FileTypeChart({ data }) {
  return (
    <section className={`${CARD_BASE_CLASS} p-5`} aria-labelledby="file-type-heading">
      <div>
        <h2 id="file-type-heading" className="text-base font-semibold text-[#0F172A]">
          File Types
        </h2>
        <p className="mt-1 text-sm text-[#64748B]">Distribution across encrypted storage</p>
      </div>

      <div className="mt-5 h-72" role="img" aria-label="Pie chart showing storage file type distribution">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              cx="50%"
              cy="48%"
              data={data}
              dataKey="value"
              innerRadius={58}
              outerRadius={92}
              paddingAngle={3}
              stroke="#FFFFFF"
              strokeWidth={3}
            >
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={FILE_TYPE_COLORS[index % FILE_TYPE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value}%`, 'Share']}
              contentStyle={{
                border: `1px solid ${DASHBOARD_THEME.border}`,
                borderRadius: 8,
                boxShadow: '0 10px 30px rgba(15, 23, 42, 0.08)',
              }}
            />
            <Legend iconType="circle" wrapperStyle={{ color: DASHBOARD_THEME.muted, fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
