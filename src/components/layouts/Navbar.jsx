import React, { useState, useEffect } from "react";
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
  Badge,
  alpha,
} from "@mui/material";
import {
  Menu as MenuIcon,
  AccountCircle,
  Logout,
  Brightness4,
  Brightness7,
  Person,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../theme/ThemeContext";
import { useAuth } from "../Contexts/AuthContext";
import Logo from "/assets/images/logo.webp";

const Navbar = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      elevation={scrolled ? 4 : 0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        background: isDarkMode
          ? scrolled
            ? 'linear-gradient(135deg, #2a2a3e 0%, #26263e 100%)'
            : 'linear-gradient(135deg, #1f1f2e 0%, #2a2a3e 100%)'
          : scrolled
          ? 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)'
          : '#ffffff',
        color: isDarkMode ? "#fff" : "#000",
        boxShadow: scrolled
          ? isDarkMode
            ? '0 4px 20px rgba(0, 0, 0, 0.5)'
            : '0 4px 20px rgba(0, 0, 0, 0.08)'
          : 'none',
        backdropFilter: 'blur(10px)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        borderBottom: scrolled
          ? 'none'
          : isDarkMode
          ? '1px solid rgba(255, 255, 255, 0.1)'
          : '1px solid rgba(0, 0, 0, 0.08)',
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between", minHeight: { xs: 64, sm: 70 } }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={onMenuToggle}
            sx={{
              mr: 1,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'scale(1.1) rotate(90deg)',
                bgcolor: isDarkMode
                  ? alpha('#fff', 0.1)
                  : alpha('#000', 0.05),
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <img
                src={Logo}
                alt="Logo"
                style={{
                  width: isMobile ? 32 : 38,
                  height: isMobile ? 32 : 38,
                  objectFit: 'contain',
                }}
              />
            </Box>

            {!isMobile && (
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 800,
                  color: (theme) => theme.palette.primary.main,
                  fontSize: '1.3rem',
                  letterSpacing: '-0.5px',
                }}
              >
                نظام إدارة السلف
              </Typography>
            )}
            
            {!isMobile && (
              <Tooltip title={isDarkMode ? "الوضع النهاري" : "الوضع الليلي"} arrow>
                <IconButton
                  onClick={toggleTheme}
                  sx={{
                    ml: 2,
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    bgcolor: isDarkMode
                      ? alpha('#fff', 0.1)
                      : alpha('#000', 0.05),
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: isDarkMode
                        ? alpha('#fff', 0.15)
                        : alpha('#000', 0.1),
                      transform: 'rotate(180deg)',
                    },
                  }}
                >
                  {isDarkMode ? (
                    <Brightness7 sx={{ fontSize: 22, color: '#ffa726' }} />
                  ) : (
                    <Brightness4 sx={{ fontSize: 22, color: '#5e35b1' }} />
                  )}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {!isMobile && user?.name && (
            <Box
              sx={{
                textAlign: 'right',
                mr: 1,
                px: 2,
                py: 1,
                borderRadius: '12px',
                bgcolor: isDarkMode
                  ? alpha('#fff', 0.05)
                  : alpha('#667eea', 0.05),
                border: `1px solid ${isDarkMode ? alpha('#fff', 0.1) : alpha('#667eea', 0.2)}`,
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: isDarkMode
                    ? alpha('#fff', 0.08)
                    : alpha('#667eea', 0.08),
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: isDarkMode ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
                  fontSize: '0.75rem',
                  lineHeight: 1.2,
                  fontWeight: 500,
                }}
              >
                مرحباً بك
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  background: isDarkMode
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: '0.95rem',
                  lineHeight: 1.2,
                }}
              >
                {user.name}
              </Typography>
            </Box>
          )}

          <Tooltip title="الحساب" arrow>
            <IconButton
              onClick={handleUserMenuOpen}
              sx={{
                p: 0,
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            >
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                variant="dot"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#44b700',
                    color: '#ffc107',
                    boxShadow: `0 0 0 2px ${isDarkMode ? '#1a1a2e' : '#fff'}`,
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    '&::after': {
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      animation: 'ripple 1.2s infinite ease-in-out',
                      border: '1px solid currentColor',
                      content: '""',
                    },
                  },
                  '@keyframes ripple': {
                    '0%': {
                      transform: 'scale(.8)',
                      opacity: 1,
                    },
                    '100%': {
                      transform: 'scale(2.4)',
                      opacity: 0,
                    },
                  },
                }}
              >
                <Avatar
                  src={user?.profileImage}
                  alt={user?.name}
                  sx={{
                    width: 42,
                    height: 42,
                    background: user?.profileImage
                      ? 'transparent'
                      : '#f59e0b',
                    color: 'white',
                    fontWeight: 700,
                    fontSize: '1.1rem',
                    border: `3px solid #f59e0b`,
                    boxShadow: isDarkMode
                      ? '0 4px 15px rgba(245, 158, 11, 0.4)'
                      : '0 4px 15px rgba(245, 158, 11, 0.3)',
                  }}
                >
                  {!user?.profileImage && user?.name
                    ? user.name.charAt(0).toUpperCase()
                    : ''}
                </Avatar>
              </Badge>
            </IconButton>
          </Tooltip>
          
          {isMobile && (
            <Tooltip title={isDarkMode ? "الوضع النهاري" : "الوضع الليلي"} arrow>
              <IconButton
                onClick={toggleTheme}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: '10px',
                  bgcolor: isDarkMode
                    ? alpha('#fff', 0.1)
                    : alpha('#000', 0.05),
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    bgcolor: isDarkMode
                      ? alpha('#fff', 0.15)
                      : alpha('#000', 0.1),
                    transform: 'rotate(180deg)',
                  },
                }}
              >
                {isDarkMode ? (
                  <Brightness7 sx={{ fontSize: 20, color: '#ffa726' }} />
                ) : (
                  <Brightness4 sx={{ fontSize: 20, color: '#5e35b1' }} />
                )}
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
                minWidth: 240,
                borderRadius: '16px',
                boxShadow: isDarkMode
                  ? '0 8px 32px rgba(0, 0, 0, 0.5)'
                  : '0 8px 32px rgba(0, 0, 0, 0.1)',
                bgcolor: isDarkMode ? '#1a1a2e' : '#ffffff',
                border: `1px solid ${isDarkMode ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
                overflow: 'visible',
                '&::before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 12,
                  height: 12,
                  bgcolor: isDarkMode ? '#1a1a2e' : '#ffffff',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                  borderTop: `1px solid ${isDarkMode ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
                  borderLeft: `1px solid ${isDarkMode ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
                },
              },
            }}
          >
            <Box
              sx={{
                px: 2.5,
                py: 2,
                borderBottom: `1px solid ${isDarkMode ? alpha('#fff', 0.1) : alpha('#000', 0.08)}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                <Avatar
                  src={user?.profileImage}
                  alt={user?.name}
                  sx={{
                    width: 48,
                    height: 48,
                    background: user?.profileImage
                      ? 'transparent'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  }}
                >
                  {!user?.profileImage && user?.name
                    ? user.name.charAt(0).toUpperCase()
                    : ''}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.2 }}>
                    {user?.name || "مستخدم"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
                      fontSize: '0.75rem',
                    }}
                  >
                    {user?.email || ""}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <MenuItem
              onClick={handleProfileClick}
              sx={{
                mx: 1,
                my: 1,
                borderRadius: '10px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: isDarkMode
                    ? alpha('#667eea', 0.2)
                    : alpha('#667eea', 0.1),
                  transform: 'translateX(-4px)',
                },
              }}
            >
              <ListItemIcon>
                <Person
                  fontSize="small"
                  sx={{
                    color: isDarkMode ? '#667eea' : '#667eea',
                  }}
                />
              </ListItemIcon>
              <ListItemText>
                <Typography fontWeight={500}>الملف الشخصي</Typography>
              </ListItemText>
            </MenuItem>

            <Divider sx={{ mx: 1 }} />

            <MenuItem
              onClick={handleLogout}
              sx={{
                mx: 1,
                my: 1,
                borderRadius: '10px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: alpha('#f44336', 0.1),
                  transform: 'translateX(-4px)',
                },
              }}
            >
              <ListItemIcon>
                <Logout fontSize="small" sx={{ color: '#f44336' }} />
              </ListItemIcon>
              <ListItemText>
                <Typography color="#f44336" fontWeight={500}>
                  تسجيل الخروج
                </Typography>
              </ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
