import React from "react";
import { FileText, Image, FileSpreadsheet, FileCode, File, Eye, Share2, Upload } from "lucide-react";

function formatFileSize(sizeInput) {
  if (!sizeInput) return "0.0 MB";
  if (typeof sizeInput === "string" && (sizeInput.includes("MB") || sizeInput.includes("KB") || sizeInput.includes("B") || sizeInput.includes("GB"))) {
    return sizeInput;
  }
  const bytes = Number(sizeInput);
  if (isNaN(bytes)) return String(sizeInput);
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(size < 10 ? 1 : 0)} ${units[i]}`;
}

function formatDate(dateString) {
  if (!dateString) return "Recently";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
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

function getActionBadge(action) {
  const act = (action || "viewed").toLowerCase();
  if (act.includes("view")) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-sky-500/15 text-sky-400 border border-sky-500/20 capitalize">
        <Eye size={12} /> Viewed
      </span>
    );
  }
  if (act.includes("share")) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-purple-500/15 text-purple-400 border border-purple-500/20 capitalize">
        <Share2 size={12} /> Shared
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-[11px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 capitalize">
      <Upload size={12} /> Uploaded
    </span>
  );
}

function FileListItem({ file }) {
  return (
    <tr className="hover:bg-[#323548]/50 transition-colors">
      <td className="py-3 px-4 text-white font-medium flex items-center gap-2.5">
        {getFileIcon(file.file_name)}
        <span className="truncate max-w-[220px]" title={file.file_name}>
          {file.file_name}
        </span>
      </td>
      <td className="py-3 px-4 text-gray-300 font-mono text-[11px]">
        {file.username || "Owner"}
      </td>
      <td className="py-3 px-4">
        <span className="px-2 py-0.5 rounded bg-[#1E1F2B] border border-[#34364A] text-gray-300 text-[11px]">
          {file.category_name || "General"}
        </span>
      </td>
      <td className="py-3 px-4">
        {getActionBadge(file.access_type)}
      </td>
      <td className="py-3 px-4 text-gray-400 font-mono text-[11px]">
        {formatDate(file.accessed_at)}
      </td>
      <td className="py-3 px-4 text-right text-gray-300 font-mono font-medium">
        {formatFileSize(file.file_size)}
      </td>
    </tr>
  );
}

export default FileListItem;
