import React from "react";

const AdminHeader = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 style={{ fontSize: "1.375rem", fontWeight: 800 }}>
          Admin Panel
        </h1>

        <p className="text-muted text-sm mt-1">
          System management, users & security monitoring
        </p>
      </div>

      <div className="flex gap-2">
        <span className="badge badge-purple">
          Admin Access
        </span>
      </div>
    </div>
  );
};

export default AdminHeader;