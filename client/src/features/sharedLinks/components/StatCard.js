import React from "react";

export default function StatCard({ label, value, icon: Icon, tint = "accent" }) {
  return (
    <div className="stat-card">
      <div className="stat-card__row">
        <span className="stat-card__label">{label}</span>
        <span className={`stat-card__icon stat-card__icon--${tint}`}>
          <Icon />
        </span>
      </div>
      <div className="stat-card__value">{value}</div>
    </div>
  );
}
