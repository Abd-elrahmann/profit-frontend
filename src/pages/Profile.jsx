import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Chip,
  useTheme,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Save as SaveIcon,
  CloudUpload as UploadIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useFormik } from 'formik';
import { useDropzone } from 'react-dropzone';
import { Helmet } from 'react-helmet-async';
import { notifySuccess, notifyError } from '../utilities/toastify';
import Api from '../config/Api';

const Profile = () => {
  const theme = useTheme();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await Api.get('/api/auth/profile');
      setUserData(response.data);
      
      // Update localStorage with latest user data including profile image
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({
        ...currentUser,
        ...response.data,
        profileImage: response.data.profileImage
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
      notifyError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: userData?.name || '',
      email: userData?.email || '',
      phone: userData?.phone || '',
    },
    onSubmit: async (values) => {
      try {
        setUpdating(true);
        const response = await Api.patch('/api/auth/update-profile', values);
        setUserData(prev => ({ ...prev, ...response.data.user }));
        
        // Update localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          ...response.data.user
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Trigger global update for navbar
        window.dispatchEvent(new Event('profileUpdated'));
        window.dispatchEvent(new Event('userDataUpdated'));
        window.dispatchEvent(new StorageEvent('storage', { key: 'user' }));
        
        notifySuccess('تم تحديث الملف الشخصي بنجاح');
      } catch (error) {
        notifyError(error.response?.data?.message || 'حدث خطأ أثناء التحديث');
      } finally {
        setUpdating(false);
      }
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('profileImage', file);

      try {
        setUploading(true);
        const response = await Api.patch('/api/auth/upload-profile-image', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        setUserData(prev => ({ 
          ...prev, 
          profileImage: response.data.profileImage 
        }));

        // Update localStorage
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = {
          ...currentUser,
          profileImage: response.data.profileImage
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        // Trigger global update for navbar (multiple events for compatibility)
        window.dispatchEvent(new Event('profileUpdated'));
        window.dispatchEvent(new Event('userDataUpdated'));
        // Also trigger storage event for cross-tab updates
        window.dispatchEvent(new StorageEvent('storage', { key: 'user' }));
        
        notifySuccess('تم تحديث الصورة الشخصية بنجاح');
      } catch (error) {
        notifyError(error.response?.data?.message || 'حدث خطأ أثناء رفع الصورة');
      } finally {
        setUploading(false);
      }
    },
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleDateString('en-US');
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          width: '100%'
        }}
      >
        <CircularProgress size={48} />
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        width: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 1.5, sm: 2, md: 3 },
        backgroundColor: 'background.default',
      }}
    >
      <Helmet>
        <title>الملف الشخصي</title>
        <meta name="description" content="الملف الشخصي للمستخدم" />
      </Helmet>

      {/* Main Container */}
      <Box 
        sx={{ 
          width: '100%',
          maxWidth: { xs: '100%', sm: '900px', md: '1100px', lg: '1200px' },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {/* Page Title */}
        <Typography 
          variant="h4" 
          fontWeight="bold" 
          color="primary" 
          gutterBottom 
          sx={{ 
            mb: { xs: 3, sm: 4, md: 5 },
            textAlign: 'center',
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
            width: '100%'
          }}
        >
          الملف الشخصي
        </Typography>

        <Grid 
          container 
          spacing={{ xs: 2, sm: 3, md: 4 }}
          sx={{
            width: '100%',
            justifyContent: 'center',
          }}
        >
          {/* Profile Image Section */}
          <Grid item xs={12} sm={12} md={6} sx={{width: '1000px'}}>
            <Card
              sx={{
                height: 'fit-content',
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(255,255,255,0.08)' : '0 4px 20px rgba(0,0,0,0.08)',
                borderRadius: 3,
                overflow: 'hidden',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.palette.mode === 'dark' ? '0 8px 30px rgba(255,255,255,0.12)' : '0 8px 30px rgba(0,0,0,0.12)',
                }
              }}
            >
              <CardContent 
                sx={{ 
                  textAlign: 'center', 
                  p: { xs: 3, sm: 4, md: 4 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Box 
                  sx={{ 
                    mb: 3,
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Avatar
                    src={userData?.profileImage}
                    sx={{
                      width: { xs: 100, sm: 120, md: 140 },
                      height: { xs: 100, sm: 120, md: 140 },
                      margin: '0 auto',
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                      bgcolor: theme.palette.primary.main,
                      border: '4px solid',
                      borderColor: theme.palette.primary.light,
                      boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(255,255,255,0.15)' : '0 4px 12px rgba(0,0,0,0.15)',
                    }}
                  >
                    {!userData?.profileImage && (userData?.name?.charAt(0) || 'U')}
                  </Avatar>
                </Box>

                {/* User Name */}
                <Typography 
                  variant="h6" 
                  fontWeight="600" 
                  color="text.primary"
                  sx={{ 
                    mb: 1,
                    fontSize: { xs: '1rem', sm: '1.125rem' }
                  }}
                >
                  {userData?.name || 'مستخدم'}
                </Typography>

                {/* Status Chip */}
                <Chip
                  icon={userData?.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                  label={userData?.isActive ? 'نشط' : 'غير نشط'}
                  color={userData?.isActive ? 'success' : 'default'}
                  size="small"
                  sx={{ mb: 3, fontWeight: 500 }}
                />

                {/* Upload Area */}
                <Box
                  {...getRootProps()}
                  sx={{
                    width: '100%',
                    border: '2px dashed',
                    borderColor: isDragActive ? theme.palette.primary.main : theme.palette.grey[300],
                    borderRadius: 2,
                    p: { xs: 2, sm: 3 },
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    backgroundColor: isDragActive ? theme.palette.primary.main + '20' : theme.palette.grey[50],
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      backgroundColor: theme.palette.primary.main + '20',
                      transform: 'scale(1.02)',
                    },
                  }}
                >
                  <input {...getInputProps()} />
                  {uploading ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={32} />
                      <Typography variant="caption" color="textSecondary">
                        جاري الرفع...
                      </Typography>
                    </Box>
                  ) : (
                    <Box>
                      <UploadIcon 
                        color="primary" 
                        sx={{ 
                          fontSize: { xs: 32, sm: 40 }, 
                          mb: 1,
                          opacity: 0.7
                        }} 
                      />
                      <Typography 
                        variant="body2" 
                        color="textSecondary"
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          mb: 0.5
                        }}
                      >
                        {isDragActive ? 'أفلت الصورة هنا' : 'انقر أو اسحب الصورة هنا'}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="textSecondary"
                        sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                      >
                        PNG, JPG, GIF (الحد الأقصى 5MB)
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Profile Information Section */}
          <Grid item xs={12} sm={12} md={6}>
            <Card
              sx={{
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 20px rgba(255,255,255,0.08)' : '0 4px 20px rgba(0,0,0,0.08)',
                borderRadius: 3,
                overflow: 'hidden',
                height: 'fit-content',
              }}
            >
              <CardContent 
                sx={{ 
                  p: { xs: 2.5, sm: 3, md: 4 },
                }}
              >
                <Typography 
                  variant="h5" 
                  fontWeight="bold" 
                  color="primary" 
                  gutterBottom 
                  sx={{ 
                    mb: { xs: 2.5, sm: 3 },
                    textAlign: { xs: 'center', sm: 'right' },
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}
                >
                  المعلومات الشخصية
                </Typography>

                <form onSubmit={formik.handleSubmit}>
                  <Grid container spacing={{ xs: 2, sm: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="الاسم"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.name && Boolean(formik.errors.name)}
                        helperText={formik.touched.name && formik.errors.name}
                        InputProps={{
                          startAdornment: <PersonIcon color="action" sx={{ mr: 1 }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="البريد الإلكتروني"
                        name="email"
                        value={formik.values.email}
                        disabled
                        InputProps={{
                          startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="رقم الهاتف"
                        name="phone"
                        value={formik.values.phone}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.phone && Boolean(formik.errors.phone)}
                        helperText={formik.touched.phone && formik.errors.phone}
                        InputProps={{
                          startAdornment: <PhoneIcon color="action" sx={{ mr: 1 }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="تاريخ التسجيل"
                        value={formatDate(userData?.createdAt)}
                        disabled
                        InputProps={{
                          startAdornment: <CalendarIcon color="action" sx={{ mr: 1 }} />,
                        }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                          }
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: { xs: 'center', sm: 'flex-start' },
                          gap: 2, 
                          flexWrap: 'wrap',
                          mt: { xs: 1, sm: 2 }
                        }}
                      >
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={!updating && <SaveIcon sx={{marginLeft: 2}} />}
                          disabled={updating}
                          sx={{
                            minWidth: { xs: '100%', sm: 160 },
                            py: 1.25,
                            borderRadius: 2,
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            fontWeight: 600,
                            boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(255,255,255,0.15)' : '0 4px 12px rgba(0,0,0,0.15)',
                            '&:hover': {
                              boxShadow: theme.palette.mode === 'dark' ? '0 6px 16px rgba(255,255,255,0.2)' : '0 6px 16px rgba(0,0,0,0.2)',
                            }
                          }}
                        >
                          {updating ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            'حفظ التغييرات'
                          )}
                        </Button>
                      </Box>
                    </Grid>
                  </Grid>
                </form>

                <Divider 
                  sx={{ 
                    my: { xs: 3, sm: 4 },
                    borderColor: 'divider'
                  }} 
                />

                {/* Additional Info */}
                <Box>
                  <Typography 
                    variant="subtitle1" 
                    fontWeight="600" 
                    color="text.primary"
                    sx={{ 
                      mb: { xs: 2, sm: 2.5 },
                      textAlign: { xs: 'center', sm: 'right' },
                      fontSize: { xs: '0.95rem', sm: '1rem' }
                    }}
                  >
                    معلومات إضافية
                  </Typography>
                  <Grid container spacing={{ xs: 2, sm: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <Box 
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: { xs: 'center', sm: 'flex-start' },
                          mb: { xs: 1.5, sm: 2 },
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : 'grey.50',
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          color="textSecondary" 
                          sx={{ 
                            minWidth: { xs: 80, sm: 100 },
                            fontWeight: 500,
                            fontSize: { xs: '0.8rem', sm: '0.875rem' }
                          }}
                        >
                          الحالة:
                        </Typography>
                        <Chip
                          icon={userData?.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                          label={userData?.isActive ? 'نشط' : 'غير نشط'}
                          color={userData?.isActive ? 'success' : 'default'}
                          size="small"
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: { xs: 'center', sm: 'flex-start' },
                          mb: { xs: 1.5, sm: 2 },
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : 'grey.50',
                        }}
                      >
                        <Typography 
                          variant="body2" 
                          color="textSecondary" 
                          sx={{ 
                            minWidth: { xs: 80, sm: 100 },
                            fontWeight: 500,
                            fontSize: { xs: '0.8rem', sm: '0.875rem' }
                          }}
                        >
                          الدور:
                        </Typography>
                        <Typography 
                          variant="body2" 
                          fontWeight="600"
                          color="primary"
                          sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                        >
                          {userData?.roleId === 1 ? 'مدير النظام' : 'مستخدم'}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Profile;