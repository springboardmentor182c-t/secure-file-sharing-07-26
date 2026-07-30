import React from "react";

export default function SearchBar({
  search,
  setSearch,
  roleFilter,
  setRoleFilter,
}) {
  return (
    <div
      className="card mb-4"
      style={{
        padding: "16px",
        display: "flex",
        gap: "12px",
        alignItems: "center",
      }}
    >
      <input
        type="text"
        className="input"
        placeholder="🔍 Search users..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ flex: 1 }}
      />

      <select
        className="input"
        value={roleFilter}
        onChange={(e) => setRoleFilter(e.target.value)}
        style={{ width: "170px" }}
      >
        <option value="all">All Roles</option>
        <option value="admin">Admin</option>
        <option value="user">User</option>
      </select>
    </div>
  );
}