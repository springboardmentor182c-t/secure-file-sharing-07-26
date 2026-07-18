import React, { useState } from "react";

const FolderList = () => {
  const [folders, setFolders] = useState([
    "All Files",
    "Finance",
    "HR Documents",
    "Product Design",
    "Engineering",
    "Marketing",
    "Legal",
  ]);

  const addFolder = () => {
    const folderName = prompt("Enter Folder Name");

    if (
      folderName &&
      folderName.trim() !== "" &&
      !folders.includes(folderName)
    ) {
      setFolders([...folders, folderName]);
    }
  };

  return (
    <div className="folder-panel">

      <div className="folder-header">
        <h3>Folders</h3>

        <button className="new-folder-btn" onClick={addFolder}>
          + New Folder
        </button>
      </div>

      <ul className="folder-list">
        {folders.map((folder, index) => (
          <li key={index}>{folder}</li>
        ))}
      </ul>

    </div>
  );
};

export default FolderList;