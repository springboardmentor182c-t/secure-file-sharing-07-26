import React from "react";
import { RotateCcw, Trash2, Clock, FileText, Image, FileSpreadsheet, FileCode, File } from "lucide-react";

function formatFileSize(bytes) {
  if (bytes === null || bytes === undefined) return "0.0 MB";
  if (typeof bytes === "string" && (bytes.includes("MB") || bytes.includes("KB") || bytes.includes("GB") || bytes.includes("B") || bytes.includes("TB"))) {
    return bytes;
  }

  const units = ["B", "KB", "MB", "GB", "TB"];
  let size = Number(bytes);
  if (Number.isNaN(size)) return "0 B";
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "Recently";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function getTrashExpiration(updatedAt) {
  const deletedDate = updatedAt ? new Date(updatedAt) : new Date();
  const expiryDate = new Date(deletedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const formattedExpiryDate = expiryDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (diffDays <= 0) {
    return { label: "Expiring Today", date: formattedExpiryDate, urgent: true };
  }

  return {
    label: `${diffDays} day${diffDays === 1 ? "" : "s"} left`,
    date: formattedExpiryDate,
    urgent: diffDays <= 5,
  };
}

function getFileIcon(fileName) {
  const ext = (fileName || "").split(".").pop().toLowerCase();
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
    return <Image size={16} className="text-emerald-400 shrink-0" />;
  }
  if (["xlsx", "xls", "csv"].includes(ext)) {
    return <FileSpreadsheet size={16} className="text-emerald-500 shrink-0" />;
  }
  if (["py", "js", "ts", "html", "css", "json"].includes(ext)) {
    return <FileCode size={16} className="text-purple-400 shrink-0" />;
  }
  if (["pdf", "doc", "docx", "txt"].includes(ext)) {
    return <FileText size={16} className="text-sky-400 shrink-0" />;
  }
  return <File size={16} className="text-gray-400 shrink-0" />;
}

function TrashRow({ file, onRestore, onDelete }) {
  const displayName = file.name || file.original_filename || file.original_name || file.file_name || "File";
  const displayType = file.file_type || file.extension || file.file_extension || (displayName.split(".").pop() || "pdf");
  const displaySize = file.size ?? file.file_size ?? null;
  const deletedTime = file.updated_at || file.created_at;
  const expiration = getTrashExpiration(deletedTime);

  return (
    <tr className="hover:bg-[#323548]/50 transition-colors">
      {/* File Name */}
      <td className="py-3 px-4 text-white font-medium flex items-center gap-2.5">
        {getFileIcon(displayName)}
        <span className="truncate max-w-[220px]" title={displayName}>
          {displayName}
        </span>
      </td>

      {/* Type */}
      <td className="py-3 px-4">
        <span className="px-2 py-0.5 rounded bg-[#1E1F2B] border border-[#34364A] text-gray-300 text-[11px] uppercase">
          {displayType}
        </span>
      </td>

      {/* Size */}
      <td className="py-3 px-4 text-gray-300 font-mono text-[11px]">
        {formatFileSize(displaySize)}
      </td>

      {/* Deleted At */}
      <td className="py-3 px-4 text-gray-400 font-mono text-[11px]">
        {formatDate(deletedTime)}
      </td>

      {/* Trash Expiration */}
      <td className="py-3 px-4">
        <div className="flex flex-col gap-0.5">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold border ${
              expiration.urgent
                ? "bg-red-500/15 text-red-400 border-red-500/30"
                : "bg-amber-500/15 text-amber-400 border-amber-500/30"
            }`}
          >
            <Clock size={12} />
            {expiration.label}
          </span>
          <span className="text-[10px] text-gray-500 font-mono">
            Auto-purges on {expiration.date}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onRestore(file.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25 transition text-xs font-semibold cursor-pointer"
            title="Restore file"
          >
            <RotateCcw size={13} />
            Restore
          </button>

          <button
            onClick={() => onDelete(file.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25 transition text-xs font-semibold cursor-pointer"
            title="Permanently delete file"
          >
            <Trash2 size={13} />
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

export default TrashRow;
