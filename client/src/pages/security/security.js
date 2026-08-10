import { useState, useEffect } from "react";
import {
  Shield, Search, Key, Smartphone, ShieldCheck, ShieldAlert,
  AlertTriangle, RotateCcw, XCircle, Trash2
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";

// ─── Badges ────────────────────────────────────────────────────────────────────
function SeverityBadge({ severity }) {
  const map = {
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    low: "bg-sky-500/20 text-sky-400 border-sky-500/30",
    info: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${map[severity] || map.info}`}>
      {severity}
    </span>
  );
}

// Read API URL via Vite's environment variable loading
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ─── Security Dashboard ────────────────────────────────────────────────────────
export function SecurityView() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rotating, setRotating] = useState(false);
  const [deletingAll, setDeletingAll] = useState(false);
  const [rotatingKeyId, setRotatingKeyId] = useState(null);
  const [deletingKeyId, setDeletingKeyId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/security/dashboard`);
      if (!response.ok) {
        throw new Error(`Failed to load security dashboard`);
      }
      const json = await response.json();
      setData(json);
    } catch (err) {
      console.error("Security API error:", err);
      setError(err.message || "Failed to connect to security API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRotateKeys = async () => {
    if (rotating) return;
    setRotating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/security/rotate-keys`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to rotate keys");
      }
      await fetchDashboardData();
    } catch (err) {
      alert("Error rotating keys: " + err.message);
    } finally {
      setRotating(false);
    }
  };

  const handleDeleteAllKeys = async () => {
    if (deletingAll) return;
    if (!window.confirm("Are you sure you want to delete all encryption keys?")) return;
    setDeletingAll(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/security/keys`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete all keys");
      }
      await fetchDashboardData();
    } catch (err) {
      alert("Error deleting all keys: " + err.message);
    } finally {
      setDeletingAll(false);
    }
  };

  const handleRotateSingleKey = async (keyId) => {
    if (rotatingKeyId) return;
    setRotatingKeyId(keyId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/security/keys/${encodeURIComponent(keyId)}/rotate`, {
        method: "POST",
      });
      if (!response.ok) {
        throw new Error("Failed to rotate key");
      }
      await fetchDashboardData();
    } catch (err) {
      alert("Error rotating key: " + err.message);
    } finally {
      setRotatingKeyId(null);
    }
  };

  const handleDeleteSingleKey = async (keyId) => {
    if (deletingKeyId) return;
    if (!window.confirm(`Delete encryption key "${keyId}"?`)) return;
    setDeletingKeyId(keyId);
    try {
      const response = await fetch(`${API_BASE_URL}/api/security/keys/${encodeURIComponent(keyId)}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete key");
      }
      await fetchDashboardData();
    } catch (err) {
      alert("Error deleting key: " + err.message);
    } finally {
      setDeletingKeyId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[#C5C3C4]">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#B7A2C9] animate-spin mb-3" />
        <p className="text-xs font-medium">Loading security control data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert size={40} className="text-red-400 mb-3" />
        <p className="text-white text-sm font-semibold mb-1">Initialization Failed</p>
        <p className="text-[#C5C3C4]/50 text-xs mb-4">{error || "No dashboard data available."}</p>
        <button
          onClick={() => { setLoading(true); fetchDashboardData(); }}
          className="px-4 py-2 bg-[#4B3A70] hover:bg-[#4B3A70]/80 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Retry Load
        </button>
      </div>
    );
  }

  // Filtering events based on the search query
  const filteredEvents = (data.events || []).filter(ev =>
    (ev.event || "").toLowerCase().includes(search.toLowerCase()) ||
    (ev.source || "").toLowerCase().includes(search.toLowerCase()) ||
    (ev.country || "").toLowerCase().includes(search.toLowerCase())
  );

  // Filtering keys based on the search query
  const filteredKeys = (data.keys || []).filter(key =>
    (key.id || "").toLowerCase().includes(search.toLowerCase()) ||
    (key.file || "").toLowerCase().includes(search.toLowerCase()) ||
    (key.algorithm || "").toLowerCase().includes(search.toLowerCase())
  );

  const iconMap = {
    "Blocked attacks": ShieldAlert,
    "Failed logins": XCircle,
    "MFA coverage": Smartphone,
    "Key rotations": Key,
  };

  return (
    <div className="flex flex-col h-full text-foreground animate-fade-in">
      <div className="flex-1 overflow-auto p-5 space-y-5">

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {(data.stats || []).map(({ label, value, sub, color }) => {
            const Icon = iconMap[label] || ShieldAlert;
            return (
              <div key={label} className="bg-[#272938] border border-[#34364A] rounded-2xl p-5 hover:border-gray-700 transition-colors">
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-gray-400 text-xs font-semibold">{label}</span>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                </div>
                <p className="text-white text-2xl font-black tracking-tight mb-0.5">{value}</p>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{sub}</p>
              </div>
            );
          })}
        </div>

        {/* Login monitoring chart */}
        <div className="bg-[#272938] border border-[#34364A] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-semibold text-sm">Login activity — today</h3>
              <p className="text-gray-400 text-xs mt-0.5">Successful vs. failed authentication attempts</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#22C55E]" /> Success</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#EF4444]" /> Failed</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data.login_attempts || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(52, 54, 74, 0.2)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#272938", border: "1px solid #34364A", borderRadius: "0.75rem", fontSize: 12, color: "#white" }} />
              <Line key="line-success" type="monotone" dataKey="success" name="Successful" stroke="#22C55E" strokeWidth={2} dot={{ fill: "#22C55E", r: 3 }} />
              <Line key="line-failed" type="monotone" dataKey="failed" name="Failed" stroke="#EF4444" strokeWidth={2} dot={{ fill: "#EF4444", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Control Panel: Search & Key Rotation / Deletion */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#272938] border border-[#34364A] p-4 rounded-2xl">
          <div className="relative flex-1 sm:flex-none">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search events, IPs, keys..."
              className="pl-9 pr-4 py-2 bg-[#1E1F2B] border border-[#34364A] rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#7C5CFC] transition-colors w-full sm:w-56"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleRotateKeys}
              disabled={rotating}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#7C5CFC] hover:bg-[#7C5CFC]/90 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 select-none shadow-lg shadow-[#7C5CFC]/25 shrink-0"
            >
              <RotateCcw size={13} className={rotating ? "animate-spin" : ""} /> {rotating ? "Rotating..." : "Rotate all keys"}
            </button>
            <button
              onClick={handleDeleteAllKeys}
              disabled={deletingAll}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50 select-none shadow-lg shadow-red-600/25 shrink-0"
            >
              <Trash2 size={13} className={deletingAll ? "animate-pulse" : ""} /> {deletingAll ? "Deleting..." : "Delete all keys"}
            </button>
          </div>
        </div>

        {/* Security events table */}
        <div className="bg-[#272938] rounded-2xl border border-[#34364A] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#34364A]">
            <div className="flex items-center gap-2">
              <ShieldAlert size={15} className="text-red-400 animate-pulse" />
              <span className="text-white font-semibold text-sm">Security events</span>
              <span className="text-[10px] bg-red-500/10 border border-red-500/20 text-red-400 px-2 py-0.5 rounded-lg font-bold">
                {filteredEvents.filter(ev => ev.severity === "critical" || ev.severity === "high").length} critical/high
              </span>
            </div>
          </div>
          <div className="grid text-[10px] font-bold text-gray-400 uppercase tracking-wider px-5 py-3 border-b border-[#34364A] gap-3"
            style={{ gridTemplateColumns: "130px 1fr 120px 80px 80px 70px" }}>
            <div>Timestamp</div>
            <div>Event</div>
            <div>Source IP</div>
            <div>Country</div>
            <div>Severity</div>
            <div>Action</div>
          </div>
          {filteredEvents.length > 0 ? (
            filteredEvents.map(ev => (
              <div key={ev.id} className={`grid items-center px-5 py-3.5 border-b border-[#34364A]/40 last:border-0 text-xs hover:bg-[#1E1F2B]/40 text-gray-300 transition-colors gap-3
                ${ev.severity === "critical" ? "bg-red-500/05" : ev.severity === "high" ? "bg-orange-500/04" : ""}`}
                style={{ gridTemplateColumns: "130px 1fr 120px 80px 80px 70px" }}>
                <div className="text-gray-500 font-mono text-[10px]">{ev.ts}</div>
                <div className="text-white font-semibold">{ev.event}</div>
                <div className="text-gray-400 font-mono text-[10px]">{ev.source}</div>
                <div className="text-gray-400">{ev.country}</div>
                <div><SeverityBadge severity={ev.severity} /></div>
                <div>{ev.blocked
                  ? <span className="text-[10px] text-green-400 flex items-center gap-0.5"><ShieldCheck size={10} /> Blocked</span>
                  : <span className="text-[10px] text-amber-400 flex items-center gap-0.5"><AlertTriangle size={10} /> Monitor</span>}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-gray-500">No matching events found.</div>
          )}
        </div>

        {/* Encryption / key rotation status */}
        <div className="bg-[#272938] border border-[#34364A] rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Key size={15} className="text-[#7C5CFC]" />
              <h3 className="text-white font-semibold text-sm">Encryption key management</h3>
            </div>
            {filteredKeys.length > 0 && (
              <button
                onClick={handleDeleteAllKeys}
                disabled={deletingAll}
                className="text-[11px] text-red-400 hover:text-red-300 font-semibold cursor-pointer disabled:opacity-50"
              >
                {deletingAll ? "Deleting..." : "Clear all keys"}
              </button>
            )}
          </div>
          <div className="space-y-2">
            {filteredKeys.length > 0 ? (
              filteredKeys.map(key => (
                <div key={key.id} className="flex items-center justify-between px-4 py-3 bg-[#1E1F2B] border border-[#34364A]/60 rounded-xl hover:border-[#7C5CFC]/20 transition-all">
                  <div className="flex items-center gap-3 min-w-0">
                    <Key size={13} className="text-[#7C5CFC] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-white text-xs font-semibold font-mono">{key.id}</p>
                      <p className="text-gray-400 text-[10px] truncate">{key.file}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-gray-400 shrink-0">
                    <span className="hidden md:block font-medium">{key.algorithm}</span>
                    <span>Rotated: {key.rotated}</span>
                    <span className={`px-2 py-0.5 rounded-lg font-bold border ${key.status === "active" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>{key.status}</span>
                    <button
                      onClick={() => handleRotateSingleKey(key.id)}
                      disabled={rotatingKeyId === key.id}
                      className="px-2.5 py-1 bg-[#34364A] hover:bg-[#7C5CFC] text-white rounded-lg text-[10px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {rotatingKeyId === key.id ? "Rotating..." : "Rotate Key"}
                    </button>
                    <button
                      onClick={() => handleDeleteSingleKey(key.id)}
                      disabled={deletingKeyId === key.id}
                      className="px-2 py-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {deletingKeyId === key.id ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-gray-500">No matching encryption keys found.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Root Component ───────────────────────────────────────────────────────
export default function App() {
  return (
    <div className="h-screen bg-[#212531] text-[#C5C3C4] flex flex-col animate-fade-in" style={{ fontFamily: "Inter, sans-serif" }}>
      <main className="flex-1 flex flex-col overflow-hidden">
        <SecurityView />
      </main>
    </div>
  );
}
