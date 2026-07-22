import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";

import AuthLayout from "../features/authentication/components/AuthLayout";
import AuthCard from "../features/authentication/components/AuthCard";
import TwoFactorForm from "../features/authentication/components/TwoFactorForm";

const TwoFactorAuth = () => {

    const navigate = useNavigate();

    const handleVerify = async (otp) => {

        try {

            const email = localStorage.getItem("email");

            if (!email) {

                alert("Session expired. Please login again.");

                navigate("/login");

                return;

            }

            const response = await axios.post(
                "http://localhost:8000/auth/verify-otp",
                {
                    email: email,
                    otp_code: otp
                }
            );

            // Store JWT tokens
            localStorage.setItem(
                "token",
                response.data.access_token
            );

            localStorage.setItem(
                "refresh_token",
                response.data.refresh_token
            );

            // Store user role
            localStorage.setItem(
                "role",
                response.data.role
            );

            // Remove temporary email
            localStorage.removeItem("email");

            // Redirect based on role
            if (response.data.role === "admin") {

                navigate("/admin");

            } else {

                navigate("/home");

            }

        }

        catch (error) {

            console.error(error);

            alert(

                error.response?.data?.detail ||

                "Invalid OTP"

            );

        }

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