import React, { useEffect, useMemo, useState } from "react";
import {
  getActivities,
  getUserActivities,
  addActivity,
} from "./activityService";

function ActivityPage() {
  const [activities, setActivities] = useState([]);
  const [userId, setUserId] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [dateRange, setDateRange] = useState("all");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const loadAllActivities = async () => {
    try {
      setLoading(true);

      const data = await getActivities();

      setActivities(data);
      setActiveFilter("All");

      showMessage("All activities loaded successfully");
    } catch (error) {
      console.error(error);
      showMessage("Failed to load activities");
    } finally {
      setLoading(false);
    }
  };

  const loadUserActivities = async () => {
    try {
      setLoading(true);

      const data = await getUserActivities(userId);

      setActivities(data);

      showMessage(`Activities loaded for User ${userId}`);
    } catch (error) {
      console.error(error);
      showMessage("Failed to load user activities");
    } finally {
      setLoading(false);
    }
  };

  const addSampleActivity = async () => {
    try {
      setLoading(true);

      await addActivity({
        user_id: Number(userId),
        action: "File Uploaded",
        file_name: "sample-file.pdf",
        description: "User uploaded a secure file from React frontend",
      });

      const data = await getActivities();
      setActivities(data);

      showMessage("Sample activity added successfully");
    } catch (error) {
      console.error(error);
      showMessage("Failed to add sample activity");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllActivities();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredActivities = useMemo(() => {
    let result = [...activities];

    // Search
    if (searchText.trim()) {
      const search = searchText.toLowerCase();

      result = result.filter((activity) => {
        return (
          String(activity.user_id).includes(search) ||
          (activity.action || "").toLowerCase().includes(search) ||
          (activity.file_name || "").toLowerCase().includes(search) ||
          (activity.description || "").toLowerCase().includes(search)
        );
      });
    }

    // Action filter
    if (activeFilter !== "All") {
      result = result.filter((activity) => {
        const action = (activity.action || "").toLowerCase();

        if (activeFilter === "Uploaded") {
          return action.includes("upload");
        }

        if (activeFilter === "Downloaded") {
          return action.includes("download");
        }

        if (activeFilter === "Shared") {
          return action.includes("share");
        }

        if (activeFilter === "Login") {
          return action.includes("login");
        }

        if (activeFilter === "Failed") {
          return (
            action.includes("fail") ||
            action.includes("blocked") ||
            action.includes("denied")
          );
        }

        return true;
      });
    }

    // Date filter
    if (dateRange !== "all") {
      const now = new Date();
      const days = Number(dateRange);

      result = result.filter((activity) => {
        const createdDate = new Date(activity.created_at);
        const difference = now - createdDate;
        const differenceInDays = difference / (1000 * 60 * 60 * 24);

        return differenceInDays <= days;
      });
    }

    return result;
  }, [activities, searchText, activeFilter, dateRange]);

  const uniqueUsers = new Set(
    activities.map((activity) => activity.user_id)
  ).size;

  const flaggedEvents = activities.filter((activity) => {
    const action = (activity.action || "").toLowerCase();

    return (
      action.includes("failed") ||
      action.includes("denied") ||
      action.includes("suspicious")
    );
  }).length;

  const blockedAttempts = activities.filter((activity) => {
    const action = (activity.action || "").toLowerCase();

    return action.includes("blocked");
  }).length;

  const exportReport = () => {
    if (filteredActivities.length === 0) {
      showMessage("No activities available to export");
      return;
    }

    const headers = [
      "ID",
      "User ID",
      "Action",
      "File Name",
      "Description",
      "Created At",
    ];

    const rows = filteredActivities.map((activity) => [
      activity.id,
      activity.user_id,
      activity.action,
      activity.file_name || "",
      activity.description || "",
      activity.created_at,
    ]);

    const escapeCSV = (value) => {
      const text = String(value ?? "").replace(/"/g, '""');
      return `"${text}"`;
    };

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "activity-report.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    showMessage("Activity report exported successfully");
  };

  return (
    <div style={styles.page}>
      {/* BLUE HEADING BOX */}
      <div style={styles.heroBox}>
        <div>
          <div style={styles.heroLabel}>TRUSTSHARE SECURITY CENTER</div>

          <h1 style={styles.heroTitle}>
            Activity & Audit Log
          </h1>

          <p style={styles.heroSubtitle}>
            Complete audit trail of all workspace activity.
          </p>
        </div>

        <button
          style={styles.exportButton}
          onClick={exportReport}
        >
          ↓ Export Report
        </button>
      </div>

      {/* SEARCH */}
      <div style={styles.searchSection}>
        <div style={styles.searchWrapper}>
          <span style={styles.searchIcon}>⌕</span>

          <input
            type="text"
            placeholder="Search files, users, actions, activity..."
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            style={styles.searchInput}
          />
        </div>

        <div style={styles.liveBadge}>
          ● Live Activity
        </div>
      </div>

      {/* MESSAGE */}
      {message && (
        <div style={styles.messageBox}>
          {message}
        </div>
      )}

      {/* STAT CARDS */}
      <div style={styles.cards}>
        <StatCard
          icon="⌁"
          value={activities.length}
          label="Total Events"
          sub="Recorded activities"
          iconStyle={styles.blueIcon}
        />

        <StatCard
          icon="♙"
          value={uniqueUsers}
          label="Unique Users"
          sub="Active users"
          iconStyle={styles.purpleIcon}
        />

        <StatCard
          icon="⚠"
          value={flaggedEvents}
          label="Flagged Events"
          sub="Need review"
          iconStyle={styles.orangeIcon}
        />

        <StatCard
          icon="♢"
          value={blockedAttempts}
          label="Blocked Attempts"
          sub="Prevented threats"
          iconStyle={styles.redIcon}
        />
      </div>

      {/* FILTER BOX */}
      <div style={styles.filterBox}>
        <select
          value={dateRange}
          onChange={(event) => setDateRange(event.target.value)}
          style={styles.select}
        >
          <option value="all">All time</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>

        <div style={styles.userControl}>
          <span style={styles.userLabel}>User ID</span>

          <input
            type="number"
            min="1"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            style={styles.userInput}
          />
        </div>

        <button
          style={styles.userButton}
          onClick={loadUserActivities}
        >
          Get User
        </button>

        {[
          "All",
          "Uploaded",
          "Downloaded",
          "Shared",
          "Login",
          "Failed",
        ].map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            style={
              activeFilter === filter
                ? styles.activeFilter
                : styles.filterButton
            }
          >
            {filter}
          </button>
        ))}

        <button
          style={styles.refreshButton}
          onClick={loadAllActivities}
        >
          ↻ Refresh
        </button>

        <button
          style={styles.addButton}
          onClick={addSampleActivity}
        >
          + Add Sample
        </button>
      </div>

      {/* RESULT INFO */}
      <div style={styles.resultBar}>
        <span>
          Showing <b>{filteredActivities.length}</b> activities
        </span>

        <span>
          Filter: <b>{activeFilter}</b>
        </span>
      </div>

      {/* TABLE */}
      <div style={styles.tableCard}>
        {loading ? (
          <div style={styles.loadingBox}>
            Loading activities...
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>TIMESTAMP</th>
                <th style={styles.th}>USER</th>
                <th style={styles.th}>ACTION · TARGET</th>
                <th style={styles.th}>DESCRIPTION</th>
                <th style={styles.th}>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan="5" style={styles.empty}>
                    No activities found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredActivities.map((activity) => {
                  const status = getActivityStatus(activity.action);

                  return (
                    <tr key={activity.id}>
                      <td style={styles.td}>
                        <strong>
                          {new Date(
                            activity.created_at
                          ).toLocaleDateString()}
                        </strong>

                        <div style={styles.muted}>
                          {new Date(
                            activity.created_at
                          ).toLocaleTimeString()}
                        </div>
                      </td>

                      <td style={styles.td}>
                        <div style={styles.userCell}>
                          <div style={styles.avatar}>
                            U{activity.user_id}
                          </div>

                          <div>
                            <strong>
                              User {activity.user_id}
                            </strong>

                            <div style={styles.muted}>
                              ID: {activity.user_id}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td style={styles.td}>
                        <strong>
                          {activity.action}
                        </strong>

                        <div style={styles.fileName}>
                          {activity.file_name || "No file target"}
                        </div>
                      </td>

                      <td style={styles.td}>
                        {activity.description || "No description"}
                      </td>

                      <td style={styles.td}>
                        <span
                          style={{
                            ...styles.statusBadge,
                            ...status.style,
                          }}
                        >
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function getActivityStatus(action = "") {
  const value = action.toLowerCase();

  if (
    value.includes("blocked") ||
    value.includes("denied")
  ) {
    return {
      label: "Blocked",
      style: {
        background: "#fee2e2",
        color: "#dc2626",
      },
    };
  }

  if (
    value.includes("failed") ||
    value.includes("suspicious")
  ) {
    return {
      label: "Flagged",
      style: {
        background: "#fef3c7",
        color: "#d97706",
      },
    };
  }

  return {
    label: "Success",
    style: {
      background: "#dcfce7",
      color: "#047857",
    },
  };
}

function StatCard({
  icon,
  value,
  label,
  sub,
  iconStyle,
}) {
  return (
    <div style={styles.statCard}>
      <div
        style={{
          ...styles.iconCircle,
          ...iconStyle,
        }}
      >
        {icon}
      </div>

      <h2 style={styles.statValue}>
        {value}
      </h2>

      <p style={styles.statLabel}>
        {label}
      </p>

      <p style={styles.statSub}>
        {sub}
      </p>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f8fd",
    padding: "28px",
    fontFamily: "Inter, Arial, sans-serif",
    color: "#172033",
  },

  heroBox: {
    background:
      "linear-gradient(135deg, #0f5eea 0%, #2563eb 50%, #4338ca 100%)",
    borderRadius: "24px",
    padding: "34px 38px",
    color: "#ffffff",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 16px 40px rgba(37, 99, 235, 0.24)",
    marginBottom: "24px",
  },

  heroLabel: {
    fontSize: "12px",
    fontWeight: "800",
    letterSpacing: "1.5px",
    opacity: 0.8,
    marginBottom: "10px",
  },

  heroTitle: {
    margin: 0,
    fontSize: "36px",
    fontWeight: "800",
  },

  heroSubtitle: {
    margin: "10px 0 0",
    fontSize: "17px",
    opacity: 0.88,
  },

  exportButton: {
    border: "1px solid rgba(255,255,255,0.45)",
    background: "rgba(255,255,255,0.16)",
    color: "#ffffff",
    borderRadius: "16px",
    padding: "14px 22px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
  },

  searchSection: {
    display: "flex",
    alignItems: "center",
    gap: "18px",
    marginBottom: "24px",
  },

  searchWrapper: {
    flex: 1,
    background: "#ffffff",
    border: "1px solid #dbe4f0",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    padding: "0 18px",
  },

  searchIcon: {
    fontSize: "24px",
    color: "#7890b2",
  },

  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    padding: "16px",
    fontSize: "16px",
    background: "transparent",
  },

  liveBadge: {
    background: "#e8f1ff",
    color: "#1d4ed8",
    borderRadius: "16px",
    padding: "14px 18px",
    fontWeight: "700",
  },

  messageBox: {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "1px solid #bfdbfe",
    padding: "13px 18px",
    borderRadius: "14px",
    marginBottom: "20px",
    fontWeight: "600",
  },

  cards: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },

  statCard: {
    background: "#ffffff",
    border: "1px solid #dfe7f2",
    borderRadius: "22px",
    padding: "26px",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
  },

  iconCircle: {
    width: "54px",
    height: "54px",
    borderRadius: "17px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "23px",
    marginBottom: "20px",
  },

  blueIcon: {
    background: "#eaf2ff",
    color: "#2563eb",
  },

  purpleIcon: {
    background: "#efedff",
    color: "#4f46e5",
  },

  orangeIcon: {
    background: "#fff7df",
    color: "#d97706",
  },

  redIcon: {
    background: "#fff0f0",
    color: "#ef4444",
  },

  statValue: {
    fontSize: "32px",
    margin: 0,
  },

  statLabel: {
    color: "#526581",
    fontSize: "17px",
    margin: "8px 0",
  },

  statSub: {
    color: "#94a3b8",
    margin: 0,
  },

  filterBox: {
    background: "#ffffff",
    border: "1px solid #dfe7f2",
    borderRadius: "22px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "18px",
  },

  select: {
    padding: "11px 14px",
    border: "1px solid #d6e0ed",
    borderRadius: "14px",
    background: "#f8fafc",
    color: "#334155",
    cursor: "pointer",
  },

  userControl: {
    display: "flex",
    alignItems: "center",
    border: "1px solid #d6e0ed",
    borderRadius: "14px",
    overflow: "hidden",
  },

  userLabel: {
    padding: "10px 12px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontWeight: "700",
  },

  userInput: {
    width: "62px",
    padding: "11px",
    border: "none",
    outline: "none",
  },

  userButton: {
    padding: "11px 16px",
    border: "none",
    borderRadius: "14px",
    background: "#0f5eea",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
  },

  activeFilter: {
    padding: "10px 17px",
    border: "none",
    borderRadius: "999px",
    background: "#2563eb",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 5px 12px rgba(37,99,235,0.25)",
  },

  filterButton: {
    padding: "10px 17px",
    border: "none",
    borderRadius: "999px",
    background: "#edf2f7",
    color: "#526581",
    fontWeight: "700",
    cursor: "pointer",
  },

  refreshButton: {
    padding: "11px 16px",
    border: "1px solid #bfdbfe",
    borderRadius: "14px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontWeight: "700",
    cursor: "pointer",
  },

  addButton: {
    marginLeft: "auto",
    padding: "11px 17px",
    border: "none",
    borderRadius: "14px",
    background: "#16a34a",
    color: "#ffffff",
    fontWeight: "700",
    cursor: "pointer",
  },

  resultBar: {
    display: "flex",
    justifyContent: "space-between",
    color: "#64748b",
    padding: "0 4px 14px",
  },

  tableCard: {
    background: "#ffffff",
    border: "1px solid #dfe7f2",
    borderRadius: "22px",
    overflowX: "auto",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.05)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
  },

  th: {
    padding: "20px",
    textAlign: "left",
    color: "#8194b2",
    fontSize: "13px",
    background: "#f8fafc",
  },

  td: {
    padding: "20px",
    borderTop: "1px solid #edf2f7",
    color: "#334155",
    verticalAlign: "middle",
  },

  userCell: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  avatar: {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
  },

  fileName: {
    color: "#7c8da8",
    marginTop: "5px",
  },

  muted: {
    color: "#94a3b8",
    marginTop: "4px",
    fontSize: "13px",
  },

  statusBadge: {
    display: "inline-block",
    padding: "7px 13px",
    borderRadius: "999px",
    fontWeight: "800",
    fontSize: "13px",
  },

  empty: {
    textAlign: "center",
    padding: "42px",
    color: "#94a3b8",
  },

  loadingBox: {
    padding: "50px",
    textAlign: "center",
    color: "#2563eb",
    fontWeight: "700",
  },
};

export default ActivityPage;