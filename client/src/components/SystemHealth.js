import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SystemHealth.css";
import { BASE_URL } from "../constants/api";

import {
  Zap,
  Database,
  HardDrive,
  Wifi,
  Cpu,
  AlertCircle,
  CheckCircle2,
  TriangleAlert,
} from "lucide-react";

const SystemHealthTab = () => {
  const [health, setHealth] = useState({
    api_response_time: "",
    database_load: "",
    storage_io: "",
    active_connections: 0,
    cpu_usage: "",
    error_rate: "",
    recent_events: [],
  });

  useEffect(() => {
    loadHealth();
  }, []);

  const loadHealth = async () => {
    try {
      const res = await axios.get(
  `${BASE_URL}/admin/system-health`
);

      setHealth(res.data);
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div className="health-container">

      <div className="health-grid">

        <div className="health-card">
          <div className="health-left">
            <Zap className="health-icon green" size={22} />
            <div>
              <p>API Response Time</p>
              <h2>{health.api_response_time}</h2>
            </div>
          </div>
          <CheckCircle2 className="status-icon" size={20} />
        </div>

        <div className="health-card">
          <div className="health-left">
            <Database className="health-icon green" size={22} />
            <div>
              <p>Database Load</p>
              <h2>{health.database_load}</h2>
            </div>
          </div>
          <CheckCircle2 className="status-icon" size={20} />
        </div>

        <div className="health-card">
          <div className="health-left">
            <HardDrive className="health-icon green" size={22} />
            <div>
              <p>Storage I/O</p>
              <h2>{health.storage_io}</h2>
            </div>
          </div>
          <CheckCircle2 className="status-icon" size={20} />
        </div>

        <div className="health-card">
          <div className="health-left">
            <Wifi className="health-icon green" size={22} />
            <div>
              <p>Active Connections</p>
              <h2>{health.active_connections}</h2>
            </div>
          </div>
          <CheckCircle2 className="status-icon" size={20} />
        </div>

        <div className="health-card">
          <div className="health-left">
            <Cpu className="health-icon green" size={22} />
            <div>
              <p>CPU Usage</p>
              <h2>{health.cpu_usage}</h2>
            </div>
          </div>
          <CheckCircle2 className="status-icon" size={20} />
        </div>

        <div className="health-card">
          <div className="health-left">
            <AlertCircle className="health-icon green" size={22} />
            <div>
              <p>Error Rate (24h)</p>
              <h2>{health.error_rate}</h2>
            </div>
          </div>
          <CheckCircle2 className="status-icon" size={20} />
        </div>

      </div>
      <div className="events-card">

        <h3>Recent System Events</h3>

        {health.recent_events.map((event, index) => (
          <div
            key={index}
            className={`event-row ${
              event.event.toLowerCase().includes("quota") ? "warning" : ""
            }`}
          >
            <div className="event-left">
              {event.event.toLowerCase().includes("quota") ? (
                <TriangleAlert className="warn" size={18} />
              ) : (
                <CheckCircle2 className="ok" size={18} />
              )}

              {event.event}
            </div>

            <span>{event.time}</span>
          </div>
        ))}

      </div>

    </div>
  );
};

export default SystemHealthTab;