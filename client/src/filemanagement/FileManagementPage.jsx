import React, { useEffect, useState } from "react";

import Sidebar from "./Sidebar";
import Header from "./Header";
import FolderList from "./FolderList";
import FileTable from "./FileTable";
import Pagination from "./Pagination";
import Toolbar from "./Toolbar";

const OWNER_ID = "aafe9b9d-0109-46fd-b525-33e24d9ee9b5";
const API_URL = "http://127.0.0.1:8000";

const FileManagementPage = () => {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);

  // null means All Files
  const [selectedFolder, setSelectedFolder] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterType, setFilterType] = useState("All");

  // =====================================================
  // HELPERS
  // =====================================================

  const formatFileSize = (bytes) => {
    if (bytes === null || bytes === undefined) {
      return "-";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString();
  };

  const getFileType = (extension) => {
    if (!extension) {
      return "FILE";
    }

    const ext = extension.toLowerCase();

    if (ext === "pdf") return "PDF";

    if (ext === "doc" || ext === "docx") {
      return "DOCX";
    }

    if (ext === "ppt" || ext === "pptx") {
      return "PPTX";
    }

    if (ext === "xls" || ext === "xlsx") {
      return "XLSX";
    }

    if (ext === "zip" || ext === "rar") {
      return "ZIP";
    }

    if (
      ext === "png" ||
      ext === "jpg" ||
      ext === "jpeg"
    ) {
      return "IMAGE";
    }

    return ext.toUpperCase();
  };

  // =====================================================
  // MAP BACKEND FILE
  // =====================================================

  const mapBackendFile = (file) => {
    return {
      ...file,

      id: file.id,

      name:
        file.file_name ||
        file.original_name ||
        "Unnamed file",

      type: getFileType(file.file_extension),

      size: formatFileSize(file.file_size),

      modified: formatDate(
        file.updated_at || file.uploaded_at
      ),

      owner: "Sarah Mitchell",

      ownerInitials: "SM",

      status: "Encrypted",

      folder_id: file.folder_id,
    };
  };

  // =====================================================
  // FETCH FOLDERS
  // =====================================================

  const fetchFolders = async () => {
    try {
      const response = await fetch(
        `${API_URL}/files/folders?owner_id=${OWNER_ID}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch folders");
      }

      const data = await response.json();

      console.log("Folders from backend:", data);

      setFolders(data);
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  };

  // =====================================================
  // FETCH FILES
  // =====================================================

  const fetchFiles = async () => {
    try {
      const response = await fetch(
        `${API_URL}/files?owner_id=${OWNER_ID}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch files");
      }

      const data = await response.json();

      console.log("Files from backend:", data);

      const mappedFiles = data.map(mapBackendFile);

      setFiles(mappedFiles);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    fetchFolders();
    fetchFiles();
  }, []);

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="app-layout">

      <Sidebar />

      <div className="content-area">

        <Header />

        <div className="dashboard-body">

          {/* FOLDERS */}

          <div className="folder-card card">

            <FolderList
              folders={folders}
              setFolders={setFolders}
              selectedFolder={selectedFolder}
              setSelectedFolder={setSelectedFolder}
              files={files}
            />

          </div>

          {/* MY DRIVE */}

          <div className="table-card card">

            <Toolbar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
              filterType={filterType}
              setFilterType={setFilterType}
              files={files}
              setFiles={setFiles}
              selectedFolder={selectedFolder}
              refreshFiles={fetchFiles}
            />

            <FileTable
              files={files}
              setFiles={setFiles}
              searchTerm={searchTerm}
              selectedFolder={selectedFolder}
              sortOrder={sortOrder}
              filterType={filterType}
            />

            <Pagination />

          </div>

        </div>

      </div>

    </div>
  );
};

export default FileManagementPage;