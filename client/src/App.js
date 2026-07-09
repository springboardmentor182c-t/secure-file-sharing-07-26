import React, { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AnalyticsProvider } from "./context/AnalyticsContext";
import { SignInPage } from "./pages/SignInPage";
import { SignUpPage } from "./pages/SignUpPage";
import { MfaVerifyPage } from "./pages/MfaVerifyPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { DashboardPage } from "./pages/DashboardPage";
import { setAccessToken } from "./utils/apiClient";

function AuthenticatedRouter() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState("signin");
  const [mfaToken, setMfaToken] = useState(null);

  // Handle the /oauth/callback#access_token=... redirect from the FastAPI OAuth flow
  const [handlingOAuthCallback, setHandlingOAuthCallback] = useState(
    window.location.pathname === "/oauth/callback"
  );

  useEffect(() => {
    if (window.location.pathname === "/oauth/callback") {
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const token = hash.get("access_token");
      if (token) setAccessToken(token);
      window.history.replaceState({}, "", "/");
      setHandlingOAuthCallback(false);
    }
  }, []);

  // Handle the /reset-password?token=... link from the recovery email
  const params = new URLSearchParams(window.location.search);
  const resetToken = window.location.pathname === "/reset-password" ? params.get("token") : null;

  if (loading || handlingOAuthCallback) {
    return (
      <div className="min-h-screen bg-[#212531] flex items-center justify-center">
        <p className="text-[#C5C3C4]/60 text-sm">Loading...</p>
      </div>
    );
  }

  if (resetToken) {
    return (
      <ResetPasswordPage
        token={resetToken}
        onDone={() => {
          window.history.replaceState({}, "", "/");
          window.location.reload();
        }}
      />
    );
  }

  if (user) {
    return <DashboardPage />;
  }

  if (screen === "mfa" && mfaToken) {
    return <MfaVerifyPage mfaToken={mfaToken} onBack={() => setScreen("signin")} />;
  }
  if (screen === "signup") {
    return <SignUpPage onSwitchToSignIn={() => setScreen("signin")} />;
  }
  if (screen === "forgot") {
    return <ForgotPasswordPage onBack={() => setScreen("signin")} />;
  }
  return (
    <SignInPage
      onSwitchToSignUp={() => setScreen("signup")}
      onForgotPassword={() => setScreen("forgot")}
      onMfaRequired={(token) => {
        setMfaToken(token);
        setScreen("mfa");
      }}
    />
  );
}

function App() {
  return (
    <AnalyticsProvider>
      <AuthProvider>
        <AuthenticatedRouter />
      </AuthProvider>
    </AnalyticsProvider>
  );
}

export default App;
