import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Divider,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useMediaQuery,
  useTheme as useMuiTheme,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Brightness4,
  Brightness7,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../theme/ThemeContext";
import { useAuth } from "../Contexts/AuthContext";
import Logo from "/assets/images/logo.webp";

const Navbar = ({ onMenuToggle, isSidebarOpen }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  const handleUserMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
    handleUserMenuClose();
    navigate("/profile");
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
        color: isDarkMode ? "#fff" : "#000",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuToggle}
            sx={{
              display: { xs: "block", md: isSidebarOpen ? "none" : "block" },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <img
              src={Logo}
              alt="Logo"
              style={{
                width: isMobile ? 28 : 34,
                height: isMobile ? 28 : 34,
              }}
            />
            {!isMobile && (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: isDarkMode ? "white" : "primary.main",
                  fontSize: isMobile ? "1rem" : "1.25rem",
                }}
              >
                نظام إدارة السلف
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Tooltip title={isDarkMode ? "الوضع النهاري" : "الوضع الليلي"}>
            <IconButton onClick={toggleTheme} color="inherit">
              {isDarkMode ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Tooltip>

          <Tooltip title="الحساب">
            <IconButton onClick={handleUserMenuOpen} color="inherit">
              {user?.profileImage ? (
                <Avatar
                  src={user.profileImage}
                  alt={user.name}
                  sx={{ width: 32, height: 32 }}
                />
              ) : (
                <AccountCircle />
              )}
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleUserMenuClose}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            PaperProps={{
              sx: {
                mt: 1.5,
                minWidth: 200,
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle1" fontWeight="bold">
                {user?.name || "مستخدم"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email || ""}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleProfileClick}>
              <ListItemIcon>
                <AccountCircle fontSize="small" />
              </ListItemIcon>
              <ListItemText>الملف الشخصي</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <Logout fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>
                <Typography color="error">تسجيل الخروج</Typography>
              </ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
