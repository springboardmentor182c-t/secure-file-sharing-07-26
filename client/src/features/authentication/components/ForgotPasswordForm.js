import React, { useState } from "react";
import { Mail } from "lucide-react";
import { InputField } from "../../../components/Form/InputField";
import { PrimaryButton } from "../../../components/Buttons";
import { forgotPassword } from "../services/authService";

export function ForgotPasswordForm({ onBack }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center py-4 gap-4">
        <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/30 flex items-center justify-center">
          <Mail size={24} className="text-green-400" />
        </div>
        <p className="text-[#C5C3C4]/70 text-sm text-center leading-relaxed">
          We sent a recovery link to {email}. Click the link in the email to reset your password — it expires in 15 minutes.
        </p>
        <PrimaryButton onClick={onBack}>Back to sign in</PrimaryButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <PrimaryButton type="submit" loading={submitting} loadingText="Sending...">
        Send recovery link
      </PrimaryButton>
    </form>
  );
}
