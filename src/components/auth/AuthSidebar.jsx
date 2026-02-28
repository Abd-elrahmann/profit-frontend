import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import {
  MdSecurity as SecurityIcon,
  MdCheckCircle as CheckCircleIcon,
} from "react-icons/md";
import Logo from "/assets/images/logo.webp";
const AuthSidebar = ({ title, subtitle, features }) => {
  return (
    <Box
      sx={{
        position: "relative",
        p: { xs: 3, md: 5 },
        background:
          "linear-gradient(135deg, #1e5a2e 0%, #2E8B45 50%, #3da35a 100%)",
        color: "#fff",
        overflow: "hidden",
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        gap: 4,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          opacity: 0.12,
          backgroundImage:
            "radial-gradient(circle at 30% 20%, #fff, transparent 28%), radial-gradient(circle at 70% 80%, #fff, transparent 22%)",
        }}
      />
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <img src={Logo} alt="Logo" style={{ width: 34, height: 34 }} />
          <Typography sx={{ fontSize: 22, fontWeight: 700, lineHeight: 1.3, color: "#fff" }}>
            نظام إدارة السلف
          </Typography>
        </Stack>
        <Typography sx={{ color: "rgba(255,255,255,0.78)", fontSize: 14, mt: 1.5 }}>
          منصة مالية موثوقة لإدارة السلف والاستحقاقات بسهولة وأمان.
        </Typography>
      </Box>
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Typography sx={{ fontSize: 28, fontWeight: 800, mb: 1, color: "#fff" }}>
          {title}
        </Typography>
        <Typography sx={{ color: "rgba(255,255,255,0.88)", mb: 3 }}>
          {subtitle}
        </Typography>
        <Stack spacing={1.5}>
          {features.map((item, idx) => (
            <Stack
              key={idx}
              direction="row"
              spacing={1.2}
              alignItems="center"
              sx={{
                backgroundColor: "rgba(255,255,255,0.06)",
                borderRadius: 2,
                px: 1.5,
                py: 1,
                backdropFilter: "blur(4px)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.12)",
                }}
              >
                {item.icon}
              </Box>
              <Typography sx={{ fontSize: 15, fontWeight: 500, color: "#fff" }}>
                {item.text}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Box>
    </Box>
  );
};
export default AuthSidebar;