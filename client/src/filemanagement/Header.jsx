import React from "react";
import SearchBar from "./SearchBar";
import UploadButton from "./UploadButton";

const Header = ({
  files,
  setFiles,
  searchTerm,
  setSearchTerm,
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

        <button className="filter-btn">
          Filter
        </button>

        <button className="sort-btn">
          Sort
        </button>

        <UploadButton
          files={files}
          setFiles={setFiles}
        />

      </div>

    </div>
  );
};

export default Header;