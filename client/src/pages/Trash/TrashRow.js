import { RotateCcw, Trash2 } from "lucide-react";

function formatFileSize(bytes) {
  if (bytes === null || bytes === undefined) return "-";

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = Number(bytes);
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 2)} ${units[unitIndex]}`;
}

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function TrashRow({ file, onRestore, onDelete }) {
  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800 transition-colors duration-200">
      {/* File Name */}
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-semibold text-white">
            {file.original_name}
          </span>

          <span className="text-xs text-gray-400 mt-1">
            {file.file_name}
          </span>
        </div>
      </td>

      {/* File Type */}
      <td className="px-6 py-4">
        <span className="text-gray-300 uppercase">
          {file.file_extension || "-"}
        </span>
      </td>

      {/* File Size */}
      <td className="px-6 py-4">
        <span className="text-gray-300">
          {formatFileSize(file.file_size)}
        </span>
      </td>

      {/* Updated At */}
      <td className="px-6 py-4">
        <span className="text-gray-300">
          {formatDate(file.updated_at)}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => onRestore(file.id)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            <RotateCcw size={16} />
            Restore
          </button>

          <button
            onClick={() => onDelete(file.id)}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default TrashRow;