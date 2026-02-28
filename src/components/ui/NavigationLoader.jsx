import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, useTheme } from '@mui/material';

const MIN_DISPLAY_MS = 400;

/**
 * يعرض لودر كامل الشاشة أثناء التنقل بين الصفحات
 * يظهر عند تغيير الراوت ويختفي بعد تحميل الصفحة الجديدة
 */
const NavigationLoader = () => {
  const location = useLocation();
  const theme = useTheme();
  const [isNavigating, setIsNavigating] = useState(false);
  const prevPathRef = useRef(location.pathname);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // تجاهل أول تحميل للتطبيق
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevPathRef.current = location.pathname;
      return;
    }

    if (location.pathname !== prevPathRef.current) {
      prevPathRef.current = location.pathname;
      setIsNavigating(true);

      const timer = setTimeout(() => {
        setIsNavigating(false);
      }, MIN_DISPLAY_MS);

      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  if (!isNavigating) return null;

  const isDark = theme.palette.mode === 'dark';
  const overlayBg = isDark
    ? 'rgba(18, 18, 18, 0.9)'
    : 'rgba(255, 255, 255, 0.9)';

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: overlayBg,
        backdropFilter: 'blur(4px)',
        gap: 2,
      }}
    >
      <CircularProgress size={56} thickness={4} sx={{ color: 'primary.main' }} />
      <Typography variant="body1" color="text.secondary" fontWeight={500}>
        جاري تحميل الصفحة...
      </Typography>
    </Box>
  );
};

export default NavigationLoader;
