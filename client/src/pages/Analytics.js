import React, { useEffect, useState } from "react";
import "./Analytics.css";
import { analyticsAPI } from "../utils/api";
import {
  FaFolder,
  FaLock,
  FaFile,
  FaHdd,
  FaImage,
  FaFilePdf,
  FaFileVideo,
  FaFileAudio,
  FaFileArchive,
  FaTable,
  FaUpload,
  FaDownload,
  FaShareAlt,
  FaTrash,
  FaSignInAlt,
  FaSyncAlt,
  FaInfoCircle,
} from "react-icons/fa";

// ── Colour palette for bar chart ────────────────────────────────────────────
const BAR_COLORS = {
  uploads:    "#3b82f6",
  downloads:  "#8b5cf6",
  encryptions:"#10b981",
};

// ── File-type colours & icons ────────────────────────────────────────────────
const TYPE_META = {
  Documents:   { icon: <FaFilePdf />,    color: "#f43f5e", bg: "rgba(244,63,94,.12)"   },
  Images:      { icon: <FaImage />,      color: "#3b82f6", bg: "rgba(59,130,246,.12)"  },
  Videos:      { icon: <FaFileVideo />,  color: "#8b5cf6", bg: "rgba(139,92,246,.12)"  },
  Audio:       { icon: <FaFileAudio />,  color: "#06b6d4", bg: "rgba(6,182,212,.12)"   },
  Spreadsheets:{ icon: <FaTable />,      color: "#10b981", bg: "rgba(16,185,129,.12)"  },
  Archives:    { icon: <FaFileArchive />,color: "#f59e0b", bg: "rgba(245,158,11,.12)"  },
  Other:       { icon: <FaFile />,       color: "#64748b", bg: "rgba(100,116,139,.12)" },
};

// ── KPI icon & colour look-up ────────────────────────────────────────────────
const KPI_META = [
  { icon: <FaFile />,   bg: "rgba(59,130,246,.12)",  color: "#3b82f6" },
  { icon: <FaHdd />,    bg: "rgba(139,92,246,.12)",  color: "#8b5cf6" },
  { icon: <FaLock />,   bg: "rgba(16,185,129,.12)",  color: "#10b981" },
  { icon: <FaFolder />, bg: "rgba(6,182,212,.12)",   color: "#06b6d4" },
];

// ── Action icon look-up ──────────────────────────────────────────────────────
function actionIcon(action) {
  const a = (action || "").toLowerCase();
  if (a.includes("upload"))   return <FaUpload />;
  if (a.includes("download")) return <FaDownload />;
  if (a.includes("share"))    return <FaShareAlt />;
  if (a.includes("delete"))   return <FaTrash />;
  if (a.includes("login"))    return <FaSignInAlt />;
  if (a.includes("encrypt"))  return <FaLock />;
  return <FaFile />;
}

// ── Fallback data for offline / unauthenticated state ───────────────────────
const FALLBACK = {
  stats: [
    { label: "Total Files",  value: "0",  sub: "0 uploads this week",    trend: "0%",  trend_up: true  },
    { label: "Storage Used", value: "0 B",sub: "0% of 5.0 GB quota",     trend: "0%",  trend_up: true  },
    { label: "Encrypted",    value: "0%", sub: "0 of 0 files",           trend: "0%",  trend_up: true  },
    { label: "Folders",      value: "0",  sub: "Active directories",     trend: "0%",  trend_up: true  },
  ],
  activity: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(l => ({
    label: l, uploads: 0, downloads: 0, encryptions: 0,
  })),
  file_types: [],
  recent_actions: [],
  storage: { label: "0 B", bytes_used: 0, pct: 0, color: "#3b82f6" },
  storage_quota_gb: 5,
  storage_used_gb: 0,
};

