import React from "react";
import axios from "axios";

import { useLocation, useNavigate } from "react-router-dom";

import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";

import AuthLayout from "../features/authentication/components/AuthLayout";
import AuthCard from "../features/authentication/components/AuthCard";
import TwoFactorForm from "../features/authentication/components/TwoFactorForm";

const OTPVerification = () => {

    const navigate = useNavigate();

    const location = useLocation();

    const email = location.state?.email;

    const handleVerify = async (otp) => {

        try {

            const response = await axios.post(
                "http://localhost:8000/auth/verify-otp",
                {
                    email: email,
                    otp_code: otp
                }
            );

            localStorage.setItem(
                "token",
                response.data.access_token
            );

            localStorage.setItem(
                "refresh_token",
                response.data.refresh_token
            );

            navigate("/login");

        }
        catch (error) {

            alert(
                error.response?.data?.detail ||
                "Invalid OTP"
            );

        }

    };

    return (

        <AuthLayout>

            <AuthCard
                title="OTP Verification"
                subtitle="Enter the 6-digit OTP sent to your registered email address."
                icon={VerifiedUserOutlinedIcon}
            >

                <TwoFactorForm
                    onVerify={handleVerify}
                />

            </AuthCard>

        </AuthLayout>

    );

};

export default OTPVerification;