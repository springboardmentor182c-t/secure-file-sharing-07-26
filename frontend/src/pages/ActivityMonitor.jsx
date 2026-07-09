import { useEffect, useState } from "react";
import "./ActivityMonitor.css";

function ActivityMonitor() {
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Function to fetch activity logs
  const fetchLogs = () => {
    fetch("http://localhost:5000/api/activity")
      .then((res) => res.json())
      .then((data) => setLogs(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchLogs();

    // Refresh every 5 seconds
    const interval = setInterval(fetchLogs, 5000);

    return () => clearInterval(interval);
  }, []);

  const filteredLogs = logs.filter((log) => {
    const user = log.user || "";
    const action = log.action || "";
    const file = log.file || "";
    const status = log.status || "";

    const matchSearch =
      user.toLowerCase().includes(search.toLowerCase()) ||
      action.toLowerCase().includes(search.toLowerCase()) ||
      file.toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === "all"
        ? true
        : status.toLowerCase() === filter;

    return matchSearch && matchFilter;
  });

  return (
    <div className="activity-page">
      <h1>Activity Monitor</h1>

      <div className="toolbar">
        <input
          type="text"
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </button>

        <button
          className={filter === "success" ? "active" : ""}
          onClick={() => setFilter("success")}
        >
          Success
        </button>

        <button
          className={filter === "warning" ? "active" : ""}
          onClick={() => setFilter("warning")}
        >
          Warning
        </button>

        <button
          className={filter === "danger" ? "active" : ""}
          onClick={() => setFilter("danger")}
        >
          Danger
        </button>
      </div>

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
          {filteredLogs.length > 0 ? (
            filteredLogs.map((log) => (
              <tr key={log._id}>
                <td>{log.time}</td>

                <td>
                  <div className="user">
                    <div className="avatar">
                      {log.user
                        ? log.user
                            .split(" ")
                            .map((name) => name[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()
                        : "U"}
                    </div>

                    {log.user || "Unknown"}
                  </div>
                </td>

                <td>{log.action || "-"}</td>

                <td>{log.file || "-"}</td>

                <td>{log.ip || "-"}</td>

                <td>
                  <span
                    className={`status ${(log.status || "").toLowerCase()}`}
                  >
                    {log.status || "-"}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                No activity found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="footer">
        <span>Showing {filteredLogs.length} activities</span>

        <div className="pages">
          <button>&lt;</button>
          <button className="current">1</button>
          <button>&gt;</button>
        </div>
      </div>
    </div>
  );
}

export default ActivityMonitor;