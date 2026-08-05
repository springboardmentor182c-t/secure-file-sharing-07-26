import React from "react";
import AllFilesRow from "./AllFilesRow";

function AllFilesTable({ files }) {
  return (
    <table className="file-table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Owner</th>
          <th>Category</th>
          <th>Uploaded</th>
          <th>Size</th>
        </tr>
      </thead>
      <tbody>
        {files.map((file) => (
          <AllFilesRow key={file.id} file={file} />
        ))}
      </tbody>
    </table>
  );
}

export default AllFilesTable;
