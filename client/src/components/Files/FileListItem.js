import React from "react";

function formatFileSize(bytes) {
  if (!bytes) return "-";
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
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getIconColor(fileName) {
  const ext = fileName.split(".").pop().toLowerCase();
  const colors = {
    pdf: "#f87171",
    zip: "#fbbf24",
    docx: "#60a5fa",
    doc: "#60a5fa",
    pptx: "#fb923c",
    jpg: "#34d399",
    jpeg: "#34d399",
    png: "#34d399",
    sql: "#a78bfa",
  };
  return colors[ext] || "#6366f1";
}

function FileListItem({ file }) {
  return (
    <tr className="file-row">
      <td className="file-row__name">
        <span
          className="file-row__icon"
          style={{ background: getIconColor(file.file_name) }}
        />
        {file.file_name}
      </td>
      <td>{file.username || "-"}</td>
      <td>{file.category_name || "-"}</td>
      <td>{file.access_type}</td>
      <td>{formatDate(file.accessed_at)}</td>
      <td>{formatFileSize(file.file_size)}</td>
    </tr>
  );
}

export default FileListItem;