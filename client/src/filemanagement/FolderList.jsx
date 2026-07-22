import React from "react";

const FolderList = ({
  folders,
  setFolders,
  selectedFolder,
  setSelectedFolder,
}) => {

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

  const renameFolder = (folder) => {

    if (folder === "All Files") {
      alert("You cannot rename 'All Files'");
      return;
    }

    const newName = prompt("Rename Folder", folder);

    if (
      newName &&
      newName.trim() !== "" &&
      !folders.includes(newName)
    ) {
      setFolders(
        folders.map((f) =>
          f === folder ? newName : f
        )
      );

      if (selectedFolder === folder) {
        setSelectedFolder(newName);
      }
    }
  };

  const deleteFolder = (folder) => {

    if (folder === "All Files") {
      alert("You cannot delete 'All Files'");
      return;
    }

    const confirmDelete = window.confirm(
      `Delete "${folder}"?`
    );

    if (confirmDelete) {
      setFolders(
        folders.filter((f) => f !== folder)
      );

      if (selectedFolder === folder) {
        setSelectedFolder("All Files");
      }
    }
  };

  return (
    <div className="folder-panel">

      <div className="folder-header">
        <h3>Folders</h3>

        <button
          className="new-folder-btn"
          onClick={addFolder}
        >
          + New Folder
        </button>
      </div>

      <ul className="folder-list">

        {folders.map((folder) => (

          <li
            key={folder}
            className={
              selectedFolder === folder
                ? "active-folder"
                : ""
            }
            onClick={() => setSelectedFolder(folder)}
          >

            <span>{folder}</span>

            {folder !== "All Files" && (

              <span className="folder-actions">

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    renameFolder(folder);
                  }}
                >
                  ✏️
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFolder(folder);
                  }}
                >
                  🗑️
                </button>

              </span>

            )}

          </li>

        ))}

      </ul>

    </div>
  );
};

export default FolderList;