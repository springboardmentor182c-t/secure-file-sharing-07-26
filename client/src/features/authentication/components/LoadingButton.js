import React from "react";
import {
  Button,
  CircularProgress
} from "@mui/material";

const LoadingButton = ({
  loading,
  children,
  ...props
}) => {
  return (
    <Button
      fullWidth
      variant="contained"
      disabled={loading}
      sx={{
        mt: 2,
        py: 1.4,
        borderRadius: 3,
        textTransform: "none",
        fontSize: 16,
        fontWeight: 600,
        backgroundColor: "#8B6F47",

        "&:hover": {
          backgroundColor: "#6D5636"
        }
      }}
      {...props}
    >
      {loading ? (
        <CircularProgress
          size={24}
          sx={{
            color: "#fff"
          }}
        />
      ) : (
        children
      )}
    </Button>
  );
};

export default LoadingButton;