import "./SummaryCard.css";
import {
  FaFolder,
  FaHdd,
  FaShareAlt,
  FaShieldAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function SummaryCard({
  title,
  value,
  subtitle,
}) {
  const navigate = useNavigate();

  const getIcon = () => {
    switch (title) {
      case "Total Files":
        return <FaFolder />;

      case "Storage Used":
        return <FaHdd />;

      case "Active Shares":
        return <FaShareAlt />;

      case "Security Events":
        return <FaShieldAlt />;

      default:
        return null;
    }
  };

  const routes = {
    "Total Files": "/files",
    "Storage Used": "/storage",
    "Active Shares": "/sharing",
    "Security Events": "/activity",
  };

  return (
    <div
      className="summary-card"
      style={{ cursor: "pointer" }}
      onClick={() => navigate(routes[title])}
    >
      <div className="summary-header">
        <h4>{title}</h4>

        <div className="summary-icon">
          {getIcon()}
        </div>
      </div>

      <h2>{value}</h2>

      <p>{subtitle}</p>
    </div>
  );
}