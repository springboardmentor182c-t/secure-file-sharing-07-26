import React from "react";
import { SearchIcon, PlusIcon } from "../../../layout/icons";

export default function Header({ searchQuery, onSearchChange, onCreateClick }) {
  return (
    <header className="page-header">
      <h1 className="page-header__title">Shared Links</h1>
      <div className="page-header__actions">
        <div className="search-bar">
          <SearchIcon className="search-bar__icon" width={16} height={16} />
          <input
            type="search"
            className="search-bar__input"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search links by file name, link URL, permission, or status"
          />
        </div>
        <button type="button" className="btn btn--primary" onClick={onCreateClick}>
          <PlusIcon width={15} height={15} /> New link
        </button>
      </div>
    </header>
  );
}
