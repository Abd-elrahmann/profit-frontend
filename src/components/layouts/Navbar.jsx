import React, { useState } from "react";
import {
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import {
  MdMenu as MenuIcon,
  MdMenuOpen as MenuOpenIcon,
  MdPerson as Person,
  MdExitToApp as ExitToApp,
} from "react-icons/md";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "/assets/images/logo.webp";
const Navbar = ({ onMenuToggle, isSidebarOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
    handleUserMenuClose();
    navigate("/login", { replace: true });
  };


  if (location.pathname === "/login") {
    return null;
  }

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1201,
        backgroundColor: "#ffffff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", direction: "rtl" }}>
        <div>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              {localStorage.getItem('user') ? (
              <IconButton
                edge="start"
                color="inherit"
                aria-label="toggle sidebar"
                onClick={() => {
                  onMenuToggle();
                  window.dispatchEvent(new Event("sidebarToggle"));
                }}
                sx={{
                  color: "primary.main",
                  mr: 1,
                  transition: "all 0.01s ease",
                  "&:hover": {
                    backgroundColor: "rgba(30, 64, 175, 0.1)",
                    transform: "scale(1.1)",
                  },
                }}
              >
                {isSidebarOpen ? <MenuOpenIcon /> : <MenuIcon />}
              </IconButton>
            ) : null}

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap:1 }}>
            <img src={logo} alt="logo" style={{ width: "30px", height: "30px" }} />

              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 600,
                  color: "primary.main",
                  display: { xs: "none", sm: "flex" },
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span>نظام إدارة السلف</span>
              </Typography>
              </Box>
            </Box>
        </div>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {localStorage.getItem('user') ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Box sx={{ textAlign: "right", mr: 2, display: "block" }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: "primary.main",
                    fontSize: "0.85rem",
                  }}
                >
                  مرحباً
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 600,
                    color: "primary.main",
                  }}
                >
                  {JSON.parse(localStorage.getItem('user')).name}
                </Typography>
              </Box>
              <IconButton onClick={handleUserMenuOpen} sx={{ p: 0 }}>
                <Avatar
                  src={JSON.parse(localStorage.getItem('user'))?.profileImage || undefined}
                  sx={{
                    bgcolor: "primary.main",
                    width: 40,
                    height: 40,
                    fontSize: "1.2rem",
                  }}
                >
                  {!JSON.parse(localStorage.getItem('user'))?.profileImage && JSON.parse(localStorage.getItem('user'))?.fullName?.charAt(0)}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleUserMenuClose}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                sx={{
                  "& .MuiMenuItem-root": {
                    direction: "rtl",
                  },
                }}
              >
                <MenuItem onClick={handleLogout}>
                  <ExitToApp sx={{ mr: 1, ml: 0 }} />
                  تسجيل الخروج
                </MenuItem>
              </Menu>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Button
                variant="contained"
                onClick={() => navigate("/login")}
                sx={{
                  backgroundColor: "primary.main",
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                }}
              >
                تسجيل الدخول
              </Button>
            </div>
          )}
        </Box>
      </Toolbar>
    </div>
  );
};

export default Navbar;
