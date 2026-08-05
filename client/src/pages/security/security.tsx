import { useState, useEffect } from "react";
import {
  Shield, Search, Key, Smartphone, ShieldCheck, ShieldAlert,
  AlertTriangle, RotateCcw, XCircle
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import "./security-theme.css";

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface SecurityEvent {
  id: number;
  ts: string;
  event: string;
  source: string;
  country: string;
  severity: string;
  blocked: boolean;
}

interface EncryptionKey {
  id: string;
  file: string;
  created: string;
  rotated: string;
  algorithm: string;
  status: string;
}

interface StatCard {
  label: string;
  value: string;
  sub: string;
  color: string;
}

interface LoginAttempt {
  hour: string;
  success: number;
  failed: number;
}

interface UserProfile {
  name: string;
  role: string;
}

interface DashboardData {
  stats: StatCard[];
  login_attempts: LoginAttempt[];
  events: SecurityEvent[];
  keys: EncryptionKey[];
  current_user: UserProfile;
}

// ─── Badges ────────────────────────────────────────────────────────────────────
function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    critical: "bg-red-500/20 text-red-400 border-red-500/30",
    high: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    low: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${map[severity] || ""}`}>
      {severity}
    </span>
  );
}

// ─── Header / TopBar ───────────────────────────────────────────────────────────
function TopBar({ title, search, setSearch, currentUser, actions }: { 
  title: string; 
  search: string; 
  setSearch: (v: string) => void; 
  currentUser?: UserProfile;
  actions?: React.ReactNode 
}) {
  const initials = currentUser?.name
    ? currentUser.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "GU";
  return (
    <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#B7A2C9]/08 shrink-0">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-[#4B3A70] flex items-center justify-center">
          <Shield size={15} className="text-white" />
        </div>
        <div>
          <span className="text-white font-semibold text-sm tracking-tight block">TrustShare</span>
          <span className="text-[#B7A2C9] text-[10px] block -mt-0.5 font-medium">Security Control Center</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#C5C3C4]/40" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search events, IPs, files..."
            className="pl-8 pr-4 py-2 bg-[#322F42]/60 border border-[#B7A2C9]/12 rounded-lg text-xs text-[#C5C3C4] placeholder:text-[#C5C3C4]/35 focus:outline-none focus:border-[#4B3A70]/50 transition-colors w-52"
          />
        </div>
        {actions}
        <div className="flex items-center gap-2.5 pl-2 border-l border-[#B7A2C9]/10">
          <div className="w-7 h-7 rounded-full bg-[#4B3A70] flex items-center justify-center text-white text-xs font-semibold shrink-0">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-white text-xs font-medium leading-none">{currentUser?.name || "Guest User"}</p>
            <p className="text-[#C5C3C4]/50 text-[9px] mt-0.5 leading-none">{currentUser?.role || "Viewer"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Read API URL via Vite's environment variable loading
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ─── Security Dashboard ────────────────────────────────────────────────────────
export function SecurityView() {
  const [search, setSearch] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rotating, setRotating] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/security/dashboard`);
      if (!response.ok) {
        throw new Error(`Failed to load data (HTTP ${response.status})`);
      }
      const json = await response.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to connect to the security API");
      setData(null);
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
    } catch (err: any) {
      alert("Error rotating keys: " + err.message);
    } finally {
      setRotating(false);
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
  const filteredEvents = data.events.filter(ev =>
    ev.event.toLowerCase().includes(search.toLowerCase()) ||
    ev.source.toLowerCase().includes(search.toLowerCase()) ||
    ev.country.toLowerCase().includes(search.toLowerCase())
  );

  // Filtering keys based on the search query
  const filteredKeys = data.keys.filter(key =>
    key.id.toLowerCase().includes(search.toLowerCase()) ||
    key.file.toLowerCase().includes(search.toLowerCase()) ||
    key.algorithm.toLowerCase().includes(search.toLowerCase())
  );

  const iconMap: Record<string, any> = {
    "Blocked attacks": ShieldAlert,
    "Failed logins": XCircle,
    "MFA coverage": Smartphone,
    "Key rotations": Key,
  };

  return (
    <div className="flex flex-col h-full">
      <TopBar title="Security Dashboard" search={search} setSearch={setSearch} currentUser={data.current_user} />
      <div className="flex-1 overflow-auto p-5 space-y-5">

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {data.stats.map(({ label, value, sub, color }) => {
            const Icon = iconMap[label] || ShieldAlert;
            return (
              <div key={label} className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#C5C3C4]/60 text-xs">{label}</span>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                    <Icon size={13} style={{ color }} />
                  </div>
                </div>
                <p className="text-white text-xl font-bold mb-0.5">{value}</p>
                <p className="text-[#C5C3C4]/50 text-[11px]">{sub}</p>
              </div>
            );
          })}
        </div>

        {/* Login monitoring chart */}
        <div className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-white font-medium text-sm">Login activity — today</h3>
              <p className="text-[#C5C3C4]/50 text-xs mt-0.5">Successful vs. failed authentication attempts</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-[#C5C3C4]/60">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#22C55E]" /> Success</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#EF4444]" /> Failed</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data.login_attempts}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(183,162,201,0.08)" vertical={false} />
              <XAxis dataKey="hour" tick={{ fill: "#8B879A", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#8B879A", fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "#322F42", border: "1px solid rgba(183,162,201,0.15)", borderRadius: "0.5rem", fontSize: 12, color: "#C5C3C4" }} />
              <Line key="line-success" type="monotone" dataKey="success" name="Successful" stroke="#22C55E" strokeWidth={2} dot={{ fill: "#22C55E", r: 3 }} />
              <Line key="line-failed" type="monotone" dataKey="failed" name="Failed" stroke="#EF4444" strokeWidth={2} dot={{ fill: "#EF4444", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Security events table */}
        <div className="bg-[#322F42]/40 rounded-xl border border-[#B7A2C9]/08 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#B7A2C9]/08">
            <div className="flex items-center gap-2">
              <ShieldAlert size={14} className="text-red-400" />
              <span className="text-white font-medium text-sm">Security events</span>
              <span className="text-[10px] bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-semibold">
                {filteredEvents.filter(ev => ev.severity === "critical" || ev.severity === "high").length} critical/high
              </span>
            </div>
          </div>
          <div className="grid text-[10px] font-semibold text-[#C5C3C4]/40 uppercase tracking-wider px-4 py-2.5 border-b border-[#B7A2C9]/08"
            style={{ gridTemplateColumns: "130px 1fr 130px 50px 70px 70px" }}>
            <div>Timestamp</div><div>Event</div><div>Source IP</div><div>Country</div><div>Severity</div><div>Action</div>
          </div>
          {filteredEvents.length > 0 ? (
            filteredEvents.map(ev => (
              <div key={ev.id} className={`grid items-center px-4 py-2.5 border-b border-[#B7A2C9]/05 last:border-0 text-xs hover:bg-[#B7A2C9]/04 transition-colors
                ${ev.severity === "critical" ? "bg-red-500/05" : ev.severity === "high" ? "bg-orange-500/04" : ""}`}
                style={{ gridTemplateColumns: "130px 1fr 130px 50px 70px 70px" }}>
                <div className="text-[#C5C3C4]/50 font-mono text-[10px]">{ev.ts}</div>
                <div className="text-white font-medium">{ev.event}</div>
                <div className="text-[#C5C3C4]/60 font-mono text-[10px]">{ev.source}</div>
                <div className="text-[#C5C3C4]/60">{ev.country}</div>
                <div><SeverityBadge severity={ev.severity} /></div>
                <div>{ev.blocked
                  ? <span className="text-[10px] text-green-400 flex items-center gap-0.5"><ShieldCheck size={9} /> Blocked</span>
                  : <span className="text-[10px] text-amber-400 flex items-center gap-0.5"><AlertTriangle size={9} /> Monitor</span>}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-xs text-[#C5C3C4]/40">No matching events found.</div>
          )}
        </div>

        {/* Encryption / key rotation status */}
        <div className="bg-[#322F42]/60 border border-[#B7A2C9]/08 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Key size={14} className="text-[#B7A2C9]" />
            <h3 className="text-white font-medium text-sm">Encryption key management</h3>
            <span
              onClick={handleRotateKeys}
              className={`ml-auto text-xs text-[#B7A2C9] hover:text-white transition-colors cursor-pointer flex items-center gap-1 select-none ${rotating ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <RotateCcw size={11} className={rotating ? "animate-spin" : ""} /> {rotating ? "Rotating..." : "Rotate all keys"}
            </span>
          </div>
          <div className="space-y-2">
            {filteredKeys.length > 0 ? (
              filteredKeys.map(key => (
                <div key={key.id} className="flex items-center justify-between px-3 py-2.5 bg-[#212531]/60 rounded-lg">
                  <div className="flex items-center gap-3 min-w-0">
                    <Key size={12} className="text-[#B7A2C9] shrink-0" />
                    <div className="min-w-0">
                      <p className="text-white text-xs font-mono">{key.id}</p>
                      <p className="text-[#C5C3C4]/50 text-[10px] truncate">{key.file}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-[#C5C3C4]/60 shrink-0">
                    <span className="hidden md:block">{key.algorithm}</span>
                    <span>Rotated: {key.rotated}</span>
                    <span className={`px-1.5 py-0.5 rounded font-medium ${key.status === "active" ? "bg-green-500/15 text-green-400" : "bg-amber-500/15 text-amber-400"}`}>{key.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-xs text-[#C5C3C4]/40">No matching encryption keys found.</div>
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
