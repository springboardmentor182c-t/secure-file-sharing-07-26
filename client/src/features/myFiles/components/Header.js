import React from "react";
import { PlusIcon, SearchIcon, UploadIcon } from "../../../layout/icons";

export default function Header({ searchQuery, onSearchChange, onNewFolder, onUploadClick, fileInputRef }) {
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <header className="page-header">
      <h1 className="page-header__title">My Files</h1>
      <div className="page-header__actions">
        <div className="search-bar">
          <SearchIcon className="search-bar__icon" width={16} height={16} />
          <input
            type="search"
            className="search-bar__input"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search files by name"
          />
        </div>
        <button type="button" className="btn btn--ghost" onClick={onNewFolder}>
          <PlusIcon width={15} height={15} /> New folder
        </button>
        <button type="button" className="btn btn--primary" onClick={handleUploadClick}>
          <UploadIcon width={15} height={15} /> Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) onUploadClick(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </header>
  );
}
