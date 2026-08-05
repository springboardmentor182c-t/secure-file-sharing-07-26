// Small date/status helpers still used by the display components
// (TableRow, etc.). Filtering, sorting, pagination, and stats now all
// happen server-side (see services/sharedLinksApi.js) - this file no
// longer contains any mock-data helpers (generateShareUrl, filterLinks,
// sortLinks, computeStats, buildChartData all used to live here).

export function formatDate(date) {
  if (!date) return "Never";
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "Never";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function daysUntil(date) {
  if (!date) return Infinity;
  const d = date instanceof Date ? date : new Date(date);
  const diffMs = d.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function isExpired(link) {
  if (!link.expiresAt) return false;
  return daysUntil(link.expiresAt) < 0;
}

// A link stored as "active" whose expiry date has passed should read as
// Expired everywhere in the UI without needing a background job to have
// run yet.
export function getEffectiveStatus(link) {
  if (link.status === "active" && isExpired(link)) return "expired";
  return link.status;
}
