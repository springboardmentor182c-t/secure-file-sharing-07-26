import React, { useState } from "react";
import { Smartphone } from "lucide-react";
import { CodeInput } from "../../../components/Form/CodeInput";
import { PrimaryButton, SecondaryButton } from "../../../components/Buttons";
import { useAuth } from "../../../context/AuthContext";
import { MFA_CODE_LENGTH } from "../../../data/constants";

export function MfaForm({ mfaToken, onBack }) {
  const { completeMfa } = useAuth();
  const [code, setCode] = useState(Array(MFA_CODE_LENGTH).fill(""));
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleVerify = async () => {
    setError(null);
    const fullCode = code.join("");
    if (fullCode.length !== MFA_CODE_LENGTH) {
      setError(`Enter all ${MFA_CODE_LENGTH} digits`);
      return;
    }
    setSubmitting(true);
    try {
      await completeMfa(mfaToken, fullCode);
    } catch (err) {
      setError(err.message || "Invalid code");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="mb-6 p-4 rounded-xl bg-[#4B3A70]/20 border border-[#4B3A70]/30 flex items-start gap-3">
        <Smartphone size={15} className="text-[#B7A2C9] mt-0.5 shrink-0" />
        <p className="text-[#C5C3C4]/80 text-xs leading-relaxed">
          Open your authenticator app (Google Authenticator, Authy, or similar) and enter the 6-digit code shown.
        </p>
      </div>
      <CodeInput value={code} onChange={setCode} length={MFA_CODE_LENGTH} />
      {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}
      <div className="space-y-3">
        <PrimaryButton onClick={handleVerify} loading={submitting} loadingText="Verifying...">
          Verify code
        </PrimaryButton>
        <SecondaryButton onClick={onBack}>← Back to sign in</SecondaryButton>
      </div>
      <p className="text-center text-xs text-[#C5C3C4]/40 mt-4">
        Lost access? Enter one of your 8-character backup codes above instead.
      </p>
    </>
  );
}
