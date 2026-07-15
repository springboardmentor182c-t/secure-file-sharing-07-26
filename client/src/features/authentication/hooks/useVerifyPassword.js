import { useState, useEffect } from 'react';

export default function useVerifyPassword(password) {
  const [feedback, setFeedback] = useState({
    minLength: false,
    hasNumber: false,
    hasSpecial: false,
    isValid: false
  });

  useEffect(() => {
    if (!password) {
      setFeedback({
        minLength: false,
        hasNumber: false,
        hasSpecial: false,
        isValid: false
      });
      return;
    }

    const minLength = password.length >= 6; // Standard check
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    setFeedback({
      minLength,
      hasNumber,
      hasSpecial,
      isValid: minLength && hasNumber
    });
  }, [password]);

  return feedback;
}
