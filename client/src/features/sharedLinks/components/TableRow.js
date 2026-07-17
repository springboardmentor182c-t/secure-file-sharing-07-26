import React from "react";
import StatusBadge from "./StatusBadge";
import PermissionBadge from "./PermissionBadge";
import ActionMenu from "./ActionMenu";
import { FileTextIcon, FileZipIcon, FileImageIcon, LockIcon, EyeIcon, DownloadIcon } from "../../../layout/icons";
import { formatDate, getEffectiveStatus } from "../utils/linkUtils";

const FILE_ICONS = { pdf: FileTextIcon, zip: FileZipIcon, doc: FileTextIcon, img: FileImageIcon };
const FILE_ICON_TINT = { pdf: "danger", zip: "warning", doc: "info", img: "accent" };

export default function TableRow({ link, onCopy, onEdit, onToggleEnabled, onDelete }) {
  const Icon = FILE_ICONS[link.fileType] || FileTextIcon;
  const effectiveStatus = getEffectiveStatus(link);

  return (
    <tr className="links-table__row">
      <td>
        <div className="links-table__file">
          <span className={`links-table__file-icon links-table__file-icon--${FILE_ICON_TINT[link.fileType] || "info"}`}>
            <Icon width={16} height={16} />
          </span>
          <span className="links-table__file-name" title={link.fileName}>{link.fileName}</span>
        </div>
      </td>
      <td>
        <code className="links-table__url">{link.shareUrl}</code>
      </td>
      <td className="links-table__muted">{formatDate(link.createdAt)}</td>
      <td className="links-table__muted">{formatDate(link.expiresAt)}</td>
      <td>
        <span className="links-table__metric">
          <EyeIcon width={13} height={13} /> {link.views}
        </span>
      </td>
      <td>
        <span className="links-table__metric">
          {link.passwordProtected ? <LockIcon width={13} height={13} /> : <DownloadIcon width={13} height={13} />}
          {" "}{link.downloads}
        </span>
      </td>
      <td>
        <PermissionBadge access={link.access} />
      </td>
      <td>
        <StatusBadge status={effectiveStatus} />
      </td>
      <td>
        <ActionMenu
          link={link}
          onCopy={onCopy}
          onEdit={onEdit}
          onToggleEnabled={onToggleEnabled}
          onDelete={onDelete}
        />
      </td>
    </tr>
  );
}
