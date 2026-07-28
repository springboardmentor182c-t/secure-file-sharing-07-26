import React from "react";
import FileListItem from "./FileListItem";

function FileTable({ files }) {
  return (
    <table className="file-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>User</th>
          <th>Category</th>
          <th>Action</th>
          <th>Accessed</th>
          <th>Size</th>
        </tr>
      </thead>
      <tbody>
        {files.map((file) => (
          <FileListItem
            key={`${file.id}-${file.accessed_at}-${file.user_id}`}
            file={file}
          />
        ))}
      </tbody>
    </table>
  );
}

export default FileTable;