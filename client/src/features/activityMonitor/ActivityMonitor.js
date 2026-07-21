import { useEffect, useMemo, useState } from "react";
import "./ActivityMonitor.css";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const TABS = [
  { key: "audit", label: "Audit Log" },
  { key: "login", label: "Login History" },
  { key: "security", label: "Security Events" },
];

const STATUS_LABELS = ["All", "Success", "Warning", "Danger"];

export default function ActivityMonitor() {
  const [activities, setActivities] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("audit");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadActivities();
  }, []);

  async function loadActivities() {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/activity/`);

      const data = await res.json();
      setActivities(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load activities:", err);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  }

  function formatTime(value) {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  }

  function getStatusClass(status) {
    const s = String(status || "").toLowerCase();

    if (s === "success") return "status success";
    if (s === "warning") return "status warning";
    if (s === "danger") return "status danger";

    return "status";
  }

  function getInitials(name) {
    if (!name) return "?";

    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }

  function classifyTab(action = "") {
    const lower = action.toLowerCase();

    if (lower.includes("login")) return "login";

    if (
      lower.includes("share") ||
      lower.includes("permission") ||
      lower.includes("security") ||
      lower.includes("backup")
    ) {
      return "security";
    }

    return "audit";
  }

  const filteredActivities = useMemo(() => {
    return activities.filter((item) => {
      const tabMatch = classifyTab(item.action) === activeTab;

      const searchText = `${item.username || ""} ${item.action || ""} ${
        item.file_name || ""
      } ${item.resource || ""} ${item.ip_address || ""} ${
        item.details || ""
      }`.toLowerCase();

      const searchMatch = searchText.includes(search.toLowerCase());

      const statusMatch =
        statusFilter === "All" ||
        String(item.status || "").toLowerCase() ===
          statusFilter.toLowerCase();

      return tabMatch && searchMatch && statusMatch;
    });
  }, [activities, activeTab, search, statusFilter]);

  return (
    <div className="activity-page">
      <div className="activity-header">
        <h1>Activity Monitor</h1>

        <div className="activity-tabs">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              className={activeTab === tab.key ? "tab active" : "tab"}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="activity-card">
        <div className="toolbar">
          <input
            type="text"
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />

          <div className="status-filters">
            {STATUS_LABELS.map((label) => (
              <button
                key={label}
                className={statusFilter === label ? "pill active" : "pill"}
                onClick={() => setStatusFilter(label)}
              >
                {label}
              </button>
            ))}
          </div>

          <button className="export-btn" onClick={() => window.print()}>
            Export
          </button>
        </div>

        <div className="table-wrap">
          <table className="activity-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>User</th>
                <th>Action</th>
                <th>File / Resource</th>
                <th>IP Address</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    Loading...
                  </td>
                </tr>
              ) : filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-cell">
                    No activity found
                  </td>
                </tr>
              ) : (
                filteredActivities.map((item) => (
                  <tr key={item.id}>
                    <td>{formatTime(item.created_at)}</td>

                    <td>
                      <div className="user-cell">
                        <span className="avatar">
                          {getInitials(item.username)}
                        </span>
                        <span>{item.username}</span>
                      </div>
                    </td>

                    <td>{item.action}</td>

                    <td>{item.resource || item.file_name || "-"}</td>

                    <td>{item.ip_address || "-"}</td>

                    <td>
                      <span className={getStatusClass(item.status)}>
                        {String(item.status || "").toLowerCase()}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}