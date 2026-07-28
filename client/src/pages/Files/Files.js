import React, { useEffect, useRef, useState } from "react";
import { Folder, Search, Upload } from "lucide-react";
import EmptyState from "../../components/Files/EmptyState";
import AllFilesTable from "../../components/Files/AllFilesTable";
import { listFiles, uploadFile } from "../../features/myFiles/services/filesApi";

function Files() {
  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const fileInputRef = useRef(null);

  const fetchFiles = async (search = "") => {
    try {
      setError(null);
      setLoading(true);
      const { files: data } = await listFiles({ search, page: 1, pageSize: 50 });
      setFiles(data);
    } catch (err) {
      setError(err.message || "Failed to fetch files");
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleSearch = async (value) => {
    setSearchTerm(value);
    fetchFiles(value);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);
    setSuccessMessage("");

    try {
      const uploadedNames = [];
      for (const file of Array.from(selectedFiles)) {
        await uploadFile({ file, folderId: null, category: undefined });
        uploadedNames.push(file.name);
      }
      setSuccessMessage(`Uploaded ${uploadedNames.length} file${uploadedNames.length > 1 ? "s" : ""}`);
      await fetchFiles(searchTerm);
    } catch (err) {
      setError(err.message || "File upload failed");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const filteredFiles = files.filter((file) =>
    (file.original_filename || file.file_name || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header__title-group">
          <h2>Files</h2>
          <button
            type="button"
            className="upload-button"
            onClick={handleUploadClick}
            disabled={uploading}
          >
            <Upload size={16} />
            {uploading ? "Uploading..." : "Upload file"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={handleFileChange}
          />
        </div>

        <div className="search-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {loading && <p className="page-loading">Loading...</p>}
      {error && <p className="error-text">{error}</p>}
      {successMessage && !error && <p className="success-text">{successMessage}</p>}

      {!loading && !error && filteredFiles.length === 0 && (
        <EmptyState
          icon={<Folder size={20} />}
          title="No files yet"
          subtitle="Upload documents to see them listed here."
        />
      )}

      {!loading && !error && filteredFiles.length > 0 && (
        <AllFilesTable files={filteredFiles} />
      )}
    </div>
  );
}

export default Files;
