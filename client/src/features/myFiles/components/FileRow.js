import React from "react";
import FileActionMenu from "./FileActionMenu";
import { StarIcon } from "../../../layout/icons";
import { formatBytes, formatDate, iconForExtension } from "../utils/fileUtils";

export default function FileRow({
  file, isTrash, selected, onToggleSelect,
  onDownload, onShare, onStar, onRename, onMove, onCategory, onTrash, onRestore, onPermanentDelete,
}) {
  const Icon = iconForExtension(file.extension);

  return (
    <tr className={selected ? "files-table__row files-table__row--selected" : "files-table__row"}>
      <td className="files-table__checkbox-cell">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggleSelect(file.id)}
          aria-label={`Select ${file.original_filename}`}
        />
      </td>
      <td>
        <div className="files-table__name-cell">
          <span className="files-table__icon"><Icon width={18} height={18} /></span>
          <div>
            <div className="files-table__filename">
              {file.original_filename}
              {file.is_starred && <StarIcon className="files-table__star" width={13} height={13} />}
            </div>
            <div className="files-table__meta">
              {file.download_count} dl · {file.encryption_status === "aes-256-gcm" ? "AES-256" : "unencrypted"}
            </div>
          </div>
        </div>
      </td>
      <td className="files-table__muted">{formatDate(file.updated_at)}</td>
      <td className="files-table__muted">{formatBytes(file.size)}</td>
      <td><span className="badge badge--muted">{file.category}</span></td>
      <td>
        <span className={`badge ${file.is_shared ? "badge--accent" : "badge--muted"}`}>
          {file.is_shared ? "Shared" : "Private"}
        </span>
      </td>
      <td>
        <FileActionMenu
          file={file}
          isTrash={isTrash}
          onDownload={() => onDownload(file)}
          onShare={() => onShare(file)}
          onStar={() => onStar(file)}
          onRename={() => onRename(file)}
          onMove={() => onMove(file)}
          onCategory={() => onCategory(file)}
          onTrash={() => onTrash(file)}
          onRestore={() => onRestore(file)}
          onPermanentDelete={() => onPermanentDelete(file)}
        />
      </td>
    </tr>
  );
}
