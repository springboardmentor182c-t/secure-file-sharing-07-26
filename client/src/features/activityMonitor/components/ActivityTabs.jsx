export default function ActivityTabs({ activeTab, setActiveTab }) {
  return (
    <div className="tabs">
      <button
        className={activeTab === "audit" ? "tab active" : "tab"}
        onClick={() => setActiveTab("audit")}
      >
        Audit Log
      </button>

      <button
        className={activeTab === "login" ? "tab active" : "tab"}
        onClick={() => setActiveTab("login")}
      >
        Login History
      </button>

      <button
        className={activeTab === "security" ? "tab active" : "tab"}
        onClick={() => setActiveTab("security")}
      >
        Security Events
      </button>
    </div>
  );
}