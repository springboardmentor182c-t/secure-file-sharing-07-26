import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { PrimaryButton } from "../components/Buttons";
import { RevokeSessionModal } from "../components/Modals/RevokeSessionModal";
import { listSessions } from "../features/authentication/services/authService";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [modalSession, setModalSession] = useState(null);

  useEffect(() => {
    listSessions()
      .then(setSessions)
      .catch(() => setSessions([]));
  }, []);

  const handleRevoked = (sessionId) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  return (
    <div className="min-h-screen bg-[#212531] flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-[440px] bg-[#322F42] rounded-2xl p-7 border border-[#B7A2C9]/10">
        <h2 className="text-white text-xl font-semibold mb-1">Welcome, {user?.full_name}</h2>
        <p className="text-[#C5C3C4]/70 text-sm mb-6">{user?.email}</p>

        <h3 className="text-white text-sm font-semibold mb-3">Active sessions</h3>
        <div className="space-y-2 mb-6">
          {sessions.length === 0 && <p className="text-[#C5C3C4]/50 text-xs">No other active sessions</p>}
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-[#212531]/60">
              <div>
                <p className="text-[#C5C3C4] text-xs">{s.user_agent || "Unknown device"}</p>
                <p className="text-[#C5C3C4]/40 text-[11px]">{s.ip_address}</p>
              </div>
              {!s.is_current && (
                <button
                  onClick={() => setModalSession(s)}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  Revoke
                </button>
              )}
              {s.is_current && <span className="text-green-400 text-[11px]">This device</span>}
            </div>
          ))}
        </div>

        <PrimaryButton onClick={logout}>Sign out</PrimaryButton>
      </div>

      <RevokeSessionModal
        open={!!modalSession}
        session={modalSession}
        onClose={() => setModalSession(null)}
        onRevoked={handleRevoked}
      />
    </div>
  );
}
