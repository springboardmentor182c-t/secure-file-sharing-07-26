import React from "react";

export default function UserList({
  users,
  search,
  roleFilter,
  user,
  toggleActive,
}) {
  const filteredUsers = users.filter(
    (u) =>
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())) &&
      (roleFilter === "all" || u.role === roleFilter)
  );

  return (
    <div className="card" style={{ overflow: "hidden" }}>
      {filteredUsers.length === 0 ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "var(--text-muted)",
          }}
        >
          🔍 No users found.
        </div>
      ) : (
        filteredUsers.map((u) => (
          <div
            key={u.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "14px 20px",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            <div
              className="avatar av-md"
              style={{
                background: "linear-gradient(135deg,#3b82f6,#8b5cf6)",
                flexShrink: 0,
              }}
            >
              {u.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .slice(0, 2)}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600 }}>{u.name}</div>
              <div className="text-xs text-muted">{u.email}</div>
            </div>

            <span
              className={`badge ${
                u.role === "admin" ? "badge-purple" : "badge-blue"
              }`}
            >
              {u.role}
            </span>

            <button
              className={`btn btn-sm ${
                u.is_active ? "btn-danger" : "btn-success"
              }`}
              onClick={() => toggleActive(u)}
              disabled={u.id === user?.id}
            >
              {u.is_active ? "🚫 Suspend" : "✅ Enable"}
            </button>
          </div>
        ))
      )}
    </div>
  );
}