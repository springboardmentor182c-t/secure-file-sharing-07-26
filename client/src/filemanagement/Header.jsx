import React from "react";
import SearchBar from "./SearchBar";
import UploadButton from "./UploadButton";

const Header = ({
    files,
    setFiles,
    searchTerm,
    setSearchTerm,
    selectedFolder,
    sortOrder,
    setSortOrder,
    filterType,
    setFilterType,
}) => {

  return (
    <div className="header">

      <div className="header-left">
        <h1>File Management</h1>
      </div>

      <div className="header-right">

        <SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

       <select
    className="filter-btn"
    value={filterType}
    onChange={(e) => setFilterType(e.target.value)}
>
    <option value="All">All Types</option>
    <option value="PDF">PDF</option>
    <option value="PPTX">PPTX</option>
    <option value="ZIP">ZIP</option>
    <option value="DOCX">DOCX</option>
    <option value="PNG">PNG</option>
    <option value="JPG">JPG</option>
</select>

<select
    className="sort-btn"
    value={sortOrder}
    onChange={(e) => setSortOrder(e.target.value)}
>
    <option value="asc">A → Z</option>
    <option value="desc">Z → A</option>
</select>

        <UploadButton
  files={files}
  setFiles={setFiles}
  selectedFolder={selectedFolder}
/>
      </div>

    </div>
  );
};

export default Header;