import React from "react";
import { TextField, InputAdornment, Box, IconButton } from "@mui/material";
import { MdLock as LockIcon, MdVisibility as VisibilityIcon, MdVisibilityOff as VisibilityOffIcon } from "react-icons/md";
import { INPUT_ADORNMENT_LOCK_SX } from "./authConstants";
const AuthPasswordField = ({
  label = "كلمة المرور",
  name = "password",
  showPassword,
  onTogglePassword,
  autoComplete = "current-password",
  ...props
}) => (
  <TextField
    fullWidth
    label={label}
    name={name}
    type={showPassword ? "text" : "password"}
    variant="outlined"
    InputLabelProps={{ shrink: true }}
    autoComplete={autoComplete}
    InputProps={{
      startAdornment: (
        <InputAdornment position="start" sx={INPUT_ADORNMENT_LOCK_SX}>
          <Box sx={{ display: "flex", alignItems: "center", width: 22, justifyContent: "center" }}>
            <LockIcon size={18} color="#64748b" />
          </Box>
        </InputAdornment>
      ),
      ...(onTogglePassword && {
        endAdornment: (
          <InputAdornment position="end" sx={{ shrink: true }}>
            <IconButton
              onClick={onTogglePassword}
              aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
            >
              {showPassword ? <VisibilityOffIcon size={20} /> : <VisibilityIcon size={20} />}
            </IconButton>
          </InputAdornment>
        ),
      }),
    }}
    {...props}
  />
);
export default AuthPasswordField;