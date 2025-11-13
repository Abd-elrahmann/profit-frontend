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
  IconButton
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

  if (repaymentData?.attachments && repaymentData?.attachments.length > 0) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          direction: "rtl",
          fontFamily: "Tajawal"
        }}
      >
        <Paper elevation={4} sx={{ p: 4, borderRadius: 3, width: "100%" }}>
          <Box textAlign="center" mb={3}>
            <Typography variant="h5" fontWeight="bold" color="success.main">
              ✓ تم رفع الإيصال بنجاح
            </Typography>
            <Typography variant="body2" color="gray" mt={2}>
              تم رفع إيصال الدفع مسبقاً وجاري مراجعته من قبل الإدارة
            </Typography>
          </Box>

          <Paper sx={{ p: 3, bgcolor: "#f5f5f5", borderRadius: 2, mb: 3 }}>
            <Stack spacing={2}>
              <Box display="flex" justifyContent="space-between">
                <Typography color="gray">اسم العميل:</Typography>
                <Typography fontWeight="bold" fontSize="1.1rem">
                  {repaymentData?.loan?.client?.name || clientName}
                </Typography>
              </Box>

              <Divider />

              <Box display="flex" justifyContent="space-between">
                <Typography color="gray">المبلغ المستحق:</Typography>
                <Typography fontWeight="bold" fontSize="1.1rem">
                  {repaymentData?.amount?.toFixed(2)}
                </Typography>
              </Box>

              <Divider />

              <Box display="flex" justifyContent="space-between">
                <Typography color="gray">حالة المراجعة:</Typography>
                <Typography 
                  fontWeight="bold" 
                  fontSize="1.1rem"
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
            sx={{ py: 1.2, borderRadius: 2, mb: 2 }}
          >
            عرض الإيصال المرفوع
          </Button>

          <Alert severity="info">
            سيتم إشعارك بنتيجة المراجعة قريباً
          </Alert>
        </Paper>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          direction: "rtl",
          fontFamily: "Tajawal"
        }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          direction: "rtl",
          fontFamily: "Tajawal"
        }}
      >
        <Alert severity="error">حدث خطأ في تحميل بيانات الدفعة</Alert>
      </Container>
    );
  }

  if (!repaymentData) {
    return (
      <Container
        maxWidth="sm"
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          direction: "rtl",
          fontFamily: "Tajawal"
        }}
      >
        <Alert severity="warning">لم يتم العثور على بيانات الدفعة</Alert>
      </Container>
    );
  }

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        direction: "rtl",
        fontFamily: "Tajawal"
      }}
    >
      <Paper elevation={4} sx={{ p: 4, borderRadius: 3, width: "100%" }}>
        <Box textAlign="center" mb={3}>
          <Typography variant="h5" fontWeight="bold">
            دفع الدفعة
          </Typography>
          <Typography variant="body2" color="gray">
            يرجى إرفاق إيصال التحويل البنكي لإتمام عملية الدفع.
          </Typography>
        </Box>

        <Paper sx={{ p: 3, bgcolor: "#f5f5f5", borderRadius: 2, mb: 3 }}>
          <Stack spacing={2}>
            <Box display="flex" justifyContent="space-between">
              <Typography color="gray">اسم العميل:</Typography>
              <Typography fontWeight="bold" fontSize="1.1rem">
                {repaymentData?.loan?.client?.name || clientName}
              </Typography>
            </Box>

            <Divider />

            <Box display="flex" justifyContent="space-between">
              <Typography color="gray">المبلغ المستحق:</Typography>
              <Typography fontWeight="bold" fontSize="1.1rem">
                {repaymentData?.amount?.toFixed(2)}
              </Typography>
            </Box>

            <Divider />

            <Box display="flex" justifyContent="space-between">
              <Typography color="gray">تاريخ الاستحقاق:</Typography>
              <Typography fontWeight="bold" fontSize="1.1rem">
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
            p: 4,
            borderRadius: 2,
            mb: 2,
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 60, color: "gray", mb: 1 }} />

          {files.length > 0 ? (
            <Stack spacing={1}>
              {files.map((file, index) => (
                <Box key={index} display="flex" alignItems="center">
                  <Typography fontWeight="bold" color="#1E40AF">
                    {file.name}
                  </Typography>
                  <Typography variant="caption" color="gray">
                    {Math.round(file.size / 1024)} KB
                  </Typography>
                  <IconButton
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                    size="small"
                    sx={{ color: "#ff4444", ml: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
            </Stack>
          ) : (
            <>
              <Typography fontSize="0.9rem" mt={1} color="gray">
                {isDragActive ? 'أفلت الملفات هنا' : 'اسحب وأفلت الملفات هنا'}
              </Typography>

              <Typography fontSize="0.8rem" color="gray" mb={1}>
                أو
              </Typography>

              <Button
                variant="outlined"
                sx={{ mb: 1, borderRadius: 2 }}
              >
                تصفح الملفات
              </Button>

              <Typography variant="caption" color="gray">
                PNG, JPG, PDF حتى 10MB
              </Typography>
            </>
          )}
        </Box>

        {files.length > 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            تم اختيار {files.length} ملفات
          </Alert>
        )}

        <Button
          fullWidth
          variant="contained"
          onClick={handleSubmit}
          disabled={!files.length || uploading}
          sx={{
            py: 1.2,
            borderRadius: 2,
            fontWeight: "bold",
            background: "#1E40AF",
            "&:hover": { background: "#153482" }
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
        >
          🔒 اتصال آمن ومشفّر
        </Typography>
      </Paper>
    </Container>
  );
};

export default PaymentReceipt;