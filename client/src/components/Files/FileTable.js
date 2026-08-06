import React from "react";
import FileListItem from "./FileListItem";

function FileTable({ files }) {
  return (
    <div className="overflow-x-auto bg-[#272938] border border-[#34364A] rounded-2xl shadow-xl">
      <table className="w-full text-xs text-left border-collapse">
        <thead>
          <tr className="border-b border-[#34364A] text-gray-400 font-semibold uppercase tracking-wider bg-[#1E1F2B]">
            <th className="py-3 px-4">Name</th>
            <th className="py-3 px-4">User</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Action</th>
            <th className="py-3 px-4">Accessed</th>
            <th className="py-3 px-4 text-right">Size</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#34364A]/50">
          {files.map((file, idx) => (
            <FileListItem
              key={`${file.id}-${idx}`}
              file={file}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FileTable;
