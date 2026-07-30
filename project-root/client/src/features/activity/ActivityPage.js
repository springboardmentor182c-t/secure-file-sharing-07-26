import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Clock3,
  Download,
  FileText,
  KeyRound,
  RefreshCw,
  Search,
  Share2,
  ShieldAlert,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";

import { getActivities } from "./activityService";
import "./ActivityPage.css";

const FILTERS = ["All", "Uploads", "Downloads", "Shares", "Security"];

const normalizeAction = (action = "") => action.toUpperCase();

function getActionMeta(action, level = "info") {
  const normalized = normalizeAction(action);

  if (normalized.includes("UPLOAD")) return { Icon: Upload, tone: "success", label: "Upload" };
  if (normalized.includes("DOWNLOAD")) return { Icon: Download, tone: "purple", label: "Download" };
  if (normalized.includes("SHARE")) return { Icon: Share2, tone: "blue", label: "Share" };
  if (normalized.includes("DELETE")) return { Icon: Trash2, tone: "danger", label: "Delete" };
  if (normalized.includes("KEY_ROTATION")) return { Icon: KeyRound, tone: "warning", label: "Security" };
  if (normalized.includes("SUMMARY")) return { Icon: Sparkles, tone: "purple", label: "AI summary" };
  if (["warn", "warning", "error", "critical"].includes(level)) {
    return { Icon: ShieldAlert, tone: "danger", label: "Security" };
  }
  return { Icon: FileText, tone: "neutral", label: "Activity" };
}

function formatAction(action = "Activity") {
  return action
    .toLowerCase()
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatTimestamp(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return { date: "Unknown date", time: "" };
  return {
    date: date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }),
    time: date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" }),
  };
}

