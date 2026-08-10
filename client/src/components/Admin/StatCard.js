import React from "react";

export default function StatCard({ label, value, subtext }) {
  return (
    <div className="bg-[#272938] border border-[#34364A] rounded-2xl p-5 shadow-xl">
      <p className="text-gray-400 text-xs font-medium mb-1.5">{label}</p>
      <h2 className="text-white text-2xl font-bold">{value}</h2>
      {subtext && <p className="text-gray-500 text-[11px] mt-1 font-medium">{subtext}</p>}
    </div>
  );
}