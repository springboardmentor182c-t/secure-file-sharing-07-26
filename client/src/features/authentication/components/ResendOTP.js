import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography
} from "@mui/material";

const ResendOTP = ({ onResend }) => {
  const [seconds, setSeconds] = useState(60);

  useEffect(() => {
    if (seconds === 0) return;

    const timer = setInterval(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  const handleResend = () => {
    if (seconds !== 0) return;

    if (onResend) {
      onResend();
    }

    setSeconds(60);
  };

  return (
    <Box
      mt={2}
      textAlign="center"
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        Didn't receive the OTP?
      </Typography>

      <Button
        onClick={handleResend}
        disabled={seconds !== 0}
        sx={{
          textTransform: "none",
          color: "#8B6F47",
          fontWeight: "bold"
        }}
      >
        {seconds === 0
          ? "Resend OTP"
          : `Resend in ${seconds}s`}
      </Button>
    </Box>
  );
};

export default ResendOTP;