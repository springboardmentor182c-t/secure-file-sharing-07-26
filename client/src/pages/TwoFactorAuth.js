import React from "react";
import { useNavigate } from "react-router-dom";

import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";

import AuthLayout from "../features/authentication/components/AuthLayout";
import AuthCard from "../features/authentication/components/AuthCard";
import TwoFactorForm from "../features/authentication/components/TwoFactorForm";

const TwoFactorAuth = () => {

  const navigate = useNavigate();

  const handleVerify = (otp) => {

    console.log("OTP:", otp);

    // Backend verification here later

    navigate("/home");

  };

  return (

    <AuthLayout>

      <AuthCard
        title="Two-Factor Authentication"
        subtitle="Enter the 6-digit verification code sent to your registered email address."
        icon={VerifiedUserOutlinedIcon}
      >

        <TwoFactorForm
          onVerify={handleVerify}
        />

      </AuthCard>

    </AuthLayout>

  );

};

export default TwoFactorAuth;