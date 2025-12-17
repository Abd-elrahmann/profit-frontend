import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  IconButton,
  useTheme,
  useMediaQuery
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDropzone } from "react-dropzone";
import { useSearchParams, useLocation, useNavigate } from "react-router-dom";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import { uploadAttachment, getRepaymentById, decodePaymentToken } from "../../pages/Installments/InstallmentsApi";
import dayjs from "dayjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const PaymentReceipt = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const queryClient = useQueryClient();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const initialPathRef = useRef(location.pathname + location.search);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));

  // Prevent route changes - block all navigation attempts
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    
    // Always prevent navigation away from payment receipt page
    if (currentPath !== initialPathRef.current) {
      // Prevent navigation by replacing with current route
      navigate(initialPathRef.current, { replace: true });
      notifyError("لا يمكن تغيير الصفحة أثناء عملية الدفع");
    }
  }, [location.pathname, location.search, navigate]);

  // Prevent browser back/forward navigation
  useEffect(() => {
    const handlePopState = (event) => {
      event.preventDefault();
      window.history.pushState(null, '', initialPathRef.current);
      notifyError("لا يمكن تغيير الصفحة أثناء عملية الدفع");
    };

    // Push current state to prevent back navigation
    window.history.pushState(null, '', initialPathRef.current);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Prevent page unload/close
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = 'هل أنت متأكد من مغادرة الصفحة؟ قد تفقد بيانات الدفع.';
      return event.returnValue;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Prevent keyboard navigation shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Prevent Alt+Arrow (browser navigation)
      if (event.altKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        event.preventDefault();
        notifyError("لا يمكن تغيير الصفحة أثناء عملية الدفع");
      }
      // Prevent Ctrl/Cmd + R (refresh)
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault();
        notifyError("يرجى عدم تحديث الصفحة أثناء عملية الدفع");
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Prevent link clicks that would navigate away
  useEffect(() => {
    const handleClick = (event) => {
      const target = event.target.closest('a');
      if (target && target.href) {
        const currentOrigin = window.location.origin;
        const linkOrigin = new URL(target.href).origin;
        
        // Always prevent navigation away from payment receipt page
        if (linkOrigin === currentOrigin && !target.href.includes('/payment-receipt')) {
          event.preventDefault();
          event.stopPropagation();
          notifyError("لا يمكن تغيير الصفحة أثناء عملية الدفع");
        }
      }
    };

    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('click', handleClick, true);
    };
  }, []);

  // Decode the token to get the actual data
  const { data: decodedData, isLoading: isDecoding, error: decodeError } = useQuery({
    queryKey: ["decodeToken", token],
    queryFn: () => decodePaymentToken(token),
    enabled: !!token,
  });

  const { loanId, clientName, repaymentId } = decodedData?.data || {};

  const { data: repaymentData, isLoading, error } = useQuery({
    queryKey: ["repayment", repaymentId],
    queryFn: () => getRepaymentById(repaymentId),
    enabled: !!repaymentId,
    refetchInterval: (data) => {
      return data?.attachments ? false : 5000;
    },
  });
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg'],
      'application/pdf': ['.pdf']
    },
    maxFiles: 5,
    maxSize: 10 * 1024 * 1024,
    onDrop: (acceptedFiles) => {
      setFiles(prevFiles => [...prevFiles, ...acceptedFiles]);
    }
  });

  const handleSubmit = async () => {
    if (!files.length) {
      notifyError("يرجى إرفاق إيصال الدفع");
      return;
    }

    try {
      setUploading(true);
      await uploadAttachment(repaymentId, files);

      notifySuccess("تم رفع المستند بنجاح");

      await queryClient.invalidateQueries({ queryKey: ["repayment", repaymentId] });

      queryClient.setQueryData(["repayment", repaymentId], (oldData) => ({
        ...oldData,
        attachments: files.map(file => URL.createObjectURL(file)),
        status: "PENDING_REVIEW"
      }));

      queryClient.invalidateQueries(["loan", loanId]);
      queryClient.invalidateQueries(["repayments", loanId]);

      setFiles([]);

      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء رفع الإيصال");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  // Container styles with responsive height
  const containerStyles = {
    minHeight: isLargeScreen ? "80vh" : "100vh",
    height: isLargeScreen ? "auto" : "100vh",
    display: "flex",
    alignItems: isSmallScreen ? "flex-start" : "center",
    justifyContent: "center",
    direction: "rtl",
    py: isSmallScreen ? 3 : 4,
    px: isSmallScreen ? 2 : 3,
    overflow: "auto",
    background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.light}15 100%)`
  };

  // Paper styles with responsive padding
  const paperStyles = {
    p: isSmallScreen ? 3 : 5,
    borderRadius: 4,
    width: "100%",
    maxWidth: "550px",
    my: isSmallScreen ? 2 : 0,
    boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
    border: `1px solid ${theme.palette.primary.light}30`
  };

  // Check if there are server-side attachments (not local blob URLs)
  const hasServerAttachments = repaymentData?.attachments &&
    repaymentData?.attachments.length > 0 &&
    !repaymentData.attachments.some(attachment => attachment.startsWith('blob:'));

  if (hasServerAttachments) {
    return (
      <Container maxWidth="sm" sx={containerStyles}>
        <Paper elevation={0} sx={paperStyles}>
          <Box 
            textAlign="center" 
            mb={4}
            sx={{
              pb: 3,
              borderBottom: `2px solid ${theme.palette.primary.light}40`
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: `${theme.palette.primary.main}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2
              }}
            >
              <Typography 
                variant="h4"
                sx={{ 
                  color: theme.palette.primary.main,
                  fontWeight: 'bold'
                }}
              >
                ✓
              </Typography>
            </Box>
            <Typography 
              variant={isSmallScreen ? "h6" : "h5"} 
              fontWeight="bold" 
              color={theme.palette.primary.main}
              mb={1}
            >
              تم رفع الإيصال بنجاح
            </Typography>
            <Typography variant="body2" color="text.secondary" mt={1}>
              تم رفع إيصال الدفع مسبقاً وجاري مراجعته من قبل الإدارة
            </Typography>
          </Box>

          <Paper sx={{ 
            p: isSmallScreen ? 2.5 : 3.5, 
            bgcolor: theme.palette.background.default, 
            borderRadius: 3, 
            mb: 3,
            border: `1px solid ${theme.palette.primary.light}20`,
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)'
          }}>
            <Stack spacing={2.5}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography color="text.secondary" variant={isSmallScreen ? "body2" : "body1"} fontWeight={500}>
                  اسم العميل:
                </Typography>
                <Typography fontWeight="bold" fontSize={isSmallScreen ? "0.95rem" : "1.1rem"} color={theme.palette.primary.main}>
                  {repaymentData?.loan?.client?.name || clientName}
                </Typography>
              </Box>

              <Divider sx={{ borderColor: theme.palette.primary.light + '30' }} />

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography color="text.secondary" variant={isSmallScreen ? "body2" : "body1"} fontWeight={500}>
                  المبلغ المستحق:
                </Typography>
                <Typography fontWeight="bold" fontSize={isSmallScreen ? "0.95rem" : "1.1rem"} color={theme.palette.primary.main}>
                  {repaymentData?.amount?.toFixed(2)} ر.س
                </Typography>
              </Box>

              <Divider sx={{ borderColor: theme.palette.primary.light + '30' }} />

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography color="text.secondary" variant={isSmallScreen ? "body2" : "body1"} fontWeight={500}>
                  حالة المراجعة:
                </Typography>
                <Typography 
                  fontWeight="bold" 
                  fontSize={isSmallScreen ? "0.95rem" : "1.1rem"}
                  sx={{
                    color: theme.palette.warning.main,
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    bgcolor: theme.palette.warning.main + '15'
                  }}
                >
                  قيد المراجعة
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Alert 
            severity="info" 
            sx={{ 
              fontSize: isSmallScreen ? "0.85rem" : "0.9rem",
              borderRadius: 2,
              bgcolor: theme.palette.info.main + '10',
              border: `1px solid ${theme.palette.info.main}30`
            }}
          >
            سيتم إشعارك بنتيجة المراجعة قريباً
          </Alert>
        </Paper>
      </Container>
    );
  }

  if (isDecoding) {
    return (
      <Container maxWidth="sm" sx={containerStyles}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress sx={{ color: theme.palette.primary.main }} size={48} />
        </Box>
      </Container>
    );
  }

  if (decodeError) {
    return (
      <Container maxWidth="sm" sx={containerStyles}>
        <Alert severity="error">حدث خطأ في فك شفرة الرابط</Alert>
      </Container>
    );
  }

  if (!token) {
    return (
      <Container maxWidth="sm" sx={containerStyles}>
        <Alert severity="warning">رابط غير صحيح</Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={containerStyles}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress sx={{ color: theme.palette.primary.main }} size={48} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="sm" sx={containerStyles}>
        <Alert severity="error">حدث خطأ في تحميل بيانات الدفعة</Alert>
      </Container>
    );
  }

  if (!repaymentData) {
    return (
      <Container maxWidth="sm" sx={containerStyles}>
        <Alert severity="warning">لم يتم العثور على بيانات الدفعة</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={containerStyles}>
      <Paper elevation={0} sx={paperStyles}>
        <Box 
          textAlign="center" 
          mb={4}
          sx={{
            pb: 3,
            borderBottom: `2px solid ${theme.palette.primary.light}40`
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: `${theme.palette.primary.main}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}
          >
            <Typography 
              variant="h4"
              sx={{ 
                color: theme.palette.primary.main,
                fontWeight: 'bold'
              }}
            >
              💳
            </Typography>
          </Box>
          <Typography 
            variant={isSmallScreen ? "h6" : "h5"} 
            fontWeight="bold"
            color={theme.palette.primary.main}
            mb={1}
          >
            دفع الدفعة
          </Typography>
          <Typography variant="body2" color="text.secondary">
            يرجى إرفاق إيصال التحويل البنكي لإتمام عملية الدفع.
          </Typography>
        </Box>

        <Paper sx={{ 
          p: isSmallScreen ? 2.5 : 3.5, 
          bgcolor: theme.palette.background.default, 
          borderRadius: 3, 
          mb: 3,
          border: `1px solid ${theme.palette.primary.light}20`,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.04)'
        }}>
          <Stack spacing={2.5}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography color="text.secondary" variant={isSmallScreen ? "body2" : "body1"} fontWeight={500}>
                اسم العميل:
              </Typography>
              <Typography fontWeight="bold" fontSize={isSmallScreen ? "0.95rem" : "1.1rem"} color={theme.palette.primary.main}>
                {repaymentData?.loan?.client?.name || clientName}
              </Typography>
            </Box>

            <Divider sx={{ borderColor: theme.palette.primary.light + '30' }} />

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography color="text.secondary" variant={isSmallScreen ? "body2" : "body1"} fontWeight={500}>
                المبلغ المستحق:
              </Typography>
              <Typography fontWeight="bold" fontSize={isSmallScreen ? "0.95rem" : "1.1rem"} color={theme.palette.primary.main}>
                {repaymentData?.amount?.toFixed(2)} ر.س
              </Typography>
            </Box>

            <Divider sx={{ borderColor: theme.palette.primary.light + '30' }} />

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography color="text.secondary" variant={isSmallScreen ? "body2" : "body1"} fontWeight={500}>
                تاريخ الاستحقاق:
              </Typography>
              <Typography fontWeight="bold" fontSize={isSmallScreen ? "0.95rem" : "1.1rem"} color={theme.palette.primary.main}>
                {dayjs(repaymentData?.dueDate).format("DD/MM/YYYY")}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Box
          {...getRootProps()}
          sx={{
            border: `2px dashed ${isDragActive ? theme.palette.primary.main : theme.palette.primary.light}60`,
            backgroundColor: isDragActive ? `${theme.palette.primary.main}08` : 'transparent',
            p: isSmallScreen ? 3 : 4,
            borderRadius: 3,
            mb: 2,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minHeight: isSmallScreen ? '140px' : '220px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            '&:hover': {
              borderColor: theme.palette.primary.main,
              backgroundColor: `${theme.palette.primary.main}05`
            }
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ 
            fontSize: isSmallScreen ? 48 : 72, 
            color: isDragActive ? theme.palette.primary.main : theme.palette.text.secondary, 
            mb: 2,
            transition: 'all 0.3s ease'
          }} />

          {files.length > 0 ? (
            <Stack spacing={1} sx={{ width: '100%' }}>
              {files.map((file, index) => (
                <Box key={index} display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" flex={1}>
                    <Typography 
                      fontWeight="bold" 
                      color={theme.palette.primary.main} 
                      fontSize={isSmallScreen ? "0.85rem" : "0.95rem"}
                      noWrap
                      sx={{ maxWidth: '150px' }}
                    >
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1.5 }}>
                      {Math.round(file.size / 1024)} KB
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                    size="small"
                    sx={{ 
                      color: theme.palette.error.main,
                      '&:hover': {
                        bgcolor: theme.palette.error.main + '15'
                      }
                    }}
                  >
                    <DeleteIcon fontSize={isSmallScreen ? "small" : "medium"} />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          ) : (
            <>
              <Typography 
                fontSize={isSmallScreen ? "0.9rem" : "1rem"} 
                mt={1} 
                color={isDragActive ? theme.palette.primary.main : "text.secondary"}
                fontWeight={500}
              >
                {isDragActive ? 'أفلت الملفات هنا' : 'اسحب وأفلت الملفات هنا'}
              </Typography>

              <Typography fontSize={isSmallScreen ? "0.75rem" : "0.85rem"} color="text.secondary" mb={1.5}>
                أو
              </Typography>

              <Button
                variant="outlined"
                sx={{ 
                  mb: 1.5, 
                  borderRadius: 2,
                  fontSize: isSmallScreen ? "0.8rem" : "0.9rem",
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  '&:hover': {
                    borderColor: theme.palette.primary.dark,
                    bgcolor: theme.palette.primary.main + '10'
                  }
                }}
              >
                تصفح الملفات
              </Button>

              <Typography 
                variant="caption" 
                color="text.secondary"
                fontSize={isSmallScreen ? "0.7rem" : "0.8rem"}
              >
                PNG, JPG, PDF حتى 10MB
              </Typography>
            </>
          )}
        </Box>

        {files.length > 0 && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 2.5, 
              fontSize: isSmallScreen ? "0.85rem" : "0.9rem",
              borderRadius: 2,
              bgcolor: theme.palette.info.main + '10',
              border: `1px solid ${theme.palette.info.main}30`
            }}
          >
            تم اختيار {files.length} ملف{files.length > 1 ? 'ات' : ''}
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={!files.length || uploading}
          sx={{
            py: isSmallScreen ? 1.2 : 1.5,
            borderRadius: 3,
            fontWeight: "bold",
            bgcolor: theme.palette.primary.main,
            fontSize: isSmallScreen ? "0.9rem" : "1rem",
            textTransform: 'none',
            boxShadow: `0px 4px 12px ${theme.palette.primary.main}40`,
            "&:hover": { 
              bgcolor: theme.palette.primary.dark,
              boxShadow: `0px 6px 16px ${theme.palette.primary.main}50`
            },
            "&:disabled": {
              bgcolor: theme.palette.action.disabledBackground,
              color: theme.palette.action.disabled
            }
          }}
        >
          {uploading ? (
            <CircularProgress size={24} sx={{ color: theme.palette.primary.contrastText }} />
          ) : (
            'تأكيد وإرسال الإيصال'
          )}
        </Button>

        <Typography
          textAlign="center"
          mt={3}
          variant="caption"
          color="text.secondary"
          display="flex"
          justifyContent="center"
          alignItems="center"
          gap={0.5}
          fontSize={isSmallScreen ? "0.7rem" : "0.8rem"}
          sx={{
            opacity: 0.8
          }}
        >
          🔒 اتصال آمن ومشفّر
        </Typography>
      </Paper>
    </Container>
  );
};

export default PaymentReceipt;