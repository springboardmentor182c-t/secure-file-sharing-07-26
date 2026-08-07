import React from "react";
import TrashRow from "./TrashRow";

function TrashTable({ files, loading, onRestore, onDelete }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16 bg-[#272938] border border-[#34364A] rounded-2xl">
        <p className="text-gray-400 text-xs font-medium animate-pulse">Loading items in trash...</p>
      </div>
    );
  }

  if (!files.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-[#272938] border border-[#34364A] rounded-2xl text-center">
        <div className="w-12 h-12 rounded-2xl bg-gray-800 border border-gray-700 flex items-center justify-center text-gray-400 text-xl mb-3">
          🗑️
        </div>
        <h2 className="text-white text-sm font-semibold">Trash is Empty</h2>
        <p className="text-gray-400 text-xs mt-1">Deleted files will appear here with a 30-day retention expiration countdown.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-[#272938] border border-[#34364A] rounded-2xl shadow-xl">
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="border-b border-[#34364A] text-gray-400 font-semibold uppercase tracking-wider bg-[#1E1F2B]">
            <th className="py-3 px-4">File Name</th>
            <th className="py-3 px-4">Type</th>
            <th className="py-3 px-4">Size</th>
            <th className="py-3 px-4">Deleted At</th>
            <th className="py-3 px-4">Trash Expiration</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#34364A]/50">
          {files.map((file) => (
            <TrashRow
              key={file.id}
              file={file}
              onRestore={onRestore}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TrashTable;
