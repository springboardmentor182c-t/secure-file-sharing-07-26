import React from "react";
import { AuthLayout } from "../layout/AuthLayout";
import { SignupForm } from "../features/authentication/components/SignupForm";

export function SignUpPage({ onSwitchToSignIn }) {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start sharing securely today"
      footer={
        <>
          Already have an account?{" "}
          <button onClick={onSwitchToSignIn} className="text-[#B7A2C9] hover:text-white transition-colors">
            Sign in
          </button>
        </>
      }
    >
      <SignupForm />
    </AuthLayout>
  );
}
