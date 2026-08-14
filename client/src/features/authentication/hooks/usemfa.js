import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyMfaCode, verifyRecoveryCode } from "../services/mfa";
import { saveSession } from "../services/authStorage";

export function useMfa() {
  const navigate = useNavigate();
  const location = useLocation();
  const mfaToken = location.state?.mfaToken;
  const email = location.state?.email;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submitCode = async (code) => {
    if (!mfaToken) {
      setError("Your session expired. Please sign in again.");
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await verifyMfaCode({ mfaToken, code });
      saveSession({ token: data.token, user: data.user });
      navigate("/", { replace: true });
      return true;
    } catch (err) {
      setError(err.message || "That code didn't work. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const submitRecoveryCode = async (recoveryCode) => {
    if (!mfaToken) {
      setError("Your session expired. Please sign in again.");
      return false;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await verifyRecoveryCode({ mfaToken, recoveryCode });
      saveSession({ token: data.token, user: data.user });
      navigate("/", { replace: true });
      return true;
    } catch (err) {
      setError(err.message || "That recovery code didn't work.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { email, mfaToken, submitCode, submitRecoveryCode, loading, error };
}