import { useEffect, useMemo, useState } from "react";
import "./ActivityMonitor.css";

import {
  getAuditLogs,
  getLoginHistory,
  getSecurityEvents,
} from "./services/activityService";

import ActivityTabs from "./components/ActivityTabs";
import ActivityToolbar from "./components/ActivityToolbar";

export default function ActivityMonitor() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("audit");

  useEffect(() => {
  loadLogs();
}, [activeTab]);

  async function loadLogs() {
  try {
    let data;

    if (activeTab === "audit") {
      data = await getAuditLogs();
    } else if (activeTab === "login") {
      data = await getLoginHistory();
    } else {
      data = await getSecurityEvents();
    }

    setLogs(data);
  } catch (err) {
    console.error(err);
  }
}

  function formatTime(timestamp) {
    return new Date(timestamp).toLocaleString();
  }

  function getStatusClass(status) {
    switch (status.toLowerCase()) {
      case "success":
        return "success";
      case "warning":
        return "warning";
      case "danger":
        return "danger";
      default:
        return "";
    }
  }

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.user_name.toLowerCase().includes(search.toLowerCase()) ||
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        (log.resource || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ||
        log.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [logs, search, statusFilter]);

  function exportLogs() {
    const headers = [
      "Time",
      "User",
      "Action",
      "Resource",
      "IP Address",
      "Status",
    ];

    const rows = filteredLogs.map((log) => [
      formatTime(log.timestamp),
      log.user_name,
      log.action,
      log.resource || "-",
      log.ip_address,
      log.status,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "audit_logs.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  return (
    <div className="activity-page">
      <h1 className="page-title">Activity Monitor</h1>

      <ActivityTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <ActivityToolbar
        search={search}
        setSearch={setSearch}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        exportLogs={exportLogs}
      />

      <div className="table-container">
        <table>
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
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td>{formatTime(log.timestamp)}</td>
                <td>{log.user_name}</td>
                <td>{log.action}</td>
                <td>{log.resource || "-"}</td>
                <td>{log.ip_address}</td>
                <td>
                  <span className={getStatusClass(log.status)}>
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}