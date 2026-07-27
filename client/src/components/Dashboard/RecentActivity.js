import "./RecentActivity.css";
import { useNavigate } from "react-router-dom";

export default function RecentActivity({ activities }) {
  return (
    <div className="recent-activity">
      <h3>Recent Activity</h3>

      {activities.map((item) => (
        <div className="activity-card" key={item.id}>
          <div className="activity-info">
            <div className={`activity-dot ${item.status}`}></div>

            <div>
              <h4>
                {item.username} — {item.action}
              </h4>

              <p>{item.time}</p>
            </div>
          </div>

          <span className={`status ${item.status}`}>
            {item.status}
          </span>
        </div>
      ))}
    </div>
  );
}