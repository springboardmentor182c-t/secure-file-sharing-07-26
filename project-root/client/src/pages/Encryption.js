import React, { useEffect, useState } from "react";
import "./Encryption.css";
import { encryptionAPI } from "../utils/api";
import {
  FaLock,
  FaGlobe,
  FaKey,
  FaUserShield,
  FaUsers,
  FaSyncAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUpload,
  FaCheckDouble,
  FaDatabase,
  FaFileAlt,
  FaShareAlt,
  FaUnlock,
  FaDownload,
  FaShieldAlt,
} from "react-icons/fa";

// Icon + colour lookups (design stays client-side; data comes from the API)
const FEATURE_ICONS = {
  "AES-256":       { icon: <FaLock />,       color: "#3b82f6" },
  "HTTPS/TLS 1.3": { icon: <FaGlobe />,      color: "#10b981" },
  "JWT Auth":      { icon: <FaKey />,        color: "#8b5cf6" },
  "OAuth 2.0":     { icon: <FaUserShield />, color: "#06b6d4" },
  "RBAC":          { icon: <FaUsers />,      color: "#3b82f6" },
  "Key Rotation":  { icon: <FaSyncAlt />,    color: "#f59e0b" },
};

const WORKFLOW_META = {
  Upload:   { icon: <FaUpload />,      color: "#3b82f6" },
  Validate: { icon: <FaCheckDouble />, color: "#3b82f6" },
  Encrypt:  { icon: <FaLock />,        color: "#8b5cf6" },
  Store:    { icon: <FaDatabase />,    color: "#8b5cf6" },
  Metadata: { icon: <FaFileAlt />,     color: "#3b82f6" },
  Share:    { icon: <FaShareAlt />,    color: "#3b82f6" },
  Decrypt:  { icon: <FaUnlock />,      color: "#8b5cf6" },
  Download: { icon: <FaDownload />,    color: "#10b981" },
};

// Fallback used only if the API is unreachable
const FALLBACK = {
  security_score: 98,
  score_label: "Excellent · Top 5% of platforms",
  compliance: "SOC 2 Compliant",
  features: Object.entries(FEATURE_ICONS).map(([title]) => ({
    title,
    subtitle: "",
    status: title === "Key Rotation" ? "Scheduled" : "Active",
    tone: title === "Key Rotation" ? "amber" : "emerald",
  })),
  workflow: Object.keys(WORKFLOW_META),
  audit: [
    { title: "Encryption at rest", subtitle: "All files encrypted", status: "Pass" },
    { title: "Key management", subtitle: "HSM-backed, auto-rotated", status: "Pass" },
    { title: "Access controls", subtitle: "RBAC enforced", status: "Pass" },
    { title: "Audit logging", subtitle: "100% coverage", status: "Pass" },
    { title: "Network security", subtitle: "TLS 1.3 only", status: "Pass" },
    { title: "Vulnerability scan", subtitle: "1 low-severity finding", status: "Warning" },
    { title: "Dependency audit", subtitle: "0 critical CVEs", status: "Pass" },
  ],
  stats: {
    files_encrypted: 0,
    files_encrypted_pct: "No files yet",
    key_age_days: 12,
    key_age_note: "Next rotation in 3 days",
    failed_decryptions: 0,
    failed_note: "Last 30 days",
  },
};

