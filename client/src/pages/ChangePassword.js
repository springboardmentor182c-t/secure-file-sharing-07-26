import React, { useState } from "react";
import {
  Alert,
  Stack,
  TextField
} from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockReset";
import { useNavigate } from "react-router-dom";

import AuthLayout from "../features/authentication/components/AuthLayout";
import AuthCard from "../features/authentication/components/AuthCard";
import LoadingButton from "../features/authentication/components/LoadingButton";
import PasswordStrength from "../features/authentication/components/PasswordStrength";

const ChangePassword = () => {

  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState("");

  const [newPassword, setNewPassword] = useState("");

  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = () => {

    setError("");

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {

      setError("Please fill all fields.");

      return;

    }

    if (newPassword !== confirmPassword) {

      setError("Passwords do not match.");

      return;

    }

    setLoading(true);

    setTimeout(() => {

      setLoading(false);

      alert("Password changed successfully.");

      navigate("/login");

    }, 1500);

  };

  return (

    <AuthLayout>

      <AuthCard
        title="Change Password"
        subtitle="Update your VaultShare password."
      >

        <Stack spacing={3}>

          <LockResetIcon
            sx={{
              fontSize: 55,
              color: "#8B6F47",
              alignSelf: "center"
            }}
          />

          {error && (
            <Alert severity="error">
              {error}
            </Alert>
          )}

          <TextField
            label="Current Password"
            type="password"
            fullWidth
            value={currentPassword}
            onChange={(e) =>
              setCurrentPassword(e.target.value)
            }
          />

          <TextField
            label="New Password"
            type="password"
            fullWidth
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
          />

          <PasswordStrength
            password={newPassword}
          />

          <TextField
            label="Confirm Password"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
          />

          <LoadingButton
            loading={loading}
            onClick={handleSubmit}
          >
            Update Password
          </LoadingButton>

        </Stack>

      </AuthCard>

    </AuthLayout>

  );

};

export default ChangePassword;