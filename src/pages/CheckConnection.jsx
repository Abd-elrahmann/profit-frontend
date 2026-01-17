import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { MdWifiOff, MdCheckCircle } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';

const CheckConnection = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const navigate = useNavigate();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleReturn = () => {
    const lastPath = sessionStorage.getItem('lastOnlinePath') || '/dashboard';
    navigate(lastPath, { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        p: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 520,
          width: '100%',
          p: { xs: 3, sm: 4 },
          textAlign: 'center',
          direction: 'rtl',
        }}
      >
        <Stack spacing={2.5} alignItems="center">
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: isOnline ? 'rgba(46, 125, 50, 0.12)' : 'rgba(229, 57, 53, 0.12)',
              color: isOnline ? '#2e7d32' : '#e53935',
            }}
          >
            {isOnline ? (
              <MdCheckCircle size={48} />
            ) : (
              <MdWifiOff size={48} />
            )}
          </Box>

          <Typography variant="h5" fontWeight={700} color={isOnline ? 'success.main' : 'error.main'}>
            {isOnline ? 'تم استعادة الاتصال بنجاح' : 'لا يوجد اتصال بالإنترنت'}
          </Typography>

          <Typography variant="body1" color="text.secondary">
            {isOnline
              ? 'يمكنك العودة لاستخدام النظام الآن.'
              : 'يرجى التأكد من اتصالك بالإنترنت للمتابعة.'}
          </Typography>

          {isOnline && (
            <Button
              variant="contained"
              color="primary"
              onClick={handleReturn}
              sx={{ mt: 1, minWidth: 180 }}
            >
              العودة للنظام
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
};

export default CheckConnection;

