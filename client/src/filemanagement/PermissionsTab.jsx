import React from "react";
import {
  FiUser,
  FiEye,
  FiEdit,
  FiShield,
} from "react-icons/fi";

const PermissionsTab = ({ file }) => {
  return (
    <div className="permissions-container">

      <h3>Access Permissions</h3>

      <div className="permission-card">

        <div className="permission-user">
          <div className="permission-avatar">
            <FiUser />
          </div>

          <div>
            <h4>{file.owner}</h4>
            <p>Owner</p>
          </div>

          <span className="permission-badge owner">
            Full Access
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
            JD
          </div>

          <div className="shared-details">
            <strong>John Doe</strong>
            <p>View Only</p>
          </div>

          <span className="permission-status view">
            Viewer
          </span>

        </div>

        <div className="shared-user">

          <div className="shared-avatar">
            EM
          </div>

          <div className="shared-details">
            <strong>Emma Watson</strong>
            <p>Edit Access</p>
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