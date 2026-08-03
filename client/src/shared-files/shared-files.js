import { useState, useEffect } from "react";
import {
  Link2, Search, RefreshCw, X, Grid, List, ShieldCheck,
  ShieldAlert, AlertTriangle, FileText, Archive, FileSpreadsheet,
  Image, FileCode, Trash2, Download, Key, HardDrive, Users
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import "./shared-theme.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function FileIcon({ type, size = 18, className = "" }) {
  switch (type.toLowerCase()) {
    case "pdf":
      return <FileText size={size} className={`text-red-400 ${className}`} />;
    case "zip":
      return <Archive size={size} className={`text-amber-400 ${className}`} />;
    case "spreadsheet":
      return <FileSpreadsheet size={size} className={`text-green-400 ${className}`} />;
    case "image":
      return <Image size={size} className={`text-purple-400 ${className}`} />;
    default:
      return <FileCode size={size} className={`text-blue-400 ${className}`} />;
  }
}

function SecurityBadge({ status }) {
  switch (status.toLowerCase()) {
    case "clean":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-green-500/15 text-green-400 border border-green-500/30">
          <ShieldCheck size={10} /> Scan Clean
        </span>
      );
    case "scanning":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
          <RefreshCw size={10} className="animate-spin" /> Scanning
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
          <ShieldAlert size={10} /> Flagged
        </span>
      );
  }
}

