import React from "react";

export default function StatCard({ label, value, subtext }) {
  return (
    <div className="bg-[#171826] border border-gray-800 rounded-xl p-5">
      <p className="text-gray-400 text-sm mb-2">{label}</p>
      <h2 className="text-white text-2xl font-semibold">{value}</h2>
      {subtext && <p className="text-gray-500 text-xs mt-1">{subtext}</p>}
    </div>
  );
}