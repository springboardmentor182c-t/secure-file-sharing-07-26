import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Upload.css";

function Upload() {

  // -------------------- States --------------------

  const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [currentUpload, setCurrentUpload] = useState(null);
  const [category, setCategory] = useState("Documents");
  const [tags, setTags] = useState("");
  const [isEncrypted, setIsEncrypted] = useState(true);
  const [requirePassword, setRequirePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [virusScanned, setVirusScanned] = useState(false);
  const [notifyOnAccess, setNotifyOnAccess] = useState(false);
  // -------------------- File Selection --------------------

  const handleFileChange = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    // Maximum 500 MB

    if (file.size > 500 * 1024 * 1024) {
      alert("File size should be less than 500 MB");
      return;
    }

    setSelectedFile(file);

  };
  const handleDragOver = (e) => {
  e.preventDefault();
};

const handleDrop = async (e) => {
  e.preventDefault();

  const file = e.dataTransfer.files[0];

  if (!file) return;

  if (file.size > 500 * 1024 * 1024) {
    alert("File size should be less than 500 MB");
    return;
  }

  setSelectedFile(file);

  const formData = new FormData();
  formData.append("file", file);

  // upload code ikkada
};

  // -------------------- Upload --------------------

  const handleUpload = async () => {

    if (!selectedFile) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("category", category);
    formData.append("tags", tags);
    formData.append("is_encrypted", isEncrypted);
    formData.append("require_password", requirePassword);
    formData.append("password", password);
    formData.append("virus_scanned", virusScanned);
    formData.append("notify_on_access", notifyOnAccess);

    try {

      const res = await axios.post(
        "http://localhost:8000/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },

          onUploadProgress: (progressEvent) => {

            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );

            setCurrentUpload({
              name: selectedFile.name,
              size: (selectedFile.size / 1024 / 1024).toFixed(2),
              progress: percent,
            });

          },
        }
      );

      alert("File uploaded successfully!");

      console.log(res.data);

      loadFiles();

      setSelectedFile(null);

    } catch (err) {

      console.error(err);
      alert("Upload failed");

    }

  };

  // -------------------- Load Files --------------------

  const loadFiles = async () => {

    try {

      const res = await axios.get(
        "http://localhost:8000/files"
      );

      setFiles(res.data);

    } catch (err) {

      console.error(err);

    }

  };

  useEffect(() => {

    loadFiles();

  }, []);

  // -------------------- Delete --------------------

  const handleDelete = async (id) => {

    try {

      await axios.delete(
        `http://localhost:8000/files/${id}`
      );

      alert("File deleted successfully");

      loadFiles();

    } catch (err) {

      console.error(err);

      alert("Delete failed");

    }

  };

  // -------------------- Download --------------------

  const handleDownload = (file) => {

  let url = `http://localhost:8000/files/download/${file.file_name}`;

  if (file.require_password) {

    const pwd = prompt("Enter file password");

    if (!pwd) return;

    url += `?password=${encodeURIComponent(pwd)}`;
  }

  const link = document.createElement("a");
  link.href = url;
  link.download = file.file_name;

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  return (
    <div className="upload-page">
      

  {/* Upload Area */}
  <div className="upload-container"
  onDrop={handleDrop}
  onDragOver={handleDragOver}>

    <div className="upload-content">

      <div className="cloud-circle">☁</div>

      <h3>Drag & Drop Files Here</h3>

      <p>Drop your files here or click to browse</p>

      <input
        type="file"
        id="fileInput"
        hidden
        onChange={handleFileChange}
      />

      <button
        className="browse-btn"
        type="button"
        onClick={() =>
          document.getElementById("fileInput").click()
        }
      >
        Browse Files
      </button>

      <button
        className="upload-btn"
        onClick={handleUpload}
      >
        Upload File
      </button>

      {selectedFile && (
        <p className="selected-file">
          Selected File: {selectedFile.name}
        </p>
      )}

      <span className="file-limit">
        Maximum file size: 500 MB
      </span>

    </div>

  </div>

  {/* Uploaded Files */}

  <div className="uploaded-files">

    <h3>Uploaded Files</h3>

    {files.length === 0 ? (

      <p>No files uploaded yet.</p>

    ) : (

      files.map((file) => (

        <div className="file-item" key={file.id}>

  <div className="file-details">
  <strong>{file.file_name}</strong>

  <p>Size: {(file.file_size / 1024).toFixed(2)} KB</p>

  <p>Category: {file.category}</p>

  <p>Tags: {file.tags || "No Tags"}</p>

  <p>
    Encryption:
    {file.is_encrypted ? " Enabled" : " Disabled"}
  </p>

  <p>
    Password:
    {file.require_password ? " Required" : " Not Required"}
  </p>
  <p>
  Virus Scan:
  {file.virus_scanned ? " Enabled" : " Disabled"}
</p>

<p>
  Notify on Access:
  {file.notify_on_access ? " Enabled" : " Disabled"}
</p>
<p>
  File Status:
  {file.is_safe ? " Safe ✅" : " Unsafe ❌"}
</p>
</div>

  <div className="file-actions">

    <button
      className="download-btn"
      onClick={() => handleDownload(file

      )}
    >
      Download
    </button>

    <button
      className="delete-btn"
      onClick={() => handleDelete(file.id)}
    >
      Delete
    </button>

  </div>

</div>

      ))

    )}

  </div>
  {/* Bottom Section */}

  <div className="bottom-section">

    {/* File Settings */}

    <div className="file-card">

      <h3>File Settings</h3>

      <div className="input-group">

        <label>Category</label>

        <select
         value={category}
  onChange={(e) => setCategory(e.target.value)}>
          <option>Documents</option>
          <option>Images</option>
          <option>Videos</option>
          <option>Others</option>
        </select>

      </div>

      <div className="input-group">

        <label>Tags</label>

        <input
  type="text"
  placeholder="Add tag..."
  value={tags}
  onChange={(e) => setTags(e.target.value)}
/>
      </div>

    </div>

    {/* Security Options */}

    <div className="security-card">

      <h3>Security Options</h3>

      <div className="security-item">

        <div>
          <h4>AES-256 Encryption</h4>
          <p>Encrypt files at rest</p>
        </div>

        <label className="switch">
          <input
  type="checkbox"
  checked={isEncrypted}
  onChange={(e) => setIsEncrypted(e.target.checked)}
/>
          <span className="slider"></span>
        </label>

      </div>

      <div className="security-item">

        <div>
          <h4>Virus Scan on Upload</h4>
          <p>Scan files before storing</p>
        </div>

        <label className="switch">
          <input
  type="checkbox"
  checked={virusScanned}
  onChange={(e) => setVirusScanned(e.target.checked)}
/>
          <span className="slider"></span>
        </label>

      </div>

      <div className="security-item">

        <div>
          <h4>Require Password</h4>
          <p>Password required for download</p>
        </div>

        <label className="switch">
         <input
  type="checkbox"
  checked={requirePassword}
  onChange={(e) => setRequirePassword(e.target.checked)}
/>
          <span className="slider"></span>
        </label>
        {requirePassword && (
  <div className="input-group">
    <label>Password</label>
    <input
      type="password"
      placeholder="Enter password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
  </div>
)}

      </div>

      <div className="security-item">

        <div>
          <h4>Notify on Access</h4>
          <p>Notify when file is opened</p>
        </div>

        <label className="switch">
          <input
  type="checkbox"
  checked={notifyOnAccess}
  onChange={(e) => setNotifyOnAccess(e.target.checked)}
/>
          <span className="slider"></span>
        </label>

      </div>

    </div>

  </div>
  {/* Upload Progress */}

  <div className="progress-section">

    <h3 className="progress-title">Upload Progress</h3>

    {currentUpload ? (

      <div className="progress-item">

        <div className="progress-header">

          <span>{currentUpload.name}</span>

          <span>{currentUpload.size} MB</span>

        </div>

        <div className="progress-bar">

          <div
            className="progress-fill"
            style={{ width: `${currentUpload.progress}%` }}
          ></div>

        </div>

        <div className="progress-percent">

          {currentUpload.progress}%

        </div>

      </div>

    ) : (

      <p>No upload in progress.</p>

    )}

  </div>

</div>

  );

}

export default Upload;