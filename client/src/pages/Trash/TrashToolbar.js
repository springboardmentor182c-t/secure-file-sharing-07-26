import React from "react";
import { Trash2, AlertCircle, Clock } from "lucide-react";

function TrashToolbar({ totalFiles, onEmptyTrash }) {
  return (
    <div className="space-y-4 mb-6">
      {/* Retention Policy Banner */}
      <div className="p-4 bg-[#272938] border border-[#34364A] rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Clock size={18} />
          </div>
          <div>
            <h3 className="text-white text-xs font-semibold">30-Day Automated Trash Retention Policy</h3>
            <p className="text-gray-400 text-xs mt-0.5">
              Files moved to Trash are kept for 30 days before being automatically purged permanently.
            </p>
          </div>
        </div>

        <button
          onClick={onEmptyTrash}
          disabled={totalFiles === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition shadow-md cursor-pointer shrink-0 ${
            totalFiles === 0
              ? "bg-gray-700/50 text-gray-500 border border-gray-600/30 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700 text-white shadow-red-600/20"
          }`}
        >
          <Trash2 size={14} />
          Empty Trash ({totalFiles})
        </button>
      </div>
    </div>
  );
}

export default TrashToolbar;
