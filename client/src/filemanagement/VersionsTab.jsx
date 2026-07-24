import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiUpload,
} from "react-icons/fi";


const OWNER_ID =
  "aafe9b9d-0109-46fd-b525-33e24d9ee9b5";

const API_URL =
  "http://127.0.0.1:8000";


const VersionsTab = ({ file }) => {

  // =====================================================
  // STATES
  // =====================================================

  const [versions, setVersions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [uploading, setUploading] =
    useState(false);

  const fileInputRef =
    useRef(null);


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (value) => {

    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

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
  // FETCH VERSION HISTORY
  // =====================================================

  const fetchVersions =
    async () => {

      if (!file?.id) {
        setLoading(false);
        return;
      }

      try {

        setLoading(true);
        setError("");

        const response =
          await fetch(
            `${API_URL}/files/${file.id}/versions?owner_id=${OWNER_ID}`
          );

        if (!response.ok) {

          const data =
            await response
              .json()
              .catch(() => null);

          throw new Error(
            data?.detail ||
            "Failed to fetch versions"
          );
        }

        const data =
          await response.json();

        console.log(
          "VERSION HISTORY:",
          data
        );

        setVersions(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        console.error(
          "Version fetch error:",
          error
        );

        setError(
          error.message ||
          "Unable to load version history."
        );

      } finally {

        setLoading(false);
      }
    };


  // =====================================================
  // LOAD VERSIONS
  // =====================================================

  useEffect(() => {

    fetchVersions();

  }, [file?.id]);


  // =====================================================
  // OPEN FILE PICKER
  // =====================================================

  const handleOpenUpload =
    () => {

      if (uploading) {
        return;
      }

      fileInputRef.current?.click();
    };


  // =====================================================
  // UPLOAD NEW VERSION
  // =====================================================

  const handleVersionUpload =
    async (event) => {

      const selectedFile =
        event.target.files?.[0];

      if (!selectedFile) {
        return;
      }

      if (!file?.id) {

        alert(
          "Unable to identify the file."
        );

        event.target.value = "";

        return;
      }

      try {

        setUploading(true);
        setError("");

        const formData =
          new FormData();

        /*
          IMPORTANT:

          This field name must match the
          UploadFile parameter expected
          by the FastAPI controller.
        */

        formData.append(
          "uploaded_file",
          selectedFile
        );

        const response =
          await fetch(
            `${API_URL}/files/${file.id}/versions?owner_id=${OWNER_ID}`,
            {
              method: "POST",
              body: formData,
            }
          );

        if (!response.ok) {

          const data =
            await response
              .json()
              .catch(() => null);

          throw new Error(
            data?.detail ||
            "Unable to upload new version"
          );
        }

        const newVersion =
          await response.json();

        console.log(
          "NEW VERSION:",
          newVersion
        );

        // Reload version history so
        // latest version appears first.
        await fetchVersions();

      } catch (error) {

        console.error(
          "Upload version error:",
          error
        );

        alert(
          error.message ||
          "Unable to upload new version"
        );

      } finally {

        setUploading(false);

        /*
          Clear input so selecting the
          same file again still triggers
          onChange.
        */

        event.target.value = "";
      }
    };


  // =====================================================
  // DOWNLOAD VERSION
  // =====================================================

  const handleDownload =
    async (version) => {

      if (
        !file?.id ||
        !version?.id
      ) {
        return;
      }

      try {

        /*
          This expects the backend route:

          GET
          /files/{file_id}/versions/{version_id}/download
        */

        const response =
          await fetch(
            `${API_URL}/files/${file.id}/versions/${version.id}/download?owner_id=${OWNER_ID}`
          );

        if (!response.ok) {

          const data =
            await response
              .json()
              .catch(() => null);

          throw new Error(
            data?.detail ||
            "Unable to download version"
          );
        }

        const blob =
          await response.blob();

        const downloadUrl =
          window.URL.createObjectURL(
            blob
          );

        const anchor =
          document.createElement("a");

        anchor.href =
          downloadUrl;

        /*
          Use current file name.
          You can change this later if
          backend returns version-specific
          file names.
        */

        const currentName =
          file.file_name ||
          file.name ||
          "file";

        anchor.download =
          `v${version.version_number}_${currentName}`;

        document.body.appendChild(
          anchor
        );

        anchor.click();

        anchor.remove();

        window.URL.revokeObjectURL(
          downloadUrl
        );

      } catch (error) {

        console.error(
          "Version download error:",
          error
        );

        alert(
          error.message ||
          "Unable to download version"
        );
      }
    };


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="versions-container">

      {/* ================================================
          TITLE + UPLOAD BUTTON
      ================================================= */}

      <div className="version-title-row">

        <div>

          <h3>
            Version History
          </h3>

          <p className="version-subtitle">
            View and manage previous versions
            of this file.
          </p>

        </div>


        {/* HIDDEN FILE INPUT */}

        <input
          ref={fileInputRef}
          type="file"
          style={{
            display: "none",
          }}
          onChange={
            handleVersionUpload
          }
        />


        {/* UPLOAD NEW VERSION */}

        <button
          type="button"
          className="upload-version-btn"
          onClick={
            handleOpenUpload
          }
          disabled={uploading}
        >

          <FiUpload />

          <span>
            {uploading
              ? "Uploading..."
              : "Upload New Version"
            }
          </span>

        </button>

      </div>


      {/* ================================================
          LOADING
      ================================================= */}

      {loading && (

        <div className="version-empty">

          <div className="version-empty-icon">
            <FiClock />
          </div>

          <p>
            Loading version history...
          </p>

        </div>

      )}


      {/* ================================================
          ERROR
      ================================================= */}

      {!loading && error && (

        <div className="version-empty">

          <p>
            {error}
          </p>

        </div>

      )}


      {/* ================================================
          NO VERSIONS
      ================================================= */}

      {!loading &&
        !error &&
        versions.length === 0 && (

          <div className="version-empty">

            <div className="version-empty-icon">
              <FiClock />
            </div>

            <h4>
              No version history
            </h4>

            <p>
              Upload a new version to
              start version tracking.
            </p>

          </div>

        )}


      {/* ================================================
          VERSION LIST
      ================================================= */}

      {!loading &&
        !error &&
        versions.length > 0 && (

          <div className="version-card">

            {versions.map(
              (
                version,
                index
              ) => {

                const isLatest =
                  index === 0;

                return (

                  <div
                    className="version-item"
                    key={version.id}
                  >

                    {/* ================= ICON ================= */}

                    <div
                      className={
                        `version-icon ${
                          isLatest
                            ? "latest"
                            : "old"
                        }`
                      }
                    >

                      {isLatest
                        ? (
                          <FiCheckCircle />
                        )
                        : (
                          <FiClock />
                        )
                      }

                    </div>


                    {/* ================= DETAILS ================= */}

                    <div className="version-content">

                      <div className="version-header">

                        <h4>
                          Version{" "}
                          {
                            version.version_number
                          }
                        </h4>


                        {isLatest && (

                          <span className="latest-badge">
                            Latest
                          </span>

                        )}

                      </div>


                      <p>

                        {isLatest
                          ? "Current version"
                          : "Previous version"
                        }

                        {" uploaded by "}

                        <strong>

                          {version.uploaded_by
                            ? (
                              version.uploaded_by ===
                              OWNER_ID
                                ? "You"
                                : version.uploaded_by
                            )
                            : "Unknown"
                          }

                        </strong>

                      </p>


                      <span className="version-date">

                        {formatDate(
                          version.uploaded_at
                        )}

                      </span>

                    </div>


                    {/* ================= DOWNLOAD ================= */}

                    <button
                      type="button"
                      className="version-btn"
                      title={
                        `Download Version ${
                          version.version_number
                        }`
                      }
                      onClick={() =>
                        handleDownload(
                          version
                        )
                      }
                    >

                      <FiDownload />

                    </button>

                  </div>
                );
              }
            )}

          </div>

        )}

    </div>
  );
};


export default VersionsTab;