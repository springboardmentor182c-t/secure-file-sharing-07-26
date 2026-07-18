import React, { useEffect, useState } from "react";
import axios from "axios";
import "./AuditReports.css";
import { Download } from "lucide-react";
import { BASE_URL } from "../constants/api";

const AuditTab = () => {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const res = await axios.get(
  `${BASE_URL}/admin/audit-reports`
);
      setReports(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const downloadReport = () => {
    window.open(
  `${BASE_URL}/admin/audit-reports/download`,
  "_blank"
);
  };

  return (
    <div className="audit-card">
      <div className="audit-header">
        <h2>Audit Reports</h2>

        <button className="export-btn" onClick={downloadReport}>
          <Download size={18} />
          Export All
        </button>
      </div>

      <table className="audit-table">
        <thead>
          <tr>
            <th>Report</th>
            <th>Period</th>
            <th>Generated</th>
            <th>Events</th>
            <th>Findings</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {reports.map((item, index) => (
            <tr key={index}>
              <td>{item.report}</td>
              <td>{item.period}</td>
              <td>{item.generated}</td>
              <td>{item.events}</td>
              <td>{item.findings}</td>
              <td>
                <button
                  className="download"
                  onClick={downloadReport}
                >
                  <Download size={16} />
                  Download
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AuditTab;