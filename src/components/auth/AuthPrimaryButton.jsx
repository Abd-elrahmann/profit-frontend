import React from "react";
import { Button, CircularProgress } from "@mui/material";
import { AUTH_BUTTON_SX } from "./authConstants";
const AuthPrimaryButton = ({ children, disabled, isLoading, fullWidth = true, type = "submit", onClick }) => {
  return (
    <Button
      type={type}
      fullWidth={fullWidth}
      variant="contained"
      disabled={disabled || isLoading}
      onClick={onClick}
      sx={AUTH_BUTTON_SX}
    >
      {isLoading ? (
        <CircularProgress size={22} sx={{ color: "#fff" }} />
      ) : (
        children
      )}
    </Button>
  );
};
export default AuthPrimaryButton;