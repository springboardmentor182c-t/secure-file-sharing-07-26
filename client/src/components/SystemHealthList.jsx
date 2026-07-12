export default function SystemHealthList({ services }) {
  return (
    <div className="bg-[#1a1a22] rounded-xl p-5 mt-4">
      <h3 className="text-lg font-semibold mb-4">System monitoring</h3>

      {/* Header row */}
      <div className="grid grid-cols-[1fr_80px_80px_120px] items-center py-2 border-b border-gray-700 text-gray-500 text-xs uppercase">
        <span>Service</span>
        <span className="text-right">Latency</span>
        <span className="text-right">Uptime</span>
        <span className="text-right">Status</span>
      </div>

      {services.map((s) => (
        <div
          key={s.service_name}
          className="grid grid-cols-[1fr_80px_80px_120px] items-center py-3 border-b border-gray-800"
        >
          <span>{s.service_name}</span>
          <span className="text-gray-400 text-sm text-right">{s.latency_ms}ms</span>
          <span className="text-gray-400 text-sm text-right">{s.uptime_pct}%</span>
          <span className="text-right">
            <span className={`px-2 py-1 rounded text-xs ${
              s.status === "Operational" ? "bg-green-900 text-green-400" : "bg-yellow-900 text-yellow-400"
            }`}>
              {s.status}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}