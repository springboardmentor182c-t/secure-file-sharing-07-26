import {
  FileIcon, FileImageIcon, FileTextIcon, FileZipIcon,
} from "../../../layout/icons";

const IMAGE_EXTS = new Set(["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "tiff"]);
const ARCHIVE_EXTS = new Set(["zip", "tar", "gz", "rar", "7z"]);
const TEXT_EXTS = new Set(["pdf", "doc", "docx", "txt", "md", "rtf", "odt", "csv", "log"]);

export function iconForExtension(extension) {
  const ext = (extension || "").toLowerCase();
  if (IMAGE_EXTS.has(ext)) return FileImageIcon;
  if (ARCHIVE_EXTS.has(ext)) return FileZipIcon;
  if (TEXT_EXTS.has(ext)) return FileTextIcon;
  return FileIcon;
}

export function formatBytes(bytes) {
  if (!bytes || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
  const value = bytes / 1024 ** i;
  return `${value >= 10 || i === 0 ? Math.round(value) : value.toFixed(1)} ${units[i]}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export const CATEGORIES = ["Finance", "Legal", "Design", "Engineering", "Marketing", "Media", "Other"];
