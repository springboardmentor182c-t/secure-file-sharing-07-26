import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "70vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <h1
          style={{
            fontSize: "5rem",
            marginBottom: "10px",
            fontWeight: 800,
          }}
        >
          404
        </h1>

        <h2 style={{ marginBottom: "12px" }}>
          Page Not Found
        </h2>

        <p
          style={{
            color: "#64748b",
            marginBottom: "24px",
          }}
        >
          The page you are looking for does not exist.
        </p>

        <Link
          to="/dashboard"
          className="btn btn-primary"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}