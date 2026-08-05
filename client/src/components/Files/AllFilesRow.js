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
  const ext = (fileName || "").split(".").pop().toLowerCase();
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

function AllFilesRow({ file }) {
  const fileName = file.original_filename || file.file_name || "Unnamed file";
  const owner = file.owner_username || file.username || "-";
  const category = file.category || file.category_name || "-";
  const uploadedAt = file.created_at || file.uploaded_at;
  const size = file.size || file.file_size;

  return (
    <tr className="file-row">
      <td className="file-row__name">
        <span
          className="file-row__icon"
          style={{ background: getIconColor(fileName) }}
        />
        {fileName}
      </td>
      <td>{owner}</td>
      <td>{category}</td>
      <td>{formatDate(uploadedAt)}</td>
      <td>{formatFileSize(size)}</td>
    </tr>
  );
}

export default AllFilesRow;
