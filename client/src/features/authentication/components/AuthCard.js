import React from "react";
import {
  Paper,
  Typography,
  Box,
  Divider
} from "@mui/material";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const AuthCard = ({
  title,
  subtitle,
  children,
  icon,
}) => {

  const Icon = icon || LockOutlinedIcon;

  return (

    <Paper
      elevation={8}
      sx={{
        width: "100%",
        maxWidth: 460,
        mx: "auto",
        p: { xs: 4, sm: 5 },
        borderRadius: 4,
        backgroundColor: "#FFFFFF",
        border: "1px solid #EFE6D8",
        boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >

      {/* Icon */}

      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "linear-gradient(135deg,#A07B4E,#7B5B35)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mb: 3,
        }}
      >

        <Icon
          sx={{
            color: "#fff",
            fontSize: 40,
          }}
        />

      </Box>

      {/* Title */}

      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: "#4E342E",
          mb: 2,
          width: "100%",
          textAlign: "center",
        }}
      >
        {title}
      </Typography>

      {/* Subtitle */}

      <Typography
        sx={{
          color: "#7A6A58",
          lineHeight: 1.7,
          maxWidth: 330,
          mb: 4,
          textAlign: "center",
        }}
      >
        {subtitle}
      </Typography>

      <Divider
        sx={{
          width: "100%",
          mb: 4,
          borderColor: "#E8DED1",
        }}
      />

      {/* Form */}

      <Box
        sx={{
          width: "100%",
        }}
      >
        {children}
      </Box>

      <Divider
        sx={{
          width: "100%",
          mt: 4,
          mb: 3,
          borderColor: "#E8DED1",
        }}
      />

      {/* Footer */}

      <Box
        sx={{
          width: "100%",
          textAlign: "center",
        }}
      >

        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "#7B5B35",
          }}
        >
          TrustShare
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: "#8A7A68",
            mt: 1,
          }}
        >
          Secure Authentication • Trusted File Sharing
        </Typography>

      </Box>

    </Paper>

  );

};

export default AuthCard;