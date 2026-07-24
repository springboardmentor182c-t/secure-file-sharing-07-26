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
  // GET ERROR MESSAGE
  // Prevents [object Object]
  // =====================================================

  const getErrorMessage = (
    data,
    fallback
  ) => {

    if (!data) {
      return fallback;
    }

    if (
      typeof data.detail === "string"
    ) {
      return data.detail;
    }

    if (
      Array.isArray(data.detail)
    ) {

      return data.detail
        .map((item) => {

          if (
            typeof item === "string"
          ) {
            return item;
          }

          if (item?.msg) {
            return item.msg;
          }

          return JSON.stringify(
            item
          );

        })
        .join("\n");
    }

    if (data.message) {
      return data.message;
    }

    return fallback;
  };


  // =====================================================
  // FETCH VERSION HISTORY
  // =====================================================

  const fetchVersions =
    async () => {

      if (!file?.id) {
        setVersions([]);
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

        const data =
          await response
            .json()
            .catch(() => null);

        if (!response.ok) {

          throw new Error(
            getErrorMessage(
              data,
              "Failed to fetch version history"
            )
          );
        }

        console.log(
          "VERSION HISTORY:",
          data
        );

        setVersions(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        console.error(
          "VERSION FETCH ERROR:",
          err
        );

        setError(
          err.message ||
          "Unable to load version history."
        );

      } finally {

        setLoading(false);
      }
    };


  // =====================================================
  // LOAD VERSIONS WHEN FILE CHANGES
  // =====================================================

  useEffect(() => {

    fetchVersions();

    // eslint-disable-next-line
  }, [file?.id]);


  // =====================================================
  // OPEN FILE PICKER
  // =====================================================

  const handleUploadClick = () => {

    if (uploading) {
      return;
    }

    fileInputRef.current?.click();
  };


  // =====================================================
  // UPLOAD NEW VERSION
  // =====================================================
const handleVersionUpload = async (event) => {
  const selectedFile = event.target.files?.[0];

  if (!selectedFile) {
    return;
  }

  if (!file?.id) {
    alert("File ID is missing.");
    event.target.value = "";
    return;
  }

  try {
    setUploading(true);

    const formData = new FormData();

    // Backend expects BOTH of these in FormData
    formData.append("owner_id", OWNER_ID);
    formData.append(
      "uploaded_file",
      selectedFile,
      selectedFile.name
    );

    console.log("FILE ID:", file.id);
    console.log("OWNER ID:", OWNER_ID);
    console.log("SELECTED FILE:", selectedFile);

    for (const [key, value] of formData.entries()) {
      console.log("FORM DATA:", key, value);
    }

    const response = await fetch(
      `${API_URL}/files/${file.id}/versions`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response
      .json()
      .catch(() => null);

    console.log("UPLOAD STATUS:", response.status);
    console.log("UPLOAD RESPONSE:", data);

    if (!response.ok) {
      let message =
        "Unable to upload new version.";

      if (typeof data?.detail === "string") {
        message = data.detail;
      }

      if (Array.isArray(data?.detail)) {
        message = data.detail
          .map((item) => {
            const location =
              item.loc?.join(" → ") || "";

            return `${location}: ${item.msg}`;
          })
          .join("\n");
      }

      throw new Error(message);
    }

    // Reload version history
    await fetchVersions();

    alert(
      `Version ${data.version_number} uploaded successfully.`
    );

  } catch (error) {
    console.error(
      "VERSION UPLOAD ERROR:",
      error
    );

    alert(
      error.message ||
      "Unable to upload new version."
    );

  } finally {
    setUploading(false);

    // Allows selecting the same file again
    event.target.value = "";
  }
};
  // =====================================================
  // DOWNLOAD VERSION
  // =====================================================

  const handleDownload =
    async (version) => {

      try {

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
            getErrorMessage(
              data,
              "Unable to download version"
            )
          );
        }

        const blob =
          await response.blob();

        const downloadUrl =
          window.URL.createObjectURL(
            blob
          );

        const link =
          document.createElement("a");

        link.href =
          downloadUrl;

        link.download =
          `v${version.version_number}_${file.file_name || file.name || "file"}`;

        document.body.appendChild(
          link
        );

        link.click();

        link.remove();

        window.URL.revokeObjectURL(
          downloadUrl
        );

      } catch (err) {

        console.error(
          "VERSION DOWNLOAD ERROR:",
          err
        );

        alert(
          err.message ||
          "Unable to download version."
        );
      }
    };


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="versions-container">

      {/* ============================================= */}
      {/* TITLE */}
      {/* ============================================= */}

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


        {/* =========================================== */}
        {/* UPLOAD BUTTON */}
        {/* =========================================== */}

        <button
          type="button"
          className="upload-version-btn"
          onClick={handleUploadClick}
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


        {/* Hidden file input */}

        <input
          ref={fileInputRef}
          type="file"
          style={{
            display: "none"
          }}
          onChange={
            handleVersionUpload
          }
        />

      </div>


      {/* ============================================= */}
      {/* LOADING */}
      {/* ============================================= */}

      {loading && (

        <div className="version-empty">
          Loading version history...
        </div>

      )}


      {/* ============================================= */}
      {/* ERROR */}
      {/* ============================================= */}

      {!loading && error && (

        <div className="version-empty">
          {error}
        </div>

      )}


      {/* ============================================= */}
      {/* EMPTY */}
      {/* ============================================= */}

      {!loading &&
        !error &&
        versions.length === 0 && (

          <div className="version-empty">
            No version history available.
          </div>

        )}


      {/* ============================================= */}
      {/* VERSION LIST */}
      {/* ============================================= */}

      {!loading &&
        !error &&
        versions.length > 0 && (

          <div className="version-card">

            {versions.map(
              (version, index) => {

                const isLatest =
                  index === 0;

                return (

                  <div
                    className="version-item"
                    key={version.id}
                  >

                    {/* ICON */}

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


                    {/* INFORMATION */}

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

                          {
                            version.uploaded_by
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


                      <span>

                        {formatDate(
                          version.uploaded_at
                        )}

                      </span>

                    </div>


                    {/* DOWNLOAD BUTTON */}

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