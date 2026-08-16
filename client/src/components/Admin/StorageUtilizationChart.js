import React from "react";

export default function StorageUtilizationChart({ data, maxScale = 1000 }) {
  const ticks = [0, 200, 400, 600, 800, 1000];

  return (
    <div>
      <div className="space-y-4">
        {data.map((user) => (
          <div className="flex items-center gap-4" key={user.name}>
            <span className="w-28 shrink-0 text-gray-300 text-sm">{user.name}</span>
            <div className="flex-1 bg-[#272938] rounded-full h-2.5 relative">
              <div
                className="bg-purple-500 h-2.5 rounded-full"
                style={{ width: `${Math.min((user.storage_used_gb / maxScale) * 100, 100)}%` }}
              />
            </div>
            <span className="w-20 text-right text-gray-400 text-sm">
              {user.storage_used_gb.toFixed(1)} GB
            </span>
          </div>
        ))}
      </div>

      {/* Axis */}
      <div className="flex items-center gap-4 mt-3 pt-2 border-t border-gray-800">
        <span className="w-28 shrink-0" />
        <div className="flex-1 flex justify-between text-xs text-gray-500">
          {ticks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>
        <span className="w-20" />
      </div>
    </div>
  );
}