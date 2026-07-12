export default function UserTable({ users }) {
  return (
    <div className="bg-[#1a1a22] rounded-xl p-5 mt-4">
      <h3 className="text-lg font-semibold mb-4">User management</h3>
      <table className="w-full text-sm text-left">
        <thead className="text-gray-400 border-b border-gray-700">
          <tr>
            <th className="py-2">User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Storage</th>
            <th>Files</th>
            <th>MFA</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-gray-800">
              <td className="py-3">{u.name}</td>
              <td className="text-gray-400">{u.email}</td>
              <td>{u.role}</td>
              <td>{(u.storage_used_mb / 1024).toFixed(1)} GB</td>
              <td>{u.files_count}</td>
              <td className={u.mfa_enabled ? "text-green-400" : "text-yellow-400"}>
                {u.mfa_enabled ? "Enabled" : "Off"}
              </td>
              <td>
                <span className={`px-2 py-1 rounded text-xs ${
                  u.status === "Active" ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"
                }`}>
                  {u.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}