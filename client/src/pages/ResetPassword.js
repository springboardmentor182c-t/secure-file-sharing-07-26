import React, { useState } from "react";
import axios from "axios";

import { useNavigate, useSearchParams } from "react-router-dom";

import {

  Stack,

  TextField,

  InputAdornment,

  Alert

} from "@mui/material";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

import LockResetOutlinedIcon from "@mui/icons-material/LockResetOutlined";

import AuthLayout from "../features/authentication/components/AuthLayout";

import AuthCard from "../features/authentication/components/AuthCard";

import LoadingButton from "../features/authentication/components/LoadingButton";

const ResetPassword = () => {

  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {

    if (password !== confirmPassword) {

      setError("Passwords do not match.");

      return;

    }

    try {

      setLoading(true);

      setError("");

      setSuccess("");

      const response = await axios.post(

        "http://localhost:8000/auth/reset-password",

        {

          token: token,

          new_password: password

        }

      );

      setSuccess(response.data.message);

      setTimeout(() => {

        navigate("/login");

      }, 2000);

    }

    catch (err) {

      setError(

        err.response?.data?.detail ||

        "Unable to reset password."

      );

    }

    finally {

      setLoading(false);

    }

  };

  return (

    <AuthLayout>

      <AuthCard

        title="Reset Password"

        subtitle="Create a new secure password for your account."

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

            type="password"

            label="New Password"

            value={password}

            onChange={(e) =>

              setPassword(e.target.value)

            }

            InputProps={{

              startAdornment: (

                <InputAdornment position="start">

                  <LockOutlinedIcon />

                </InputAdornment>

              )

            }}

          />

          <TextField

            fullWidth

            type="password"

            label="Confirm Password"

            value={confirmPassword}

            onChange={(e) =>

              setConfirmPassword(e.target.value)

            }

            InputProps={{

              startAdornment: (

                <InputAdornment position="start">

                  <LockOutlinedIcon />

                </InputAdornment>

              )

            }}

          />

          <LoadingButton

            loading={loading}

            onClick={handleSubmit}

          >

            Reset Password

          </LoadingButton>

        </Stack>

      </AuthCard>

    </AuthLayout>

  );

};

export default ResetPassword;