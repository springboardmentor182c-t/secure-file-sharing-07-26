import React from "react";
import { AuthLayout } from "../layout/AuthLayout";
import { ForgotPasswordForm } from "../features/authentication/components/ForgotPasswordForm";

export function ForgotPasswordPage({ onBack }) {
  return (
    <AuthLayout
      title="Forgot password"
      subtitle="Enter your email and we'll send a recovery link"
      footer={
        <button onClick={onBack} className="text-[#B7A2C9] hover:text-white transition-colors">
          ← Back to sign in
        </button>
      }
    >
      <ForgotPasswordForm onBack={onBack} />
    </AuthLayout>
  );
}
