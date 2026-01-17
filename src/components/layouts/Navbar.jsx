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

const Navbar = ({ onMenuToggle }) => {
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
              mr: 1,
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <img
              src={Logo}
              alt="Logo"
              style={{
                width: isMobile ? 24 : 28,
                height: isMobile ? 24 : 28,
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
            
            {!isMobile && (
              <Tooltip title={isDarkMode ? "الوضع النهاري" : "الوضع الليلي"}>
                <IconButton onClick={toggleTheme} color="inherit" size="small" sx={{ p: 0.5 }}>
                  {isDarkMode ? <Brightness7 sx={{ fontSize: 20 }} /> : <Brightness4 sx={{ fontSize: 20 }} />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {!isMobile && user?.name && (
            <Box sx={{ textAlign: 'right', mr: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  color: isDarkMode ? "rgba(255,255,255,0.7)" : "text.secondary",
                  fontSize: '0.85rem',
                  lineHeight: 1.2,
                }}
              >
                مرحباً
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 600,
                  color: 'primary.main',
                  fontSize: '0.95rem',
                  lineHeight: 1.2,
                }}
              >
                {user.name}
              </Typography>
            </Box>
          )}

          <Tooltip title="الحساب">
            <IconButton onClick={handleUserMenuOpen} color="inherit">
              <Avatar
                src={user?.profileImage}
                alt={user?.name}
                sx={{ 
                  width: 40, 
                  height: 40,
                  bgcolor: user?.profileImage ? 'transparent' : 'primary.main',
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '1.1rem'
                }}
              >
                {!user?.profileImage && user?.name ? user.name.charAt(0).toUpperCase() : ''}
              </Avatar>
            </IconButton>
          </Tooltip>
          
          {isMobile && (
            <Tooltip title={isDarkMode ? "الوضع النهاري" : "الوضع الليلي"}>
              <IconButton onClick={toggleTheme} color="inherit" size="small" sx={{ p: 0.5 }}>
                {isDarkMode ? <Brightness7 sx={{ fontSize: 20 }} /> : <Brightness4 sx={{ fontSize: 20 }} />}
              </IconButton>
            </Tooltip>
          )}

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
