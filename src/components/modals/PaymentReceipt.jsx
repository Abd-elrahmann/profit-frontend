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
  const [, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const initialPathRef = useRef(location.pathname + location.search);
  useEffect(() => {
    const currentPath = location.pathname + location.search;
    if (currentPath !== initialPathRef.current) {
      navigate(initialPathRef.current, { replace: true });
      notifyError("لا يمكن تغيير الصفحة أثناء عملية الدفع");
    }
  }, [location.pathname, location.search, navigate]);
  useEffect(() => {
    const handlePopState = (event) => {
      event.preventDefault();
      window.history.pushState(null, '', initialPathRef.current);
      notifyError("لا يمكن تغيير الصفحة أثناء عملية الدفع");
    };
    window.history.pushState(null, '', initialPathRef.current);
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
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
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
        event.preventDefault();
        notifyError("لا يمكن تغيير الصفحة أثناء عملية الدفع");
      }
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
  useEffect(() => {
    const handleClick = (event) => {
      const target = event.target.closest('a');
      if (target && target.href) {
        const currentOrigin = window.location.origin;
        const linkOrigin = new URL(target.href).origin;
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
  const { data: decodedData, isLoading: isDecoding, error: decodeError } = useQuery({
    queryKey: ["decodeToken", token],
    queryFn: () => decodePaymentToken(token),
    enabled: !!token,
  });
  const { clientName, repaymentId } = decodedData?.data || {};
  const { data: repaymentData, isLoading } = useQuery({
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
      'application/pdf': ['.pdf'],
    },
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0 || !repaymentId) return;
      setUploading(true);
      try {
        await uploadAttachment(repaymentId, acceptedFiles);
        notifySuccess('تم رفع المرفق بنجاح');
        queryClient.invalidateQueries({ queryKey: ['repayment', repaymentId] });
        setFiles([]);
      } catch (err) {
        notifyError(err.response?.data?.message || 'حدث خطأ أثناء رفع المرفق');
      } finally {
        setUploading(false);
      }
    },
    multiple: true,
    disabled: uploading || !repaymentId,
  });

  if (isDecoding || !token) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  if (decodeError) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">رابط الدفع غير صالح أو منتهي الصلاحية</Alert>
      </Container>
    );
  }
  if (isLoading || !repaymentData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const repayment = repaymentData?.data || repaymentData;
  const amount = repayment?.amount ?? repayment?.paidAmount ?? 0;
  const dueDate = repayment?.dueDate ? dayjs(repayment.dueDate).format('YYYY-MM-DD') : '-';
  const attachments = repayment?.attachments || [];

  return (
    <Container maxWidth="md" sx={{ py: 4 }} dir="rtl">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          إيصال الدفع
        </Typography>
        <Typography variant="body1" color="text.secondary">
          العميل: {clientName || '-'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          المبلغ: {amount} ر.س
        </Typography>
        <Typography variant="body1" color="text.secondary">
          تاريخ الاستحقاق: {dueDate}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
          رفع إثبات الدفع
        </Typography>
        <Paper
          {...getRootProps()}
          sx={{
            p: 4,
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'divider',
            textAlign: 'center',
            cursor: uploading ? 'not-allowed' : 'pointer',
            bgcolor: isDragActive ? 'action.hover' : 'transparent',
          }}
        >
          <input {...getInputProps()} />
          <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            {uploading ? 'جاري الرفع...' : 'اسحب الملفات هنا أو انقر للاختيار'}
          </Typography>
        </Paper>
        {attachments.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              المرفقات المرفوعة
            </Typography>
            <Stack spacing={1}>
              {attachments.map((att, idx) => (
                <Typography key={idx} variant="body2">
                  {typeof att === 'string' ? att : att?.name || att?.url || `مرفق ${idx + 1}`}
                </Typography>
              ))}
            </Stack>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default PaymentReceipt;