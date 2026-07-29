import React from "react";
import { formatBytes } from "../utils/fileUtils";

export default function StorageUsage({ stats }) {
  if (!stats) return null;
  const percent = Math.min(100, stats.used_percent);

  return (
    <div className="storage-usage">
      <div className="storage-usage__row">
        <span>Storage</span>
        <span>{formatBytes(stats.used_bytes)} / {formatBytes(stats.total_bytes)}</span>
      </div>
      <div className="storage-usage__track">
        <div className="storage-usage__fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="storage-usage__meta">
        {stats.file_count} files · {stats.folder_count} folders
      </div>
    </div>
  );
}
