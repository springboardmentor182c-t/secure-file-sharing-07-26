import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function StorageChart({ data }) {
  return (
    <div className="bg-[#1a1a22] rounded-xl p-5 mt-4">
      <h3 className="text-lg font-semibold mb-4">Storage utilization by user</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <XAxis type="number" stroke="#888" />
          <YAxis dataKey="user" type="category" stroke="#888" />
          <Tooltip />
          <Bar dataKey="storage_gb" fill="#7c3aed" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}