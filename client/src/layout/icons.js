// Lightweight inline SVG icon set — avoids adding an icon-library dependency
// that isn't already in package.json. Each icon accepts standard SVG props.
import React from "react";

const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

export const FolderIcon = (p) => (
  <svg {...base} {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" /></svg>
);
export const ShareIcon = (p) => (
  <svg {...base} {...p}><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><path d="M8.6 10.5 15.4 6.5M8.6 13.5l6.8 4" /></svg>
);
export const ClockIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
);
export const StarIcon = (p) => (
  <svg {...base} {...p}><path d="M12 3l2.6 5.6 6.1.6-4.6 4.1 1.3 6-5.4-3.1L6.6 19.3l1.3-6-4.6-4.1 6.1-.6L12 3Z" /></svg>
);
export const TrashIcon = (p) => (
  <svg {...base} {...p}><path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-8 0 1 13a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2l1-13" /></svg>
);
export const LinkIcon = (p) => (
  <svg {...base} {...p}><path d="M9.5 14.5 14.5 9.5" /><path d="M11 7l1.3-1.3a3.5 3.5 0 0 1 5 5L16 12" /><path d="M13 17l-1.3 1.3a3.5 3.5 0 0 1-5-5L8 12" /></svg>
);
export const BarChartIcon = (p) => (
  <svg {...base} {...p}><path d="M4 20V10M12 20V4M20 20v-7" /></svg>
);
export const AuditIcon = (p) => (
  <svg {...base} {...p}><path d="M4 20V10m4 10V4m4 16v-7m4 7v-3" /></svg>
);
export const ShieldIcon = (p) => (
  <svg {...base} {...p}><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3Z" /></svg>
);
export const UsersIcon = (p) => (
  <svg {...base} {...p}><circle cx="9" cy="8" r="3" /><path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" /><circle cx="17" cy="8" r="2.5" /><path d="M17.5 14c2.6.4 4.5 2.4 4.5 6" /></svg>
);
export const BellIcon = (p) => (
  <svg {...base} {...p}><path d="M6 9a6 6 0 1 1 12 0c0 4 1.5 5.5 1.5 5.5H4.5S6 13 6 9Z" /><path d="M10 19a2 2 0 0 0 4 0" /></svg>
);
export const SettingsIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="12" r="3" /><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14 3h-4l-.6 2.5a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.6a7 7 0 0 0 0 2.4l-2 1.6 2 3.4 2.3-.9c.6.5 1.3.9 2 1.2L10 21h4l.6-2.5c.7-.3 1.4-.7 2-1.2l2.3.9 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z" /></svg>
);
export const SearchIcon = (p) => (
  <svg {...base} {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
);
export const PlusIcon = (p) => (
  <svg {...base} {...p}><path d="M12 5v14M5 12h14" /></svg>
);
export const EyeIcon = (p) => (
  <svg {...base} {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
);
export const DownloadIcon = (p) => (
  <svg {...base} {...p}><path d="M12 3v12m0 0 4-4m-4 4-4-4M4 19h16" /></svg>
);
export const LockIcon = (p) => (
  <svg {...base} {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 1 1 8 0v4" /></svg>
);
export const UnlockIcon = (p) => (
  <svg {...base} {...p}><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V7a4 4 0 0 1 7.3-2.3" /></svg>
);
export const MoreIcon = (p) => (
  <svg {...base} {...p}><circle cx="12" cy="5" r="1.5" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1.5" fill="currentColor" stroke="none" /></svg>
);
export const CopyIcon = (p) => (
  <svg {...base} {...p}><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
);
export const EditIcon = (p) => (
  <svg {...base} {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z" /></svg>
);
export const PowerIcon = (p) => (
  <svg {...base} {...p}><path d="M12 2v9" /><path d="M6 5.5a8 8 0 1 0 12 0" /></svg>
);
export const CheckIcon = (p) => (
  <svg {...base} {...p}><path d="m20 6-11 11-5-5" /></svg>
);
export const XIcon = (p) => (
  <svg {...base} {...p}><path d="M18 6 6 18M6 6l12 12" /></svg>
);
export const ChevronLeftIcon = (p) => (
  <svg {...base} {...p}><path d="m15 18-6-6 6-6" /></svg>
);
export const ChevronRightIcon = (p) => (
  <svg {...base} {...p}><path d="m9 18 6-6-6-6" /></svg>
);
export const ChevronDownIcon = (p) => (
  <svg {...base} {...p}><path d="m6 9 6 6 6-6" /></svg>
);
export const LogoutIcon = (p) => (
  <svg {...base} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>
);
export const FileTextIcon = (p) => (
  <svg {...base} {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" /><path d="M14 3v5h5" /></svg>
);
export const FileZipIcon = (p) => (
  <svg {...base} {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" /><path d="M14 3v5h5" /><path d="M11 9v1m0 2v1m0 2v1" /></svg>
);
export const FileImageIcon = (p) => (
  <svg {...base} {...p}><rect x="4" y="4" width="16" height="16" rx="2" /><circle cx="9.5" cy="9.5" r="1.5" /><path d="m5 17 4.5-4.5L13 16l3-3 3 3" /></svg>
);
export const FileIcon = (p) => (
  <svg {...base} {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" /><path d="M14 3v5h5" /><path d="M9 13h6M9 16.5h6" /></svg>
);
export const UploadIcon = (p) => (
  <svg {...base} {...p}><path d="M12 21V9m0 0 4 4m-4-4-4 4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" /></svg>
);
export const MoveIcon = (p) => (
  <svg {...base} {...p}><path d="M5 9V5a2 2 0 0 1 2-2h4M19 9V5a2 2 0 0 0-2-2h-4M5 15v4a2 2 0 0 0 2 2h4M19 15v4a2 2 0 0 1-2 2h-4" /></svg>
);
export const FolderPlusIcon = (p) => (
  <svg {...base} {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" /><path d="M12 11v4M10 13h4" /></svg>
);
