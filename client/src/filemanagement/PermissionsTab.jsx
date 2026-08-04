import React from "react";
import {
  FiUser,
  FiEye,
  FiEdit,
  FiShield,
} from "react-icons/fi";

const PermissionsTab = ({ file }) => {
  const ownerName = file?.owner || file?.uploaded_by || "Owner";
  const fileName = file?.name || file?.file_name || "this file";
  const permissionSummary =
    file?.permission_summary ||
    file?.permissions?.summary ||
    "";
  const sharedUsers = Array.isArray(file?.shared_users)
    ? file.shared_users.map((user) =>
        typeof user === "string"
          ? { name: user, role: "Shared" }
          : user
      )
    : [];

  const hasPermissionData = Boolean(permissionSummary || sharedUsers.length);

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
            {permissionSummary || "Managed by server"}
          </span>
        </div>

        <hr />

        <div className="permission-row">
          <div className="permission-label">
            <FiEye />
            View
          </div>

          <span className="permission-status allowed">
            {permissionSummary ? "Allowed" : "Pending"}
          </span>
        </div>

        <div className="permission-row">
          <div className="permission-label">
            <FiEdit />
            Edit
          </div>

          <span className="permission-status allowed">
            {permissionSummary ? "Allowed" : "Pending"}
          </span>
        </div>

        <div className="permission-row">
          <div className="permission-label">
            <FiShield />
            Share
          </div>

          <span className="permission-status allowed">
            {permissionSummary ? "Allowed" : "Pending"}
          </span>
        </div>

      </div>

      <div className="permission-card">

        <h4>Shared Users</h4>

        {hasPermissionData ? (
          sharedUsers.length > 0 ? (
            sharedUsers.map((user, index) => (
              <div className="shared-user" key={user?.id || `${user?.name || "shared"}-${index}`}>
                <div className="shared-avatar">
                  {(user?.name || user?.username || ownerName)
                    .charAt(0)
                    .toUpperCase() || "U"}
                </div>

                <div className="shared-details">
                  <strong>{user?.name || user?.username || ownerName}</strong>
                  <p>{user?.role || user?.permission || "Shared access"}</p>
                </div>

                <span className="permission-status view">
                  {user?.role || "Shared"}
                </span>
              </div>
            ))
          ) : (
            <div className="shared-user">
              <div className="shared-avatar">
                {fileName.charAt(0).toUpperCase() || "F"}
              </div>

              <div className="shared-details">
                <strong>{ownerName}</strong>
                <p>{permissionSummary || "Access details are managed for this file"}</p>
              </div>

              <span className="permission-status view">
                Managed
              </span>
            </div>
          )
        ) : (
          <p className="permission-empty">
            No permission details are available yet for this file.
          </p>
        )}

      </div>

    </div>
  );
};

export default PermissionsTab;