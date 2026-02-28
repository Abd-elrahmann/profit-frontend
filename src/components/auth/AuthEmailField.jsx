import React from "react";
import { TextField, InputAdornment, Box } from "@mui/material";
import { MdAlternateEmail as AlternateEmailIcon } from "react-icons/md";
import { INPUT_ADORNMENT_SX } from "./authConstants";
const AuthEmailField = ({ autoComplete = "username", ...props }) => (
  <TextField
    fullWidth
    label="البريد الإلكتروني"
    name="email"
    variant="outlined"
    InputLabelProps={{ shrink: true }}
    autoComplete={autoComplete}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start" sx={INPUT_ADORNMENT_SX}>
          <Box sx={{ display: "flex", alignItems: "center", width: 22, justifyContent: "center" }}>
            <AlternateEmailIcon size={18} color="#64748b" />
          </Box>
        </InputAdornment>
      ),
    }}
    {...props}
  />
);
export default AuthEmailField;