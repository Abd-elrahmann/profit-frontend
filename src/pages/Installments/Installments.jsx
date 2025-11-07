import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableContainer,
  Button,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Divider,
  Chip,
  Stack,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Schedule as PostponeIcon,
  Description as DocumentIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Payment as PartialPaymentIcon,
} from "@mui/icons-material";
import { Download } from "@mui/icons-material";

import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { 
  getLoanById, 
  approveRepayment, 
  rejectRepayment, 
  postponeRepayment,
  markAsPartialPaid,
} from "./InstallmentsApi";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import { StyledTableCell, StyledTableRow } from "../../components/layouts/tableLayout";
import dayjs from "dayjs";
import PaymentProofGenerator from "../../components/PaymentProofGenerator";
import PaymentProofPreview from "../../components/PaymentProofPreview";
import InstallmentSettlementPreview from "../../components/InstallmentSettlementPreview";
import InstallmentSettlementReceipt from "../../components/InstallmentSettlementReceipt";
import Api from "../../config/Api";
import { Helmet } from "react-helmet-async";
const Installments = () => {
    const { loanId } = useParams();
    const queryClient = useQueryClient();
    const [selectedInstallment, setSelectedInstallment] = useState(null);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedActionInstallment, setSelectedActionInstallment] = useState(null);
    const [activeStep, setActiveStep] = useState(0);
    
    const [postponeModalOpen, setPostponeModalOpen] = useState(false);
    const [newDueDate, setNewDueDate] = useState("");
    const [postponeReason, setPostponeReason] = useState("");
    
    const [partialPaymentModalOpen, setPartialPaymentModalOpen] = useState(false);
    const [paidAmount, setPaidAmount] = useState("");
    
    const [activeInstallmentId, setActiveInstallmentId] = useState(null);

    const [paymentProofModalOpen, setPaymentProofModalOpen] = useState(false);
    const [selectedProofInstallment, setSelectedProofInstallment] = useState(null);
    const [paymentProofTemplate, setPaymentProofTemplate] = useState('');
    const [paymentProofHtml, setPaymentProofHtml] = useState('');
    const [isGeneratingProof, setIsGeneratingProof] = useState(false);
    const [settlementModalOpen, setSettlementModalOpen] = useState(false);
    const [settlementHtml, setSettlementHtml] = useState('');
    const [isGeneratingSettlement, setIsGeneratingSettlement] = useState(false);
    const [settlementTemplate, setSettlementTemplate] = useState('');

    const settlementReceiptRef = useRef(null);

    const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
    const [selectedDocumentsInstallment, setSelectedDocumentsInstallment] = useState(null);
  
    const paymentProofGeneratorRef = useRef(null);

    useEffect(() => {
      if (loanId) {
        fetchPaymentProofTemplate();
        fetchSettlementTemplate();
      }
    }, [loanId]);

    const fetchPaymentProofTemplate = async () => {
      try {
        const response = await Api.get('/api/templates/PAYMENT_PROOF');
        setPaymentProofTemplate(response.data.content || '');
      } catch (error) {
        console.warn('Could not fetch payment proof template:', error);
      }
    };

    const fetchSettlementTemplate = async () => {
      try {
        const response = await Api.get('/api/templates/SETTLEMENT');
        setSettlementTemplate(response.data.content || '');
      } catch (error) {
        console.warn('Could not fetch settlement template:', error);
      }
    };

    const { data: loanData, isLoading, error } = useQuery({
      queryKey: ["loan", loanId],
      queryFn: () => getLoanById(loanId),
      enabled: !!loanId,
    });
  
    const { data: repaymentsData } = useQuery({
      queryKey: ["repayments", loanId],
      queryFn: () => getLoanById(loanId),
      enabled: !!loanId && (!loanData?.repayments || loanData.repayments.length === 0),
    });
  
    const steps = [
      "بإنتظار رفع الإيصال",
      "مراجعة الإيصال المرفوع",
      "إتمام العملية"
    ];
  
    const installments = Array.isArray(loanData?.repayments) ? loanData.repayments : 
                     Array.isArray(repaymentsData) ? repaymentsData : [];
    
    const sortedInstallments = [...installments].sort((a, b) => {
      return a.id - b.id || new Date(a.dueDate) - new Date(b.dueDate);
    });

    // Handle row click
    const handleRowClick = (installment) => {
      setSelectedInstallment(installment);
      setActiveInstallmentId(installment.id);
      
      // Set active step based on installment status and attachments
      if (installment.status === "PAID") {
        setActiveStep(2);
      } else if (installment.attachments && installment.attachments.length > 0) {
        setActiveStep(1);
      } else {
        setActiveStep(0);
      }
    };

    // Auto-select installment with pending documents for review
    useEffect(() => {
      const installmentWithDocuments = sortedInstallments.find(inst => 
        inst.attachments && inst.attachments.length > 0 && inst.status === "PENDING"
      );
      
      if (installmentWithDocuments && !activeInstallmentId) {
        handleRowClick(installmentWithDocuments);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortedInstallments]);

    const handleApprove = async (installment) => {
      try {
        setSelectedProofInstallment(installment);
        
        const defaultEmployeeName = "ربيش سالم ناصر الهمامي";
        
        const proofHtml = await paymentProofGeneratorRef.current.generateContract(
          false, 
          { 
            installmentData: installment, 
            loanData, 
            clientData: loanData?.client,
            employeeName: defaultEmployeeName
          }
        );
        
        setPaymentProofHtml(proofHtml);
        setPaymentProofModalOpen(true);
        
      } catch (error) {
        console.log('Error generating payment proof:', error);
        notifyError('حدث خطأ أثناء توليد إيصال السداد');
      }
      setAnchorEl(null);
    };

    const handleSavePaymentProof = async () => {
      try {
        setIsGeneratingProof(true);
        
        const defaultEmployeeName = "ربيش سالم ناصر الهمامي";
        
        const finalProofHtml = await paymentProofGeneratorRef.current.generateContract(
          false, 
          { 
            installmentData: selectedProofInstallment, 
            loanData, 
            clientData: loanData?.client,
            employeeName: defaultEmployeeName
          }
        );
        
        await paymentProofGeneratorRef.current.generatePDF(finalProofHtml);
        
        notifySuccess("تم حفظ إيصال السداد بنجاح");
        
        await approveRepayment(selectedProofInstallment.id, selectedProofInstallment.amount, "تمت الموافقة على السداد");
        
        setPaymentProofModalOpen(false);
        setSelectedProofInstallment(null);
        setActiveStep(2);
        
        // Reset after successful approval
        setTimeout(() => {
          setActiveStep(0);
          setSelectedInstallment(null);
          setActiveInstallmentId(null);
        }, 2000);
  
        queryClient.invalidateQueries(["loan", loanId]);
        queryClient.invalidateQueries(["repayments", loanId]);
        queryClient.invalidateQueries(["repayment", selectedProofInstallment.id]);
        
      } catch (error) {
        console.log('Error saving payment proof:', error);
        notifyError(error.response?.data?.message || "حدث خطأ أثناء حفظ الإيصال");
      } finally {
        setIsGeneratingProof(false);
      }
    };
  
    const handleReject = async (installment) => {
      try {
        await rejectRepayment(installment.id, "تم رفض الإيصال");
        notifySuccess("تم رفض السداد");
        queryClient.invalidateQueries(["loan", loanId]);
        queryClient.invalidateQueries(["repayments", loanId]);
        setActiveStep(0);
      } catch (error) {
        console.log('Reject error:', error);
        notifyError(error.response?.data?.message || "حدث خطأ أثناء رفض السداد");
      }
      setAnchorEl(null);
    };

    const handlePartialPayment = async () => {
      if (!selectedActionInstallment || !paidAmount) {
        notifyError("يرجى إدخال المبلغ المدفوع");
        return;
      }

      const paidAmountNum = parseFloat(paidAmount);
      if (isNaN(paidAmountNum) || paidAmountNum <= 0) {
        notifyError("يرجى إدخال مبلغ صحيح");
        return;
      }

      if (paidAmountNum > selectedActionInstallment.amount) {
        notifyError("المبلغ المدفوع لا يمكن أن يكون أكبر من قيمة القسط");
        return;
      }

      try {
        await markAsPartialPaid(selectedActionInstallment.id, paidAmountNum);
        notifySuccess("تم تسجيل الدفع الجزئي بنجاح");
        queryClient.invalidateQueries(["loan", loanId]);
        queryClient.invalidateQueries(["repayments", loanId]);
        setPartialPaymentModalOpen(false);
        setPaidAmount("");
      } catch (error) {
        console.log('Partial payment error:', error);
        notifyError(error.response?.data?.message || "حدث خطأ أثناء تسجيل الدفع الجزئي");
      }
      setAnchorEl(null);
    };

  const handlePostpone = async () => {
    if (!selectedActionInstallment || !newDueDate) {
      notifyError("يرجى إدخال تاريخ الاستحقاق الجديد");
      return;
    }

    try {
      await postponeRepayment(selectedActionInstallment.id, newDueDate, postponeReason);
      notifySuccess("تم تأجيل القسط بنجاح");
      queryClient.invalidateQueries(["loan", loanId]);
      queryClient.invalidateQueries(["repayments", loanId]);
      setPostponeModalOpen(false);
      setNewDueDate("");
      setPostponeReason("");
    } catch (error) {
      console.log('Postpone error:', error);
      notifyError(error.response?.data?.message || "حدث خطأ أثناء تأجيل القسط");
    }
    setAnchorEl(null);
  };

  const handleMenuOpen = (event, installment) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedActionInstallment(installment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedActionInstallment(null);
  };

  const checkIfOverdue = (installment) => {
    if (installment.status === "PAID") return false;
    const dueDate = new Date(installment.dueDate);
    const today = new Date();
    return dueDate < today;
  };

  // Check if all installments are paid
  const allInstallmentsPaid = () => {
    return sortedInstallments.every(installment => installment.status === "PAID");
  };

  // Check if settlement is already completed
  const isSettlementCompleted = () => {
    return loanData?.SETTLEMENT !== null && loanData?.SETTLEMENT !== undefined;
  };

  // Check if actions should be disabled
  const shouldDisableActions = () => {
    return isSettlementCompleted();
  };

  const handleSettlement = async () => {
    try {
      setIsGeneratingSettlement(true);
      
      const lastInstallment = sortedInstallments[sortedInstallments.length - 1];
      
      const defaultEmployeeName = "ربيش سالم ناصر الهمامي";
      
      const settlementHtml = await settlementReceiptRef.current.generateContract(
        false, 
        { 
          installmentData: lastInstallment, 
          loanData, 
          clientData: loanData?.client,
          employeeName: defaultEmployeeName
        }
      );
      
      setSettlementHtml(settlementHtml);
      setSettlementModalOpen(true);
      
      setIsGeneratingSettlement(false);
      
    } catch (error) {
      console.log('Error generating settlement receipt:', error);
      notifyError('حدث خطأ أثناء توليد سند التسوية');
      setIsGeneratingSettlement(false);
    }
  };

  const handleSaveSettlement = async () => {
    try {
      setIsGeneratingSettlement(true);
      
      const lastInstallment = sortedInstallments[sortedInstallments.length - 1];
      const defaultEmployeeName = "ربيش سالم ناصر الهمامي";
      
      const finalSettlementHtml = await settlementReceiptRef.current.generateContract(
        false, 
        { 
          installmentData: lastInstallment, 
          loanData, 
          clientData: loanData?.client,
          employeeName: defaultEmployeeName
        }
      );
      
      await settlementReceiptRef.current.generatePDF(finalSettlementHtml);
      
      notifySuccess("تم حفظ سند التسوية بنجاح");
      
      setSettlementModalOpen(false);
      
      setTimeout(() => {
        notifySuccess("تم تسوية القسط النهائي وإغلاقه بنجاح");
      }, 500);
      
      queryClient.invalidateQueries(["loan", loanId]);
      
    } catch (error) {
      console.log('Error saving settlement receipt:', error);
      notifyError(error.response?.data?.message || "حدث خطأ أثناء حفظ السند");
    } finally {
      setIsGeneratingSettlement(false);
    }
  };

  const getStatusColor = (status, installment) => {
    if (checkIfOverdue(installment)) {
      return "error";
    }
    
    const effectiveStatus = (status === "PENDING" && installment.attachments && installment.attachments.length > 0) 
      ? "PENDING_REVIEW" 
      : status;
    
    switch (effectiveStatus) {
      case "PENDING":
        return "warning";
      case "PENDING_REVIEW":
        return "warning";
      case "COMPLETED":
        return "info";
      case "PAID":
        return "success";
      case "PARTIAL_PAID":
        return "info";
      case "OVERDUE":
        return "error";
      default:
        return "default";
    }
  };

  const getStatusText = (status, installment) => {
    if (checkIfOverdue(installment)) {
      return "متأخر";
    }
    
    const effectiveStatus = (status === "PENDING" && installment.attachments && installment.attachments.length > 0) 
      ? "PENDING_REVIEW" 
      : status;
    
    switch (effectiveStatus) {
      case "PENDING":
        return "قيد الانتظار";
      case "PENDING_REVIEW":
        return "قيد المراجعة";
      case "COMPLETED":
        return "مكتمل";
      case "PAID":
        return "مدفوع";
      case "PARTIAL_PAID":
        return "مدفوع جزئياً";
      case "OVERDUE":
        return "متأخر";
      default:
        return status;
    }
  };

  const extractFileName = (url) => {
    if (!url) return 'ملف غير معروف';

    if (Array.isArray(url)) {
      if (url.length === 0) return 'ملف غير معروف';
      url = url[0];
    }
    
    const parts = url.split('/');
    return parts[parts.length - 1] || 'ملف غير معروف';
  };

  const hasPendingDocuments = (installment) => {
    return installment.attachments && installment.attachments.length > 0 && installment.status === "PENDING";
  };

  const hasFiles = (installment) => {
    return (installment.attachments && installment.attachments.length > 0) || installment.PaymentProof;
  };

  if (!loanId) {
    return (
      <Box
        sx={{
          bgcolor: "#f6f6f8",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 4
        }}
      >
        <Paper sx={{ p: 6, textAlign: "center", maxWidth: 500, borderRadius: 3 }}>
          <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
            اختر قسطاً
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            يرجى اختيار قسط لعرض الإحصائيات والتفاصيل
          </Typography>
          
          <Button 
            variant="contained" 
            size="large"
            onClick={() => window.location.href = "/loans"}
            sx={{
              bgcolor: "#1E40AF",
              "&:hover": { bgcolor: "#153482" },
              borderRadius: 2,
              px: 4,
              py: 1.5
            }}
          >
            الذهاب إلى صفحة السلف
          </Button>
        </Paper>
      </Box>
    );
  }

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        حدث خطأ في تحميل بيانات الأقساط
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "#f6f6f8",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Helmet>
        <title> أقساط السلفة</title>
        <meta name="description" content="أقساط السلفة" />
      </Helmet>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flex: 1,
          height: "calc(100vh - 80px)",
          width: "100%",
        }}
      >
        <Box
          sx={{
            flex: 1,
            p: 4,
            bgcolor: "#fff",
            overflowY: "auto",
          }}
        >
          <Typography variant="h5" fontWeight="bold" mb={3}>
            أقساط السلفة - {loanData?.client?.name}
          </Typography>

          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={12} md={4} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  مبلغ السلفة
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="warning.main">
                  {loanData?.amount?.toLocaleString()} ر.س
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  إجمالي الفائدة
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="error.main">
                  {loanData?.interestAmount?.toLocaleString()} ر.س
                </Typography>
              </Grid>
              <Grid item xs={12} md={4} textAlign="center">
                <Typography variant="body2" color="text.secondary">
                  المبلغ الإجمالي
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {loanData?.totalAmount?.toLocaleString()} ر.س
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Settlement Button - Only show if all installments are paid AND settlement is not completed */}
          {allInstallmentsPaid() && !isSettlementCompleted() && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
              <Button
                variant="contained"
                onClick={handleSettlement}
                sx={{
                  bgcolor: "#16a34a",
                  "&:hover": { bgcolor: "#15803d" },
                  fontWeight: "bold",
                  borderRadius: 2,
                  px: 4,
                  py: 1.5
                }}
              >
                تسوية القسط النهائي
              </Button>
            </Box>
          )}

          {/* Show message if settlement is already completed */}
          {isSettlementCompleted() && (
            <Alert severity="success" sx={{ mb: 3 }}>
              تم تسوية القسط النهائي بنجاح
            </Alert>
          )}

          <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
            <TableContainer>
              <Table stickyHeader>
                <TableHead>
                  <StyledTableRow>
                    <StyledTableCell align="center">الاقساط المدفوعة</StyledTableCell>
                    <StyledTableCell align="center">رقم القسط</StyledTableCell>
                    <StyledTableCell align="center">تاريخ الاستحقاق</StyledTableCell>
                    <StyledTableCell align="center">القسط</StyledTableCell>
                    <StyledTableCell align="center">المبلغ المدفوع</StyledTableCell>
                    <StyledTableCell align="center">الرصيد المتبقي</StyledTableCell>
                    <StyledTableCell align="center">الحالة</StyledTableCell>
                    <StyledTableCell align="center"> تاريخ الدفع</StyledTableCell>
                    <StyledTableCell align="center">الإجراءات</StyledTableCell>
                  </StyledTableRow>
                </TableHead>
                <TableBody>
                  {sortedInstallments.map((installment) => (
                    <StyledTableRow 
                      key={installment.id} 
                      hover
                      onClick={() => handleRowClick(installment)}
                      sx={{
                        cursor: 'pointer',
                        border: hasPendingDocuments(installment) ? '2px solid #1E40AF' : 'none',
                        borderLeft: hasPendingDocuments(installment) ? '4px solid #1E40AF' : 'none',
                        backgroundColor: activeInstallmentId === installment.id ? '#e6f0ff' : 
                                       hasPendingDocuments(installment) ? '#f0f4ff' : 'inherit',
                        '&:hover': {
                          backgroundColor: activeInstallmentId === installment.id ? '#d4e4ff' : 
                                         hasPendingDocuments(installment) ? '#e6f0ff' : '#f5f5f5',
                        }
                      }}
                    >
                      <StyledTableCell align="center">
                        {installment.status === "PAID" && (
                          <Checkbox checked size="small" />
                        )}
                      </StyledTableCell>
                      <StyledTableCell align="center">{installment.count}</StyledTableCell>
                      <StyledTableCell align="center">
                        {dayjs(installment.dueDate).format("DD/MM/YYYY")}
                      </StyledTableCell>
                      <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                        {installment.amount?.toFixed(2)} ر.س
                      </StyledTableCell>
                      <StyledTableCell align="center" style={{color: installment.paidAmount > 0 ? "green" : "red",fontWeight:"bold"}}>
                        {installment.paidAmount > 0
                          ? `${installment.paidAmount.toFixed(2)} ر.س`
                          : "0.00 ر.س"}
                      </StyledTableCell>
                      <StyledTableCell align="center" style={{color: installment.remaining === 0 ? "black" : "red",fontWeight:"bold"}}>
                        {installment.remaining?.toFixed(2) || "0.00"} ر.س
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Chip
                          label={getStatusText(installment.status, installment)}
                          color={getStatusColor(installment.status, installment)}
                          size="small"
                        />
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {installment.paymentDate ? dayjs(installment.paymentDate).format("DD/MM/YYYY") : "لم يأتي بعد"}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, installment)}
                            disabled={shouldDisableActions()}
                            sx={{
                              opacity: shouldDisableActions() ? 0.5 : 1,
                              cursor: shouldDisableActions() ? 'not-allowed' : 'pointer'
                            }}
                          >
                            <MoreVertIcon />
                          </IconButton>
                        </Stack>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        <Box
          sx={{
            width: "270px",
            borderRight: "1px solid #ddd",
            bgcolor: "#fafafa",
            height: "100%",
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={3}>
              خطوات المراجعة
            </Typography>

            <Stepper orientation="vertical" activeStep={activeStep} sx={{ mb: 3 }}>
              {steps.map((label, index) => (
                <Step key={index}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Divider sx={{ my: 3 }} />

            {activeInstallmentId ? (
              <Box>
                <Typography variant="body2" color="text.secondary" mb={1}>
                  القسط المحدد: #{selectedInstallment?.count}
                </Typography>
                
                {selectedInstallment && (
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    المبلغ: {selectedInstallment.amount?.toFixed(2)} ر.س
                  </Typography>
                )}
                
                {activeStep === 0 && (
                  <Alert severity="info" sx={{ mb: 2,ml:2 }}>
                    في انتظار رفع الإيصال من العميل
                  </Alert>
                )}
                
                {activeStep === 1 && (
                  <Alert severity="warning" sx={{ mb: 2,ml:2 }}>
                    جاري مراجعة الإيصال المرفوع
                  </Alert>
                )}

                {activeStep === 2 && (
                  <Alert severity="success" sx={{ mb: 2,ml:2 }}>
                    تم إتمام العملية بنجاح
                  </Alert>
                )}

                {/* Display files if they exist */}
                {hasFiles(selectedInstallment) ? (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      الملفات المرفوعة:
                    </Typography>
                    
                    {/* Display attachments */}
                    {selectedInstallment?.attachments && selectedInstallment.attachments.length > 0 && (
                      <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                          المستندات:
                        </Typography>
                        {selectedInstallment.attachments.map((attachment, index) => (
                          <Box 
                            key={index}
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              gap: 1,
                              cursor: 'pointer',
                              '&:hover': { bgcolor: 'grey.200' },
                              p: 1,
                              borderRadius: 1,
                              mb: 1
                            }}
                            onClick={() => {
                              window.open(attachment, '_blank');
                            }}
                          >
                            <Typography variant="body2" sx={{ flex: 1 }}>
                              {extractFileName(attachment)}
                            </Typography>
                            <IconButton 
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                const link = document.createElement('a');
                                link.href = attachment;
                                link.download = extractFileName(attachment);
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                            >
                              <Download />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}

                    {/* Display payment proof */}
                    {selectedInstallment?.PaymentProof && (
                      <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                        <Typography variant="body2" fontWeight="bold" gutterBottom>
                          إيصال الدفع:
                        </Typography>
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'grey.200' },
                            p: 1,
                            borderRadius: 1
                          }}
                          onClick={() => {
                            window.open(selectedInstallment.PaymentProof, '_blank');
                          }}
                        >
                          <Typography variant="body2" sx={{ flex: 1 }}>
                            {extractFileName(selectedInstallment.PaymentProof)}
                          </Typography>
                          <IconButton 
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              const link = document.createElement('a');
                              link.href = selectedInstallment.PaymentProof;
                              link.download = extractFileName(selectedInstallment.PaymentProof);
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                            }}
                          >
                            <Download />
                          </IconButton>
                        </Box>
                      </Box>
                    )}
                  </Box>
                ) : (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    هذا القسط لا يحتوي على أي ملفات
                  </Alert>
                )}
              </Box>
            ) : (
              <Alert severity="info">
                اختر قسطاً لعرض التفاصيل
              </Alert>
            )}
          </Box>
        </Box>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedActionInstallment?.status !== "PAID" && !shouldDisableActions() && (
          <MenuItem onClick={() => handleApprove(selectedActionInstallment)} sx={{ color: 'green' }}>
            <ApproveIcon sx={{ mr: 1, color: 'green',marginLeft: '10px' }} />
            موافقة
          </MenuItem>
        )}
      
        {!shouldDisableActions() && (
          <MenuItem onClick={() => handleReject(selectedActionInstallment)} sx={{ color: 'red' }}>
            <RejectIcon sx={{ mr: 1, color: 'red',marginLeft: '10px' }} />
            رفض
          </MenuItem>
        )}

        {selectedActionInstallment?.status !== "PAID" && !shouldDisableActions() && (
          <MenuItem onClick={() => setPartialPaymentModalOpen(true)} sx={{ color: 'blue' }}>
            <PartialPaymentIcon sx={{ mr: 1, color: 'blue',marginLeft: '10px' }} />
            إضافة دفع جزئي
          </MenuItem>
        )}

        {selectedActionInstallment?.status !== "PAID" && !shouldDisableActions() && (
          <MenuItem onClick={() => setPostponeModalOpen(true)} sx={{ color: 'orange' }}>
            <PostponeIcon sx={{ mr: 1, color: 'orange',marginLeft: '10px' }} />
            تأجيل
          </MenuItem>
        )}
        {selectedActionInstallment?.status === "PAID" && (
        <MenuItem onClick={() => {
          setSelectedDocumentsInstallment(selectedActionInstallment);
          setDocumentsModalOpen(true);
        }}>
          <DocumentIcon sx={{ mr: 1,marginLeft: '10px' }} />
          عرض المستندات
        </MenuItem>
        )}
      </Menu>

      {/* Partial Payment Modal */}
      <Dialog maxWidth="md" open={partialPaymentModalOpen} onClose={() => setPartialPaymentModalOpen(false)}>
        <DialogTitle>إضافة دفع جزئي</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            القسط: #{selectedActionInstallment?.count} - المبلغ: {selectedActionInstallment?.amount?.toFixed(2)} ر.س
          </Typography>
          <TextField
            fullWidth
            type="number"
            label="المبلغ المدفوع"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            sx={{ mt: 2 }}
            InputProps={{
              inputProps: { 
                min: 0,
                max: selectedActionInstallment?.remaining,
                step: 0.01
              }
            }}
            helperText={`الحد الأقصى: ${selectedActionInstallment?.remaining?.toFixed(2)} ر.س`}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 2, flexDirection: 'row-reverse' }}>
          <Button onClick={() => setPartialPaymentModalOpen(false)} variant="outlined">إلغاء</Button>
          <Button onClick={handlePartialPayment} variant="contained" color="primary">
            تأكيد الدفع الجزئي
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog  maxWidth="md" open={postponeModalOpen} onClose={() => setPostponeModalOpen(false)}>
        <DialogTitle>تأجيل القسط</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            type="date"
            label="التاريخ الجديد للاستحقاق"
            value={newDueDate}
            onChange={(e) => setNewDueDate(e.target.value)}
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="سبب التأجيل"
            value={postponeReason}
            onChange={(e) => setPostponeReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, gap: 2, flexDirection: 'row-reverse' }}>
          <Button onClick={() => setPostponeModalOpen(false)} variant="outlined">إلغاء</Button>
          <Button onClick={handlePostpone} variant="contained">
            تأجيل
          </Button>
        </DialogActions>
      </Dialog>

      <PaymentProofGenerator
        ref={paymentProofGeneratorRef}
        installmentData={selectedProofInstallment}
        loanData={loanData}
        clientData={loanData?.client}
        templateContent={paymentProofTemplate}
        employeeName="الموظف المختص"
        autoGenerate={false}
      />

      <PaymentProofPreview
        open={paymentProofModalOpen}
        onClose={() => {
          setPaymentProofModalOpen(false);
          setSelectedProofInstallment(null);
        }}
        paymentProofHtml={paymentProofHtml}
        onSaveProof={handleSavePaymentProof}
        loading={isGeneratingProof}
        clientName={loanData?.client?.name}
        installmentAmount={selectedProofInstallment?.amount || 0}
        installmentNumber={selectedProofInstallment?.id || ''}
      />

      <InstallmentSettlementReceipt
        ref={settlementReceiptRef}
        installmentData={sortedInstallments[sortedInstallments.length - 1]}
        loanData={loanData}
        clientData={loanData?.client}
        templateContent={settlementTemplate}
        employeeName="الموظف المختص"
        autoGenerate={false}
      />

      <InstallmentSettlementPreview
        open={settlementModalOpen}
        onClose={() => {
          setSettlementModalOpen(false);
        }}
        settlementHtml={settlementHtml}
        onSaveSettlement={handleSaveSettlement}
        loading={isGeneratingSettlement}
        clientName={loanData?.client?.name}
        installmentAmount={loanData?.totalAmount || 0}
        installmentNumber={sortedInstallments[sortedInstallments.length - 1]?.count || ''}
      />

      <Dialog open={documentsModalOpen} onClose={() => setDocumentsModalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ textAlign: 'center' }}> قسط #{selectedDocumentsInstallment?.id}</DialogTitle>
        <DialogContent>
          {selectedDocumentsInstallment?.attachments && selectedDocumentsInstallment.attachments.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                المستندات المرفوعة:
              </Typography>
              {selectedDocumentsInstallment.attachments.map((attachment, index) => (
                <Box 
                  key={index}
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1,
                    cursor: 'pointer',
                    '&:hover': { bgcolor: 'grey.200' },
                    p: 1,
                    borderRadius: 1,
                    mb: 1
                  }}
                  onClick={() => {
                    window.open(attachment, '_blank');
                  }}
                >
                  <Typography variant="body2" sx={{ flex: 1 }}>
                    {extractFileName(attachment)}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.print();
                      }}
                      title="طباعة"
                    >
                      <PrintIcon />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (navigator.share) {
                          navigator.share({
                            title: extractFileName(attachment),
                            url: attachment
                          });
                        } else {
                          navigator.clipboard.writeText(attachment);
                          notifySuccess("تم نسخ الرابط إلى الحافظة");
                        }
                      }}
                      title="مشاركة"
                    >
                      <ShareIcon />
                    </IconButton>
                    <IconButton 
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        const link = document.createElement('a');
                        link.href = attachment;
                        link.download = extractFileName(attachment);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}
                      title="تحميل"
                    >
                      <Download />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          )}

          {selectedDocumentsInstallment?.PaymentProof && (
            <Box>
              <Typography variant="h6" gutterBottom>
                إيصال الدفع:
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'grey.200' },
                  p: 1,
                  borderRadius: 1
                }}
                onClick={() => {
                  window.open(selectedDocumentsInstallment.PaymentProof, '_blank');
                }}
              >
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {extractFileName(selectedDocumentsInstallment.PaymentProof)}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <IconButton 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.print();
                    }}
                    title="طباعة"
                    >
                    <PrintIcon />
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (navigator.share) {
                        navigator.share({
                          title: extractFileName(selectedDocumentsInstallment.PaymentProof),
                          url: selectedDocumentsInstallment.PaymentProof
                        });
                      } else {
                        navigator.clipboard.writeText(selectedDocumentsInstallment.PaymentProof);
                        notifySuccess("تم نسخ الرابط إلى الحافظة");
                      }
                    }}
                    title="مشاركة"
                  >
                    <ShareIcon />
                  </IconButton>
                  <IconButton 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      const link = document.createElement('a');
                      link.href = selectedDocumentsInstallment.PaymentProof;
                      link.download = extractFileName(selectedDocumentsInstallment.PaymentProof);
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    title="تحميل"
                  >
                    <Download />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          )}

          {(!selectedDocumentsInstallment?.attachments || selectedDocumentsInstallment.attachments.length === 0) && 
           !selectedDocumentsInstallment?.PaymentProof && (
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
              لا توجد مستندات مرفوعة لهذا القسط
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentsModalOpen(false)}>إغلاق</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Installments;