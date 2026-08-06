import React from "react";
import { TextField, InputAdornment } from "@mui/material";

const FormInput = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  endIcon,
}) => {
  return (
    <TextField
      fullWidth
      variant="outlined"
      label={label}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      margin="normal"
      InputProps={{
        startAdornment: icon ? (
          <InputAdornment position="start">
            {icon}
          </InputAdornment>
        ) : null,
        endAdornment: endIcon ? (
          <InputAdornment position="end">
            {endIcon}
          </InputAdornment>
        ) : null,
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          borderRadius: "12px",
          backgroundColor: "#fff",
        },
        "& .MuiOutlinedInput-root:hover fieldset": {
          borderColor: "#7B5A50",
        },
        "& .MuiOutlinedInput-root.Mui-focused fieldset": {
          borderColor: "#7B5A50",
        },
      }}
    />
  );
};

export default FormInput;