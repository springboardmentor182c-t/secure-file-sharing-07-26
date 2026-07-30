import React from "react";

export default function SystemStatus() {
  return (
    <div className="grid-2">
      <div className="card card-pad">
        <div style={{ fontWeight: 700, marginBottom: 16 }}>
          🛡️ Security Monitor
        </div>

        {[
          { label: "API Gateway", value: "🟢 Healthy" },
          { label: "SSL Certificate", value: "✅ Valid" },
          { label: "Rate Limiting", value: "✅ Active" },
          { label: "Intrusion Detection", value: "🟢 No threats" },
          { label: "Key Rotation", value: "✅ Current" },
          { label: "Encryption", value: "AES-256 Active" },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: "1px solid var(--border-subtle)",
              fontSize: ".875rem",
            }}
          >
            <span className="text-secondary">{s.label}</span>

            <span
              style={{
                fontWeight: 600,
                color: "var(--emerald-400)",
              }}
            >
              {s.value}
            </span>
          </div>
        ))}
      </div>

      <div className="card card-pad">
        <div style={{ fontWeight: 700, marginBottom: 16 }}>
          ⚙️ Infrastructure
        </div>

        {[
          { name: "Auth Service", latency: "12ms" },
          { name: "File Service", latency: "8ms" },
          { name: "Encryption Service", latency: "45ms" },
          { name: "Sharing Service", latency: "15ms" },
          { name: "Analytics Service", latency: "38ms" },
          { name: "SQLite DB", latency: "2ms" },
        ].map((s) => (
          <div
            key={s.name}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 0",
              borderBottom: "1px solid var(--border-subtle)",
              fontSize: ".875rem",
            }}
          >
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "var(--emerald-500)",
                }}
              />
              {s.name}
            </div>

            <span
              style={{
                fontFamily: "monospace",
                fontSize: ".75rem",
                color: "var(--text-muted)",
              }}
            >
              {s.latency}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}