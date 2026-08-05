import React from "react";

export default function AuditLog({
  logs,
  LEVEL_BADGE,
  timeAgo,
}) {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid var(--border-subtle)",
          fontWeight: 700,
        }}
      >
        📋 Audit Log
      </div>

      <div style={{ maxHeight: 480, overflowY: "auto" }}>
        {logs.length === 0 ? (
          <div
            className="text-center"
            style={{
              padding: "32px",
              color: "var(--text-muted)",
            }}
          >
            No audit events yet
          </div>
        ) : (
          logs.map((l) => (
            <div
              key={l.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "10px 20px",
                borderBottom: "1px solid var(--border-subtle)",
                fontSize: ".875rem",
              }}
            >
              <span
                className="text-muted"
                style={{ fontSize: ".75rem", width: 60 }}
              >
                {timeAgo(l.created_at)}
              </span>

              <span
                style={{
                  fontWeight: 700,
                  fontFamily: "monospace",
                  color: "var(--blue-400)",
                  width: 120,
                }}
              >
                {l.action}
              </span>

              <span
                className="text-secondary"
                style={{ flex: 1 }}
              >
                {l.resource_name || l.resource_type || "—"}
              </span>

              <span
                className={`badge ${
                  LEVEL_BADGE[l.level] || "badge-blue"
                }`}
              >
                {l.level}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}