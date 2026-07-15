import { useState } from 'react';
import { signupService } from '../services/signup';

export default function useSignup() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const signup = async (email, password, fullName) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await signupService(email, password, fullName);
      setSuccess(true);
      return true;
    } catch (err) {
      setError(err.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading, error, success };
}
