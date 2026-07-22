import React from "react";
import { Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="protected-loading">
        <motion.div
          className="protected-loading-spinner"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
        >
          <div className="spinner-ring" />
          <div className="spinner-ring spinner-ring-delay" />
        </motion.div>
        <motion.p
          className="protected-loading-text"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          Loading TrustShare...
        </motion.p>

        <style>{`
          .protected-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 16px;
            height: 100vh;
            background: #f8fafc;
            transition: background 0.3s ease;
          }

          body.dark .protected-loading {
            background: #0b1220;
          }

          .protected-loading-spinner {
            position: relative;
            width: 48px;
            height: 48px;
          }

          .spinner-ring {
            position: absolute;
            inset: 0;
            border: 3px solid transparent;
            border-top-color: #6366f1;
            border-radius: 50%;
            animation: spinnerRotate 1s linear infinite;
          }

          .spinner-ring-delay {
            border-top-color: #3b82f6;
            animation-duration: 1.5s;
            animation-direction: reverse;
            opacity: 0.5;
          }

          @keyframes spinnerRotate {
            to { transform: rotate(360deg); }
          }

          .protected-loading-text {
            font-size: 13px;
            font-weight: 500;
            color: #64748b;
            letter-spacing: -0.1px;
            margin: 0;
            transition: color 0.3s ease;
          }

          body.dark .protected-loading-text {
            color: #94a3b8;
          }

          @media (prefers-reduced-motion: reduce) {
            .spinner-ring {
              animation-duration: 3s;
            }
          }
        `}</style>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin")
    return <Navigate to="/dashboard" replace />;

  return children;
}