import { useState } from "react";
import { Search, UserPlus, X } from "lucide-react";
import { createUser } from "../api/users";

export default function Header({ title = "Admin Dashboard", onUserAdded, searchValue, onSearchChange }) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("Viewer");

  const handleInvite = async () => {
    if (!name || !email) return;
    await createUser({ name, email, role });
    setShowModal(false);
    setName("");
    setEmail("");
    if (onUserAdded) onUserAdded();
  };

  return (
    <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
      <h1 className="text-2xl font-bold text-white">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-[#1a1a22] border border-gray-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 w-64 focus:outline-none focus:border-purple-500"
          />
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <UserPlus size={16} />
          Invite user
        </button>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[#1a1a22] rounded-xl p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">Invite user</h3>
              <X size={18} className="text-gray-400 cursor-pointer" onClick={() => setShowModal(false)} />
            </div>

            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mb-3 bg-[#0f0f14] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-3 bg-[#0f0f14] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full mb-4 bg-[#0f0f14] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
            >
              <option value="Viewer">Viewer</option>
              <option value="Editor">Editor</option>
              <option value="Admin">Admin</option>
            </select>

            <button
              onClick={handleInvite}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium py-2 rounded-lg"
            >
              Send invite
            </button>
          </div>
        </div>
      )}
    </div>
  );
}