import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
} from "react-router-dom";

// Authentication Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import OTPVerification from "./pages/OTPVerification";
import EmailVerification from "./pages/EmailVerification";
import TwoFactorAuth from "./pages/TwoFactorAuth";
import SessionExpired from "./pages/SessionExpired";
import AdminHome from "./pages/AdminHome";

import AdminRoute from "./features/authentication/components/AdminRoute";

// Dashboard Page
import Home from "./pages/Home";

// Protected Route
import ProtectedRoute from "./features/authentication/components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Default Route */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Authentication Routes */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<Signup />}
        />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        <Route
          path="/otp-verification"
          element={<OTPVerification />}
        />

        <Route
          path="/email-verification"
          element={<EmailVerification />}
        />

        <Route
          path="/two-factor"
          element={<TwoFactorAuth />}
        />

        <Route
          path="/session-expired"
          element={<SessionExpired />}
        />

        {/* Dashboard Route */}
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />

        {/* Invalid Route */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
                <AdminHome />
            </AdminRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;