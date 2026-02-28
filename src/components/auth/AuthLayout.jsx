import React from "react";
import { Box, Card, CardContent } from "@mui/material";
import AuthSidebar from "./AuthSidebar";
import { AUTH_BACKGROUND } from "./authConstants";
const AuthLayout = ({
  children,
  sidebarTitle,
  sidebarSubtitle,
  sidebarFeatures,
  background = AUTH_BACKGROUND,
}) => {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background,
        padding: { xs: 2, md: 4 },
      }}
    >
      <Card
        sx={{
          maxWidth: { xs: 450, md: 1100 },
          width: "100%",
          boxShadow: { xs: "0 8px 32px rgba(0,0,0,0.1)", md: "0 25px 80px rgba(15, 23, 42, 0.12)" },
          borderRadius: { xs: 3, md: 4 },
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "0.95fr 1fr" },
            minHeight: { md: 540 },
          }}
        >
          <AuthSidebar
            title={sidebarTitle}
            subtitle={sidebarSubtitle}
            features={sidebarFeatures}
          />
          <CardContent
            sx={{
              p: { xs: 3, md: 2 },
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#fff",
            }}
          >
            <Box sx={{ width: "100%", maxWidth: 430, mx: "auto" }}>
              {children}
            </Box>
          </CardContent>
        </Box>
      </Card>
    </Box>
  );
};
export default AuthLayout;