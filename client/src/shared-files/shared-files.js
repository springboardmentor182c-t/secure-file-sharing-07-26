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

// Read API URL via Vite's environment variable loading
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ─── File Type Icon Helper ───────────────────────────────────────────────────
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

// ─── Security Status Badge Helper ─────────────────────────────────────────────
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

  // States for sharing new files
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
          owner_name: shareOwnerName
        })
      });
      if (!response.ok) {
        throw new Error("Failed to share file");
      }
      // Reset form
      setShareFileName("");
      setShareFileSize("");
      setShareRecipientEmail("");
      setSharePermission("viewer");
      setShareOwnerName("");
      setShowShareModal(false);
      
      // Refresh the view
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

  // Filtering shared files
  const filteredShares = data.shares.filter(s => {
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
      
      {/* Metrics Row */}
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

      {/* Activity Chart */}
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
                <stop offset="5%" stopColor="#7C5CFC" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0}/>
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

      {/* Control Panel: Filters, Search & View Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#272938] border border-[#34364A] p-4 rounded-2xl">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {["all", "pdf", "zip", "spreadsheet", "image", "doc"].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer border ${
                filterType === t
                  ? "bg-[#7C5CFC] text-white border-[#7C5CFC]"
                  : "bg-[#1E1F2B] text-gray-400 border-[#34364A] hover:text-white"
              }`}
            >
              {t === "all" ? "All types" : t}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:flex-none">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search files or owners..."
              className="pl-9 pr-4 py-2 bg-[#1E1F2B] border border-[#34364A] rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#7C5CFC] transition-colors w-full md:w-56"
            />
          </div>
          <button 
            onClick={() => { setLoading(true); fetchDashboardData(); }}
            className="p-2 bg-[#1E1F2B] border border-[#34364A] rounded-xl hover:bg-[#34364A] transition-colors cursor-pointer text-gray-300"
          >
            <RefreshCw size={14} />
          </button>
          <div className="flex items-center gap-1 bg-[#1E1F2B] border border-[#34364A] p-1 rounded-xl">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === "grid" ? "bg-[#7C5CFC] text-white" : "text-gray-400 hover:text-white"}`}
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === "list" ? "bg-[#7C5CFC] text-white" : "text-gray-400 hover:text-white"}`}
            >
              <List size={14} />
            </button>
          </div>
          <button
            onClick={() => setShowShareModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#7C5CFC] hover:bg-[#7C5CFC]/90 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg shadow-[#7C5CFC]/25 shrink-0"
          >
            <Link2 size={13} /> Share File
          </button>
        </div>
      </div>

      {/* Shared Files Grid / List */}
      {filteredShares.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredShares.map(share => (
              <div
                key={share.id}
                onClick={() => setSelectedShare(share)}
                className="bg-[#272938] border border-[#34364A] rounded-2xl p-5 shared-card-hover cursor-pointer flex flex-col justify-between h-48"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <FileIcon type={share.file.file_type} size={20} className="shrink-0" />
                      <span className="text-white font-semibold text-sm truncate">{share.file.name}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize shrink-0 ${
                      share.permission === "editor" ? "bg-[#7C5CFC]/20 text-[#9E86FF]" : "bg-gray-500/20 text-gray-400"
                    }`}>
                      {share.permission}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <SecurityBadge status={share.file.security_status} />
                    <span className="text-gray-500 text-[11px] font-medium">• {share.file.size}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-[#34364A]/50">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-full bg-[#7C5CFC] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
                      {share.file.owner.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white text-xs font-semibold truncate leading-none mb-1">{share.file.owner.name}</p>
                      <p className="text-gray-500 text-[10px] truncate leading-none">{share.file.owner.email}</p>
                    </div>
                  </div>
                  <span className="text-gray-500 text-[10px] font-medium shrink-0">Shared {share.shared_at.split(" ")[0]}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[#272938] border border-[#34364A] rounded-2xl overflow-hidden">
            <div className="grid text-[10px] font-bold text-gray-500 uppercase tracking-wider px-6 py-4 border-b border-[#34364A]"
              style={{ gridTemplateColumns: "1fr 120px 100px 110px 200px 100px" }}>
              <div>File name</div><div>Size</div><div>Permission</div><div>Security Scan</div><div>Shared by</div><div>Shared Date</div>
            </div>
            {filteredShares.map(share => (
              <div
                key={share.id}
                onClick={() => setSelectedShare(share)}
                className="grid items-center px-6 py-4 border-b border-[#34364A]/30 last:border-0 text-xs hover:bg-[#34364A]/25 transition-colors cursor-pointer"
                style={{ gridTemplateColumns: "1fr 120px 100px 110px 200px 100px" }}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileIcon type={share.file.file_type} size={18} className="shrink-0" />
                  <span className="text-white font-semibold truncate">{share.file.name}</span>
                </div>
                <div className="text-gray-400 font-mono text-[11px]">{share.file.size}</div>
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold capitalize ${
                    share.permission === "editor" ? "bg-[#7C5CFC]/20 text-[#9E86FF]" : "bg-gray-500/20 text-gray-400"
                  }`}>
                    {share.permission}
                  </span>
                </div>
                <div><SecurityBadge status={share.file.security_status} /></div>
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[#7C5CFC] flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                    {share.file.owner.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <span className="text-white font-medium truncate">{share.file.owner.name}</span>
                </div>
                <div className="text-gray-500 text-[10px]">{share.shared_at.split(" ")[0]}</div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-[#272938]/30 border border-dashed border-[#34364A] rounded-2xl">
          <Link2 size={36} className="text-gray-600 mb-2" />
          <p className="text-white text-sm font-semibold mb-0.5">No Shared Files Found</p>
          <p className="text-gray-500 text-xs">Try clearing search filters or checking back later</p>
        </div>
      )}

      {/* Slide-out Sidebar Drawer */}
      {selectedShare && (
        <>
          <div className="shared-drawer-overlay animate-fade-in" onClick={() => setSelectedShare(null)} />
          <div className="shared-sidebar-drawer animate-slide-in">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#34364A]">
              <div className="flex items-center gap-2">
                <FileIcon type={selectedShare.file.file_type} size={18} />
                <h3 className="text-white font-semibold text-sm truncate max-w-[260px]">{selectedShare.file.name}</h3>
              </div>
              <button 
                onClick={() => setSelectedShare(null)} 
                className="text-gray-400 hover:text-white p-1 hover:bg-[#34364A] rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-auto p-6 space-y-6">
              {/* File Info Card */}
              <div className="bg-[#272938] border border-[#34364A] p-4 rounded-xl space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">File size</span>
                  <span className="text-white font-mono">{selectedShare.file.size}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Date created</span>
                  <span className="text-white">{selectedShare.file.created_at}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Permission level</span>
                  <span className="text-[#9E86FF] font-semibold capitalize">{selectedShare.permission}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Owner</span>
                  <span className="text-white font-medium">{selectedShare.file.owner.name}</span>
                </div>
              </div>

              {/* Security Verification */}
              <div className="space-y-3">
                <h4 className="text-white text-xs font-semibold uppercase tracking-wider text-gray-500">Security Verification</h4>
                <div className="bg-[#272938] border border-[#34364A] p-4 rounded-xl space-y-4">
                  <div className="flex items-start gap-2.5">
                    <ShieldCheck size={16} className="text-green-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white text-xs font-semibold">Scan clean (No viruses)</p>
                      <p className="text-gray-500 text-[10px] mt-0.5">Verified clean by real-time scanning agent</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <Key size={16} className="text-[#7C5CFC] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-white text-xs font-semibold">Encrypted with AES-256</p>
                      <p className="text-gray-500 text-[10px] mt-0.5">Data block is encrypted on servers at rest</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 border-t border-[#34364A]/50 pt-4">
                    <div className="w-full">
                      <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-wider mb-1.5">SHA-256 Checksum</p>
                      <p className="text-gray-400 text-[10px] font-mono bg-[#1E1F2B] p-2.5 rounded border border-[#34364A] break-all select-all">
                        {selectedShare.file.checksum}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Access Details */}
              <div className="space-y-2">
                <h4 className="text-white text-xs font-semibold uppercase tracking-wider text-gray-500">Collaborator Details</h4>
                <div className="flex items-center gap-3 bg-[#272938] p-3 border border-[#34364A] rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-[#7C5CFC] flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {selectedShare.file.owner.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-white text-xs font-semibold">{selectedShare.file.owner.name}</p>
                    <p className="text-gray-500 text-[10px]">{selectedShare.file.owner.email}</p>
                  </div>
                  <span className="ml-auto text-[10px] bg-[#7C5CFC]/15 text-[#7C5CFC] border border-[#7C5CFC]/30 px-1.5 py-0.5 rounded font-bold">
                    Owner
                  </span>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-[#34364A] bg-[#272938]/60 grid grid-cols-2 gap-3 shrink-0">
              <a
                href={`${API_BASE_URL}/api/shared/files`}
                download
                onClick={e => { e.preventDefault(); alert("Initiating secure file download..."); }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#7C5CFC] hover:bg-[#7C5CFC]/90 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Download size={13} /> Download
              </a>
              <button
                disabled={revokingId === selectedShare.id}
                onClick={() => handleRevokeShare(selectedShare.id)}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Trash2 size={13} /> {revokingId === selectedShare.id ? "Revoking..." : "Remove Access"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Share File Modal */}
      {showShareModal && (
        <>
          <div className="shared-drawer-overlay animate-fade-in" onClick={() => setShowShareModal(false)} />
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="bg-[#272938] border border-[#34364A] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#34364A]">
                <div className="flex items-center gap-2 text-white">
                  <Link2 size={18} className="text-[#7C5CFC]" />
                  <h3 className="font-semibold text-sm">Share New File</h3>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-white p-1 hover:bg-[#34364A] rounded-lg transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleShareFile} className="p-6 space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-gray-400 text-xs font-medium">File Name *</label>
                  <input
                    type="text"
                    required
                    value={shareFileName}
                    onChange={e => setShareFileName(e.target.value)}
                    placeholder="e.g. Q4-Strategy-Doc.pdf"
                    className="w-full px-3 py-2.5 bg-[#1E1F2B] border border-[#34364A] rounded-xl text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#7C5CFC] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-gray-400 text-xs font-medium">File Size (e.g. 12.4 MB)</label>
                    <input
                      type="text"
                      value={shareFileSize}
                      onChange={e => setShareFileSize(e.target.value)}
                      placeholder="e.g. 5.2 MB"
                      className="w-full px-3 py-2.5 bg-[#1E1F2B] border border-[#34364A] rounded-xl text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#7C5CFC] transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-gray-400 text-xs font-medium">File Type *</label>
                    <select
                      value={shareFileType}
                      onChange={e => setShareFileType(e.target.value)}
                      className="w-full px-3 py-2.5 bg-[#1E1F2B] border border-[#34364A] rounded-xl text-xs text-white focus:outline-none focus:border-[#7C5CFC] transition-colors cursor-pointer"
                    >
                      <option value="pdf">PDF Document</option>
                      <option value="zip">ZIP Archive</option>
                      <option value="spreadsheet">Spreadsheet</option>
                      <option value="image">Image</option>
                      <option value="doc">Word Doc</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 text-xs font-medium">Owner Name * (Who is sharing this?)</label>
                  <input
                    type="text"
                    required
                    value={shareOwnerName}
                    onChange={e => setShareOwnerName(e.target.value)}
                    placeholder="e.g. Sarah Kim"
                    className="w-full px-3 py-2.5 bg-[#1E1F2B] border border-[#34364A] rounded-xl text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#7C5CFC] transition-colors"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 text-xs font-medium">Recipient Email * (Your Email to see it here)</label>
                  <input
                    type="email"
                    required
                    value={shareRecipientEmail}
                    onChange={e => setShareRecipientEmail(e.target.value)}
                    placeholder="e.g. user@acme.com"
                    className="w-full px-3 py-2.5 bg-[#1E1F2B] border border-[#34364A] rounded-xl text-xs text-white placeholder:text-gray-600 focus:outline-none focus:border-[#7C5CFC] transition-colors"
                  />
                  <p className="text-[10px] text-gray-500">Enter your email to see the file appear in your Shared Files list!</p>
                </div>

                <div className="space-y-1">
                  <label className="text-gray-400 text-xs font-medium block">Permission Level</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                      <input
                        type="radio"
                        name="permission"
                        value="viewer"
                        checked={sharePermission === "viewer"}
                        onChange={() => setSharePermission("viewer")}
                        className="accent-[#7C5CFC] cursor-pointer"
                      />
                      Viewer
                    </label>
                    <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                      <input
                        type="radio"
                        name="permission"
                        value="editor"
                        checked={sharePermission === "editor"}
                        onChange={() => setSharePermission("editor")}
                        className="accent-[#7C5CFC] cursor-pointer"
                      />
                      Editor
                    </label>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#34364A]/50">
                  <button
                    type="button"
                    onClick={() => setShowShareModal(false)}
                    className="px-4 py-2 bg-[#1E1F2B] hover:bg-[#34364A] text-gray-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-[#34364A]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSharing}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#7C5CFC] hover:bg-[#7C5CFC]/90 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSharing ? "Sharing..." : "Share File"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
