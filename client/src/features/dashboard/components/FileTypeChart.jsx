import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { CARD_BASE_CLASS, FILE_TYPE_COLORS } from '../constants/dashboardConstants';

export default function FileTypeChart({ data }) {
  return (
    <section className={`${CARD_BASE_CLASS} p-5`} aria-labelledby="file-type-heading">
      <h2 id="file-type-heading" className="text-base font-semibold text-[#0F172A]">
        File Types
      </h2>
      <div className="mt-4 h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={56} outerRadius={88} paddingAngle={4} stroke="#FFFFFF" strokeWidth={3}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={FILE_TYPE_COLORS[index % FILE_TYPE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}%`, 'Share']} contentStyle={{ borderRadius: 14, border: '1px solid #E2E8F0' }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