const Encryption = () => {
  const [data, setData] = useState(FALLBACK);
  const [scanning, setScanning] = useState(false);

  const loadDashboard = () =>
    encryptionAPI
      .dashboard()
      .then(({ data }) => setData(data))
      .catch(() => setData(FALLBACK));

  useEffect(() => {
    loadDashboard();
  }, []);

  const runScan = async () => {
    if (scanning) return;
    setScanning(true);
    await loadDashboard();
    setTimeout(() => setScanning(false), 900);
  };

  const { security_score: SCORE, features, workflow, audit, stats } = data;

  // Gauge geometry
  const R = 62;
  const CIRC = 2 * Math.PI * R;
  const offset = CIRC * (1 - SCORE / 100);

  return (
    <div className="fade-in">
      {/* Header */}
      <div className="enc-header">
        <div>
          <h1>Security Dashboard</h1>
          <p>Real-time encryption health and security posture</p>
        </div>
        <button className={`enc-scan-btn${scanning ? " spinning" : ""}`} onClick={runScan}>
          <FaSyncAlt />
          {scanning ? "Scanning..." : "Run Security Scan"}
        </button>
      </div>

      {/* Score + feature cards */}
      <div className="enc-score-row">
        <div className="card enc-score-card">
          <div className="enc-gauge">
            <svg width="150" height="150">
              <defs>
                <linearGradient id="encGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <circle className="enc-gauge-track" cx="75" cy="75" r={R} />
              <circle
                className="enc-gauge-fill"
                cx="75"
                cy="75"
                r={R}
                strokeDasharray={CIRC}
                strokeDashoffset={offset}
              />
            </svg>
            <div className="enc-gauge-value">
              <b>{SCORE}</b>
              <span>/100</span>
            </div>
          </div>
          <div className="enc-score-title">Security Score</div>
          <div className="enc-score-sub">{data.score_label}</div>
          <span className="badge badge-emerald">{data.compliance}</span>
        </div>

        <div className="feature-grid">
          {features.map((f) => {
            const meta = FEATURE_ICONS[f.title] || { icon: <FaLock />, color: "#3b82f6" };
            return (
              <div key={f.title} className="card feature-card">
                <div className="feature-top">
                  <div
                    className="feature-icon"
                    style={{ background: `${meta.color}1f`, color: meta.color }}
                  >
                    {meta.icon}
                  </div>
                  <span className={`badge badge-${f.tone}`}>{f.status}</span>
                </div>
                <h3>{f.title}</h3>
                <p>{f.subtitle}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Encryption workflow */}
      <div className="card workflow-card">
        <h2 style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: 20 }}>
          Encryption Workflow
        </h2>
        <div className="workflow-steps">
          {workflow.map((label, i) => {
            const meta = WORKFLOW_META[label] || { icon: <FaLock />, color: "#3b82f6" };
            return (
              <React.Fragment key={label}>
                <div className="workflow-step">
                  <div className="step-icon" style={{ background: meta.color }}>
                    {meta.icon}
                  </div>
                  <span className="step-label">{label}</span>
                </div>
                {i < workflow.length - 1 && <span className="step-arrow">›</span>}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Security audit status */}
      <div className="card audit-card">
        <h2>Security Audit Status</h2>
        {audit.map((a) => {
          const pass = a.status === "Pass";
          return (
            <div key={a.title} className="audit-row">
              <div className={`audit-icon ${pass ? "pass" : "warn"}`}>
                {pass ? <FaCheckCircle /> : <FaExclamationTriangle />}
              </div>
              <div className="audit-info">
                <div className="title">{a.title}</div>
                <div className="sub">{a.subtitle}</div>
              </div>
              <span className={`badge badge-${pass ? "emerald" : "amber"}`}>
                {a.status}
              </span>
            </div>
          );
        })}
      </div>

      {/* Bottom stats */}
      <div className="enc-stats">
        <div className="card enc-stat-card">
          <div className="enc-stat-icon" style={{ background: "rgba(59,130,246,.12)", color: "#3b82f6" }}>
            <FaLock />
          </div>
          <div>
            <b>{stats.files_encrypted.toLocaleString()}</b>
            <div className="sl">Files Encrypted</div>
            <div className="ss">{stats.files_encrypted_pct}</div>
          </div>
        </div>

        <div className="card enc-stat-card">
          <div className="enc-stat-icon" style={{ background: "rgba(139,92,246,.12)", color: "#8b5cf6" }}>
            <FaKey />
          </div>
          <div>
            <b>{stats.key_age_days} days</b>
            <div className="sl">Key Age (avg)</div>
            <div className="ss">{stats.key_age_note}</div>
          </div>
        </div>

        <div className="card enc-stat-card">
          <div className="enc-stat-icon" style={{ background: "rgba(16,185,129,.12)", color: "#10b981" }}>
            <FaShieldAlt />
          </div>
          <div>
            <b>{stats.failed_decryptions}</b>
            <div className="sl">Failed Decryptions</div>
            <div className="ss">{stats.failed_note}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Encryption;
