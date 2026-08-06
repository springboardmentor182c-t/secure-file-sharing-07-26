import React, { useState } from "react";
import { Stack, TextField, Alert } from "@mui/material";
import PasswordStrength from "./PasswordStrength";
import LoadingButton from "./LoadingButton";

const ChangePasswordForm = ({ onSubmit }) => {

    const [password, setPassword] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");

    const [error, setError] = useState("");

    const handleSave = () => {

        if (password !== confirmPassword) {

            setError("Passwords do not match.");

            return;

        }

        setError("");

        onSubmit(password);

    };

    return (

        <Stack spacing={3}>

            {error && <Alert severity="error">{error}</Alert>}

            <TextField

                label="New Password"

                type="password"

                fullWidth

                value={password}

                onChange={(e) =>
                    setPassword(e.target.value)
                }

            />

            <PasswordStrength password={password} />

            <TextField

                label="Confirm Password"

                type="password"

                fullWidth

                value={confirmPassword}

                onChange={(e) =>
                    setConfirmPassword(e.target.value)
                }

            />

            <LoadingButton onClick={handleSave}>

                Save Password

            </LoadingButton>

        </Stack>

    );

};

export default ChangePasswordForm;