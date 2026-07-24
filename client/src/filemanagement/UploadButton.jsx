import React, { useState } from "react";
import { FiUpload } from "react-icons/fi";

const OWNER_ID = "aafe9b9d-0109-46fd-b525-33e24d9ee9b5";
const API_URL = "http://127.0.0.1:8000";

const UploadButton = ({
  selectedFolder,
  refreshFiles,
}) => {

  const [uploading, setUploading] =
    useState(false);

  const handleUpload = async (event) => {

    const selectedFiles =
      Array.from(event.target.files);

    if (selectedFiles.length === 0) {
      return;
    }

    setUploading(true);

    try {

      for (const file of selectedFiles) {

        const formData =
          new FormData();

        // Owner
        formData.append(
          "owner_id",
          OWNER_ID
        );

        // Actual file
        formData.append(
          "uploaded_file",
          file
        );

        // IMPORTANT:
        // selectedFolder contains database folder object.
        if (selectedFolder?.id) {

          console.log(
            "Uploading to folder:",
            selectedFolder.folder_name,
            selectedFolder.id
          );

          formData.append(
            "folder_id",
            selectedFolder.id
          );
        } else {

          console.log(
            "Uploading to All Files"
          );

        }

        const response = await fetch(
          `${API_URL}/files/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {

          const errorText =
            await response.text();

          console.error(
            "Backend upload error:",
            errorText
          );

          throw new Error(
            `Upload failed for ${file.name}`
          );
        }

        const uploadedFile =
          await response.json();

        console.log(
          "Uploaded successfully:",
          uploadedFile
        );
      }

      // Get latest files from database.
      if (refreshFiles) {
        await refreshFiles();
      }

      alert(
        "File uploaded successfully!"
      );

    } catch (error) {

      console.error(
        "Upload error:",
        error
      );

      alert(
        "Failed to upload file."
      );

    } finally {

      setUploading(false);

      // Allows selecting same file again
      event.target.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        id="upload-file"
        multiple
        hidden
        disabled={uploading}
        onChange={handleUpload}
      />

      <label
        htmlFor="upload-file"
        className="upload-btn"
        style={{
          opacity: uploading ? 0.6 : 1,
          pointerEvents:
            uploading ? "none" : "auto",
        }}
      >

        <FiUpload />

        {uploading
          ? "Uploading..."
          : "Upload"}

      </label>
    </>
  );
};

export default UploadButton;