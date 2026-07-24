import React, { useEffect, useRef, useState } from "react";
import {
  FiFolder,
  FiPlus,
  FiMoreVertical,
  FiEdit2,
  FiTrash2,
} from "react-icons/fi";

const OWNER_ID = "aafe9b9d-0109-46fd-b525-33e24d9ee9b5";
const API_URL = "http://127.0.0.1:8000";

const FolderList = ({
  folders,
  setFolders,
  selectedFolder,
  setSelectedFolder,
  files,
}) => {
  const [openMenuId, setOpenMenuId] = useState(null);

  const menuRef = useRef(null);

  // =====================================================
  // CLOSE MENU WHEN CLICKING OUTSIDE
  // =====================================================

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // =====================================================
  // CREATE FOLDER
  // =====================================================

  const addFolder = async () => {
    const folderName = window.prompt("Enter Folder Name");

    if (folderName === null) {
      return;
    }

    const trimmedName = folderName.trim();

    if (!trimmedName) {
      alert("Folder name cannot be empty.");
      return;
    }

    const alreadyExists = folders.some(
      (folder) =>
        folder.folder_name?.toLowerCase() ===
        trimmedName.toLowerCase()
    );

    if (alreadyExists) {
      alert("Folder already exists.");
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/files/folders?owner_id=${OWNER_ID}&folder_name=${encodeURIComponent(
          trimmedName
        )}`,
        {
          method: "POST",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          "Create folder error:",
          errorText
        );

        throw new Error("Failed to create folder");
      }

      const createdFolder = await response.json();

      setFolders((previousFolders) => [
        createdFolder,
        ...previousFolders,
      ]);

      alert("Folder created successfully!");
    } catch (error) {
      console.error("Create folder error:", error);

      alert("Failed to create folder.");
    }
  };

  // =====================================================
  // RENAME FOLDER
  // =====================================================

  const handleRenameFolder = async (folder) => {
    setOpenMenuId(null);

    const newName = window.prompt(
      "Enter new folder name",
      folder.folder_name
    );

    if (newName === null) {
      return;
    }

    const trimmedName = newName.trim();

    if (!trimmedName) {
      alert("Folder name cannot be empty.");
      return;
    }

    if (trimmedName === folder.folder_name) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/files/folders/${folder.id}/rename?owner_id=${OWNER_ID}&new_name=${encodeURIComponent(
          trimmedName
        )}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          "Rename folder API error:",
          errorText
        );

        throw new Error("Failed to rename folder");
      }

      const updatedFolder = await response.json();

      setFolders((previousFolders) =>
        previousFolders.map((currentFolder) =>
          currentFolder.id === folder.id
            ? updatedFolder
            : currentFolder
        )
      );

      // If currently selected folder was renamed,
      // update selectedFolder too.
      if (selectedFolder?.id === folder.id) {
        setSelectedFolder(updatedFolder);
      }

      alert("Folder renamed successfully!");
    } catch (error) {
      console.error(
        "Rename folder error:",
        error
      );

      alert("Failed to rename folder.");
    }
  };

  // =====================================================
  // DELETE FOLDER
  // =====================================================

  const handleDeleteFolder = async (folder) => {
    setOpenMenuId(null);

    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${folder.folder_name}"?`
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/files/folders/${folder.id}?owner_id=${OWNER_ID}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        console.error(
          "Delete folder API error:",
          errorText
        );

        throw new Error("Failed to delete folder");
      }

      setFolders((previousFolders) =>
        previousFolders.filter(
          (currentFolder) =>
            currentFolder.id !== folder.id
        )
      );

      // If deleted folder is selected,
      // return to All Files.
      if (selectedFolder?.id === folder.id) {
        setSelectedFolder(null);
      }

      alert("Folder deleted successfully!");
    } catch (error) {
      console.error(
        "Delete folder error:",
        error
      );

      alert("Failed to delete folder.");
    }
  };

  // =====================================================
  // COUNT FILES
  // =====================================================

  const getFolderCount = (folderId) => {
    return files.filter(
      (file) => file.folder_id === folderId
    ).length;
  };

  // =====================================================
  // TOGGLE THREE-DOT MENU
  // =====================================================

  const toggleMenu = (event, folderId) => {
    event.stopPropagation();

    setOpenMenuId((currentId) =>
      currentId === folderId
        ? null
        : folderId
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="folder-panel">

      <div className="folder-title">
        <h3>Folders</h3>
      </div>

      <div className="folder-items">

        {/* ================= ALL FILES ================= */}

        <div
          className={`folder-item ${
            selectedFolder === null
              ? "active"
              : ""
          }`}
          onClick={() => {
            setSelectedFolder(null);
            setOpenMenuId(null);
          }}
        >
          <div className="folder-left">

            <FiFolder />

            <span className="folder-name">
              All Files
            </span>

          </div>

          <div className="folder-right">

            <span className="folder-count">
              {files.length}
            </span>

          </div>
        </div>

        {/* ================= DATABASE FOLDERS ================= */}

        {folders.map((folder) => (

          <div
            key={folder.id}
            className={`folder-item ${
              selectedFolder?.id === folder.id
                ? "active"
                : ""
            }`}
            onClick={() => {
              setSelectedFolder(folder);
              setOpenMenuId(null);
            }}
          >

            {/* LEFT */}

            <div className="folder-left">

              <FiFolder />

              <span
                className="folder-name"
                title={folder.folder_name}
              >
                {folder.folder_name}
              </span>

            </div>

            {/* RIGHT */}

            <div className="folder-right">

              <span className="folder-count">
                {getFolderCount(folder.id)}
              </span>

              {/* THREE DOT MENU */}

              <div
                className="folder-menu-container"
                ref={
                  openMenuId === folder.id
                    ? menuRef
                    : null
                }
              >

                <button
                  type="button"
                  className="folder-menu-btn"
                  title="Folder options"
                  onClick={(event) =>
                    toggleMenu(
                      event,
                      folder.id
                    )
                  }
                >
                  <FiMoreVertical />
                </button>

                {/* DROPDOWN */}

                {openMenuId === folder.id && (

                  <div
                    className="folder-dropdown"
                    onClick={(event) =>
                      event.stopPropagation()
                    }
                  >

                    <button
                      type="button"
                      className="folder-dropdown-item"
                      onClick={() =>
                        handleRenameFolder(
                          folder
                        )
                      }
                    >
                      <FiEdit2 />

                      <span>Rename</span>
                    </button>

                    <button
                      type="button"
                      className="folder-dropdown-item delete"
                      onClick={() =>
                        handleDeleteFolder(
                          folder
                        )
                      }
                    >
                      <FiTrash2 />

                      <span>Delete</span>
                    </button>

                  </div>

                )}

              </div>

            </div>

          </div>

        ))}

      </div>

      {/* ================= NEW FOLDER ================= */}

      <button
        type="button"
        className="new-folder-btn"
        onClick={addFolder}
      >
        <FiPlus />
        New Folder
      </button>

    </div>
  );
};

export default FolderList;