import React from "react";

const UploadButton = ({ files, setFiles }) => {

  const handleUpload = (event) => {
    const selectedFiles = Array.from(event.target.files);

    const formattedFiles = selectedFiles.map((file) => ({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
      modified: "Just Now",
      owner: "You",
      status: "Uploaded",
    }));

    setFiles([...files, ...formattedFiles]);
  };

  return (
    <>
      <input
        type="file"
        multiple
        id="upload-file"
        style={{ display: "none" }}
        onChange={handleUpload}
      />

      <label htmlFor="upload-file" className="upload-btn">
        + Upload
      </label>
    </>
  );
};

export default UploadButton;