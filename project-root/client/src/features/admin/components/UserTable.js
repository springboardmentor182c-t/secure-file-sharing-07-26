import React from "react";

const UserTable = ({
  users,
  search = "",
  roleFilter = "all",
  toggleActive,
}) => {
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });
 

  return (
    <div className="user-table-container">
      <h2>Users</h2>

      <table className="user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredUsers.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.is_active ? "Active" : "Inactive"}</td>
              <td>
  <button
    onClick={() => toggleActive(user)}
    className="btn btn-sm"
  >
    {user.is_active ? "Deactivate" : "Activate"}
  </button>
</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;