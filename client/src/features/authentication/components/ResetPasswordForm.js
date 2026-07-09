import React, { useState } from "react";
import { InputField } from "../../../components/Form/InputField";
import { PrimaryButton } from "../../../components/Buttons";
import { resetPassword } from "../services/authService";
import { PASSWORD_MIN_LENGTH } from "../../../data/constants";

export function ResetPasswordForm({ token, onDone }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password.length < PASSWORD_MIN_LENGTH) {
      setError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setError(err.message || "This link may have expired");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return <PrimaryButton onClick={onDone}>Back to sign in</PrimaryButton>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField label="New password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={`Min. ${PASSWORD_MIN_LENGTH} characters`} required minLength={PASSWORD_MIN_LENGTH} />
      <InputField label="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter password" required />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <PrimaryButton type="submit" loading={submitting} loadingText="Updating...">
        Update password
      </PrimaryButton>
    </form>
  );
}
