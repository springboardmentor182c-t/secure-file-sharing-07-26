import React from "react";

export default function UserManagementTable({ users }) {
  return (
    <div className="overflow-x-auto bg-[#171826] border border-gray-800 rounded-xl">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400 text-left">
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Storage</th>
            <th className="px-4 py-3 font-medium">Files</th>
            <th className="px-4 py-3 font-medium">MFA</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-gray-800/60 last:border-0">
              <td className="px-4 py-3 text-white">{user.name}</td>
              <td className="px-4 py-3 text-gray-400">{user.email}</td>
              <td className="px-4 py-3 text-gray-300">{user.role}</td>
              <td className="px-4 py-3 text-gray-300">{user.storage_used_gb.toFixed(1)} GB</td>
              <td className="px-4 py-3 text-gray-300">{user.files_count}</td>
              <td className="px-4 py-3">
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                    user.mfa_enabled
                      ? "bg-green-500/15 text-green-400"
                      : "bg-gray-500/15 text-gray-400"
                  }`}
                >
                  {user.mfa_enabled ? "Enabled" : "Off"}
                </span>
              </td>
              <td className="px-4 py-3">
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-medium ${
                    user.status === "Active"
                      ? "bg-green-500/15 text-green-400"
                      : "bg-red-500/15 text-red-400"
                  }`}
                >
                  {user.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}