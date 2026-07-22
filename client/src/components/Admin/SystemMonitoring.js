import React from "react";

export default function SystemMonitoring({ services }) {
  return (
    <div className="overflow-x-auto bg-[#171826] border border-gray-800 rounded-xl">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400 text-left">
            <th className="px-4 py-3 font-medium">Service</th>
            <th className="px-4 py-3 font-medium">Latency</th>
            <th className="px-4 py-3 font-medium">Uptime</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {services.map((service) => (
            <tr key={service.service_name} className="border-b border-gray-800/60 last:border-0">
              <td className="px-4 py-3 text-white">{service.service_name}</td>
              <td className="px-4 py-3 text-gray-300">{service.latency_ms.toFixed(2)}ms</td>
              <td className="px-4 py-3 text-gray-300">{service.uptime_percent}%</td>
              <td className="px-4 py-3">
                <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-green-500/15 text-green-400">
                  {service.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}