import React from "react";
import {
  FiUser,
  FiEye,
  FiEdit,
  FiShield,
} from "react-icons/fi";

const PermissionsTab = ({ file }) => {
  const ownerName = file?.owner || file?.uploaded_by || "You";
  const fileName = file?.name || file?.file_name || "this file";
  const permissionSummary = file?.permission_summary || "Full Access";

  return (
    <div className="permissions-container">

      <h3>Access Permissions</h3>

      <div className="permission-card">

        <div className="permission-user">
          <div className="permission-avatar">
            <FiUser />
          </div>

          <div>
            <h4>{ownerName}</h4>
            <p>Owner</p>
          </div>

          <span className="permission-badge owner">
            {permissionSummary}
          </span>
        </div>

        <hr />

        <div className="permission-row">
          <div className="permission-label">
            <FiEye />
            View
          </div>

          <span className="permission-status allowed">
            Allowed
          </span>
        </div>

        <div className="permission-row">
          <div className="permission-label">
            <FiEdit />
            Edit
          </div>

          <span className="permission-status allowed">
            Allowed
          </span>
        </div>

        <div className="permission-row">
          <div className="permission-label">
            <FiShield />
            Share
          </div>

          <span className="permission-status allowed">
            Allowed
          </span>
        </div>

      </div>

      <div className="permission-card">

        <h4>Shared Users</h4>

        <div className="shared-user">

          <div className="shared-avatar">
            {fileName.charAt(0).toUpperCase() || "F"}
          </div>

          <div className="shared-details">
            <strong>{ownerName}</strong>
            <p>Primary access to {fileName}</p>
          </div>

          <span className="permission-status view">
            Viewer
          </span>

        </div>

        <div className="shared-user">

          <div className="shared-avatar">
            ME
          </div>

          <div className="shared-details">
            <strong>You</strong>
            <p>Manage access and collaboration</p>
          </div>

          <span className="permission-status edit">
            Editor
          </span>

        </div>

      </div>

    </div>
  );
};

export default PermissionsTab;