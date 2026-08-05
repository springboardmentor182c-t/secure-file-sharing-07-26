import React from "react";

const STYLES = {
  view: { label: "View only", cls: "badge--info" },
  download: { label: "Download", cls: "badge--success" },
  edit: { label: "Edit", cls: "badge--accent" },
};

export default function PermissionBadge({ access }) {
  const cfg = STYLES[access] || STYLES.view;
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>;
}
