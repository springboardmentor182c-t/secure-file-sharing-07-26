import { useState, useEffect } from 'react';

/**
 * useVerifyPassword – validates a password according to common security rules.
 *
 * Returns an object with boolean flags and an overall `isValid` field.
 *
 * Rules:
 *   - Minimum length 8 characters
 *   - At least one uppercase letter
 *   - At least one lowercase letter
 *   - At least one numeric digit
 *   - At least one special character
 */
export default function useVerifyPassword(password) {
  const [state, setState] = useState({
    lengthOk: false,
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
    isValid: false,
  });

  useEffect(() => {
    const lengthOk = password?.length >= 8;
    const hasUpper = /[A-Z]/.test(password || '');
    const hasLower = /[a-z]/.test(password || '');
    const hasNumber = /[0-9]/.test(password || '');
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password || '');
    const isValid = lengthOk && hasUpper && hasLower && hasNumber && hasSpecial;
    setState({ lengthOk, hasUpper, hasLower, hasNumber, hasSpecial, isValid });
  }, [password]);

  return state;
}
