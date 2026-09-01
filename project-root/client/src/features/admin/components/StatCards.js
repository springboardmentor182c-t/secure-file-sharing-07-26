import React from "react";

const StatCards = ({ stats }) => {
  const cards = [
    {
      title: "Total Users",
      value: stats?.total_users ?? 0,
      icon: "👥",
    },
    {
      title: "Active Users",
      value: stats?.active_users ?? 0,
      icon: "✅",
    },
    {
      title: "Admins",
      value: stats?.admins ?? 0,
      icon: "🔐",
    },
    {
      title: "Audit Logs",
      value: stats?.audit_logs ?? 0,
      icon: "📋",
    },
  ];

  return (
    <div className="stats-grid">
      {cards.map((item, index) => (
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