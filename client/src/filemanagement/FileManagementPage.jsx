import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import FileTable from "./FileTable";
import Pagination from "./Pagination";

const FileManagementPage = () => {

  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="file-management-container">

      <Sidebar />

      <div className="main-content">

        <Header
          files={files}
          setFiles={setFiles}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <FileTable
          files={files}
          searchTerm={searchTerm}
        />

        <Pagination />

      </div>

    </div>
  );
};

export default FileManagementPage;