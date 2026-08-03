import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Share2, Clock, Link as LinkIcon, Bell, BarChart3, Users, Trash2 } from "lucide-react";
import { AuthProvider, useAuth } from "./AuthContext.jsx";
import Landing from "./pages/Landing.jsx";
import { SignIn, SignUp, ForgotPassword, ResetPassword, MFAVerify, OAuthLoginCallback } from "./pages/Auth.jsx";
import SecurityDashboard, { OAuthLinkCallback } from "./pages/security.jsx";
import FilesDashboard from "./pages/FilesDashboard.jsx";
import Placeholder from "./pages/Placeholder.jsx";

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/signin" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/mfa" element={<MFAVerify />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Post-login landing page — static UI only, matches the provided design, no backend */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <FilesDashboard />
              </ProtectedRoute>
            }
          />

          {/* Real, backend-wired account security settings */}
          <Route
            path="/security"
            element={
              <ProtectedRoute>
                <SecurityDashboard />
              </ProtectedRoute>
            }
          />

          {/* Remaining sidebar items — static placeholders, no backend behind them yet */}
          <Route
            path="/shared"
            element={
              <ProtectedRoute>
                <Placeholder icon={Share2} title="Shared with me" description="Files and folders that others have shared with you will appear here." />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recent"
            element={
              <ProtectedRoute>
                <Placeholder icon={Clock} title="Recent" description="Files you've viewed or edited recently will appear here." />
              </ProtectedRoute>
            }
          />
          <Route
            path="/shared-links"
            element={
              <ProtectedRoute>
                <Placeholder icon={LinkIcon} title="Shared Links" description="Links you've created to share files externally will appear here." />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Placeholder icon={Bell} title="Notifications" description="Account and file activity notifications will appear here." />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Placeholder icon={BarChart3} title="Analytics" description="Usage and sharing analytics will appear here." />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Placeholder icon={Users} title="Admin" description="Workspace administration tools will appear here." />
              </ProtectedRoute>
            }
          />
          <Route
            path="/trash"
            element={
              <ProtectedRoute>
                <Placeholder icon={Trash2} title="Trash" description="Deleted files will appear here." />
              </ProtectedRoute>
            }
          />

          {/* Linking a provider to the currently signed-in account (Security page) */}
          <Route
            path="/oauth/:provider/callback"
            element={
              <ProtectedRoute>
                <OAuthLinkCallback />
              </ProtectedRoute>
            }
          />
          {/* Signing in / signing up via a provider (Sign In / Sign Up screens) — public */}
          <Route path="/oauth/google/login-callback" element={<OAuthLoginCallback provider="google" />} />
          <Route path="/oauth/microsoft/login-callback" element={<OAuthLoginCallback provider="microsoft" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
