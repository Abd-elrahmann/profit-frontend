import React from "react";
import { Stack, Typography } from "@mui/material";
const AuthFormTitle = ({ children }) => (
  <Stack spacing={1} sx={{ textAlign: "center", mb: 3 }}>
    <Typography sx={{ fontSize: 24, fontWeight: 700, color: "#0f172a", textAlign: "center" }}>
      {children}
    </Typography>
  </Stack>
);
export default AuthFormTitle;