export default function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [days, setDays] = useState("all");

  const loadActivities = useCallback(async (showLoader = false) => {
    if (showLoader) setRefreshing(true);
    try {
      const data = await getActivities();
      setActivities(Array.isArray(data) ? data : []);
      setError("");
    } catch (requestError) {
      setError(requestError?.response?.data?.detail || "We couldn't load your activity. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadActivities();
    const interval = window.setInterval(() => loadActivities(), 30000);
    return () => window.clearInterval(interval);
  }, [loadActivities]);

  const visibleActivities = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const cutoff = days === "all" ? null : Date.now() - Number(days) * 24 * 60 * 60 * 1000;

    return activities.filter((item) => {
      const action = normalizeAction(item.action);
      const meta = getActionMeta(item.action, item.level);
      const matchesFilter = filter === "All" || (
        (filter === "Uploads" && action.includes("UPLOAD")) ||
        (filter === "Downloads" && action.includes("DOWNLOAD")) ||
        (filter === "Shares" && action.includes("SHARE")) ||
        (filter === "Security" && (meta.label === "Security" || meta.tone === "danger"))
      );
      const matchesDate = !cutoff || new Date(item.created_at).getTime() >= cutoff;
      const searchable = `${item.action || ""} ${item.resource_name || ""} ${item.resource_type || ""}`.toLowerCase();
      return matchesFilter && matchesDate && (!needle || searchable.includes(needle));
    });
  }, [activities, days, filter, query]);

  const stats = useMemo(() => ({
    total: activities.length,
    uploads: activities.filter((item) => normalizeAction(item.action).includes("UPLOAD")).length,
    downloads: activities.filter((item) => normalizeAction(item.action).includes("DOWNLOAD")).length,
    security: activities.filter((item) => {
      const meta = getActionMeta(item.action, item.level);
      return meta.label === "Security" || meta.tone === "danger";
    }).length,
  }), [activities]);

  const exportReport = () => {
    if (!visibleActivities.length) return;
    const rows = visibleActivities.map((item) => [
      item.created_at,
      formatAction(item.action),
      item.resource_type || "",
      item.resource_name || "",
      item.level || "info",
    ]);
    const escape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [["Timestamp", "Action", "Resource type", "Resource", "Level"], ...rows]
      .map((row) => row.map(escape).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "my-activity-report.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="activity-page fade-in" aria-labelledby="activity-title">
      <header className="activity-header">
        <div>
          <span className="activity-eyebrow"><Activity size={14} /> Personal audit trail</span>
          <h1 id="activity-title">Activity</h1>
          <p>Review the file and security actions recorded for your account.</p>
        </div>
        <div className="activity-header-actions">
          <span className="activity-live"><span aria-hidden="true" /> Updates every 30 seconds</span>
          <button className="btn btn-secondary" onClick={exportReport} disabled={!visibleActivities.length}>
            <Download size={16} /> Export CSV
          </button>
        </div>
      </header>

      <div className="activity-stats" aria-label="Activity totals">
        <StatCard icon={Clock3} label="Total events" value={stats.total} tone="blue" />
        <StatCard icon={Upload} label="Uploads" value={stats.uploads} tone="success" />
        <StatCard icon={Download} label="Downloads" value={stats.downloads} tone="purple" />
        <StatCard icon={ShieldAlert} label="Security events" value={stats.security} tone="danger" />
      </div>

      <div className="activity-toolbar card">
        <label className="activity-search">
          <Search size={17} aria-hidden="true" />
          <span className="sr-only">Search activity</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search actions or file names"
          />
        </label>
        <label className="activity-date-filter">
          <span className="sr-only">Filter by date</span>
          <select value={days} onChange={(event) => setDays(event.target.value)} aria-label="Activity date range">
            <option value="all">All time</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
          </select>
        </label>
        <button
          className="btn btn-secondary btn-icon"
          onClick={() => loadActivities(true)}
          disabled={refreshing}
          aria-label="Refresh activity"
          title="Refresh activity"
        >
          <RefreshCw size={17} className={refreshing ? "activity-spin" : ""} />
        </button>
      </div>

      <div className="activity-filters" role="group" aria-label="Filter activity by type">
        {FILTERS.map((item) => (
          <button
            key={item}
            className={`btn btn-sm ${filter === item ? "btn-primary" : "btn-ghost"}`}
            onClick={() => setFilter(item)}
            aria-pressed={filter === item}
          >
            {item}
          </button>
        ))}
      </div>

      {error && (
        <div className="activity-error" role="alert">
          <ShieldAlert size={18} />
          <span>{error}</span>
          <button className="btn btn-sm btn-secondary" onClick={() => loadActivities(true)}>Try again</button>
        </div>
      )}

      <div className="activity-feed card" aria-busy={loading}>
        <div className="activity-feed-heading">
          <div>
            <h2>Recent activity</h2>
            <p>{visibleActivities.length} {visibleActivities.length === 1 ? "event" : "events"} shown</p>
          </div>
        </div>

        {loading ? (
          <div className="activity-state"><div className="spinner" /><p>Loading your secure activity trail…</p></div>
        ) : visibleActivities.length === 0 ? (
          <div className="activity-state">
            <div className="activity-empty-icon"><Activity size={28} /></div>
            <h3>{activities.length ? "No matching activity" : "No activity recorded yet"}</h3>
            <p>{activities.length ? "Try changing your search or filters." : "Uploads, downloads, shares and security actions will appear here automatically."}</p>
          </div>
        ) : (
          <div className="activity-list">
            {visibleActivities.map((item) => {
              const meta = getActionMeta(item.action, item.level);
              const timestamp = formatTimestamp(item.created_at);
              return (
                <article className="activity-row" key={item.id}>
                  <div className={`activity-action-icon activity-tone-${meta.tone}`}><meta.Icon size={18} /></div>
                  <div className="activity-row-main">
                    <div className="activity-row-title">
                      <strong>{formatAction(item.action)}</strong>
                      <span className={`activity-badge activity-tone-${meta.tone}`}>{meta.label}</span>
                    </div>
                    <p>{item.resource_name || `${item.resource_type || "Account"} activity`}</p>
                  </div>
                  <time className="activity-time" dateTime={item.created_at}>
                    <strong>{timestamp.date}</strong>
                    <span>{timestamp.time}</span>
                  </time>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="card activity-stat-card">
      <div className={`activity-stat-icon activity-tone-${tone}`}><Icon size={19} /></div>
      <div><strong>{value}</strong><span>{label}</span></div>
    </div>
  );
}
