import React from "react";

const stats = [
  {
    title: "Total Users",
    value: "0",
    icon: "👥",
  },
  {
    title: "Active Users",
    value: "0",
    icon: "✅",
  },
  {
    title: "Admins",
    value: "0",
    icon: "🔐",
  },
  {
    title: "Audit Logs",
    value: "0",
    icon: "📋",
  },
];

const StatCards = () => {
  return (
    <div className="stats-grid">
      {stats.map((item, index) => (
        <div className="stat-card" key={index}>
          <div className="stat-icon">{item.icon}</div>

          <h3>{item.value}</h3>

          <p>{item.title}</p>
        </div>
      ))}
    </div>
  );
};

export default StatCards;