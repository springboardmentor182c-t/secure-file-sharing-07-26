import React from "react";

const users = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "User",
    status: "Active",
  },
  {
    id: 2,
    name: "Alice Smith",
    email: "alice@example.com",
    role: "Admin",
    status: "Active",
  },
  {
    id: 3,
    name: "Robert Brown",
    email: "robert@example.com",
    role: "User",
    status: "Inactive",
  },
];

const UserTable = () => {
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
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>{user.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;