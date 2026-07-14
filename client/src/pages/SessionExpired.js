import React from "react";
import {
  Stack,
  Typography
} from "@mui/material";

import TimerOffIcon from "@mui/icons-material/TimerOff";

import { useNavigate } from "react-router-dom";

import AuthLayout from "../features/authentication/components/AuthLayout";
import AuthCard from "../features/authentication/components/AuthCard";
import LoadingButton from "../features/authentication/components/LoadingButton";

const SessionExpired = () => {

  const navigate = useNavigate();

  return (

    <AuthLayout>

      <AuthCard
        title="Session Expired"
        subtitle="Your session has expired for security reasons."
      >

        <Stack spacing={3}>

          <TimerOffIcon
            sx={{
              fontSize: 70,
              color: "#8B6F47",
              alignSelf: "center"
            }}
          />

          <Typography
            align="center"
            color="text.secondary"
          >
            Please login again to continue using
            TrustShare Secure File Sharing.
          </Typography>

          <LoadingButton
            loading={false}
            onClick={() => navigate("/login")}
          >
            Login Again
          </LoadingButton>

        </Stack>

      </AuthCard>

    </AuthLayout>

  );

};

export default SessionExpired;