import React from "react";

const MetadataTab = ({ file }) => {
  return (
    <div className="metadata-container">

      <h3>Document Metadata</h3>

      <div className="metadata-grid">

        <div className="metadata-item">
          <label>File Name</label>
          <p>{file.name}</p>
        </div>

        <div className="metadata-item">
          <label>File Type</label>
          <p>{file.type}</p>
        </div>

        <div className="metadata-item">
          <label>File Size</label>
          <p>{file.size}</p>
        </div>

        <div className="metadata-item">
          <label>Owner</label>
          <p>{file.owner}</p>
        </div>

        <div className="metadata-item">
          <label>Folder</label>
          <p>{file.folder}</p>
        </div>

        <div className="metadata-item">
          <label>Version</label>
          <p>{file.version}</p>
        </div>

        <div className="metadata-item">
          <label>Uploaded On</label>
          <p>{file.uploadDate}</p>
        </div>

        <div className="metadata-item">
          <label>Last Modified</label>
          <p>{file.modified}</p>
        </div>

      </div>

    </div>
  );
};

export default MetadataTab;