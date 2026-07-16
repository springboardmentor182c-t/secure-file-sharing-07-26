import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { authAPI } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const OAuthCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [error, setError] = useState("");

  useEffect(() => {
    const access = params.get("access_token");
    const refresh = params.get("refresh_token");
    const err = params.get("error");

    if (err) {
      setError(err === "provider_not_configured"
        ? "This provider isn't configured. Set the client ID / secret in server/.env and restart the backend."
        : err);
      return;
    }
    if (!access || !refresh) {
      setError("Missing tokens in OAuth callback");
      return;
    }

    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    authAPI.me()
      .then(({ data }) => { setUser(data); navigate("/dashboard", { replace: true }); })
      .catch(() => { setError("Failed to load user profile"); });
  }, [params, navigate, setUser]);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>OAuth Callback</h2>
      {error
        ? <p style={{ color: "#ef4444" }}>{error} — <a href="/login">back to login</a></p>
        : <p>Signing you in…</p>}
    </div>
  );
};

export default OAuthCallback;
