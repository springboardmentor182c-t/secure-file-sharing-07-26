import React, { useState } from "react";
import { FolderIcon, FolderPlusIcon, MoreIcon } from "../../../layout/icons";

export default function FoldersPanel({
  folderId, folders, onSelectFolder,
  onNewFolder, onRenameFolder, onDeleteFolder,
}) {
  const [openMenuId, setOpenMenuId] = useState(null);

  return (
    <aside className="folders-panel">
      <div className="folders-panel__header">
        <div className="folders-panel__section-title">FOLDERS</div>
        <button type="button" className="folders-panel__new-btn-header" onClick={onNewFolder}>
          <FolderPlusIcon width={16} height={16} />
        </button>
      </div>

      <nav className="folders-panel__list">
        <button
          type="button"
          className={`folders-panel__item ${!folderId ? "folders-panel__item--active" : ""}`}
          onClick={() => onSelectFolder(null)}
        >
          <FolderIcon width={16} height={16} />
          <span className="folders-panel__item-name">All files</span>
        </button>

        {folders.length === 0 && <p className="folders-panel__empty">No folders yet</p>}
        {folders.map((folder) => (
          <div key={folder.id} className="folders-panel__row">
            <button
              type="button"
              className={`folders-panel__item ${folderId === folder.id ? "folders-panel__item--active" : ""}`}
              onClick={() => onSelectFolder(folder.id)}
            >
              <FolderIcon width={16} height={16} />
              <span className="folders-panel__item-name">{folder.name}</span>
              <span className="folders-panel__item-count">{folder.file_count}</span>
            </button>
            <div className="action-menu">
              <button
                type="button"
                className="action-menu__trigger"
                aria-label={`More actions for ${folder.name}`}
                onClick={() => setOpenMenuId(openMenuId === folder.id ? null : folder.id)}
              >
                <MoreIcon width={15} height={15} />
              </button>
              {openMenuId === folder.id && (
                <div className="action-menu__dropdown" role="menu">
                  <button type="button" onClick={() => { onRenameFolder(folder); setOpenMenuId(null); }}>Rename</button>
                  <button type="button" className="action-menu__danger" onClick={() => { onDeleteFolder(folder); setOpenMenuId(null); }}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </nav>

      <button type="button" className="folders-panel__new-btn" onClick={onNewFolder}>
        <FolderPlusIcon width={15} height={15} /> New folder
      </button>
    </aside>
  );
}
