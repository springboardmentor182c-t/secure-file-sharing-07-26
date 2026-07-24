import React, { useEffect, useState } from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import Sidebar from "./Sidebar";
import Header from "./Header";

import PreviewTab from "./PreviewTab";
import MetadataTab from "./MetadataTab";
import PermissionsTab from "./PermissionsTab";
import VersionsTab from "./VersionsTab";

import {
  FiDownload,
  FiShare2,
  FiTrash2,
  FiFileText,
  FiShield,
  FiArrowLeft,
} from "react-icons/fi";


const OWNER_ID =
  "aafe9b9d-0109-46fd-b525-33e24d9ee9b5";

const API_URL =
  "http://127.0.0.1:8000";


const FileDetailsPage = () => {

  const navigate = useNavigate();
  const location = useLocation();

  // File passed from FileTable
  const passedFile =
    location.state?.file || null;

  const [file, setFile] =
    useState(passedFile);

  const [activeTab, setActiveTab] =
    useState("Preview");

  const [loading, setLoading] =
    useState(false);


  // =====================================================
  // FORMAT FILE SIZE
  // =====================================================

  const formatFileSize = (bytes) => {

    if (
      bytes === null ||
      bytes === undefined
    ) {
      return "-";
    }

    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(2)} MB`;
  };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (value) => {

    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleString();
  };


  // =====================================================
  // FETCH LATEST FILE DETAILS
  // =====================================================

  useEffect(() => {

    if (!passedFile?.id) {
      return;
    }

    const fetchFileDetails =
      async () => {

        try {

          setLoading(true);

          const response =
            await fetch(
              `${API_URL}/files/${passedFile.id}?owner_id=${OWNER_ID}`
            );

          if (!response.ok) {

            throw new Error(
              "Failed to fetch file details"
            );
          }

          const backendFile =
            await response.json();

          console.log(
            "File details:",
            backendFile
          );

          // Merge backend values with
          // frontend display values.
          setFile({
            ...passedFile,
            ...backendFile,

            name:
              backendFile.file_name ||
              passedFile.name,

            size:
              formatFileSize(
                backendFile.file_size
              ),

            modified:
              formatDate(
                backendFile.updated_at ||
                backendFile.uploaded_at
              ),

            type:
              backendFile.file_extension
                ?.toUpperCase() ||
              passedFile.type ||
              "FILE",

            owner:
              passedFile.owner ||
              "You",

            status:
              passedFile.status ||
              "Encrypted",
          });

        } catch (error) {

          console.error(
            "File details error:",
            error
          );

        } finally {

          setLoading(false);

        }
      };

    fetchFileDetails();

  }, [passedFile?.id]);


  // =====================================================
  // DELETE FILE
  // =====================================================

  const handleDelete = async () => {

    if (!file?.id) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${
          file.name ||
          file.file_name
        }"?`
      );

    if (!confirmed) {
      return;
    }

    try {

      const response =
        await fetch(
          `${API_URL}/files/${file.id}?owner_id=${OWNER_ID}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {

        throw new Error(
          "Failed to delete file"
        );
      }

      alert(
        "File deleted successfully!"
      );

      navigate("/");

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
  // DOWNLOAD
  // =====================================================

  const handleDownload = async () => {
  if (!file?.id) {
    alert("File ID not found.");
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/files/${file.id}/download?owner_id=${OWNER_ID}`
    );

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Download API Error:",
        errorText
      );

      throw new Error(
        "Failed to download file"
      );
    }

    const blob = await response.blob();

    const downloadUrl =
      window.URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = downloadUrl;

    link.download =
      file.file_name ||
      file.name ||
      file.original_name ||
      "download";

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    window.URL.revokeObjectURL(
      downloadUrl
    );

  } catch (error) {
    console.error(
      "Download error:",
      error
    );

    alert(
      "Failed to download file."
    );
  }
};


  // =====================================================
  // SHARE
  // =====================================================

  const handleShare = async () => {
  if (!file?.id) {
    alert("File ID not found.");
    return;
  }

  const shareUrl =
    `${window.location.origin}/file-details?file_id=${file.id}`;

  try {

    // Use browser native share dialog
    // if supported.
    if (navigator.share) {

      await navigator.share({
        title:
          file.file_name ||
          file.name ||
          "Shared File",

        text:
          `Shared file: ${
            file.file_name ||
            file.name
          }`,

        url: shareUrl,
      });

      return;
    }

    // Desktop fallback
    await navigator.clipboard.writeText(
      shareUrl
    );

    alert(
      "Share link copied to clipboard!"
    );

  } catch (error) {

    // User closing the share popup
    // should not be treated as a real error.
    if (error?.name === "AbortError") {
      return;
    }

    console.error(
      "Share error:",
      error
    );

    // Final fallback
    window.prompt(
      "Copy this share link:",
      shareUrl
    );
  }
};


  // =====================================================
  // NO FILE
  // =====================================================

  if (!file) {

    return (

      <div
        style={{
          padding: "60px",
          textAlign: "center",
        }}
      >

        <h2>
          No File Selected
        </h2>

        <p>
          Please select a file from
          File Management.
        </p>

        <button
          className="upload-btn"
          onClick={() =>
            navigate("/")
          }
        >
          Back to File Management
        </button>

      </div>
    );
  }


  // =====================================================
  // DISPLAY VALUES
  // =====================================================

  const displayName =
    file.name ||
    file.file_name ||
    file.original_name ||
    "Unnamed File";

  const displaySize =
    file.size ||
    formatFileSize(
      file.file_size
    );

  const displayModified =
    file.modified ||
    formatDate(
      file.updated_at ||
      file.uploaded_at
    );

  const displayOwner =
    file.owner ||
    "You";

  const displayType =
    file.type ||
    file.file_extension
      ?.toUpperCase() ||
    "FILE";


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="app-layout">

      <Sidebar />

      <div className="content-area">

        <Header />

        <div className="file-details-page">

          {/* ================= PAGE HEADING ================= */}

          <div className="page-heading">

            <button
              type="button"
              className="details-back-btn"
              onClick={() =>
                navigate("/")
              }
              title="Back to File Management"
            >
              <FiArrowLeft />
            </button>

            <div>

              <h2>
                File Details
              </h2>

              {loading && (
                <span className="details-loading">
                  Updating...
                </span>
              )}

            </div>

          </div>


          {/* ================= MAIN CONTENT ================= */}

          <div className="details-layout">


            {/* ==========================================
                LEFT SIDE
            ========================================== */}

            <div className="details-left">


              {/* ================= TABS ================= */}

              <div className="details-tabs">

                <button
                  className={
                    activeTab === "Preview"
                      ? "active-tab"
                      : ""
                  }
                  onClick={() =>
                    setActiveTab(
                      "Preview"
                    )
                  }
                >
                  Preview
                </button>


                <button
                  className={
                    activeTab === "Metadata"
                      ? "active-tab"
                      : ""
                  }
                  onClick={() =>
                    setActiveTab(
                      "Metadata"
                    )
                  }
                >
                  Metadata
                </button>


                <button
                  className={
                    activeTab ===
                    "Permissions"
                      ? "active-tab"
                      : ""
                  }
                  onClick={() =>
                    setActiveTab(
                      "Permissions"
                    )
                  }
                >
                  Permissions
                </button>


                <button
                  className={
                    activeTab === "Versions"
                      ? "active-tab"
                      : ""
                  }
                  onClick={() =>
                    setActiveTab(
                      "Versions"
                    )
                  }
                >
                  Versions
                </button>

              </div>


              {/* ================= TAB CONTENT ================= */}

              <div className="tab-container">

                {activeTab ===
                  "Preview" && (

                  <PreviewTab
                    file={file}
                  />

                )}


                {activeTab ===
                  "Metadata" && (

                  <MetadataTab
                    file={file}
                  />

                )}


                {activeTab ===
                  "Permissions" && (

                  <PermissionsTab
                    file={file}
                  />

                )}


                {activeTab ===
                  "Versions" && (

                  <VersionsTab
                    file={file}
                  />

                )}

              </div>

            </div>


            {/* ==========================================
                RIGHT SIDE
            ========================================== */}

            <div className="details-right">


              {/* ================= FILE INFO ================= */}

              <div className="info-card">

                <div className="info-header">

                  <h3>
                    File Info
                  </h3>


                  <div className="info-icons">

                    {/* DOWNLOAD */}

                    <button
                      type="button"
                      title="Download"
                      onClick={
                        handleDownload
                      }
                    >
                      <FiDownload />
                    </button>


                    {/* SHARE */}

                    <button
                      type="button"
                      title="Share"
                      onClick={
                        handleShare
                      }
                    >
                      <FiShare2 />
                    </button>


                    {/* DELETE */}

                    <button
                      type="button"
                      title="Delete"
                      onClick={
                        handleDelete
                      }
                    >
                      <FiTrash2 />
                    </button>

                  </div>

                </div>


                {/* ================= SUMMARY ================= */}

                <div className="file-summary">

                  <div className="summary-icon">
                    <FiFileText />
                  </div>


                  <div className="summary-text">

                    <h4 title={displayName}>
                      {displayName}
                    </h4>

                    <span>
                      {displaySize}
                    </span>

                  </div>

                </div>


                <hr />


                {/* ================= TYPE ================= */}

                <div className="info-row">

                  <span>
                    Type
                  </span>

                  <strong>
                    {displayType}
                  </strong>

                </div>


                {/* ================= OWNER ================= */}

                <div className="info-row">

                  <span>
                    Owner
                  </span>

                  <strong>
                    {displayOwner}
                  </strong>

                </div>


                {/* ================= MODIFIED ================= */}

                <div className="info-row">

                  <span>
                    Modified
                  </span>

                  <strong>
                    {displayModified}
                  </strong>

                </div>


                {/* ================= FILE ID ================= */}

                <div className="info-row">

                  <span>
                    File ID
                  </span>

                  <strong
                    title={file.id}
                    className="file-id-value"
                  >
                    {file.id
                      ? `${file.id.substring(
                          0,
                          8
                        )}...`
                      : "-"}
                  </strong>

                </div>


                {/* ================= FOLDER ================= */}

                <div className="info-row">

                  <span>
                    Folder
                  </span>

                  <strong>
                    {file.folder_id
                      ? "Folder"
                      : "All Files"}
                  </strong>

                </div>

              </div>


              {/* ================= ENCRYPTION ================= */}

              <div className="encrypt-card">

                <h3>
                  Security
                </h3>


                <div className="encrypt-status">

                  <FiShield />

                  <div>

                    <strong>
                      Secure File
                    </strong>

                    <p>
                      Stored securely on
                      the server
                    </p>

                  </div>

                </div>


                <div className="info-row">

                  <span>
                    Status
                  </span>

                  <strong>
                    {file.status ||
                      "Encrypted"}
                  </strong>

                </div>


                <div className="info-row">

                  <span>
                    MIME Type
                  </span>

                  <strong>
                    {file.mime_type ||
                      "-"}
                  </strong>

                </div>


                <div className="info-row">

                  <span>
                    Extension
                  </span>

                  <strong>
                    {file.file_extension
                      ? `.${file.file_extension}`
                      : "-"}
                  </strong>

                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default FileDetailsPage;