export function SharedFilesView() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedShare, setSelectedShare] = useState(null);
  const [revokingId, setRevokingId] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareFileName, setShareFileName] = useState("");
  const [shareFileSize, setShareFileSize] = useState("");
  const [shareFileType, setShareFileType] = useState("pdf");
  const [shareRecipientEmail, setShareRecipientEmail] = useState("");
  const [sharePermission, setSharePermission] = useState("viewer");
  const [shareOwnerName, setShareOwnerName] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  const handleShareFile = async (e) => {
    e.preventDefault();
    if (!shareFileName.trim() || !shareRecipientEmail.trim() || !shareOwnerName.trim()) {
      alert("Please fill in all required fields.");
      return;
    }
    setIsSharing(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/shared/files`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          file_name: shareFileName,
          size: shareFileSize.trim() || "5.0 MB",
          file_type: shareFileType,
          recipient_email: shareRecipientEmail,
          permission: sharePermission,
          owner_name: shareOwnerName,
        }),
      });
      if (!response.ok) {
        throw new Error("Failed to share file");
      }
      setShareFileName("");
      setShareFileSize("");
      setShareRecipientEmail("");
      setSharePermission("viewer");
      setShareOwnerName("");
      setShowShareModal(false);
      await fetchDashboardData();
    } catch (err) {
      alert("Error sharing file: " + err.message);
    } finally {
      setIsSharing(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/shared/files`);
      if (!response.ok) {
        throw new Error(`Failed to load shared files (HTTP ${response.status})`);
      }
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err.message || "Failed to connect to the files sharing API");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRevokeShare = async (shareId) => {
    if (confirm("Are you sure you want to remove your access to this file?")) {
      setRevokingId(shareId);
      try {
        const response = await fetch(`${API_BASE_URL}/api/shared/files/${shareId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to remove access");
        }
        setSelectedShare(null);
        await fetchDashboardData();
      } catch (err) {
        alert("Error: " + err.message);
      } finally {
        setRevokingId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-[#C5C3C4]">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent border-[#7C5CFC] animate-spin mb-3" />
        <p className="text-xs font-medium">Loading files shared with you...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert size={40} className="text-red-400 mb-3" />
        <p className="text-white text-sm font-semibold mb-1">Initialization Failed</p>
        <p className="text-[#C5C3C4]/50 text-xs mb-4">{error || "No shared files data available."}</p>
        <button
          onClick={() => { setLoading(true); fetchDashboardData(); }}
          className="px-4 py-2 bg-[#7C5CFC] hover:bg-[#7C5CFC]/80 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
        >
          Retry Load
        </button>
      </div>
    );
  }

  const filteredShares = data.shares.filter((s) => {
    const matchesSearch = s.file.name.toLowerCase().includes(search.toLowerCase()) ||
      s.file.owner.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === "all" || s.file.file_type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  });

  const iconMap = {
    "Shared files": Link2,
    "Shared storage": HardDrive,
    "Collaborators": Users,
    "Safe shares": ShieldCheck,
  };

  return (
    <div className="space-y-6 text-[#C5C3C4] relative animate-fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {data.stats.map(({ label, value, sub, color }) => {
          const Icon = iconMap[label] || Link2;
          return (
            <div key={label} className="bg-[#272938] border border-[#34364A] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-xs font-medium">{label}</span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                  <Icon size={16} style={{ color }} />
                </div>
              </div>
              <p className="text-white text-2xl font-bold mb-0.5">{value}</p>
              <p className="text-gray-500 text-xs">{sub}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-[#272938] border border-[#34364A] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-white font-semibold text-sm">Weekly Access Activity</h3>
            <p className="text-gray-400 text-xs mt-0.5">Daily secure downloads of shared files</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#7C5CFC] font-semibold bg-[#7C5CFC]/10 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C5CFC]" /> Downloads
          </div>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data.activity}>
            <defs>
              <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7C5CFC" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(183,162,201,0.08)" vertical={false} />
            <XAxis dataKey="day" tick={{ fill: "#8B879A", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#8B879A", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: "#1b1c28", border: "1px solid rgba(183,162,201,0.12)", borderRadius: "0.5rem", fontSize: 12, color: "#C5C3C4" }} />
            <Area type="monotone" dataKey="downloads" stroke="#7C5CFC" fillOpacity={1} fill="url(#colorDownloads)" strokeWidth={2} name="Downloads" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-[#272938] border border-[#34364A] rounded-2xl p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-white font-semibold text-sm">Shared Files Inventory</h3>
            <p className="text-gray-400 text-xs mt-0.5">Securely shared items with your team</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search files"
                className="pl-9 pr-3 py-2 rounded-lg bg-[#1B1C28] border border-[#34364A] text-sm text-white w-44"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-2 rounded-lg bg-[#1B1C28] border border-[#34364A] text-sm text-white"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="zip">Archive</option>
            </select>
            <div className="flex rounded-lg border border-[#34364A] overflow-hidden">
              <button onClick={() => setViewMode("grid")} className={`p-2 ${viewMode === "grid" ? "bg-[#7C5CFC] text-white" : "text-gray-400"}`}>
                <Grid size={15} />
              </button>
              <button onClick={() => setViewMode("list")} className={`p-2 ${viewMode === "list" ? "bg-[#7C5CFC] text-white" : "text-gray-400"}`}>
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          {filteredShares.length === 0 ? (
            <div className="text-center py-10 text-gray-400 text-sm">No matching shared files.</div>
          ) : viewMode === "grid" ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredShares.map((share) => (
                <div key={share.id} className="rounded-2xl border border-[#34364A] bg-[#1B1C28] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-2 rounded-xl bg-[#7C5CFC]/10">
                        <FileIcon type={share.file.file_type} size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{share.file.name}</p>
                        <p className="text-gray-400 text-xs">{share.file.owner.name}</p>
                      </div>
                    </div>
                    <SecurityBadge status={share.file.security_status} />
                  </div>
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                    <span>{share.file.size}</span>
                    <span>{share.shared_at}</span>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => setSelectedShare(share)}
                      className="px-3 py-2 rounded-lg text-xs font-semibold bg-[#7C5CFC] text-white"
                    >
                      View details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredShares.map((share) => (
                <div key={share.id} className="flex items-center justify-between rounded-2xl border border-[#34364A] bg-[#1B1C28] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <FileIcon type={share.file.file_type} size={16} />
                    <div>
                      <p className="text-white text-sm font-medium">{share.file.name}</p>
                      <p className="text-gray-400 text-xs">{share.file.owner.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <SecurityBadge status={share.file.security_status} />
                    <button onClick={() => setSelectedShare(share)} className="text-xs text-[#7C5CFC]">Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedShare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-2xl rounded-2xl border border-[#34364A] bg-[#1B1C28] p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{selectedShare.file.name}</h3>
                <p className="text-sm text-gray-400">Shared by {selectedShare.file.owner.name}</p>
              </div>
              <button onClick={() => setSelectedShare(null)} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-[#34364A] p-4">
                <p className="text-xs uppercase text-gray-500">Permissions</p>
                <p className="mt-2 text-sm text-white">{selectedShare.permission}</p>
              </div>
              <div className="rounded-xl border border-[#34364A] p-4">
                <p className="text-xs uppercase text-gray-500">Security</p>
                <p className="mt-2 text-sm text-white">{selectedShare.file.security_status}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => handleRevokeShare(selectedShare.id)}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
              >
                <Trash2 size={15} /> {revokingId === selectedShare.id ? "Revoking..." : "Remove Access"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SharedFilesView;
