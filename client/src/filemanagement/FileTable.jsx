import React from "react";
import {
  FiFileText,
  FiLock,
  FiShare2,
  FiMoreVertical,
  FiTrash2,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const FileTable = ({
  files,
  setFiles,
  searchTerm,
  selectedFolder,
  sortOrder,
  filterType,
}) => {
  const navigate = useNavigate();

  // =====================================================
  // CONFIGURATION
  // =====================================================

  const OWNER_ID =
    "aafe9b9d-0109-46fd-b525-33e24d9ee9b5";

  const API_URL = "http://127.0.0.1:8000";

  // =====================================================
  // SAFE FILE ARRAY
  // =====================================================

  const allFiles = Array.isArray(files)
    ? files
    : [];

  // =====================================================
  // SEARCH + FOLDER + TYPE FILTER
  // =====================================================

let filteredFiles = allFiles.filter((file) => {
  const fileName =
    file?.name ||
    file?.file_name ||
    "";

  const fileType =
    file?.type ||
    file?.file_extension ||
    "";

  // Search
  const matchesSearch =
    fileName
      .toLowerCase()
      .includes(
        (searchTerm || "").toLowerCase()
      );

  // Folder
  const matchesFolder =
    selectedFolder === null ||
    file?.folder_id === selectedFolder?.id;

  // Type
  const matchesType =
    !filterType ||
    filterType === "All" ||
    fileType.toLowerCase() ===
      filterType.toLowerCase();

  return (
    matchesSearch &&
    matchesFolder &&
    matchesType
  );
});

  // =====================================================
  // SORT FILES
  // =====================================================

  filteredFiles = [...filteredFiles].sort(
    (a, b) => {
      const nameA =
        a?.name ||
        a?.file_name ||
        "";

      const nameB =
        b?.name ||
        b?.file_name ||
        "";

      if (sortOrder === "asc") {
        return nameA.localeCompare(nameB);
      }

      return nameB.localeCompare(nameA);
    }
  );

  // =====================================================
  // RENAME FILE
  // =====================================================

  const handleRename = async (file) => {
    const currentName =
      file?.name ||
      file?.file_name ||
      "";

    const newName = window.prompt(
      "Enter new file name",
      currentName
    );

    // Cancel
    if (newName === null) {
      return;
    }

    const trimmedName = newName.trim();

    // Empty name
    if (trimmedName === "") {
      alert("File name cannot be empty.");
      return;
    }

    // Same name
    if (trimmedName === currentName) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/files/${file.id}/rename?owner_id=${OWNER_ID}&new_name=${encodeURIComponent(
          trimmedName
        )}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(
          "Rename API Error:",
          response.status,
          errorText
        );

        throw new Error(
          "Failed to rename file"
        );
      }

      const updatedFile =
        await response.json();

      console.log(
        "Renamed file from backend:",
        updatedFile
      );

      // Update frontend state
      setFiles((previousFiles) =>
        previousFiles.map((f) =>
          f.id === file.id
            ? {
                ...f,

                name:
                  updatedFile.file_name ||
                  trimmedName,

                file_name:
                  updatedFile.file_name ||
                  trimmedName,

                updated_at:
                  updatedFile.updated_at ||
                  f.updated_at,
              }
            : f
        )
      );

      alert(
        "File renamed successfully!"
      );
    } catch (error) {
      console.error(
        "Rename error:",
        error
      );

      alert(
        "Failed to rename file."
      );
    }
  };

  // =====================================================
  // DELETE FILE
  // =====================================================

  const handleDelete = async (file) => {
    const fileName =
      file?.name ||
      file?.file_name ||
      "this file";

    const confirmDelete =
      window.confirm(
        `Are you sure you want to delete "${fileName}"?`
      );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(
        `${API_URL}/files/${file.id}?owner_id=${OWNER_ID}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorText =
          await response.text();

        console.error(
          "Delete API Error:",
          response.status,
          errorText
        );

        throw new Error(
          "Failed to delete file"
        );
      }

      const result =
        await response.json();

      console.log(
        "Delete response:",
        result
      );

      // Remove file from UI
      setFiles((previousFiles) =>
        previousFiles.filter(
          (f) => f.id !== file.id
        )
      );

      alert(
        "File deleted successfully!"
      );
    } catch (error) {
      console.error(
        "Delete error:",
        error
      );

      alert(
        "Failed to delete file."
      );
    }
  };

  // =====================================================
  // OPEN FILE DETAILS
  // =====================================================

  const handleFileClick = (file) => {
    console.log(
      "Clicked file:",
      file
    );

    navigate(
      "/file-details",
      {
        state: {
          file,
        },
      }
    );
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="file-list">

      {/* ================= HEADER ================= */}

      <div className="file-header">

        <div className="header-name">

          <input
            type="checkbox"
            onClick={(e) =>
              e.stopPropagation()
            }
          />

          <span>Name</span>

        </div>

        <div>Size</div>

        <div>Modified</div>

        <div>Owner</div>

        <div>Status</div>

        <div></div>

      </div>

      {/* ================= FILE BODY ================= */}

      <div className="file-body">

        {filteredFiles.length === 0 ? (

          <div className="empty-state">
            No files found
          </div>

        ) : (

          filteredFiles.map((file) => {

            const displayName =
              file?.name ||
              file?.file_name ||
              "Unnamed file";

            const displaySize =
              file?.size ||
              "-";

            const displayModified =
              file?.modified ||
              "-";

            const displayOwner =
              file?.owner ||
              "Unknown";

            const displayStatus =
              file?.status ||
              "Encrypted";

            return (

              <div
                className="file-card"
                key={file.id}
                onClick={() =>
                  handleFileClick(file)
                }
                style={{
                  cursor: "pointer",
                }}
              >

                {/* ================= NAME ================= */}

                <div className="file-name">

                  <input
                    type="checkbox"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  />

                  <div className="file-icon">

                    {file.icon || (
                      <FiFileText />
                    )}

                  </div>

                  <div className="file-details">

                    <div className="file-title">

                      {displayName}

                    </div>

                    <div className="file-subtitle">

                      {file.type ||
                        file.file_extension ||
                        "File"}

                    </div>

                  </div>

                </div>

                {/* ================= SIZE ================= */}

                <div className="file-size">

                  {displaySize}

                </div>

                {/* ================= MODIFIED ================= */}

                <div className="file-modified">

                  {displayModified}

                </div>

                {/* ================= OWNER ================= */}

                <div className="file-owner">

                  <div className="owner-avatar">

                    {file.ownerInitials ||
                      (displayOwner !==
                      "Unknown"
                        ? displayOwner
                            .split(" ")
                            .map(
                              (name) =>
                                name[0]
                            )
                            .join("")
                            .toUpperCase()
                        : "U")}

                  </div>

                  <span>
                    {displayOwner}
                  </span>

                </div>

                {/* ================= STATUS ================= */}

                <div className="file-status">

                  <span
                    className={
                      displayStatus ===
                      "Encrypted"
                        ? "status encrypted"
                        : "status shared"
                    }
                  >

                    {displayStatus ===
                    "Encrypted" ? (
                      <>
                        <FiLock
                          size={12}
                        />

                        Encrypted
                      </>
                    ) : (
                      <>
                        <FiShare2
                          size={12}
                        />

                        {displayStatus}
                      </>
                    )}

                  </span>

                </div>

                {/* ================= ACTIONS ================= */}

                <div className="file-actions">

                  {/* RENAME */}

                  <button
                    type="button"
                    className="menu-btn"
                    title="Rename"
                    onClick={(e) => {
                      e.stopPropagation();

                      handleRename(
                        file
                      );
                    }}
                  >

                    <FiMoreVertical />

                  </button>

                  {/* DELETE */}

                  <button
                    type="button"
                    className="menu-btn"
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();

                      handleDelete(
                        file
                      );
                    }}
                  >

                    <FiTrash2 />

                  </button>

                </div>

              </div>

            );
          })

        )}

      </div>

    </div>
  );
};

export default FileTable;