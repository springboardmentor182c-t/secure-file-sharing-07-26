import "./QuickActions.css";
import { useNavigate } from "react-router-dom";

export default function QuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      title: "Upload File",
      path: "/upload",
    },
    {
      title: "Share File",
      path: "/sharing",
    },
    {
      title: "Create Folder",
      path: "/files",
    },
    {
      title: "Manage Users",
      path: "/users",
    },
  ];

  return (
    <div className="quick-actions">
      <h3>Quick Actions</h3>

      <div className="action-grid">
        {actions.map((action) => (
          <button
            key={action.title}
            type="button"
            onClick={() => navigate(action.path)}
          >
            {action.title}
          </button>
        ))}
      </div>
    </div>
  );
}