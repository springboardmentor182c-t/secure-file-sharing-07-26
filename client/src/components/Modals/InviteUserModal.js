import { useState } from "react";
import { X } from "lucide-react";
import { inviteUser } from "../../features/dashboard/services/dashboardService";

export default function InviteUserModal({ open, onClose, onInvited }) {
  const [form, setForm] = useState({ name: "", email: "", role: "Viewer" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await inviteUser(form);
      setForm({ name: "", email: "", role: "Viewer" });
      onInvited();
    } catch (err) {
      setError(err.message || "Failed to invite user");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="bg-[#171826] border border-gray-800 rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-semibold text-lg">Invite user</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-xs mb-1.5">Name</label>
            <input name="name" value={form.name} onChange={handleChange} required
              className="w-full bg-[#1E1F2B] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1.5">Email</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required
              className="w-full bg-[#1E1F2B] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-purple-500" />
          </div>
          <div>
            <label className="block text-gray-400 text-xs mb-1.5">Role</label>
            <select name="role" value={form.role} onChange={handleChange}
              className="w-full bg-[#1E1F2B] border border-gray-800 rounded-lg px-3 py-2.5 text-white text-sm outline-none focus:border-purple-500">
              <option value="Admin">Admin</option>
              <option value="Editor">Editor</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-lg text-gray-300 hover:bg-white/5 text-sm">Cancel</button>
            <button type="submit" disabled={submitting} className="px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium disabled:opacity-50">
              {submitting ? "Sending..." : "Send invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}