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
    <div className="page p-6 lg:p-8 space-y-6 animate-fade-in">
      <div className="flex justify-end mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            className="pl-9 pr-4 py-2 bg-[#1E1F2B] border border-[#34364A] rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#7C5CFC] transition-colors w-64"
            placeholder="Search recent files..."
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
