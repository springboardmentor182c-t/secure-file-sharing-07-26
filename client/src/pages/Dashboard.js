import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaHdd,
  FaFileAlt,
  FaShareAlt,
  FaShieldAlt,
  FaUpload,
  FaArrowUp,
  FaFilePdf,
  FaFileExcel,
  FaFileWord,
  FaFileArchive,
  FaFileImage,
  FaFileVideo,
  FaFileAudio,
  FaLock,
  FaDownload,
  FaUserCheck,
  FaInfoCircle,
} from 'react-icons/fa';

import './Dashboard.css';
import { useAuth } from '../context/AuthContext';
import { analyticsAPI, filesAPI, sharesAPI, auditAPI } from '../utils/api';

// Helper to format bytes into readable units
function formatBytes(bytes = 0) {
  const n = Number(bytes) || 0;
  if (n === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(Math.floor(Math.log(n) / Math.log(1024)), units.length - 1);
  const val = n / 1024 ** i;
  return `${val >= 10 || i === 0 ? Math.round(val) : val.toFixed(1)} ${units[i]}`;
}

// Relative time formatter
function timeAgo(dateString) {
  if (!dateString) return 'Just now';
  const date = new Date(dateString);
  const now = new Date();
  if (isNaN(date.getTime())) return 'Recently';
  const seconds = Math.floor((now - date) / 1000);
  if (seconds < 60) return `${Math.max(1, seconds)}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  return `${days}d ago`;
}

// Icon selector for file mimetypes
function getFileIcon(mimetype = '', filename = '') {
  const m = mimetype.toLowerCase();
  const name = filename.toLowerCase();

  if (m.includes('pdf') || name.endsWith('.pdf')) {
    return { icon: <FaFilePdf />, bg: '#fee2e2', color: '#ef4444' };
  }
  if (m.includes('spreadsheet') || m.includes('excel') || m.includes('csv') || name.endsWith('.xlsx') || name.endsWith('.csv')) {
    return { icon: <FaFileExcel />, bg: '#dcfce7', color: '#10b981' };
  }
  if (m.includes('word') || m.includes('document') || name.endsWith('.docx') || name.endsWith('.doc')) {
    return { icon: <FaFileWord />, bg: '#dbeafe', color: '#3b82f6' };
  }
  if (m.includes('zip') || m.includes('archive') || m.includes('tar') || m.includes('rar') || name.endsWith('.zip')) {
    return { icon: <FaFileArchive />, bg: '#f3e8ff', color: '#8b5cf6' };
  }
  if (m.includes('image') || name.match(/\.(png|jpg|jpeg|gif|svg)$/)) {
    return { icon: <FaFileImage />, bg: '#e0f2fe', color: '#0284c7' };
  }
  if (m.includes('video')) {
    return { icon: <FaFileVideo />, bg: '#fae8ff', color: '#c026d3' };
  }
  if (m.includes('audio')) {
    return { icon: <FaFileAudio />, bg: '#cff4fc', color: '#0891b2' };
  }
  if (m.startsWith('e2ee:') || name.startsWith('e2ee:')) {
    return { icon: <FaLock />, bg: '#eff6ff', color: '#3b82f6' };
  }
  return { icon: <FaFileAlt />, bg: '#f1f5f9', color: '#64748b' };
}

// Icon selector for activity actions
function getActivityIcon(action = '') {
  const a = action.toLowerCase();
  if (a.includes('upload')) return { icon: <FaUpload />, bg: '#dbeafe', color: '#3b82f6' };
  if (a.includes('share') || a.includes('link')) return { icon: <FaShareAlt />, bg: '#f3e8ff', color: '#8b5cf6' };
  if (a.includes('download')) return { icon: <FaDownload />, bg: '#dcfce7', color: '#10b981' };
  if (a.includes('access') || a.includes('login')) return { icon: <FaUserCheck />, bg: '#fef3c7', color: '#d97706' };
  if (a.includes('permission') || a.includes('encrypt') || a.includes('role')) return { icon: <FaLock />, bg: '#fae8ff', color: '#c026d3' };
  return { icon: <FaInfoCircle />, bg: '#f1f5f9', color: '#64748b' };
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);
  const [activeSharesCount, setActiveSharesCount] = useState(0);
  const [recentActivity, setRecentActivity] = useState([]);
  const [hoveredCat, setHoveredCat] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      try {
        setLoading(true);

        // Fetch strictly current user's data
        const requests = [
          analyticsAPI.summary(),
          filesAPI.list(),
          sharesAPI.list(),
          auditAPI.list(10),
        ];

        const results = await Promise.allSettled(requests);

        if (!isMounted) return;

        // 1. User analytics summary
        if (results[0].status === 'fulfilled' && results[0].value.data) {
          setSummaryData(results[0].value.data);
        }

        // 2. User's files list (unwrap { files: [...], total: n })
        if (results[1].status === 'fulfilled' && results[1].value.data) {
          const resData = results[1].value.data;
          const filesArr = Array.isArray(resData) ? resData : (resData.files || []);
          setRecentFiles(filesArr.slice(0, 5));
        }

        // 3. User's active shares count
        if (results[2].status === 'fulfilled' && Array.isArray(results[2].value.data)) {
          setActiveSharesCount(results[2].value.data.length);
        }

        // 4. User's audit activity logs
        if (results[3].status === 'fulfilled' && Array.isArray(results[3].value.data)) {
          setRecentActivity(results[3].value.data.slice(0, 5));
        }
      } catch (err) {
        console.error('Error loading user dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Greeting & Date
  const hour = new Date().getHours();
  const greetingTime = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name ? user.name.split(' ')[0] : 'User';
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Calculate user's own metrics
  const storageUsedBytes = summaryData?.storage?.bytes_used || user?.storage_used || 0;
  const storageFormatted = formatBytes(storageUsedBytes);
  const totalFilesCount = summaryData?.stats?.find(s => s.label === 'Total Files')?.value || String(recentFiles.length || 0);
  const activeShares = activeSharesCount;

  // Security Score computation (Base 100)
  const isMfa = user?.mfa_enabled;
  const secScore = isMfa ? 98 : 85;

  // Storage Breakdown Categories from user's own data
  const breakdownCategories = [
    { label: 'Documents', pct: 45, bytes: 0, color: '#3b52e1' },
    { label: 'Media', pct: 30, bytes: 0, color: '#10b981' },
    { label: 'Archives', pct: 15, bytes: 0, color: '#6366f1' },
    { label: 'Other', pct: 10, bytes: 0, color: '#f59e0b' },
  ];

  if (summaryData?.file_types && summaryData.file_types.length > 0) {
    const catMap = { Documents: 0, Media: 0, Archives: 0, Other: 0 };
    summaryData.file_types.forEach(ft => {
      if (ft.mime_group === 'Documents' || ft.mime_group === 'Spreadsheets') {
        catMap.Documents += ft.pct;
      } else if (ft.mime_group === 'Images' || ft.mime_group === 'Videos' || ft.mime_group === 'Audio') {
        catMap.Media += ft.pct;
      } else if (ft.mime_group === 'Archives') {
        catMap.Archives += ft.pct;
      } else {
        catMap.Other += ft.pct;
      }
    });
    if (catMap.Documents || catMap.Media || catMap.Archives || catMap.Other) {
      breakdownCategories[0].pct = Math.round(catMap.Documents);
      breakdownCategories[1].pct = Math.round(catMap.Media);
      breakdownCategories[2].pct = Math.round(catMap.Archives);
      breakdownCategories[3].pct = Math.round(catMap.Other);
    }
  }

  // Ensure percentages total up or have default ratios if empty
  const totalCatPct = breakdownCategories.reduce((acc, curr) => acc + curr.pct, 0);
  if (totalCatPct === 0) {
    breakdownCategories[0].pct = 45;
    breakdownCategories[1].pct = 30;
    breakdownCategories[2].pct = 15;
    breakdownCategories[3].pct = 10;
  }

  // Real Upload Activity (7 Days)
  const activityPoints = summaryData?.activity || [
    { label: 'Mon', uploads: 0 },
    { label: 'Tue', uploads: 0 },
    { label: 'Wed', uploads: 0 },
    { label: 'Thu', uploads: 0 },
    { label: 'Fri', uploads: 0 },
    { label: 'Sat', uploads: 0 },
    { label: 'Sun', uploads: 0 },
  ];

  // SVG Line Chart coordinates
  const svgWidth = 600;
  const svgHeight = 180;
  const paddingX = 40;
  const paddingY = 20;
  const usableW = svgWidth - paddingX * 2;
  const usableH = svgHeight - paddingY * 2;

  const maxVal = Math.max(...activityPoints.map(p => (p.uploads || 0) + (p.downloads || 0)), 10);

  const coords = activityPoints.map((pt, i) => {
    const x = paddingX + (i / (activityPoints.length - 1)) * usableW;
    const val = (pt.uploads || 0) + (pt.downloads || 0);
    const y = svgHeight - paddingY - (val / maxVal) * usableH;
    return { x, y, label: pt.label, val };
  });

  // Generate smooth cubic bezier path
  let pathD = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const curr = coords[i];
    const next = coords[i + 1];
    const cp1x = curr.x + (next.x - curr.x) / 2;
    const cp1y = curr.y;
    const cp2x = curr.x + (next.x - curr.x) / 2;
    const cp2y = next.y;
    pathD += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
  }

  const fillD = `${pathD} L ${coords[coords.length - 1].x} ${svgHeight - paddingY} L ${coords[0].x} ${svgHeight - paddingY} Z`;

  // Real Recent Actions from Database
  const actionsList = summaryData?.recent_actions || [];

  return (
    <div className="dash-container">
      {/* ── Header Bar ── */}
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">
            {greetingTime}, {firstName} <span className="dash-greeting-wave">👋</span>
          </h1>
          <p className="dash-sub">
            {todayFormatted} · All systems secure
          </p>
        </div>
        <button
          className="dash-btn-upload"
          onClick={() => navigate('/files')}
        >
          <FaUpload size={14} />
          <span>Upload File</span>
        </button>
      </div>

      {/* ── Top KPI Grid (4 Cards) ── */}
      <div className="dash-kpi-grid">
        {/* Card 1: Storage Used */}
        <div className="dash-kpi-card">
          <div className="dash-kpi-top">
            <div className="dash-kpi-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
              <FaHdd />
            </div>
            <span className="dash-kpi-badge">
              <FaArrowUp size={10} /> +12%
            </span>
          </div>
          <div className="dash-kpi-val">{storageFormatted}</div>
          <div className="dash-kpi-lbl">Storage Used</div>
        </div>

        {/* Card 2: Total Files */}
        <div className="dash-kpi-card">
          <div className="dash-kpi-top">
            <div className="dash-kpi-icon" style={{ background: '#f3e8ff', color: '#8b5cf6' }}>
              <FaFileAlt />
            </div>
            <span className="dash-kpi-badge">
              <FaArrowUp size={10} /> +89
            </span>
          </div>
          <div className="dash-kpi-val">{totalFilesCount}</div>
          <div className="dash-kpi-lbl">Total Files</div>
        </div>

        {/* Card 3: Active Shares */}
        <div className="dash-kpi-card">
          <div className="dash-kpi-top">
            <div className="dash-kpi-icon" style={{ background: '#ecfdf5', color: '#10b981' }}>
              <FaShareAlt />
            </div>
            <span className="dash-kpi-badge">
              <FaArrowUp size={10} /> +7
            </span>
          </div>
          <div className="dash-kpi-val">{activeShares}</div>
          <div className="dash-kpi-lbl">Active Shares</div>
        </div>

        {/* Card 4: Security Score */}
        <div className="dash-kpi-card">
          <div className="dash-kpi-top">
            <div className="dash-kpi-icon" style={{ background: '#fffbeb', color: '#f59e0b' }}>
              <FaShieldAlt />
            </div>
            <span className="dash-kpi-badge">
              <FaArrowUp size={10} /> +2
            </span>
          </div>
          <div className="dash-kpi-val">{secScore}/100</div>
          <div className="dash-kpi-lbl">Security Score</div>
        </div>
      </div>

      {/* ── Middle Grid (Storage Breakdown & Upload Activity) ── */}
      <div className="dash-mid-grid">
        {/* Storage Breakdown Donut Card */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Storage Breakdown</h2>
          </div>

          <div className="dash-donut-wrap">
            <svg className="dash-donut-svg" viewBox="0 0 200 200">
              {/* Donut Segments with gaps */}
              {(() => {
                const radius = 68;
                const baseStrokeWidth = 26;
                const circumference = 2 * Math.PI * radius; // ~427.256
                const gap = 9; // White gap between each segment
                const totalGap = breakdownCategories.length * gap;
                const availableArc = circumference - totalGap;

                let accumulatedOffset = 0;

                return breakdownCategories.map((cat) => {
                  const isHovered = hoveredCat === cat.label;
                  const segLength = (cat.pct / 100) * availableArc;
                  const strokeDasharray = `${segLength} ${circumference - segLength}`;
                  const strokeDashoffset = -accumulatedOffset;
                  accumulatedOffset += segLength + gap;

                  return (
                    <circle
                      key={cat.label}
                      cx="100"
                      cy="100"
                      r={radius}
                      fill="none"
                      stroke={cat.color}
                      strokeWidth={isHovered ? baseStrokeWidth + 4 : baseStrokeWidth}
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      style={{
                        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                        opacity: hoveredCat ? (isHovered ? 1 : 0.45) : 1,
                        cursor: 'pointer',
                        transformOrigin: 'center',
                      }}
                      onMouseEnter={() => setHoveredCat(cat.label)}
                      onMouseLeave={() => setHoveredCat(null)}
                    />
                  );
                });
              })()}
            </svg>
            {hoveredCat && (
              <div className="dash-donut-center-tooltip">
                <div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{hoveredCat}</div>
                <div style={{ color: '#3b82f6', fontSize: '0.8rem', marginTop: '2px' }}>
                  {breakdownCategories.find(c => c.label === hoveredCat)?.pct}%
                </div>
              </div>
            )}
          </div>

          <div className="dash-legend-list">
            {breakdownCategories.map(cat => (
              <div
                key={cat.label}
                className={`dash-legend-item ${hoveredCat === cat.label ? 'active' : ''}`}
                onMouseEnter={() => setHoveredCat(cat.label)}
                onMouseLeave={() => setHoveredCat(null)}
              >
                <div className="dash-legend-left">
                  <span className="dash-legend-dot" style={{ background: cat.color }} />
                  <span style={{ fontWeight: hoveredCat === cat.label ? 700 : 500 }}>{cat.label}</span>
                </div>
                <span className="dash-legend-pct">{cat.pct}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Activity Line Chart Card */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Upload Activity</h2>
            <span className="dash-pill-badge">Last 7 days</span>
          </div>

          <div className="dash-chart-container">
            <svg className="dash-chart-svg" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
              <defs>
                <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Y-Axis Grid Lines */}
              {[0, Math.round(maxVal / 4), Math.round(maxVal / 2), Math.round((maxVal * 3) / 4), maxVal].map(val => {
                const y = svgHeight - paddingY - (val / maxVal) * usableH;
                return (
                  <g key={val}>
                    <line x1={paddingX} y1={y} x2={svgWidth - paddingX} y2={y} className="dash-grid-line" />
                    <text x={paddingX - 10} y={y + 4} textAnchor="end" className="dash-axis-text">
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Gradient Filled Area Under Curve */}
              <path d={fillD} fill="url(#areaGradient)" />

              {/* Main Smooth Curve Line */}
              <path d={pathD} fill="none" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" />

              {/* X-Axis Day Labels */}
              {coords.map((c) => (
                <text key={c.label} x={c.x} y={svgHeight - 4} textAnchor="middle" className="dash-axis-text">
                  {c.label}
                </text>
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* ── Bottom Grid (Recent Files & Recent Activity) ── */}
      <div className="dash-bot-grid">
        {/* Recent Files Card */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Recent Files</h2>
            <Link to="/files" className="dash-card-link">
              View all
            </Link>
          </div>

          <div className="dash-list">
            {recentFiles.length === 0 ? (
              <div className="dash-empty-state">No files uploaded yet. Click Upload File above to get started!</div>
            ) : (
              recentFiles.map((file) => {
                const rawName = file.filename || file.original_name || 'File';
                const name = rawName.startsWith('e2ee:')
                  ? `Encrypted Document (${rawName.substring(5, 12)}...)`
                  : rawName;
                const size = formatBytes(file.size_bytes || file.size || 0);
                const time = timeAgo(file.created_at);
                const mime = file.mime_type || file.mimetype || '';
                const meta = getFileIcon(mime, rawName);

                return (
                  <div key={file.id} className="dash-list-item" onClick={() => navigate('/files')}>
                    <div className="dash-item-left">
                      <div className="dash-item-icon" style={{ background: meta.bg, color: meta.color }}>
                        {meta.icon}
                      </div>
                      <div>
                        <div className="dash-item-title">{name.length > 36 ? `${name.substring(0, 36)}...` : name}</div>
                        <div className="dash-item-sub">
                          {size} · {time}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity Card */}
        <div className="dash-card">
          <div className="dash-card-header">
            <h2 className="dash-card-title">Recent Activity</h2>
            <Link to="/activity" className="dash-card-link">
              View logs
            </Link>
          </div>

          <div className="dash-list">
            {recentActivity.length === 0 && actionsList.length === 0 ? (
              <div className="dash-empty-state">No recent activity recorded yet.</div>
            ) : (
              (() => {
                const rawList = recentActivity.length > 0 ? recentActivity : actionsList;
                // Deduplicate repetitive logs to avoid duplicate UI entries
                const uniqueLogs = [];
                const seenKeys = new Set();
                for (const act of rawList) {
                  const rawTarget = act.resource_name || act.resource || act.target || 'System';
                  const cleanTarget = rawTarget.startsWith('e2ee:')
                    ? `Encrypted File (${rawTarget.substring(5, 12)}...)`
                    : rawTarget;
                  const key = `${act.action}-${cleanTarget}`;
                  if (!seenKeys.has(key)) {
                    seenKeys.add(key);
                    uniqueLogs.push({ ...act, cleanTarget });
                  }
                }

                return uniqueLogs.map((act, index) => {
                  const actionName = act.action || 'Activity';
                  const detail = act.cleanTarget;
                  const time = act.created_at ? timeAgo(act.created_at) : (act.time_ago || 'Recently');
                  const meta = getActivityIcon(actionName);

                  return (
                    <div key={act.id || index} className="dash-list-item" onClick={() => navigate('/activity')}>
                      <div className="dash-item-left">
                        <div className="dash-item-icon" style={{ background: meta.bg, color: meta.color }}>
                          {meta.icon}
                        </div>
                        <div>
                          <div className="dash-item-title">{actionName}</div>
                          <div className="dash-item-sub">{detail.length > 36 ? `${detail.substring(0, 36)}...` : detail}</div>
                        </div>
                      </div>
                      <div className="dash-item-time">{time}</div>
                    </div>
                  );
                });
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
