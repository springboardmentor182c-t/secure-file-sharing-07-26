import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Download,
  Eye,
  Share2,
  HardDrive,
  FileText,
  Clock,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Activity,
  Layers
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { fetchAnalyticsOverview } from "../features/sharedLinks/services/sharedLinksApi";
import "./analytics-theme.css";

// Utility: Format raw bytes into human readable string (KB, MB, GB)
function formatBytes(bytes, decimals = 2) {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

// Utility: Format ISO timestamp
function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return dateStr;
  }
}

export function AnalyticsView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [topFilesMetric, setTopFilesMetric] = useState("views"); // 'views' | 'downloads'

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchAnalyticsOverview();
      setData(res);
    } catch (err) {
      console.error("Error loading analytics overview:", err);
      setError(err.message || "Failed to load analytics data from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  const stats = data?.stats || {
    active_links: 0,
    total_views: 0,
    total_downloads: 0,
    expiring_soon: 0,
    total_files: 0,
    total_storage_bytes: 0
  };

  const monthlyActivity = data?.monthly_activity || [];
  const mostViewedFiles = data?.most_viewed_files || [];
  const mostDownloadedFiles = data?.most_downloaded_files || [];
  const recentActivity = data?.recent_activity || [];

  const topFilesList = topFilesMetric === "views" ? mostViewedFiles : mostDownloadedFiles;

  return (
    <div className="space-y-6 text-[#C5C3C4] relative animate-fade-in analytics-theme">
      {/* Top Action Bar */}
      <div className="flex justify-end mb-2">
        <button
          onClick={loadAnalytics}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-[#272938] hover:bg-[#323548] text-white border border-[#34364A] rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#7C5CFC] ${loading ? "animate-spin" : ""}`} />
          Refresh Stats
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-between text-red-400">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span className="text-xs font-medium">{error}</span>
          </div>
          <button
            onClick={loadAnalytics}
            className="text-xs underline hover:text-red-300 font-semibold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton View */}
      {loading && !data ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-[#272938] border border-[#34364A] rounded-2xl animate-pulse p-5" />
          ))}
        </div>
      ) : (
        <>
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Active Links Card */}
            <div className="bg-[#272938] border border-[#34364A] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                  Active Shared Links
                </span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#7C5CFC]/20">
                  <Share2 size={16} className="text-[#7C5CFC]" />
                </div>
              </div>
              <p className="text-white text-2xl font-bold mb-0.5">
                {stats.active_links.toLocaleString()}
              </p>
              <p className="text-gray-500 text-xs flex items-center gap-1">
                <span className="text-emerald-400 font-semibold">{stats.expiring_soon}</span> expiring soon
              </p>
            </div>

            {/* Total File Views Card */}
            <div className="bg-[#272938] border border-[#34364A] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                  Total File Views
                </span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-sky-500/20">
                  <Eye size={16} className="text-sky-400" />
                </div>
              </div>
              <p className="text-white text-2xl font-bold mb-0.5">
                {stats.total_views.toLocaleString()}
              </p>
              <p className="text-gray-500 text-xs">
                Public link views registered
              </p>
            </div>

            {/* Total Downloads Card */}
            <div className="bg-[#272938] border border-[#34364A] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                  Total Downloads
                </span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-500/20">
                  <Download size={16} className="text-emerald-400" />
                </div>
              </div>
              <p className="text-white text-2xl font-bold mb-0.5">
                {stats.total_downloads.toLocaleString()}
              </p>
              <p className="text-gray-500 text-xs">
                Successful file downloads
              </p>
            </div>

            {/* Total Storage Used Card */}
            <div className="bg-[#272938] border border-[#34364A] rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">
                  Total Storage Used
                </span>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-purple-500/20">
                  <HardDrive size={16} className="text-purple-400" />
                </div>
              </div>
              <p className="text-white text-2xl font-bold mb-0.5">
                {formatBytes(stats.total_storage_bytes)}
              </p>
              <p className="text-gray-500 text-xs">
                Across <span className="text-white font-medium">{stats.total_files}</span> files
              </p>
            </div>
          </div>

          {/* Activity Chart & Storage Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Area Chart: Monthly Creation vs Access Events */}
            <div className="lg:col-span-2 bg-[#272938] border border-[#34364A] rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-white text-base font-semibold flex items-center gap-2">
                    <Activity size={18} className="text-[#7C5CFC]" />
                    Activity & Usage Trends
                  </h2>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Monthly link creations vs. total access events (views & downloads)
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#7C5CFC]" />
                    <span className="text-gray-400">Created Links</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                    <span className="text-gray-400">Access Events</span>
                  </div>
                </div>
              </div>

              <div className="h-64 w-full">
                {monthlyActivity.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500 text-xs">
                    No activity trends recorded yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monthlyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7C5CFC" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorAccess" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#34364A" vertical={false} />
                      <XAxis dataKey="label" stroke="#8B879A" fontSize={11} tickLine={false} />
                      <YAxis stroke="#8B879A" fontSize={11} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ backgroundColor: "#272938", borderColor: "#34364A", borderRadius: "10px", color: "#FFF", fontSize: "12px" }} />
                      <Area type="monotone" dataKey="created" name="Links Created" stroke="#7C5CFC" strokeWidth={2} fillOpacity={1} fill="url(#colorCreated)" />
                      <Area type="monotone" dataKey="access" name="Access Events" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorAccess)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Quick Metrics Summary Sidebar */}
            <div className="bg-[#272938] border border-[#34364A] rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-white text-base font-semibold flex items-center gap-2 mb-1">
                  <Layers size={18} className="text-purple-400" />
                  Sharing Health Summary
                </h2>
                <p className="text-gray-400 text-xs mb-5">
                  Key security metrics for your shared resources
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-[#1E1F2B] border border-[#34364A] rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-xs font-medium text-gray-300">Active Shared Links</span>
                    </div>
                    <span className="text-xs font-bold text-white">{stats.active_links}</span>
                  </div>

                  <div className="p-3 bg-[#1E1F2B] border border-[#34364A] rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-amber-500" />
                      <span className="text-xs font-medium text-gray-300">Expiring Soon (7d)</span>
                    </div>
                    <span className="text-xs font-bold text-amber-400">{stats.expiring_soon}</span>
                  </div>

                  <div className="p-3 bg-[#1E1F2B] border border-[#34364A] rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-sky-500" />
                      <span className="text-xs font-medium text-gray-300">View-to-Download Ratio</span>
                    </div>
                    <span className="text-xs font-bold text-sky-400">
                      {stats.total_downloads > 0
                        ? (stats.total_views / stats.total_downloads).toFixed(1) + "x"
                        : "N/A"}
                    </span>
                  </div>

                  <div className="p-3 bg-[#1E1F2B] border border-[#34364A] rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span className="text-xs font-medium text-gray-300">Total Storage Space</span>
                    </div>
                    <span className="text-xs font-bold text-purple-400">
                      {formatBytes(stats.total_storage_bytes)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Grid: Top Shared Files & Recent Access Activity Log */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Shared Files Table */}
            <div className="bg-[#272938] border border-[#34364A] rounded-2xl p-6 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-white text-base font-semibold flex items-center gap-2">
                    <TrendingUp size={18} className="text-emerald-400" />
                    Top Performing Files
                  </h2>
                  <p className="text-gray-400 text-xs mt-0.5">
                    Most accessed files across active and archived links
                  </p>
                </div>

                {/* Metric Selector Toggle */}
                <div className="flex bg-[#1E1F2B] border border-[#34364A] p-1 rounded-xl self-start sm:self-auto">
                  <button
                    onClick={() => setTopFilesMetric("views")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      topFilesMetric === "views"
                        ? "bg-[#7C5CFC] text-white shadow-sm"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    By Views
                  </button>
                  <button
                    onClick={() => setTopFilesMetric("downloads")}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      topFilesMetric === "downloads"
                        ? "bg-[#7C5CFC] text-white shadow-sm"
                        : "text-gray-400 hover:text-white"
                    }`}
                  >
                    By Downloads
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto analytics-custom-scrollbar flex-1">
                {topFilesList.length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-gray-500 text-xs italic">
                    No top file records found yet.
                  </div>
                ) : (
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#34364A] text-gray-400 font-semibold uppercase tracking-wider">
                        <th className="py-2.5 px-3">#</th>
                        <th className="py-2.5 px-3">File Name</th>
                        <th className="py-2.5 px-3 text-right">
                          {topFilesMetric === "views" ? "Views" : "Downloads"}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#34364A]/50">
                      {topFilesList.map((item, index) => (
                        <tr key={item.file_id || index} className="hover:bg-[#323548]/50 transition-colors">
                          <td className="py-3 px-3 font-semibold text-[#7C5CFC] w-8">
                            {index + 1}
                          </td>
                          <td className="py-3 px-3 font-medium text-white flex items-center gap-2">
                            <FileText size={16} className="text-gray-400 shrink-0" />
                            <span className="truncate max-w-[200px]" title={item.file_name}>
                              {item.file_name}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-emerald-400">
                            {item.value.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            {/* Recent File Access Log */}
            <div className="bg-[#272938] border border-[#34364A] rounded-2xl p-6 flex flex-col">
              <div className="mb-5">
                <h2 className="text-white text-base font-semibold flex items-center gap-2">
                  <Clock size={18} className="text-sky-400" />
                  Recent Access Activity Log
                </h2>
                <p className="text-gray-400 text-xs mt-0.5">
                  Audit record of public views and file download requests
                </p>
              </div>

              <div className="overflow-x-auto analytics-custom-scrollbar flex-1 max-h-[300px]">
                {recentActivity.length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-gray-500 text-xs italic">
                    No recent file access events recorded.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {recentActivity.map((log, index) => (
                      <div
                        key={index}
                        className="p-3 bg-[#1E1F2B] border border-[#34364A] rounded-xl flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {log.success ? (
                            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                          ) : (
                            <XCircle size={16} className="text-red-400 shrink-0" />
                          )}
                          <div className="min-w-0">
                            <div className="font-semibold text-white truncate max-w-[180px]" title={log.file_name}>
                              {log.file_name}
                            </div>
                            <div className="text-gray-400 text-[11px] capitalize flex items-center gap-2 mt-0.5">
                              <span className="font-medium text-[#7C5CFC]">{log.action}</span>
                              <span>•</span>
                              <span>{formatDate(log.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase border ${
                            log.success
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-red-500/10 text-red-400 border-red-500/20"
                          }`}
                        >
                          {log.success ? "Success" : "Failed"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AnalyticsView;
