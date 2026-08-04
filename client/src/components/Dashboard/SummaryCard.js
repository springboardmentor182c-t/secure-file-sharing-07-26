import "./SummaryCard.css";
import {
  FaFolder,
  FaHdd,
  FaShareAlt,
  FaShieldAlt,
} from "react-icons/fa";

export default function SummaryCard({
  title,
  value,
  subtitle,
}) {
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

  return (
    <div className="summary-card">
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