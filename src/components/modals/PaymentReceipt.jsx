import React, { useState, useEffect } from "react";
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
import { useParams } from "react-router-dom";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import { uploadAttachment, getRepaymentById } from "../../pages/Installments/InstallmentsApi";
import dayjs from "dayjs";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const PaymentReceipt = () => {
  const { loanId, clientName, repaymentId } = useParams();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('lg'));
  
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

  useEffect(() => {
    if (repaymentData?.attachments && repaymentData?.attachments.length > 0) {
      notifySuccess("تم رفع الإيصال مسبقاً وجاري مراجعته");
    }
  }, [repaymentData?.attachments, repaymentData?.attachments.length]);

  const handleSubmit = async () => {
    if (!files.length) {
      notifyError("يرجى إرفاق إيصال الدفع");
      return;
    }

    try {
      setUploading(true);
      await uploadAttachment(repaymentId, files);
      
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
    fontFamily: "Tajawal",
    py: isSmallScreen ? 2 : 0,
    overflow: "auto"
  };

  // Paper styles with responsive padding
  const paperStyles = {
    p: isSmallScreen ? 2 : 4,
    borderRadius: 3,
    width: "100%",
    maxWidth: "500px",
    my: isSmallScreen ? 2 : 0
  };

  if (repaymentData?.attachments && repaymentData?.attachments.length > 0) {
    return (
      <Container maxWidth="sm" sx={containerStyles}>
        <Paper elevation={4} sx={paperStyles}>
          <Box textAlign="center" mb={3}>
            <Typography 
              variant={isSmallScreen ? "h6" : "h5"} 
              fontWeight="bold" 
              color="success.main"
            >
              ✓ تم رفع الإيصال بنجاح
            </Typography>
            <Typography variant="body2" color="gray" mt={2}>
              تم رفع إيصال الدفع مسبقاً وجاري مراجعته من قبل الإدارة
            </Typography>
          </Box>

          <Paper sx={{ 
            p: isSmallScreen ? 2 : 3, 
            bgcolor: "#f5f5f5", 
            borderRadius: 2, 
            mb: 3 
          }}>
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between">
                <Typography color="gray" variant={isSmallScreen ? "body2" : "body1"}>
                  اسم العميل:
                </Typography>
                <Typography fontWeight="bold" fontSize={isSmallScreen ? "0.9rem" : "1.1rem"}>
                  {repaymentData?.loan?.client?.name || clientName}
                </Typography>
              </Box>

              <Divider />

              <Box display="flex" justifyContent="space-between">
                <Typography color="gray" variant={isSmallScreen ? "body2" : "body1"}>
                  المبلغ المستحق:
                </Typography>
                <Typography fontWeight="bold" fontSize={isSmallScreen ? "0.9rem" : "1.1rem"}>
                  {repaymentData?.amount?.toFixed(2)}
                </Typography>
              </Box>

              <Divider />

              <Box display="flex" justifyContent="space-between">
                <Typography color="gray" variant={isSmallScreen ? "body2" : "body1"}>
                  حالة المراجعة:
                </Typography>
                <Typography 
                  fontWeight="bold" 
                  fontSize={isSmallScreen ? "0.9rem" : "1.1rem"}
                  color="warning.main"
                >
                  قيد المراجعة
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => window.open(repaymentData.attachments, '_blank')}
            sx={{ 
              py: isSmallScreen ? 1 : 1.2, 
              borderRadius: 2, 
              mb: 2,
              fontSize: isSmallScreen ? "0.8rem" : "0.9rem"
            }}
          >
            عرض الإيصال المرفوع
          </Button>

          <Alert severity="info" sx={{ fontSize: isSmallScreen ? "0.8rem" : "0.9rem" }}>
            سيتم إشعارك بنتيجة المراجعة قريباً
          </Alert>
        </Paper>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={containerStyles}>
        <CircularProgress />
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
      <Paper elevation={4} sx={paperStyles}>
        <Box textAlign="center" mb={3}>
          <Typography variant={isSmallScreen ? "h6" : "h5"} fontWeight="bold">
            دفع الدفعة
          </Typography>
          <Typography variant="body2" color="gray">
            يرجى إرفاق إيصال التحويل البنكي لإتمام عملية الدفع.
          </Typography>
        </Box>

        <Paper sx={{ 
          p: isSmallScreen ? 2 : 3, 
          bgcolor: "#f5f5f5", 
          borderRadius: 2, 
          mb: 3 
        }}>
          <Stack spacing={2}>
            <Box display="flex" justifyContent="space-between">
              <Typography color="gray" variant={isSmallScreen ? "body2" : "body1"}>
                اسم العميل:
              </Typography>
              <Typography fontWeight="bold" fontSize={isSmallScreen ? "0.9rem" : "1.1rem"}>
                {repaymentData?.loan?.client?.name || clientName}
              </Typography>
            </Box>

            <Divider />

            <Box display="flex" justifyContent="space-between">
              <Typography color="gray" variant={isSmallScreen ? "body2" : "body1"}>
                المبلغ المستحق:
              </Typography>
              <Typography fontWeight="bold" fontSize={isSmallScreen ? "0.9rem" : "1.1rem"}>
                {repaymentData?.amount?.toFixed(2)}
              </Typography>
            </Box>

            <Divider />

            <Box display="flex" justifyContent="space-between">
              <Typography color="gray" variant={isSmallScreen ? "body2" : "body1"}>
                تاريخ الاستحقاق:
              </Typography>
              <Typography fontWeight="bold" fontSize={isSmallScreen ? "0.9rem" : "1.1rem"}>
                {dayjs(repaymentData?.dueDate).format("DD/MM/YYYY")}
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed',
            borderColor: isDragActive ? '#1E40AF' : '#bdbdbd',
            backgroundColor: isDragActive ? '#f0f4ff' : 'transparent',
            p: isSmallScreen ? 2 : 4,
            borderRadius: 2,
            mb: 2,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            minHeight: isSmallScreen ? '120px' : '200px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ 
            fontSize: isSmallScreen ? 40 : 60, 
            color: "gray", 
            mb: 1 
          }} />

          {files.length > 0 ? (
            <Stack spacing={1} sx={{ width: '100%' }}>
              {files.map((file, index) => (
                <Box key={index} display="flex" alignItems="center" justifyContent="space-between">
                  <Box display="flex" alignItems="center" flex={1}>
                    <Typography 
                      fontWeight="bold" 
                      color="#1E40AF" 
                      fontSize={isSmallScreen ? "0.8rem" : "0.9rem"}
                      noWrap
                      sx={{ maxWidth: '150px' }}
                    >
                      {file.name}
                    </Typography>
                    <Typography variant="caption" color="gray" sx={{ ml: 1 }}>
                      {Math.round(file.size / 1024)} KB
                    </Typography>
                  </Box>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                    size="small"
                    sx={{ color: "#ff4444" }}
                  >
                    <DeleteIcon fontSize={isSmallScreen ? "small" : "medium"} />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          ) : (
            <>
              <Typography 
                fontSize={isSmallScreen ? "0.8rem" : "0.9rem"} 
                mt={1} 
                color="gray"
              >
                {isDragActive ? 'أفلت الملفات هنا' : 'اسحب وأفلت الملفات هنا'}
              </Typography>

              <Typography fontSize={isSmallScreen ? "0.7rem" : "0.8rem"} color="gray" mb={1}>
                أو
              </Typography>

              <Button
                variant="outlined"
                sx={{ 
                  mb: 1, 
                  borderRadius: 2,
                  fontSize: isSmallScreen ? "0.7rem" : "0.8rem"
                }}
              >
                تصفح الملفات
              </Button>

              <Typography 
                variant="caption" 
                color="gray"
                fontSize={isSmallScreen ? "0.6rem" : "0.7rem"}
              >
                PNG, JPG, PDF حتى 10MB
              </Typography>
            </>
          )}
        </Box>

        {files.length > 0 && (
          <Alert severity="info" sx={{ mb: 2, fontSize: isSmallScreen ? "0.8rem" : "0.9rem" }}>
            تم اختيار {files.length} ملفات
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={!files.length || uploading}
          sx={{
            py: isSmallScreen ? 1 : 1.2,
            borderRadius: 2,
            fontWeight: "bold",
            background: "#1E40AF",
            "&:hover": { background: "#153482" },
            fontSize: isSmallScreen ? "0.8rem" : "0.9rem"
          }}
        >
          {uploading ? <CircularProgress size={24} /> : 'تأكيد وإرسال الإيصال'}
        </Button>

        <Typography
          textAlign="center"
          mt={2}
          variant="caption"
          color="gray"
          display="flex"
          justifyContent="center"
          alignItems="center"
          gap={0.5}
          fontSize={isSmallScreen ? "0.6rem" : "0.7rem"}
        >
          🔒 اتصال آمن ومشفّر
        </Typography>
      </Paper>
    </Container>
  );
};

export default PaymentReceipt;