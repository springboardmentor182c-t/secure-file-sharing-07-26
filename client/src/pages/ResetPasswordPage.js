import React from "react";
import { AuthLayout } from "../layout/AuthLayout";
import { ResetPasswordForm } from "../features/authentication/components/ResetPasswordForm";

export function ResetPasswordPage({ token, onDone }) {
  return (
    <AuthLayout title="Set a new password" subtitle="Choose a new password for your account">
      <ResetPasswordForm token={token} onDone={onDone} />
    </AuthLayout>
  );
}
