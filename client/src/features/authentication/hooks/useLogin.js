import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/login";
import { saveSession } from "../services/authStorage";

export function useLogin() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async ({ email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await login({ email, password });

      if (data.mfa_required) {
        // Password checked out - hand off to the MFA screen with the
        // short-lived mfa_token. No full session yet.
        navigate("/mfa", { state: { mfaToken: data.mfa_token, email } });
        return true;
      }

      saveSession({ token: data.token, user: data.user });
      navigate("/", { replace: true });
      return true;
    } catch (err) {
      setError(err.message || "Couldn't sign you in. Check your email and password.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}