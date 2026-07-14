import React, { useRef, useState } from "react";

import {
  Box,
  Stack,
  Typography,
  Alert,
  TextField
} from "@mui/material";

import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";

import LoadingButton from "./LoadingButton";
import ResendOTP from "./ResendOTP";

const TwoFactorForm = ({ onVerify }) => {

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [error, setError] = useState("");

  const inputs = useRef([]);

  const handleChange = (value, index) => {

    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];

    newOtp[index] = value;

    setOtp(newOtp);

    if (value && index < 5) {

      inputs.current[index + 1].focus();

    }

  };

  const handleKeyDown = (e, index) => {

    if (
      e.key === "Backspace" &&
      otp[index] === "" &&
      index > 0
    ) {

      inputs.current[index - 1].focus();

    }

  };

  const handleSubmit = () => {

    const code = otp.join("");

    if (code.length !== 6) {

      setError("Please enter the complete 6-digit OTP.");

      return;

    }

    setError("");

    onVerify(code);

  };

  return (

    <Stack spacing={3}>

      {error && (

        <Alert severity="error">

          {error}

        </Alert>

      )}

      <Typography
        align="center"
        color="text.secondary"
      >

        Please enter the verification code below.

      </Typography>

      <Box

        display="flex"

        justifyContent="space-between"

        gap={1}

      >

        {otp.map((digit, index) => (

          <TextField

            key={index}

            value={digit}

            inputRef={(el) =>

              (inputs.current[index] = el)

            }

            onChange={(e) =>

              handleChange(

                e.target.value,

                index

              )

            }

            onKeyDown={(e) =>

              handleKeyDown(

                e,

                index

              )

            }

            inputProps={{

              maxLength: 1,

              style: {

                textAlign: "center",

                fontSize: "1.4rem",

                fontWeight: 700

              }

            }}

            sx={{

              width: 55,

              "& .MuiOutlinedInput-root": {

                borderRadius: 2

              }

            }}

          />

        ))}

      </Box>

      <LoadingButton

        endIcon={<ArrowForwardRoundedIcon />}

        onClick={handleSubmit}

      >

        Verify OTP

      </LoadingButton>

      <ResendOTP />

    </Stack>

  );

};

export default TwoFactorForm;