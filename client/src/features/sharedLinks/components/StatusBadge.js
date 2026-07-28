import React from "react";

const STYLES = {
  active: { label: "Active", cls: "badge--success" },
  expired: { label: "Expired", cls: "badge--muted" },
  revoked: { label: "Revoked", cls: "badge--danger" },
  disabled: { label: "Disabled", cls: "badge--warning" },
};

export default function StatusBadge({ status }) {
  const cfg = STYLES[status] || STYLES.active;
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}
