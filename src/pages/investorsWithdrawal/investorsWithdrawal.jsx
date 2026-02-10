import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  CircularProgress,
  Alert,
  Button,
} from "@mui/material";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Api, { handleApiError } from "../../config/Api";
import InvestorsWithdrawalTable from "../../components/modals/investorsWithdrawalTable";
import DeleteModal from "../../components/modals/DeleteModal";
import PartialPayWithdraw from "../../components/modals/PartialPayWithdraw";
import WithdrawReceiptGenerator from "../../components/WithdrawReceiptGenerator";
import WithdrawReceiptPreview from "../../components/WithdrawReceiptPreview";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import dayjs from "dayjs";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getWithdrawingInvestors,
  getWithdrawalDetails,
  approveWithdrawal,
  rejectWithdrawal,
  partialPayWithdrawal,
  uploadWithdrawalReceipt,
} from "./withdrawal";
import { getMonthName } from "../../components/investors/investorsUtils";
import {
  Grid,
  Card,
  CardContent,
  Chip,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import {
  CheckCircle,
  Cancel,
  AttachMoney,
  Visibility,
  Description,
  PictureAsPdf,
  TableChart,
} from "@mui/icons-material";
import { StyledTableCell, StyledTableRow } from "../../components/layouts/tableLayout";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import { exportWithdrawalDetailsToPDF, exportWithdrawalDetailsToExcel } from "../../utilities/InvestorsWithdrawalExporter";

export default function InvestorsWithdrawal() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedInvestorId, setSelectedInvestorId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [partialPayDialogOpen, setPartialPayDialogOpen] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState(null);
  const [partialAmount, setPartialAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSavingReceipt, setIsSavingReceipt] = useState(false);
  const [withdrawReceiptTemplate, setWithdrawReceiptTemplate] = useState("");
  const [previewReceiptHtml, setPreviewReceiptHtml] = useState("");
  const [allSchedulesPaid, setAllSchedulesPaid] = useState(false);
  const [hasAutoOpenedPreview, setHasAutoOpenedPreview] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [partialPaymentAlerts, setPartialPaymentAlerts] = useState([]);

  const queryClient = useQueryClient();
  const { permissions } = usePermissions();
  const withdrawReceiptGeneratorRef = useRef(null);

  useEffect(() => {
    if (location.state) {
      const { investorId: stateInvestorId, activeTab: targetTab } = location.state;
      if (stateInvestorId) {
        setSelectedInvestorId(stateInvestorId);
        setActiveTab(targetTab || 1);
      }
    }
  }, [location.state]);

  const { data: withdrawingInvestorsData, isLoading: isWithdrawingLoading } = useQuery({
    queryKey: ["withdrawing-investors", currentPage],
    queryFn: () => getWithdrawingInvestors(currentPage),
    enabled: activeTab === 0,
  });

  const { data: withdrawalDetails, isLoading: isDetailsLoading, refetch: refetchDetails } = useQuery({
    queryKey: ["withdrawal-details", selectedInvestorId],
    queryFn: () => getWithdrawalDetails(selectedInvestorId),
    enabled: !!selectedInvestorId && activeTab === 1,
  });

  const fetchWithdrawReceiptTemplate = async () => {
    try {
      const response = await Api.get("/api/templates/WITHDRAWAL_RECEIPT");
      setWithdrawReceiptTemplate(response.data.content || "");
    } catch (error) {
      console.error("Error fetching withdrawal receipt template:", error);
      handleApiError(error);
    }
  };

  const handleOpenPreview = useCallback(async () => {
    if (!withdrawalDetails) {
      notifyError("لا توجد بيانات للعرض");
      return;
    }

    if (!withdrawReceiptTemplate) {
      notifyError("لم يتم تحميل قالب المخالصة بعد، يرجى الانتظار");
      return;
    }

    if (!withdrawReceiptGeneratorRef.current) {
      notifyError("مولد المخالصة غير جاهز، يرجى المحاولة مرة أخرى");
      return;
    }

    try {
      const { data: countData } = await Api.get('/api/partner-withdraw/next-count');
      const receiptNumber = countData?.toString() || 'غير محدد';

      const receiptHtml = await withdrawReceiptGeneratorRef.current.generateContract(
        false,
        withdrawalDetails,
        receiptNumber
      );
      setPreviewReceiptHtml(receiptHtml);
      setIsPreviewOpen(true);
    } catch (error) {
      notifyError("حدث خطأ أثناء توليد المخالصة");
      console.error(error);
      handleApiError(error);
    }
  }, [withdrawalDetails, withdrawReceiptTemplate]);

  useEffect(() => {
    if (withdrawalDetails?.schedule) {
      const allPaid = withdrawalDetails.schedule.every(s => s.status === "PAID");
      setAllSchedulesPaid(allPaid);
      if (!allPaid) {
        setHasAutoOpenedPreview(false);
      }
    }
  }, [withdrawalDetails]);

  useEffect(() => {
    if (
      allSchedulesPaid &&
      withdrawalDetails &&
      !isPreviewOpen &&
      !hasAutoOpenedPreview &&
      withdrawReceiptTemplate &&
      withdrawReceiptGeneratorRef.current &&
      !withdrawalDetails?.withdrawal?.WITHDRAWAL_RECEIPT
    ) {
      const timer = setTimeout(() => {
        if (withdrawReceiptGeneratorRef.current && withdrawReceiptTemplate) {
          handleOpenPreview();
          setHasAutoOpenedPreview(true);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [allSchedulesPaid, withdrawalDetails, isPreviewOpen, hasAutoOpenedPreview, withdrawReceiptTemplate, handleOpenPreview]);

  useEffect(() => {
    fetchWithdrawReceiptTemplate();
  }, []);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    if (newValue === 0) {
      setSelectedInvestorId(null);
    }
  };

  const handleViewDetails = (investorId) => {
    setSelectedInvestorId(investorId);
    setActiveTab(1);
    setHasAutoOpenedPreview(false);
  };

  const handleApprove = async (scheduleId) => {
    if (!permissions.includes("partners-withdraw_Post")) {
      notifyError("ليس لديك صلاحية لتنفيذ هذا الإجراء");
      return;
    }

    try {
      setIsProcessing(true);
      await approveWithdrawal(scheduleId);
      
      const schedule = withdrawalDetails?.schedule?.find(s => s.id === scheduleId);
      const monthName = schedule?.month ? getMonthName(schedule.month) : "الدفعة";
      
      notifySuccess(`تم الموافقة على دفعة شهر ${monthName} بنجاح`);
      queryClient.invalidateQueries({ queryKey: ["withdrawal-details", selectedInvestorId] });
      queryClient.invalidateQueries({ queryKey: ["withdrawing-investors"] });
      refetchDetails();
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء الموافقة على الدفعة");
      handleApiError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenRejectModal = (scheduleId) => {
    if (!permissions.includes("partners-withdraw_Post")) {
      notifyError("ليس لديك صلاحية لتنفيذ هذا الإجراء");
      return;
    }
    setSelectedScheduleId(scheduleId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmReject = async () => {
    try {
      setIsProcessing(true);
      await rejectWithdrawal(selectedScheduleId);
      
      const schedule = withdrawalDetails?.schedule?.find(s => s.id === selectedScheduleId);
      const monthName = schedule?.month ? getMonthName(schedule.month) : "الدفعة";
      
      notifySuccess(`تم رفض دفعة شهر ${monthName} بنجاح`);
      setIsDeleteModalOpen(false);
      setSelectedScheduleId(null);
      queryClient.invalidateQueries({ queryKey: ["withdrawal-details", selectedInvestorId] });
      queryClient.invalidateQueries({ queryKey: ["withdrawing-investors"] });
      refetchDetails();
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء رفض الدفعة");
      handleApiError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseRejectModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedScheduleId(null);
  };

  const handleOpenPartialPayDialog = (scheduleId) => {
    setSelectedScheduleId(scheduleId);
    setPartialAmount("");
    setPartialPayDialogOpen(true);
  };

  const handlePartialPay = async () => {
    if (!permissions.includes("partners-withdraw_Post")) {
      notifyError("ليس لديك صلاحية لتنفيذ هذا الإجراء");
      return;
    }

    if (!partialAmount || parseFloat(partialAmount) <= 0) {
      notifyError("يرجى إدخال مبلغ صحيح");
      return;
    }

    try {
      setIsProcessing(true);
      await partialPayWithdrawal(selectedScheduleId, parseFloat(partialAmount));
      
      const schedule = withdrawalDetails?.schedule?.find(s => s.id === selectedScheduleId);
      const monthName = schedule?.month ? getMonthName(schedule.month) : "الدفعة";
      
      // إضافة alert للدفع الجزئي
      const paidAmount = parseFloat(partialAmount);
      const totalDue = (schedule?.amount || 0) + (schedule?.carryAmount || 0);
      const remainingAmount = totalDue - paidAmount;
      
      if (remainingAmount > 0) {
        const alertId = Date.now();
        const newAlert = {
          id: alertId,
          scheduleId: selectedScheduleId,
          month: monthName,
          paidAmount: paidAmount,
          carriedAmount: remainingAmount,
          timestamp: new Date().toLocaleString('ar-SA')
        };
        
        setPartialPaymentAlerts(prev => [newAlert, ...prev]);
      }
      
      notifySuccess(`تم تسجيل السداد الجزئي لدفعة شهر ${monthName} بنجاح`);
      setPartialPayDialogOpen(false);
      setPartialAmount("");
      setSelectedScheduleId(null);
      queryClient.invalidateQueries({ queryKey: ["withdrawal-details", selectedInvestorId] });
      queryClient.invalidateQueries({ queryKey: ["withdrawing-investors"] });
      refetchDetails();
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء تسجيل السداد الجزئي");
      handleApiError(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveReceipt = async () => {
    if (!withdrawalDetails?.partner?.id) {
      notifyError("لا يوجد معرف للمساهم");
      return;
    }

    try {
      setIsSavingReceipt(true);
      
      const { data: countData } = await Api.get('/api/partner-withdraw/next-count');
      const receiptNumber = countData?.toString() || 'غير محدد';

      const receiptHtml = await withdrawReceiptGeneratorRef.current.generateContract(
        false,
        withdrawalDetails,
        receiptNumber
      );
      const pdfBlob = await withdrawReceiptGeneratorRef.current.generatePDF(receiptHtml);
      
      const formData = new FormData();
      const filename = `مخالصة_${withdrawalDetails.partner?.name?.replace(/[^a-zA-Z0-9\u0600-\u06FF]/g, '_')}_${Date.now()}.pdf`;
      formData.append("file", pdfBlob, filename);
      
      await uploadWithdrawalReceipt(withdrawalDetails.partner.id, formData);

      notifySuccess("تم حفظ المخالصة بنجاح");

      queryClient.invalidateQueries({ queryKey: ['investor-details', withdrawalDetails.partner.id] });
      queryClient.invalidateQueries({ queryKey: ['investors'] });
      queryClient.invalidateQueries({ queryKey: ['withdrawal-details', selectedInvestorId] });
      await refetchDetails();

      setIsPreviewOpen(false);
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء حفظ المخالصة");
      handleApiError(error);
    } finally {
      setIsSavingReceipt(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return "success";
      case "PENDING":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PAID":
        return "مدفوع";
      case "PENDING":
        return "قيد الانتظار";
      default:
        return status;
    }
  };

  const getWithdrawingStatusColor = (status) => {
    switch (status) {
      case "WITHDRAWING":
        return "warning";
      case "WITHDRAWN":
        return "success";
      default:
        return "default";
    }
  };

  const handleExportPDF = async () => {
    if (!withdrawalDetails) {
      notifyError("لا توجد بيانات للتصدير");
      return;
    }
    
    try {
      setIsExporting(true);
      await exportWithdrawalDetailsToPDF(withdrawalDetails);
      notifySuccess("تم تصدير التقرير بصيغة PDF بنجاح");
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير PDF");
      console.error('PDF export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!withdrawalDetails) {
      notifyError("لا توجد بيانات للتصدير");
      return;
    }
    
    try {
      setIsExporting(true);
      await exportWithdrawalDetailsToExcel(withdrawalDetails);
      notifySuccess("تم تصدير التقرير بصيغة Excel بنجاح");
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير Excel");
      console.error('Excel export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleCloseAlert = (alertId) => {
    setPartialPaymentAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const getWithdrawingStatusText = (status) => {
    switch (status) {
      case "WITHDRAWING":
        return "قيد السحب";
      case "WITHDRAWN":
        return "تم السحب";
      default:
        return status;
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.paper', minHeight: "100vh" }}>
      <Helmet>
        <title>انسحابات المستثمرين</title>
        <meta name="description" content="انسحابات المستثمرين" />
      </Helmet>
      {/* Tabs */}
      <Box sx={{ bgcolor: "background.default", borderBottom: "1px solid #ddd", p: 1 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            px: 2,
            "& .MuiTab-root": {
              color: "text.primary",
              "&.Mui-selected": {
                color: "primary.main",
              },
            },
          }}
        >
          <Tab label="جدول السحب" />
          <Tab label="التفاصيل" disabled={!selectedInvestorId} />
        </Tabs>
      </Box>

      {/* Content */}
      <Box sx={{ p: 3, bgcolor: 'background.paper' }}>
        {activeTab === 0 && (
          <InvestorsWithdrawalTable
            data={withdrawingInvestorsData}
            isLoading={isWithdrawingLoading}
            onViewDetails={handleViewDetails}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />
        )}

        {activeTab === 1 && (
          <Box sx={{ bgcolor: 'background.paper', minHeight: '100%' }}>
            {/* Success notification when withdrawal receipt exists */}
            {withdrawalDetails?.withdrawal?.WITHDRAWAL_RECEIPT && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Alert
                  severity="success"
                  sx={{
                    flex: 1,
                    fontSize: "16px",
                    fontWeight: "bold",
                    textAlign: "center"
                  }}
                >
                  تم سداد دفعات المساهم وإنشاء المخالصة بنجاح
                </Alert>
                <Button
                  variant="contained"
                  startIcon={<Visibility sx={{marginLeft: "5px"}} />}
                  onClick={() => window.open(withdrawalDetails.withdrawal.WITHDRAWAL_RECEIPT, '_blank')}
                  sx={{
                    bgcolor: "#2e7d32",
                    "&:hover": { bgcolor: "#1b5e20" },
                    fontWeight: "bold",
                    whiteSpace: "nowrap"
                  }}
                >
                  عرض المخالصة
                </Button>
              </Box>
            )}

            {isDetailsLoading ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : !withdrawalDetails ? (
              <Alert severity="info">يرجى اختيار مستثمر لعرض التفاصيل</Alert>
            ) : (
              <Box>
                {/* Export Buttons */}
                {permissions.includes("partners-withdraw_Export") && (
                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 3 }}>
                  <Button
                    variant="outlined"
                    startIcon={<PictureAsPdf sx={{ marginLeft: "5px" }} />}
                    onClick={handleExportPDF}
                    disabled={isExporting}
                    sx={{
                      borderColor: "#d32f2f",
                      color: "#d32f2f",
                      "&:hover": { bgcolor: "rgba(211, 47, 47, 0.1)", borderColor: "#b71c1c" },
                      fontWeight: "bold",
                    }}
                  >
                    {isExporting ? <CircularProgress size={20} /> : "تصدير PDF"}
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TableChart sx={{ marginLeft: "5px" }} />}
                    onClick={handleExportExcel}
                    disabled={isExporting}
                    sx={{
                      borderColor: "#2e7d32",
                      color: "#2e7d32",
                      "&:hover": { bgcolor: "rgba(46, 125, 50, 0.1)", borderColor: "#1b5e20" },
                      fontWeight: "bold",
                    }}
                  >
                    {isExporting ? <CircularProgress size={20} /> : "تصدير Excel"}
                  </Button>
                </Box>
                )}

                {/* Partner Info */}
                <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" ,color: "primary.main",textAlign: "center"}}>
                    معلومات المستثمر
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" mb={1} fontWeight={500}>
                        الاسم
                      </Typography>
                      <TextField
                        value={withdrawalDetails.partner?.name || ""}
                        fullWidth
                            readOnly
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: 'background.paper',
                            borderRadius: "6px",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" mb={1} fontWeight={500}>
                        رقم الهوية الوطنية
                      </Typography>
                      <TextField
                        value={withdrawalDetails.partner?.nationalId || ""}
                        fullWidth
                        readOnly
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: 'background.paper',
                            borderRadius: "6px",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" mb={1} fontWeight={500}>
                        حالة السحب
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <TextField
                          value={getWithdrawingStatusText(withdrawalDetails.partner?.withdrawingStatus)}
                          fullWidth
                          readOnly
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: 'background.paper',
                              borderRadius: "6px",
                            },
                          }}
                        />
                        <Chip
                          label={getWithdrawingStatusText(withdrawalDetails.partner?.withdrawingStatus)}
                          color={getWithdrawingStatusColor(withdrawalDetails.partner?.withdrawingStatus)}
                          size="small"
                        />
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="body2" mb={1} fontWeight={500}>
                        الحالة
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <TextField
                          value={withdrawalDetails.partner?.isFrozen ? "مجمّد" : "نشط"}
                          fullWidth
                          readOnly
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: 'background.paper',
                              borderRadius: "6px",
                            },
                          }}
                        />
                        <Chip
                          label={withdrawalDetails.partner?.isFrozen ? "مجمّد" : "نشط"}
                          color={withdrawalDetails.partner?.isFrozen ? "error" : "success"}
                          size="small"
                        />
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>

                {/* Withdrawal Request Info */}
                {withdrawalDetails.withdrawal && (
                  <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" ,color: "primary.main",textAlign: "center"}}>
                      معلومات طلب الانسحاب
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" mb={1} fontWeight={500}>
                          رأس المال الإجمالي
                        </Typography>
                        <TextField
                          value={withdrawalDetails.withdrawal.totalCapital?.toLocaleString() || "0"}
                          fullWidth
                            readOnly
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: 'background.paper',
                              borderRadius: "6px",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" mb={1} fontWeight={500}>
                          مبلغ التعثرات
                        </Typography>
                        <TextField
                          value={withdrawalDetails.withdrawal.defaultShare?.toLocaleString() || "0"}
                          fullWidth
                          readOnly
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: 'background.paper',
                              borderRadius: "6px",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" mb={1} fontWeight={500}>
                          رأس المال المتبقي
                        </Typography>
                        <TextField
                          value={withdrawalDetails.withdrawal.remainingCapital?.toLocaleString() || "0"}
                          fullWidth
                          readOnly
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: 'background.paper',
                              borderRadius: "6px",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" mb={1} fontWeight={500}>
                          مبلغ الادخار
                        </Typography>
                        <TextField
                          value={withdrawalDetails.withdrawal.savingAmount?.toLocaleString() || "0"}
                          fullWidth
                          readOnly
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: 'background.paper',
                              borderRadius: "6px",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Typography variant="body2" mb={1} fontWeight={500}>
                          تاريخ الطلب
                        </Typography>
                        <TextField
                          value={
                            withdrawalDetails.withdrawal.createdAt
                              ? dayjs(withdrawalDetails.withdrawal.createdAt).format("DD/MM/YYYY")
                              : "-"
                          }
                          fullWidth
                          readOnly
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: 'background.paper',
                              borderRadius: "6px",
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                {withdrawalDetails.schedule && withdrawalDetails.schedule.length > 0 && (
                  <Paper sx={{ p: 3, mb: 3, bgcolor: 'background.paper' }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: "bold" ,color: "primary.main"}}>
                        جدول السحب
                      </Typography>
                      {allSchedulesPaid && !withdrawalDetails?.withdrawal?.WITHDRAWAL_RECEIPT && (
                        <Button
                          variant="contained"
                          startIcon={<Description />}
                          onClick={handleOpenPreview}
                          sx={{
                            bgcolor: "#2e7d32",
                            "&:hover": { bgcolor: "#1b5e20" },
                            fontWeight: "bold",
                          }}
                        >
                          معاينة المخالصة
                        </Button>
                      )}
                    </Box>

                    {/* Partial Payment Alerts */}
                    {partialPaymentAlerts.length > 0 && (
                      <Box sx={{ mb: 2 }}>
                        {partialPaymentAlerts.map((alert) => (
                          <Box
                            key={alert.id}
                            sx={{
                              bgcolor: 'info.50',
                              borderBottom: '2px solid',
                              borderColor: 'info.200',
                              px: 3,
                              py: 2,
                              mb: 1,
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
                              <AttachMoney sx={{ color: 'info.main', fontSize: 24, mt: 0.5 }} />
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body1" fontWeight="bold" color="info.main" sx={{ mb: 1 }}>
                                  دفع جزئي لشهر {alert.month}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                                  <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                      المبلغ المدفوع
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold" color="success.main">
                                      {alert.paidAmount.toLocaleString()} ريال
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                      المبلغ المرحل
                                    </Typography>
                                    <Typography variant="body1" fontWeight="bold" color="warning.main">
                                      {alert.carriedAmount.toLocaleString()} ريال
                                    </Typography>
                                  </Box>
                                  <Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                      التاريخ والوقت
                                    </Typography>
                                    <Typography variant="body1" fontWeight="600" color="text.primary">
                                      {alert.timestamp}
                                    </Typography>
                                  </Box>
                                </Box>
                              </Box>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => handleCloseAlert(alert.id)}
                              sx={{
                                color: 'info.main',
                                '&:hover': { bgcolor: 'info.100' }
                              }}
                            >
                              <Cancel fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}
                    <TableContainer sx={{ bgcolor: 'background.paper' }}>
                      <Table>
                        <TableHead sx={{ bgcolor: 'background.paper' }}>
                          <StyledTableRow>
                            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                              السنة
                            </StyledTableCell>
                            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                              الشهر
                            </StyledTableCell>
                            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                              المبلغ
                            </StyledTableCell>
                            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                              المبلغ المرحل
                            </StyledTableCell>
                            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                              إجمالي المبلغ
                            </StyledTableCell>
                            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                              المدفوع
                            </StyledTableCell>
                            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                              الحالة
                            </StyledTableCell>
                            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                              تاريخ الدفع
                            </StyledTableCell>
                            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                              الإجراءات
                            </StyledTableCell>
                          </StyledTableRow>
                        </TableHead>
                        <TableBody>
                          {withdrawalDetails.schedule.map((schedule) => (
                            <StyledTableRow key={schedule.id} hover>
                              <StyledTableCell align="center">
                                {schedule.year}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {getMonthName(schedule.month)}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {schedule.amount?.toLocaleString()}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {schedule.carryAmount?.toLocaleString() || 0}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {(schedule.amount + (schedule.carryAmount || 0))?.toLocaleString()}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {schedule.paidAmount?.toLocaleString() || 0}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                <Chip
                                  label={getStatusText(schedule.status)}
                                  color={getStatusColor(schedule.status)}
                                  size="small"
                                />
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {schedule.paidAt
                                  ? dayjs(schedule.paidAt).format("DD/MM/YYYY")
                                  : "-"}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {permissions.includes("partners-withdraw_Post") && (
                                <Box sx={{ display: "flex", gap: 0.3, justifyContent: "center" }}>
                                    <>
                                      {schedule.status !== "PAID" && !schedule.isPaid && (
                                        <>
                                          <Tooltip title="موافقة على الدفعة" arrow>
                                            <IconButton
                                              size="large"
                                              color="success"
                                              onClick={() => handleApprove(schedule.id)}
                                              disabled={isProcessing}
                                              sx={{
                                                color: "green",
                                              }}
                                            >
                                              <CheckCircle fontSize="medium" />
                                            </IconButton>
                                          </Tooltip>
                                          <Tooltip title="رفض الدفعة" arrow>
                                            <IconButton
                                              size="large"
                                              color="error"
                                              onClick={() => handleOpenRejectModal(schedule.id)}
                                              disabled={isProcessing}
                                              sx={{
                                                color: "red",
                                              }}
                                            >
                                              <Cancel fontSize="medium" />
                                            </IconButton>
                                          </Tooltip>
                                          <Tooltip title="دفع جزئي" arrow>
                                            <IconButton
                                              size="large"
                                              color="warning"
                                              onClick={() => handleOpenPartialPayDialog(schedule.id)}
                                              disabled={isProcessing}
                                              sx={{
                                                color: "orange",
                                              }}
                                            >
                                              <AttachMoney fontSize="medium" />
                                            </IconButton>
                                          </Tooltip>
                                        </>
                                      )}
                                      {schedule.status === "PAID" && (
                                        <Tooltip title="رفض الدفعة" arrow>
                                          <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleOpenRejectModal(schedule.id)}
                                            disabled={isProcessing}
                                            sx={{
                                              bgcolor: "error.main",
                                              color: "white",
                                              "&:hover": { bgcolor: "error.dark" },
                                            }}
                                          >
                                            <Cancel fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                    </>
                                </Box>
                                )}
                              </StyledTableCell>
                            </StyledTableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                )}

                {withdrawalDetails.journals && withdrawalDetails.journals.length > 0 && (
                  <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" ,color: "primary.main",textAlign: "center"}}>
                      القيود المحاسبية
                    </Typography>
                    <TableContainer sx={{ bgcolor: 'background.paper' }}>
                      <Table>
                        <TableHead sx={{ bgcolor: 'background.paper' }}>
                          <StyledTableRow>
                            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                              المرجع
                            </StyledTableCell>
                            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                              الوصف
                            </StyledTableCell>
                            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                              التاريخ
                            </StyledTableCell>
                            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                              الإجراءات
                            </StyledTableCell>
                          </StyledTableRow>
                        </TableHead>
                        <TableBody>
                          {withdrawalDetails.journals.map((journal) => (
                            <StyledTableRow key={journal.id} hover>
                              <StyledTableCell align="center">
                                {journal.reference}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {journal.description}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {journal.createdAt
                                  ? dayjs(journal.createdAt).format("DD/MM/YYYY")
                                  : "-"}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<Visibility sx={{marginLeft: "5px"}} />}
                                  onClick={() => {
                                    navigate("/journal-entries", {
                                      state: {
                                        journalId: journal.id,
                                        activeTab: 1,
                                        fromInvestorsWithdrawal: true,
                                        investorId: selectedInvestorId,
                                      },
                                    });
                                  }}
                                  sx={{
                                    borderColor: "primary.main",
                                    color: "primary.main",
                                    "&:hover": {
                                      bgcolor: "primary.50",
                                      borderColor: "primary.dark",
                                    },
                                  }}
                                >
                                  عرض التفاصيل
                                </Button>
                              </StyledTableCell>
                            </StyledTableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                )}
              </Box>
            )}
          </Box>
        )}
      </Box>

      <PartialPayWithdraw
        open={partialPayDialogOpen}
        onClose={() => {
          setPartialPayDialogOpen(false);
          setPartialAmount("");
          setSelectedScheduleId(null);
        }}
        partialAmount={partialAmount}
        onAmountChange={(e) => setPartialAmount(e.target.value)}
        selectedScheduleId={selectedScheduleId}
        withdrawalDetails={withdrawalDetails}
        onConfirm={handlePartialPay}
        isProcessing={isProcessing}
      />

      <DeleteModal
        open={isDeleteModalOpen}
        onClose={handleCloseRejectModal}
        onConfirm={handleConfirmReject}
        title="رفض الدفعة"
        message="هل أنت متأكد من رفض هذه الدفعة؟"
        isLoading={isProcessing}
        ButtonText="رفض"
      />

      {withdrawReceiptTemplate && (
        <WithdrawReceiptGenerator
          ref={withdrawReceiptGeneratorRef}
          withdrawalData={withdrawalDetails}
          templateContent={withdrawReceiptTemplate}
        />
      )}

      <WithdrawReceiptPreview
        open={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
        }}
        receiptHtml={previewReceiptHtml}
        onSaveReceipt={handleSaveReceipt}
        loading={isSavingReceipt}
        investorName={withdrawalDetails?.partner?.name}
        totalAmount={withdrawalDetails?.withdrawal?.totalCapital || 0}
      />
    </Box>
  );
}