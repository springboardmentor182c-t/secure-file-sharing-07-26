import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signup } from "../services/signup";
import { saveSession } from "../services/authStorage";

export function useSignup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const submit = async ({ fullName, email, password }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await signup({ fullName, email, password });
      
      navigate("/", { replace: true });
      return true;
    } catch (err) {
      setError(err.message || "Couldn't create your account. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { submit, loading, error };
}