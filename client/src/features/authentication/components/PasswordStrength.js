import React from "react";
import {
  Box,
  LinearProgress,
  Typography
} from "@mui/material";

const PasswordStrength = ({ password }) => {
  const getStrength = () => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
  };

  const strength = getStrength();

  const getColor = () => {
    switch (strength) {
      case 1:
        return "error";
      case 2:
        return "warning";
      case 3:
        return "info";
      case 4:
        return "success";
      case 5:
        return "success";
      default:
        return "inherit";
    }
  };

  const getLabel = () => {
    switch (strength) {
      case 1:
        return "Very Weak";
      case 2:
        return "Weak";
      case 3:
        return "Medium";
      case 4:
        return "Strong";
      case 5:
        return "Very Strong";
      default:
        return "";
    }
  };

  return (
    <Box mt={1}>
      <LinearProgress
        variant="determinate"
        value={strength * 20}
        color={getColor()}
        sx={{
          height: 8,
          borderRadius: 5
        }}
      />

      <Typography
        variant="caption"
        color="text.secondary"
      >
        {getLabel()}
      </Typography>
    </Box>
  );
};

export default PasswordStrength;