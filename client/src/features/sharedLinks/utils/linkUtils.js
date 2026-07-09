// Utility helpers for the Shared Links module.
// No external deps — plain JS date/string helpers.

const SLUG_CHARS = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateSlug(length = 6) {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += SLUG_CHARS[Math.floor(Math.random() * SLUG_CHARS.length)];
  }
  return out;
}

export function generateShareUrl() {
  return `trust.share/f/${generateSlug()}`;
}

export function formatDate(date) {
  if (!date) return "Never";
  const d = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(d.getTime())) return "Never";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function monthLabel(date) {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("en-US", { month: "short" });
}

export function daysUntil(date) {
  if (!date) return Infinity;
  const d = date instanceof Date ? date : new Date(date);
  const diffMs = d.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function isExpiringSoon(link) {
  if (link.status !== "active" || !link.expiresAt) return false;
  const days = daysUntil(link.expiresAt);
  return days >= 0 && days <= 7;
}

export function isExpired(link) {
  if (!link.expiresAt) return false;
  return daysUntil(link.expiresAt) < 0;
}

// A link stored as "active" whose expiry date has passed should read as
// Expired everywhere in the UI without needing a background job.
export function getEffectiveStatus(link) {
  if (link.status === "active" && isExpired(link)) return "expired";
  return link.status;
}

export function computeStats(links) {
  const active = links.filter((l) => getEffectiveStatus(l) === "active");
  return {
    activeLinks: active.length,
    totalViews: links.reduce((sum, l) => sum + l.views, 0),
    totalDownloads: links.reduce((sum, l) => sum + l.downloads, 0),
    expiringSoon: links.filter(isExpiringSoon).length,
  };
}

export function filterLinks(links, query) {
  if (!query || !query.trim()) return links;
  const q = query.trim().toLowerCase();
  return links.filter((l) =>
    l.fileName.toLowerCase().includes(q) ||
    l.shareUrl.toLowerCase().includes(q) ||
    l.access.toLowerCase().includes(q) ||
    l.status.toLowerCase().includes(q)
  );
}

export function sortLinks(links, sortBy) {
  const copy = [...links];
  switch (sortBy) {
    case "oldest":
      return copy.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    case "most-viewed":
      return copy.sort((a, b) => b.views - a.views);
    case "most-downloaded":
      return copy.sort((a, b) => b.downloads - a.downloads);
    case "alphabetical":
      return copy.sort((a, b) => a.fileName.localeCompare(b.fileName));
    case "status":
      return copy.sort((a, b) => a.status.localeCompare(b.status));
    case "newest":
    default:
      return copy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export function buildChartData(links) {
  // Group by month using the last 5 distinct months present in the data
  // (falls back to the current month when there's no data yet).
  const buckets = new Map();
  links.forEach((l) => {
    const d = new Date(l.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!buckets.has(key)) {
      buckets.set(key, { key, date: d, created: 0, access: 0 });
    }
    const bucket = buckets.get(key);
    bucket.created += 1;
    bucket.access += l.views + l.downloads;
  });

  const sorted = [...buckets.values()].sort((a, b) => a.date - b.date);
  const last5 = sorted.slice(-5);

  if (last5.length === 0) {
    const now = new Date();
    return [{ label: monthLabel(now), created: 0, access: 0 }];
  }

  return last5.map((b) => ({ label: monthLabel(b.date), created: b.created, access: b.access }));
}
