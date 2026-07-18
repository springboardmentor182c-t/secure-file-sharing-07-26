import React from "react";

const sampleFiles = [
  {
    name: "Q3-Financial-Report.pdf",
    size: "2.4 MB",
    modified: "Today",
    owner: "Sarah",
    status: "Encrypted",
  },
  {
    name: "Product-Roadmap-2025.pptx",
    size: "8.1 MB",
    modified: "Today",
    owner: "James",
    status: "Shared",
  },
  {
    name: "client-database-backup.zip",
    size: "124.7 MB",
    modified: "Yesterday",
    owner: "Priya",
    status: "Encrypted",
  },
];

const FileTable = ({ files, searchTerm }) => {

  // Combine sample files and uploaded files
  const allFiles = [...sampleFiles, ...files];

  // Filter files based on search text
  const filteredFiles = allFiles.filter((file) =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <table className="file-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Size</th>
          <th>Modified</th>
          <th>Owner</th>
          <th>Status</th>
        </tr>
      </thead>

      <tbody>
        {filteredFiles.map((file, index) => (
          <tr key={index}>
            <td>{file.name}</td>
            <td>{file.size}</td>
            <td>{file.modified}</td>
            <td>{file.owner}</td>
            <td>{file.status}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default FileTable;