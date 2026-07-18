import React from "react";

const StatusBadge = ({ status }) => {
  return (
    <span
      className={
        status === "Encrypted"
          ? "badge encrypted"
          : "badge shared"
      }
    >
      {status}
    </span>
  );
};

export default StatusBadge;