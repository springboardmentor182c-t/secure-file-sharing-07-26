import React from "react";

const UploadButton = ({ files, setFiles, selectedFolder }) => {

  const handleUpload = (event) => {

    const selectedFiles = Array.from(event.target.files);

    const formattedFiles = selectedFiles.map((file) => ({
  id: Date.now() + Math.random(),

  name: file.name,

  size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,

  type: file.name.split(".").pop().toUpperCase(),

  modified: new Date().toLocaleDateString(),

  uploadDate: new Date().toLocaleDateString(),

  owner: "You",

  folder: selectedFolder,

  status: "Encrypted",

  version: "1.0",
}));

    setFiles([...files, ...formattedFiles]);
  };

  return (
    <>
      <input
        type="file"
        id="upload-file"
        multiple
        hidden
        onChange={handleUpload}
      />

      <label htmlFor="upload-file" className="upload-btn">
        + Upload
      </label>
    </>
  );
};

export default UploadButton;