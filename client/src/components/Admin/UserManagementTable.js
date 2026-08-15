import React, { useState } from "react";
import { Trash2, Shield, ShieldCheck, UserCheck, UserX } from "lucide-react";
import { updateUser, deleteUser } from "../../features/dashboard/services/dashboardService";
import { formatStorage } from "../../utils/formatStorage";

export default function UserManagementTable({ users, onUserUpdated }) {
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingId(userId);
    try {
      await updateUser(userId, { role: newRole });
      if (onUserUpdated) onUserUpdated();
    } catch (err) {
      alert("Failed to update role: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleStatus = async (user) => {
    setUpdatingId(user.id);
    const newStatus = (user.status || "").toLowerCase() === "active" ? "Suspended" : "Active";
    try {
      await updateUser(user.id, { status: newStatus });
      if (onUserUpdated) onUserUpdated();
    } catch (err) {
      alert("Failed to update status: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleToggleMfa = async (user) => {
    setUpdatingId(user.id);
    const newMfa = !user.mfa_enabled;
    try {
      await updateUser(user.id, { mfa_enabled: newMfa });
      if (onUserUpdated) onUserUpdated();
    } catch (err) {
      alert("Failed to update MFA: " + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to remove user "${userName}"?`)) return;
    setDeletingId(userId);
    try {
      await deleteUser(userId);
      if (onUserUpdated) onUserUpdated();
    } catch (err) {
      alert("Failed to delete user: " + err.message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="overflow-x-auto bg-[#272938] border border-[#34364A] rounded-2xl shadow-xl">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-[#34364A] text-gray-400 text-left font-semibold bg-[#1E1F2B]">
            <th className="px-4 py-3 font-medium">User</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Storage</th>
            <th className="px-4 py-3 font-medium">Files</th>
            <th className="px-4 py-3 font-medium">MFA</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#34364A]/50">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-[#1E1F2B]/50 transition-colors">
              <td className="px-4 py-3 text-white font-semibold flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#7C5CFC]/20 border border-[#7C5CFC]/40 text-[#7C5CFC] flex items-center justify-center font-bold text-xs uppercase">
                  {user.name?.[0] || "U"}
                </div>
                {user.name}
              </td>
              <td className="px-4 py-3 text-gray-400 font-mono">{user.email}</td>
              <td className="px-4 py-3">
                <select
                  value={user.role || "Viewer"}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  disabled={updatingId === user.id}
                  className="px-2.5 py-1 rounded-lg bg-[#1E1F2B] border border-[#34364A] text-xs text-purple-300 font-medium outline-none cursor-pointer focus:border-[#7C5CFC]"
                >
                  <option value="Admin">Admin</option>
                  <option value="Editor">Editor</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </td>
             <td className="px-4 py-3 text-gray-300 font-mono">{formatStorage(user.storage_used_gb || 0)}</td>
              <td className="px-4 py-3 text-gray-300 font-mono">{user.files_count || 0}</td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleToggleMfa(user)}
                  disabled={updatingId === user.id}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                    user.mfa_enabled
                      ? "bg-green-500/15 text-green-400 border-green-500/30 hover:bg-green-500/25"
                      : "bg-gray-500/15 text-gray-400 border-gray-500/30 hover:bg-gray-500/25"
                  }`}
                  title="Click to toggle MFA requirement"
                >
                  {user.mfa_enabled ? "Enabled" : "Off"}
                </button>
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleToggleStatus(user)}
                  disabled={updatingId === user.id}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer capitalize ${
                    (user.status || "").toLowerCase() === "active"
                      ? "bg-green-500/15 text-green-400 border-green-500/30 hover:bg-green-500/25"
                      : "bg-red-500/15 text-red-400 border-red-500/30 hover:bg-red-500/25"
                  }`}
                  title="Click to toggle status (Active / Suspended)"
                >
                  {user.status || "Active"}
                </button>
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => handleDeleteUser(user.id, user.name)}
                  disabled={deletingId === user.id}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/15 border border-transparent hover:border-red-500/30 rounded-lg transition cursor-pointer"
                  title="Remove user"
                >
                  <Trash2 size={14} className={deletingId === user.id ? "animate-spin text-red-400" : ""} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}