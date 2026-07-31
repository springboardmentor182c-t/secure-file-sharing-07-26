import React, { useEffect, useState } from "react";
import { listFiles } from "../../features/aiFileSummary/services/aiSummaryApi";
import FileSummaryRow from "./FileSummaryRow";

export default function AiSummary() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await listFiles();
        setFiles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div style={{ padding: "24px" }}>
      <h2>AI File Summary</h2>
      <p style={{ opacity: 0.7 }}>
        Select a file below to generate an AI-powered summary.
      </p>

      {loading && <p>Loading files...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {!loading && !error && files.length === 0 && (
        <p>No files found.</p>
      )}

      {!loading &&
        files.map((file) => <FileSummaryRow key={file.id} file={file} />)}
    </div>
  );
}