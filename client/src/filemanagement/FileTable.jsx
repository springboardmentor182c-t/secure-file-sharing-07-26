import React from "react";

const sampleFiles = [
  {
    id: 1,
    name: "Q3-Financial-Report.pdf",
    type: "PDF",
    size: "2.4 MB",
    modified: "Today",
    uploadDate: "15 Jul 2026",
    owner: "Sarah",
    status: "Encrypted",
    folder: "Finance",
    version: "2.1",
  },
  {
    id: 2,
    name: "Product-Roadmap-2025.pptx",
    type: "PPTX",
    size: "8.1 MB",
    modified: "Today",
    uploadDate: "15 Jul 2026",
    owner: "James",
    status: "Shared",
    folder: "Product Design",
    version: "1.3",
  },
  {
    id: 3,
    name: "client-database-backup.zip",
    type: "ZIP",
    size: "124.7 MB",
    modified: "Yesterday",
    uploadDate: "14 Jul 2026",
    owner: "Priya",
    status: "Encrypted",
    folder: "Engineering",
    version: "1.0",
  },
];

const FileTable = ({
  files,
  setFiles,
  searchTerm,
  selectedFolder,
  sortOrder,
  filterType,
}) => {

  // Merge sample files and uploaded files
  const allFiles = [...sampleFiles, ...files];

  // Apply search + folder + file type filters
  let filteredFiles = allFiles.filter((file) => {

    const matchesSearch = file.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesFolder =
      selectedFolder === "All Files" ||
      file.folder === selectedFolder;

    const matchesType =
      filterType === "All" ||
      file.type === filterType;

    return matchesSearch && matchesFolder && matchesType;
  });

  // Apply sorting
  filteredFiles.sort((a, b) => {
    if (sortOrder === "asc") {
      return a.name.localeCompare(b.name);
    }
    return b.name.localeCompare(a.name);
  });

  // Rename uploaded files
  const handleRename = (file) => {

    // Don't rename sample files
    if (file.id <= 3) {
      alert("Sample files cannot be renamed.");
      return;
    }

    const newName = prompt("Enter new file name", file.name);

    if (!newName || newName.trim() === "") return;

    const updatedFiles = files.map((f) =>
      f.id === file.id
        ? {
            ...f,
            name: newName,
          }
        : f
    );

    setFiles(updatedFiles);
  };

  // Delete uploaded files
  const handleDelete = (file) => {

    // Don't delete sample files
    if (file.id <= 3) {
      alert("Sample files cannot be deleted.");
      return;
    }

    if (window.confirm("Delete this file?")) {
      const updatedFiles = files.filter(
        (f) => f.id !== file.id
      );

      setFiles(updatedFiles);
    }
  };

  return (
    <table className="file-table">

      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Size</th>
          <th>Folder</th>
          <th>Owner</th>
          <th>Upload Date</th>
          <th>Version</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>

        {filteredFiles.length === 0 ? (
          <tr>
            <td colSpan="9" style={{ textAlign: "center" }}>
              No files found
            </td>
          </tr>
        ) : (
          filteredFiles.map((file) => (
            <tr key={file.id}>
              <td>{file.name}</td>
              <td>{file.type}</td>
              <td>{file.size}</td>
              <td>{file.folder}</td>
              <td>{file.owner}</td>
              <td>{file.uploadDate}</td>
              <td>{file.version}</td>
              <td>{file.status}</td>

              <td>
                <button
                  onClick={() => handleRename(file)}
                >
                  ✏️
                </button>

                <button
                  onClick={() => handleDelete(file)}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))
        )}

      </tbody>

    </table>
  );
};

export default FileTable;