import React, { useState } from "react";
import {
  FiEye,
  FiFileText,
  FiX,
  FiExternalLink,
} from "react-icons/fi";

const OWNER_ID =
  "aafe9b9d-0109-46fd-b525-33e24d9ee9b5";

const API_URL = "http://127.0.0.1:8000";

const PreviewTab = ({ file }) => {
  const [showPreview, setShowPreview] =
    useState(false);

  // ==========================================
  // SAFE FILE VALUES
  // ==========================================

  const fileName =
    file?.name ||
    file?.file_name ||
    "Unnamed file";

  const fileType =
    file?.type ||
    file?.file_extension ||
    "File";

  const fileSize =
    file?.size ||
    (file?.file_size
      ? `${(file.file_size / 1024).toFixed(1)} KB`
      : "-");

  // ==========================================
  // PREVIEW URL
  // ==========================================

  const previewUrl = file?.id
    ? `${API_URL}/files/${file.id}/preview?owner_id=${OWNER_ID}`
    : "";

  // ==========================================
  // OPEN PREVIEW
  // ==========================================

  const handlePreview = () => {
    if (!file?.id) {
      alert("File ID not found.");
      return;
    }

    setShowPreview(true);
  };

  // ==========================================
  // OPEN IN NEW TAB
  // ==========================================

  const handleOpenNewTab = () => {
    if (!previewUrl) {
      return;
    }

    window.open(
      previewUrl,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="preview-wrapper">

      {!showPreview ? (

        // ======================================
        // DEFAULT PREVIEW CARD
        // ======================================

        <div className="preview-box">

          <div className="preview-content">

            <div className="preview-icon">
              <FiFileText />
            </div>

            <h2 className="preview-file-name">
              {fileName}
            </h2>

            <p className="preview-file-type">
              {fileType.toUpperCase()} Document
              {" • "}
              {fileSize}
            </p>

            <button
              type="button"
              className="preview-btn"
              onClick={handlePreview}
            >
              <FiEye />

              Open Preview
            </button>

          </div>

        </div>

      ) : (

        // ======================================
        // ACTUAL FILE PREVIEW
        // ======================================

        <div className="actual-preview">

          {/* Preview Header */}

          <div className="preview-header">

            <div className="preview-header-info">

              <FiFileText />

              <span>
                {fileName}
              </span>

            </div>

            <div className="preview-header-actions">

              <button
                type="button"
                className="preview-action-btn"
                onClick={handleOpenNewTab}
                title="Open in new tab"
              >
                <FiExternalLink />
              </button>

              <button
                type="button"
                className="preview-action-btn"
                onClick={() =>
                  setShowPreview(false)
                }
                title="Close preview"
              >
                <FiX />
              </button>

            </div>

          </div>

          {/* File Preview */}

          <div className="preview-frame-container">

            <iframe
              src={previewUrl}
              title={`Preview ${fileName}`}
              className="preview-frame"
            />

          </div>

        </div>

      )}

    </div>
  );
};

export default PreviewTab;