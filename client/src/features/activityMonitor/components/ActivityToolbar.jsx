export default function ActivityToolbar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  exportLogs,
}) {
  return (
    <div className="toolbar">
      <input
        type="text"
        placeholder="Search logs..."
        className="search-box"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="filters">
        {["All", "Success", "Warning", "Danger"].map((status) => (
          <button
            key={status}
            className={
              statusFilter === status
                ? "filter active"
                : "filter"
            }
            onClick={() => setStatusFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      <button
        className="export-btn"
        onClick={exportLogs}
      >
        Export
      </button>
    </div>
  );
}