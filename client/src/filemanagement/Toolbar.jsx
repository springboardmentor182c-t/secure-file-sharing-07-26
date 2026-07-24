import React from "react";
import { FiSearch } from "react-icons/fi";

import UploadButton from "./UploadButton";

const Toolbar = ({
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  sortOrder,
  setSortOrder,
  files,
  setFiles,
  selectedFolder,
  refreshFiles,
}) => {

  return (
    <div className="toolbar">

      <div className="toolbar-left">

        <div>
          <h2>My Drive</h2>

          <p>
            Manage and organize your secure files
          </p>
        </div>

      </div>

      <div className="toolbar-right">

        {/* SEARCH */}

        <div className="toolbar-search">

          <FiSearch />

          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />

        </div>

        {/* FILTER */}

        <select
          value={filterType}
          onChange={(e) =>
            setFilterType(e.target.value)
          }
        >
          <option value="All">All</option>
          <option value="PDF">PDF</option>
          <option value="PPTX">PPTX</option>
          <option value="ZIP">ZIP</option>
          <option value="DOCX">DOCX</option>
          <option value="XLSX">XLSX</option>
          <option value="IMAGE">Image</option>
        </select>

        {/* SORT */}

        <select
          value={sortOrder}
          onChange={(e) =>
            setSortOrder(e.target.value)
          }
        >
          <option value="asc">
            A → Z
          </option>

          <option value="desc">
            Z → A
          </option>
        </select>

        {/* UPLOAD */}

        <UploadButton
          files={files}
          setFiles={setFiles}
          selectedFolder={selectedFolder}
          refreshFiles={refreshFiles}
        />

      </div>

    </div>
  );
};

export default Toolbar;