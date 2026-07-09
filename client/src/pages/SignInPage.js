import React from "react";
import { AuthLayout } from "../layout/AuthLayout";
import { LoginForm } from "../features/authentication/components/LoginForm";

export function SignInPage({ onSwitchToSignUp, onForgotPassword, onMfaRequired }) {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your TrustShare account"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <button onClick={onSwitchToSignUp} className="text-[#B7A2C9] hover:text-white transition-colors">
            Create one
          </button>
        </>
      }
    >
      <LoginForm onForgotPassword={onForgotPassword} onMfaRequired={onMfaRequired} />
    </AuthLayout>
  );
}
