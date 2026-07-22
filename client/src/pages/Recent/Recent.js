import React, { useEffect, useState } from "react";
import { Clock, Search } from "lucide-react";
import EmptyState from "../../components/Files/EmptyState";
import FileTable from "../../components/Files/FileTable";
import { getRecentFiles } from "../../features/files/services/getRecentFiles";

function Recent() {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFiles() {
      try {
        setLoading(true);
        const data = await getRecentFiles();
        setFiles(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchFiles();
  }, []);

  const filteredFiles = files.filter((file) =>
    file.file_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <h2>Recent</h2>
        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading && <p className="page-loading">Loading...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && filteredFiles.length === 0 && (
        <EmptyState
          icon={<Clock size={20} />}
          title="Recent files"
          subtitle="Files you've viewed or edited recently will appear here."
        />
      )}

      {!loading && !error && filteredFiles.length > 0 && (
        <FileTable files={filteredFiles} />
      )}
    </div>
  );
}

export default Recent;