// ── Main component ───────────────────────────────────────────────────────────
export default function Analytics() {
  const [data, setData]       = useState(FALLBACK);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    analyticsAPI
      .summary()
      .then(({ data: d }) => setData(d))
      .catch(() => setData(FALLBACK))
      .finally(() => setTimeout(() => setLoading(false), 700));
  };

  useEffect(() => { load(); }, []);   // eslint-disable-line react-hooks/exhaustive-deps

  const { stats, activity, file_types, recent_actions, storage, storage_quota_gb, storage_used_gb } = data;

  // Bar chart geometry
  const maxVal = Math.max(
    1,
    ...activity.flatMap(a => [a.uploads, a.downloads, a.encryptions])
  );

  // Donut geometry
  const R    = 56;
  const CIRC = 2 * Math.PI * R;
  const offset = CIRC * (1 - Math.min(storage.pct, 100) / 100);

  return (
    <div className="an-fade-in">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="an-header">
        <div>
          <h1>Analytics Dashboard</h1>
          <p>Your storage, activity & file insights — updated in real-time</p>
        </div>
        <button
          className={`an-refresh-btn${loading ? " spinning" : ""}`}
          onClick={load}
        >
          <FaSyncAlt />
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* ── KPI cards ──────────────────────────────────────────────────── */}
      <div className="an-kpi-grid">
        {stats.map((s, i) => {
          const m = KPI_META[i] || KPI_META[0];
          return (
            <div key={s.label} className="card an-kpi-card">
              <div className="an-kpi-top">
                <div className="an-kpi-icon" style={{ background: m.bg, color: m.color }}>
                  {m.icon}
                </div>
                <span className={s.trend_up ? "an-trend-up" : "an-trend-down"}>
                  {s.trend_up ? "▲" : "▼"} {s.trend}
                </span>
              </div>
              <div className="an-kpi-value">{s.value}</div>
              <div className="an-kpi-label">{s.label}</div>
              <div className="an-kpi-sub">{s.sub}</div>
            </div>
          );
        })}
      </div>

      {/* ── Mid row: bar chart + file types ────────────────────────────── */}
      <div className="an-mid-row">

        {/* Activity bar chart */}
        <div className="card an-chart-card">
          <h2>7-Day Activity</h2>
          <div className="an-chart-wrap">
            {activity.map(day => (
              <div key={day.label} className="an-bar-group">
                <div className="an-bars">
                  {[
                    { key: "uploads",    v: day.uploads,    color: BAR_COLORS.uploads    },
                    { key: "downloads",  v: day.downloads,  color: BAR_COLORS.downloads  },
                    { key: "encryptions",v: day.encryptions,color: BAR_COLORS.encryptions},
                  ].map(({ key, v, color }) => (
                    <div
                      key={key}
                      className="an-bar"
                      title={`${key}: ${v}`}
                      style={{
                        height: `${Math.max(4, Math.round((v / maxVal) * 140))}px`,
                        background: color,
                        opacity: v === 0 ? 0.15 : 0.9,
                      }}
                    />
                  ))}
                </div>
                <div className="an-bar-label">{day.label}</div>
              </div>
            ))}
          </div>
          <div className="an-legend">
            {Object.entries(BAR_COLORS).map(([k, c]) => (
              <div key={k} className="an-legend-item">
                <div className="an-legend-dot" style={{ background: c }} />
                {k.charAt(0).toUpperCase() + k.slice(1)}
              </div>
            ))}
          </div>
        </div>

        {/* File-type breakdown */}
        <div className="card an-types-card">
          <h2>File Types</h2>
          {file_types.length === 0 ? (
            <div className="an-empty">
              <FaFile />
              <span>No files uploaded yet</span>
            </div>
          ) : (
            file_types.map(ft => {
              const m = TYPE_META[ft.mime_group] || TYPE_META.Other;
              return (
                <div key={ft.mime_group} className="an-type-row">
                  <div className="an-type-icon" style={{ background: m.bg, color: m.color }}>
                    {m.icon}
                  </div>
                  <div className="an-type-info">
                    <div className="an-type-name">{ft.mime_group}</div>
                    <div className="an-type-bar-wrap">
                      <div
                        className="an-type-bar"
                        style={{ width: `${ft.pct}%`, background: m.color }}
                      />
                    </div>
                  </div>
                  <div className="an-type-count">{ft.count}</div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── Bottom row: storage donut + recent actions ──────────────────── */}
      <div className="an-bot-row">

        {/* Storage donut */}
        <div className="card an-storage-card">
          <h2>Storage</h2>
          <div className="an-donut-wrap">
            <svg width="140" height="140">
              <defs>
                <linearGradient id="anGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%"   stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <circle className="an-donut-track" cx="70" cy="70" r={R} />
              <circle
                className="an-donut-fill"
                cx="70" cy="70" r={R}
                strokeDasharray={CIRC}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="an-donut-label">
              <b>{storage.pct}%</b>
              <span>used</span>
            </div>
          </div>
          <div className="an-storage-meta">
            <div className="an-storage-row">
              <span>Used</span>
              <span>{storage.label}</span>
            </div>
            <div className="an-storage-row">
              <span>Quota</span>
              <span>{storage_quota_gb} GB</span>
            </div>
            <div className="an-storage-row">
              <span>Free</span>
              <span>
                {Math.max(0, storage_quota_gb - storage_used_gb).toFixed(1)} GB
              </span>
            </div>
          </div>
          {storage.pct >= 80 && (
            <span className="badge badge-amber" style={{ marginTop: 4 }}>
              ⚠ Storage almost full
            </span>
          )}
          {storage.pct < 80 && (
            <span className="badge badge-emerald" style={{ marginTop: 4 }}>
              ✓ Plenty of space
            </span>
          )}
        </div>

        {/* Recent actions */}
        <div className="card an-recent-card">
          <h2>Recent Activity</h2>
          <div className="an-recent-sub">Last {recent_actions.length} recorded actions</div>
          {recent_actions.length === 0 ? (
            <div className="an-empty">
              <FaInfoCircle />
              <span>No activity recorded yet</span>
            </div>
          ) : (
            recent_actions.map((a, i) => (
              <div key={i} className="an-action-row">
                <div className={`an-action-icon ${a.level}`}>
                  {actionIcon(a.action)}
                </div>
                <div className="an-action-info">
                  <div className="an-action-name">{a.action}</div>
                  <div className="an-action-res">{a.resource}</div>
                </div>
                <div className="an-action-time">{a.time_ago}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
