import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import {
  Stack,
  TextField,
  InputAdornment,
  Alert,
  Typography
} from "@mui/material";

import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";

import AuthLayout from "../features/authentication/components/AuthLayout";
import AuthCard from "../features/authentication/components/AuthCard";
import LoadingButton from "../features/authentication/components/LoadingButton";

const ForgotPassword = () => {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {

    if (!email.trim()) {

      setError("Please enter your registered email.");

      return;

    }

    try {

      setLoading(true);

      setError("");

      setSuccess("");

      const response = await axios.post(

        "http://localhost:8000/auth/forgot-password",

        {

          email: email

        }

      );

      setSuccess(response.data.message);

    }

    catch (err) {

      setError(

        err.response?.data?.detail ||

        "Unable to send reset email."

      );

    }

    finally {

      setLoading(false);

    }

  };

  return (

    <AuthLayout>

      <AuthCard

        title="Forgot Password"

        subtitle="Enter your registered email address. A password reset link will be sent to your inbox."

        icon={LockResetOutlinedIcon}

      >

        <Stack spacing={3}>

          {error &&

            <Alert severity="error">

              {error}

            </Alert>

          }

          {success &&

            <Alert severity="success">

              {success}

            </Alert>

          }

          <TextField

            fullWidth

            label="Email Address"

            value={email}

            onChange={(e) =>

              setEmail(e.target.value)

            }

            InputProps={{

              startAdornment: (

                <InputAdornment position="start">

                  <EmailOutlinedIcon />

                </InputAdornment>

              )

            }}

          />

          <LoadingButton

            loading={loading}

            onClick={handleSubmit}

          >

            Send Reset Link

          </LoadingButton>

          <Typography

            align="center"

            sx={{

              cursor: "pointer",

              color: "#8B6F47"

            }}

            onClick={() => navigate("/login")}

          >

            Back to Login

          </Typography>

        </Stack>

      </AuthCard>

    </AuthLayout>

  );

};

export default ForgotPassword;