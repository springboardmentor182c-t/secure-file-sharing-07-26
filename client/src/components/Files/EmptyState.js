import React from "react";

function EmptyState({ icon, title, subtitle }) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">{icon}</div>
      <h3 className="empty-state__title">{title}</h3>
      <p className="empty-state__subtitle">{subtitle}</p>
    </div>
  );
}

export default EmptyState;