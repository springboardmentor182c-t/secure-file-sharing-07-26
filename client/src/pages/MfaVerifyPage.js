import React from "react";
import { AuthLayout } from "../layout/AuthLayout";
import { MfaForm } from "../features/authentication/components/MfaForm";

export function MfaVerifyPage({ mfaToken, onBack }) {
  return (
    <AuthLayout title="Two-factor authentication" subtitle="Enter the 6-digit code from your authenticator app">
      <MfaForm mfaToken={mfaToken} onBack={onBack} />
    </AuthLayout>
  );
}
