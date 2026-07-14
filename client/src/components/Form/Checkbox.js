import React from "react";
import { Checkbox, FormControlLabel } from "@mui/material";

const CustomCheckbox = ({ label, checked, onChange }) => {
  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={checked}
          onChange={onChange}
          sx={{
            color: "#7B5A50",
            "&.Mui-checked": {
              color: "#7B5A50",
            },
          }}
        />
      }
      label={label}
      sx={{
        "& .MuiFormControlLabel-label": {
          fontSize: "14px",
        },
      }}
    />
  );
};

export default CustomCheckbox;