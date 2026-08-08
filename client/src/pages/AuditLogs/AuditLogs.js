import React, { useState, useEffect } from "react";
import { ClipboardList, Search, ShieldAlert, ShieldCheck, AlertCircle, Download, RefreshCw, CheckCircle2, Radio } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function AuditLogsView() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchAuditLogs = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE_URL}/api/audit/logs`);
      if (!res.ok) {
        throw new Error(`Failed to load audit logs (HTTP ${res.status})`);
      }
      const data = await res.json();
      setLogs(data.logs || []);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();

    // Live Real-Time 5-Second Interval Polling across modules
    const interval = setInterval(() => {
      fetchAuditLogs(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(search.toLowerCase()) ||
      log.id.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = categoryFilter === "all" || log.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesSeverity =
      severityFilter === "all" ||
      log.severity.toLowerCase() === severityFilter.toLowerCase() ||
      (severityFilter.toLowerCase() === "info" && (log.severity.toLowerCase() === "low" || log.severity.toLowerCase() === "info")) ||
      (severityFilter.toLowerCase() === "low" && (log.severity.toLowerCase() === "low" || log.severity.toLowerCase() === "info"));

    return matchesSearch && matchesCategory && matchesSeverity;
  });

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case "critical":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30">Critical</span>;
      case "high":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30">High</span>;
      case "medium":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30">Medium</span>;
      case "low":
      case "info":
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-500/20 text-blue-400 border border-blue-500/30">Info</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Success":
        return <span className="inline-flex items-center gap-1 text-green-400 text-xs font-medium"><CheckCircle2 size={12} /> Success</span>;
      case "Blocked":
      case "Denied":
        return <span className="inline-flex items-center gap-1 text-red-400 text-xs font-medium"><ShieldAlert size={12} /> {status}</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-amber-400 text-xs font-medium"><AlertCircle size={12} /> {status}</span>;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-white animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#34364A] pb-4">
        <p className="text-xs text-gray-400">Live background polling recording access attempts, security mitigations, and module events.</p>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
            <Radio size={14} className="animate-pulse text-green-400" /> Live Polling {lastUpdated && `(${lastUpdated})`}
          </div>

          <button
            onClick={() => fetchAuditLogs()}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#272938] hover:bg-[#34364A] border border-[#34364A] text-gray-300 hover:text-white rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Now
          </button>
        </div>
      </div>

      {/* Audit Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#272938] border border-[#34364A] rounded-2xl p-5">
          <p className="text-gray-400 text-xs font-medium mb-1">Total Live Records</p>
          <p className="text-white text-2xl font-bold">{logs.length}</p>
          <p className="text-gray-500 text-xs mt-1">Recorded in database</p>
        </div>

        <div className="bg-[#272938] border border-[#34364A] rounded-2xl p-5">
          <p className="text-gray-400 text-xs font-medium mb-1">Blocked Security Attacks</p>
          <p className="text-red-400 text-2xl font-bold">{logs.filter(l => l.status === "Blocked").length}</p>
          <p className="text-gray-500 text-xs mt-1">Threat mitigations</p>
        </div>

        <div className="bg-[#272938] border border-[#34364A] rounded-2xl p-5">
          <p className="text-gray-400 text-xs font-medium mb-1">File & Link Access</p>
          <p className="text-[#7C5CFC] text-2xl font-bold">{logs.filter(l => l.category === "File Access").length}</p>
          <p className="text-gray-500 text-xs mt-1">Shared link downloads & views</p>
        </div>

        <div className="bg-[#272938] border border-[#34364A] rounded-2xl p-5">
          <p className="text-gray-400 text-xs font-medium mb-1">Successful Executions</p>
          <p className="text-green-400 text-2xl font-bold">{logs.filter(l => l.status === "Success").length}</p>
          <p className="text-gray-500 text-xs mt-1">Clean audit events</p>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#272938] border border-[#34364A] p-4 rounded-2xl">
        <div className="relative w-full md:w-80">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by User, IP, or Event..."
            className="pl-9 pr-4 py-2 bg-[#1E1F2B] border border-[#34364A] rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#7C5CFC] w-full"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#1E1F2B] border border-[#34364A] rounded-xl text-xs text-white outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              <option value="authentication">Authentication</option>
              <option value="security threat">Security Threat</option>
              <option value="file access">File Access</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="px-3 py-1.5 bg-[#1E1F2B] border border-[#34364A] rounded-xl text-xs text-white outline-none cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="info">Info</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#272938] border border-[#34364A] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400 flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-[#7C5CFC] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs">Fetching live database audit logs...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#1E1F2B] text-gray-400 uppercase font-semibold border-b border-[#34364A]">
                <tr>
                  <th className="px-5 py-3.5">Log ID</th>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Actor / IP</th>
                  <th className="px-5 py-3.5">Event Action</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Severity</th>
                  <th className="px-5 py-3.5">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#34364A]/50">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-[#1E1F2B]/60 transition cursor-pointer"
                    >
                      <td className="px-5 py-3.5 font-mono text-gray-400">{log.id}</td>
                      <td className="px-5 py-3.5 text-gray-300 font-mono text-[11px]">{log.timestamp}</td>
                      <td className="px-5 py-3.5 font-medium text-white">{log.user}</td>
                      <td className="px-5 py-3.5 font-mono text-[#7C5CFC] font-semibold">{log.action}</td>
                      <td className="px-5 py-3.5 text-gray-300">{log.category}</td>
                      <td className="px-5 py-3.5">{getSeverityBadge(log.severity)}</td>
                      <td className="px-5 py-3.5">{getStatusBadge(log.status)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-gray-500">
                      No audit log events recorded in database yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#272938] border border-[#34364A] rounded-2xl p-6 max-w-lg w-full space-y-4">
            <div className="flex items-center justify-between border-b border-[#34364A] pb-3">
              <h3 className="text-base font-bold">Audit Record Details ({selectedLog.id})</h3>
              <button onClick={() => setSelectedLog(null)} className="text-gray-400 hover:text-white cursor-pointer">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between p-2 bg-[#1E1F2B] rounded-lg">
                <span className="text-gray-400">Timestamp:</span>
                <span className="font-mono text-white">{selectedLog.timestamp}</span>
              </div>
              <div className="flex justify-between p-2 bg-[#1E1F2B] rounded-lg">
                <span className="text-gray-400">Actor / Initiator:</span>
                <span className="font-medium text-white">{selectedLog.user}</span>
              </div>
              <div className="flex justify-between p-2 bg-[#1E1F2B] rounded-lg">
                <span className="text-gray-400">Action Code:</span>
                <span className="font-mono text-[#7C5CFC] font-semibold">{selectedLog.action}</span>
              </div>
              <div className="p-3 bg-[#1E1F2B] rounded-lg border border-[#34364A]">
                <span className="block text-gray-400 mb-1 font-semibold">Audit Event Description:</span>
                <p className="text-gray-200">{selectedLog.details}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-[#7C5CFC] hover:bg-[#6847EC] text-white text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AuditLogsView;
