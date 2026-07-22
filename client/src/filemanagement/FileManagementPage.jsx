import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import FolderList from "./FolderList";
import FileTable from "./FileTable";
import Pagination from "./Pagination";

const FileManagementPage = () => {

  const [files, setFiles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [sortOrder, setSortOrder] = useState("asc");
  const [filterType, setFilterType] = useState("All");

  const [folders, setFolders] = useState([
    "All Files",
    "Finance",
    "HR Documents",
    "Product Design",
    "Engineering",
    "Marketing",
    "Legal",
  ]);

  const [selectedFolder, setSelectedFolder] =
    useState("All Files");

  return (

    <div className="app-layout">

      <Sidebar />

      <div className="content-area">

        <Header
          files={files}
          setFiles={setFiles}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          filterType={filterType}
          setFilterType={setFilterType}
          selectedFolder={selectedFolder}
        />

        <div className="dashboard-body">

          <FolderList
            folders={folders}
            setFolders={setFolders}
            selectedFolder={selectedFolder}
            setSelectedFolder={setSelectedFolder}
          />

          <div className="table-card">

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