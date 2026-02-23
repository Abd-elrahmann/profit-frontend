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
  TextField,
  Checkbox,
  Card,
  CardContent,
  useMediaQuery,
  Pagination,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Check as ApproveIcon,
  Close as RejectIcon,
  Close as CloseIcon,
  KeyboardArrowRight as ArrowRightIcon,
  Schedule as PostponeIcon,
  Description as DocumentIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Payment as PartialPaymentIcon,
  ArrowBack as ArrowBackIcon,
  PictureAsPdf as PDFIcon,
  TableChart as ExcelIcon,
} from "@mui/icons-material";
import { Download } from "@mui/icons-material";

import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getLoanById,
  approveRepayment,
  rejectRepayment,
  postponeRepayment,
  markAsPartialPaid,
  earlyPayment,
  approveMultipleRepayments,
  rejectMultipleRepayments,
} from "./InstallmentsApi";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import {
  StyledTableCell,
  StyledTableRow,
  ScrollableTableContainer
} from "../../components/layouts/tableLayout";
import dayjs from "dayjs";
import PaymentProofGenerator from "../../components/contracts/generators/PaymentProofGenerator";
import PaymentProofPreview from "../../components/contracts/generators/PaymentProofPreview";
import InstallmentSettlementPreview from "../../components/contracts/generators/InstallmentSettlementPreview";
import InstallmentSettlementReceipt from "../../components/contracts/generators/InstallmentSettlementReceipt";
import DeleteModal from "../../components/modals/DeleteModal";
import DiscountModal from "../../components/modals/DiscountModal";
import PartialPaymentModal from "../../components/modals/PartialPaymentModal";
import PostponeModal from "../../components/modals/PostponeModal";
import EarlyPaymentModal from "../../components/modals/EarlyPaymentModal";
import DocumentsModal from "../../components/modals/DocumentsModal";
import Api, { handleApiError } from "../../config/Api";
import { Helmet } from "react-helmet-async";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import { exportRepaymentsToPDF, exportRepaymentsToExcel } from "../../utilities/repaymentsExporter";

const downloadFile = async (url, filename) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    try {
      link.download = decodeURIComponent(filename);
    } catch {
      link.download = filename;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download error:', error);
    notifyError('حدث خطأ أثناء تحميل الملف');
  }
};

const handleShareFile = async (fileUrl, filename) => {
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();

    const decodedFilename = decodeURIComponent(filename);
    const file = new File([blob], decodedFilename, { type: blob.type });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: decodedFilename,
        text: 'مشاركة إيصال الدفع',
        files: [file],
      });
    } else {
      await navigator.clipboard.writeText(fileUrl);
      notifySuccess('تم نسخ رابط الملف إلى الحافظة');
    }
  } catch (error) {
    console.error('Share error:', error);
    notifyError('حدث خطأ أثناء مشاركة الملف');
  }
};

const Installments = () => {
  const { loanId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedActionInstallment, setSelectedActionInstallment] =
    useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedInstallments, setSelectedInstallments] = useState([]);
  const [isBulkOperationLoading, setIsBulkOperationLoading] = useState(false);

  const [postponeModalOpen, setPostponeModalOpen] = useState(false);
  const [newDueDate, setNewDueDate] = useState("");
  const [postponeReason, setPostponeReason] = useState("");

  const [partialPaymentModalOpen, setPartialPaymentModalOpen] = useState(false);
  const [paidAmount, setPaidAmount] = useState("");
  const [partialPaymentProofModalOpen, setPartialPaymentProofModalOpen] = useState(false);
  const [partialPaymentProofHtml, setPartialPaymentProofHtml] = useState("");
  const [isGeneratingPartialProof, setIsGeneratingPartialProof] = useState(false);
  const [partialPaymentInstallment, setPartialPaymentInstallment] = useState(null);

  const [activeInstallmentId, setActiveInstallmentId] = useState(null);

  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [discountInstallment, setDiscountInstallment] = useState(null);
  const [confirmedDiscount, setConfirmedDiscount] = useState({ discount: 0, notes: '' });

  const [paymentProofModalOpen, setPaymentProofModalOpen] = useState(false);
  const [selectedProofInstallment, setSelectedProofInstallment] =
    useState(null);
  const [paymentProofTemplate, setPaymentProofTemplate] = useState("");
  const [paymentProofHtml, setPaymentProofHtml] = useState("");
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [settlementModalOpen, setSettlementModalOpen] = useState(false);
  const [settlementHtml, setSettlementHtml] = useState("");
  const [isGeneratingSettlement, setIsGeneratingSettlement] = useState(false);
  const [settlementJustSaved, setSettlementJustSaved] = useState(false);
  const [settlementManuallyClosed, setSettlementManuallyClosed] = useState(false);
  const [settlementTemplate, setSettlementTemplate] = useState("");
  const { permissions } = usePermissions();
  const settlementReceiptRef = useRef(null);

  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const [bulkPaymentProofModalOpen, setBulkPaymentProofModalOpen] = useState(false);
  const [bulkPaymentProofHtml, setBulkPaymentProofHtml] = useState("");
  const [isGeneratingBulkProof, setIsGeneratingBulkProof] = useState(false);

  const handleChangePage = (event, value) => {
    setPage(value);
    setSelectedInstallments([]);
  };

  const handleInstallmentSelect = (installmentId) => {
    setSelectedInstallments(prev =>
      prev.includes(installmentId)
        ? prev.filter(id => id !== installmentId)
        : [...prev, installmentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInstallments.length === sortedInstallments.length) {
      setSelectedInstallments([]);
    } else {
      setSelectedInstallments(sortedInstallments.map(installment => installment.id));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedInstallments.length === 0) {
      notifyError("يرجى اختيار الدفعات المراد اعتمادها");
      return;
    }

    const installmentsToApprove = sortedInstallments.filter(installment =>
      selectedInstallments.includes(installment.id)
    );
    const alreadyPaid = installmentsToApprove.filter(installment => installment.status === 'PAID' || installment.status === 'EARLY_PAID' || installment.status === 'COMPLETED');

    if (alreadyPaid.length > 0) {
      notifyError(`لا يمكن الموافقة على الدفعات التالية لأنها مدفوعة بالفعل: ${alreadyPaid.map(inst => `دفعة ${inst.count}`).join(', ')}`);
      return;
    }

    try {
      const { data: countData } = await Api.get('/api/repayments/next-count');
      const receiptNumber = countData?.toString() || 'غير محدد';

      const defaultEmployeeName = "ربيش سالم ناصر الهمامي";

      const bulkProofHtml = await paymentProofGeneratorRef.current.generateContract(
        false,
        {
          installmentsData: installmentsToApprove,
          loanData,
          clientData: loanData?.client,
          employeeName: defaultEmployeeName,
          receiptNumber: receiptNumber,
        }
      );

      setBulkPaymentProofHtml(bulkProofHtml);
      setBulkPaymentProofModalOpen(true);
    } catch (error) {
      notifyError("حدث خطأ أثناء توليد إيصال السداد المجمع");
      handleApiError(error);
    }
  };

  const handleBulkReject = async () => {
    if (selectedInstallments.length === 0) {
      notifyError("يرجى اختيار الدفعات المراد رفضها");
      return;
    }

    const installmentsToReject = sortedInstallments.filter(installment =>
      selectedInstallments.includes(installment.id)
    );
    const completedInstallments = installmentsToReject.filter(installment => installment.status === 'COMPLETED');

    if (completedInstallments.length > 0) {
      notifyError(`لا يمكن رفض الدفعات التالية لأنها مكتملة: ${completedInstallments.map(inst => `دفعة ${inst.count}`).join(', ')}`);
      return;
    }

    try {
      setIsBulkOperationLoading(true);
      await rejectMultipleRepayments(selectedInstallments);
      notifySuccess(`تم رفض ${selectedInstallments.length} دفعة بنجاح`);
      setSelectedInstallments([]);
      queryClient.invalidateQueries(["loan", loanId]);
      queryClient.invalidateQueries(["repayments", loanId]);
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء رفض الدفعات");
    } finally {
      setIsBulkOperationLoading(false);
    }
  };
  const [selectedDocumentsInstallment, setSelectedDocumentsInstallment] =
    useState(null);

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [reviewStepsVisible, setReviewStepsVisible] = useState(true);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [earlyPaymentModalOpen, setEarlyPaymentModalOpen] = useState(false);
  const [discountAmount, setDiscountAmount] = useState("0");
  const [allInstallmentsForEarlyPayment, setAllInstallmentsForEarlyPayment] = useState(null);
  const [isLoadingAllForEarlyPayment, setIsLoadingAllForEarlyPayment] = useState(false);
  const paymentProofGeneratorRef = useRef(null);

  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;

  useEffect(() => {
    if (loanId) {
      fetchPaymentProofTemplate();
      fetchSettlementTemplate();
    }
  }, [loanId]);

  const fetchPaymentProofTemplate = async () => {
    try {
      const response = await Api.get("/api/templates/PAYMENT_PROOF");
      setPaymentProofTemplate(response.data.content || "");
    } catch (error) {
      console.warn("Could not fetch payment proof template:", error);
    }
  };

  const fetchSettlementTemplate = async () => {
    try {
      const response = await Api.get("/api/templates/SETTLEMENT");
      setSettlementTemplate(response.data.content || "");
    } catch (error) {
      console.warn("Could not fetch settlement template:", error);
    }
  };

  const {
    data: loanData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["loan", loanId, page, limit],
    queryFn: () => getLoanById(loanId, page, limit),
    enabled: !!loanId,
  });

  const totalPages =
    loanData?.pagination?.totalPages
    ?? (loanData?.pagination?.totalRepayments && limit
      ? Math.max(1, Math.ceil(loanData.pagination.totalRepayments / limit))
      : loanData?.repayments?.length && limit
        ? Math.max(1, Math.ceil(loanData.repayments.length / limit))
        : 1);

  const steps = [
    "بإنتظار رفع الإيصال",
    "مراجعة الإيصال المرفوع",
    "إتمام العملية",
  ];

  const installments = Array.isArray(loanData?.repayments)
    ? loanData.repayments
    : [];

  const sortedInstallments = [...installments].sort((a, b) => {
    return a.id - b.id || new Date(a.dueDate) - new Date(b.dueDate);
  });

  const handleRowClick = (installment) => {
    setSelectedInstallment(installment);
    setActiveInstallmentId(installment.id);

    if (installment.status === "PAID") {
      setActiveStep(2);
    } else if (installment.attachments && installment.attachments.length > 0) {
      setActiveStep(1);
    } else {
      setActiveStep(0);
    }
  };

  useEffect(() => {
    const installmentWithDocuments = sortedInstallments.find(
      (inst) =>
        inst.attachments &&
        inst.attachments.length > 0 &&
        inst.status === "PENDING"
    );

    if (installmentWithDocuments && !activeInstallmentId) {
      handleRowClick(installmentWithDocuments);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedInstallments]);

  useEffect(() => {
    setSettlementJustSaved(false);
  }, [loanId]);

  useEffect(() => {
    if (
      sortedInstallments.length > 0 &&
      allInstallmentsPaid() &&
      !isSettlementCompleted() &&
      !settlementModalOpen &&
      settlementTemplate &&
      !settlementJustSaved &&
      !settlementManuallyClosed
    ) {
      handleSettlement();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortedInstallments, settlementTemplate, settlementJustSaved, settlementManuallyClosed]);

  // عند فتح مودال السداد المبكر: جلب كل الدفعات (كل الصفحات) لظهور جميع الدفعات المعلقة
  useEffect(() => {
    if (!earlyPaymentModalOpen || !loanId) return;
    setIsLoadingAllForEarlyPayment(true);
    setAllInstallmentsForEarlyPayment(null);
    fetchAllRepayments()
      .then(({ repayments }) => {
        const sorted = [...(repayments || [])].sort(
          (a, b) => a.id - b.id || new Date(a.dueDate) - new Date(b.dueDate)
        );
        setAllInstallmentsForEarlyPayment(sorted);
      })
      .catch(() => setAllInstallmentsForEarlyPayment([]))
      .finally(() => setIsLoadingAllForEarlyPayment(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchAllRepayments يستخدم loanId و limit من النطاق
  }, [earlyPaymentModalOpen, loanId]);

  const handleApprove = (installment) => {
    setDiscountInstallment(installment);
    setDiscountModalOpen(true);
    setAnchorEl(null);
  };

  const handleDiscountConfirm = async ({ discount, notes }) => {
    try {
      setConfirmedDiscount({ discount, notes });
      setDiscountModalOpen(false);

      // إذا كانت الدفعة مدفوعة جزئياً، استخدم المبلغ المتبقي بدلاً من المبلغ الأصلي
      const installmentAmount = discountInstallment.status === 'PARTIAL_PAID'
        ? discountInstallment.remaining
        : discountInstallment.amount;
      const isFullDiscount = Number(discount) >= Number(installmentAmount);

      // خصم كامل للدفعة: لا يُفتح سند قبض، فقط موافقة وإشعار نجاح (اشعار خصم لدفعة)
      if (isFullDiscount) {
        await approveRepayment(
          discountInstallment.id,
          installmentAmount,
          notes?.trim() || 'اشعار خصم لدفعة',
          discount
        );
        notifySuccess("تم تطبيق خصم على الدفعة بنجاح");
        queryClient.invalidateQueries(["loan", loanId]);
        queryClient.invalidateQueries(["repayments", loanId]);
        queryClient.invalidateQueries(["repayment", discountInstallment.id]);
        setDiscountInstallment(null);
        setConfirmedDiscount({ discount: 0, notes: '' });
        return;
      }

      const installmentDataForProof = {
        ...discountInstallment,
        amount: installmentAmount
      };

      setSelectedProofInstallment(installmentDataForProof);

      const { data: countData } = await Api.get('/api/repayments/next-count');
      const receiptNumber = countData?.toString() || 'غير محدد';

      const defaultEmployeeName = "ربيش سالم ناصر الهمامي";

      const proofHtml = await paymentProofGeneratorRef.current.generateContract(
        false,
        {
          installmentData: installmentDataForProof,
          loanData,
          clientData: loanData?.client,
          employeeName: defaultEmployeeName,
          discount: discount,
          receiptNumber: receiptNumber,
        }
      );

      setPaymentProofHtml(proofHtml);
      setPaymentProofModalOpen(true);
    } catch (error) {
      notifyError("حدث خطأ أثناء توليد إيصال السداد");
      handleApiError(error);
    }
  };

  const handleSavePaymentProof = async () => {
    try {
      setIsGeneratingProof(true);

      const { data: countData } = await Api.get('/api/repayments/next-count');
      const receiptNumber = countData?.toString() || 'غير محدد';

      const defaultEmployeeName = "ربيش سالم ناصر الهمامي";

      const finalProofHtml =
        await paymentProofGeneratorRef.current.generateContract(false, {
          installmentData: selectedProofInstallment,
          loanData,
          clientData: loanData?.client,
          employeeName: defaultEmployeeName,
          discount: confirmedDiscount.discount,
          receiptNumber: receiptNumber,
        }, true);

      await paymentProofGeneratorRef.current.generatePDF(finalProofHtml);

      notifySuccess("تم حفظ إيصال السداد بنجاح");

      // استخدم المبلغ من selectedProofInstallment الذي تم تعديله في handleDiscountConfirm
      await approveRepayment(
        selectedProofInstallment.id,
        selectedProofInstallment.amount,
        confirmedDiscount.notes || "تمت الموافقة على السداد",
        confirmedDiscount.discount
      );

      setPaymentProofModalOpen(false);
      setSelectedProofInstallment(null);
      setActiveStep(2);

      setTimeout(() => {
        setActiveStep(0);
        setSelectedInstallment(null);
        setActiveInstallmentId(null);
      }, 2000);

      setTimeout(() => {
        queryClient.invalidateQueries(["loan", loanId]);
        queryClient.invalidateQueries(["repayments", loanId]);
        queryClient.invalidateQueries(["repayment", selectedProofInstallment.id]);
      }, 400);
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء حفظ الإيصال");
    } finally {
      setIsGeneratingProof(false);
    }
  };

  const handleSaveBulkPaymentProof = async () => {
    try {
      setIsGeneratingBulkProof(true);

      const { data: countData } = await Api.get('/api/repayments/next-count');
      const receiptNumber = countData?.toString() || 'غير محدد';

      const installmentsToApprove = sortedInstallments.filter(installment =>
        selectedInstallments.includes(installment.id)
      );

      const defaultEmployeeName = "ربيش سالم ناصر الهمامي";

      const finalBulkProofHtml =
        await paymentProofGeneratorRef.current.generateContract(false, {
          installmentsData: installmentsToApprove,
          loanData,
          clientData: loanData?.client,
          employeeName: defaultEmployeeName,
          receiptNumber: receiptNumber,
        }, true);

      await paymentProofGeneratorRef.current.generatePDF(
        finalBulkProofHtml,
        true,
        selectedInstallments
      );

      notifySuccess("تم حفظ إيصال السداد المجمع بنجاح");

      await approveMultipleRepayments(selectedInstallments, null, "تمت الموافقة على الدفعات المجمعة");

      setBulkPaymentProofModalOpen(false);
      setSelectedInstallments([]);

      queryClient.invalidateQueries(["loan", loanId]);
      queryClient.invalidateQueries(["repayments", loanId]);
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء حفظ الإيصال المجمع");
    } finally {
      setIsGeneratingBulkProof(false);
    }
  };

  const handleReject = (installment) => {
    setSelectedActionInstallment(installment);
    setRejectModalOpen(true);
    setAnchorEl(null);
  };

  const handleConfirmReject = async () => {
    try {
      setRejectLoading(true);
      await rejectRepayment(selectedActionInstallment.id, "تم رفض الإيصال");
      notifySuccess("تم رفض السداد");
      queryClient.invalidateQueries(["loan", loanId]);
      queryClient.invalidateQueries(["repayments", loanId]);
      setActiveStep(0);
      setRejectModalOpen(false);
      setSelectedActionInstallment(null);
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء رفض السداد");
    } finally {
      setRejectLoading(false);
    }
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
      notifyError("المبلغ المدفوع لا يمكن أن يكون أكبر من قيمة الدفعة");
      return;
    }

    try {
      const { data: countData } = await Api.get('/api/repayments/next-count');
      const receiptNumber = countData?.toString() || 'غير محدد';

      const defaultEmployeeName = "ربيش سالم ناصر الهمامي";

      const partialInstallmentData = {
        ...selectedActionInstallment,
        amount: paidAmountNum,
        isPartialPayment: true
      };

      setPartialPaymentInstallment({
        ...partialInstallmentData,
        paidAmountNum: paidAmountNum,
        receiptNumber: receiptNumber
      });

      // توليد HTML للمعاينة
      const proofHtml = await paymentProofGeneratorRef.current.generateContract(
        false,
        {
          installmentData: partialInstallmentData,
          loanData,
          clientData: loanData?.client,
          employeeName: defaultEmployeeName,
          discount: 0,
          receiptNumber: receiptNumber,
        }
      );

      setPartialPaymentProofHtml(proofHtml);
      setPartialPaymentModalOpen(false);
      setPartialPaymentProofModalOpen(true);
    } catch (error) {
      console.error("Partial payment error:", error);
      notifyError(
        error.message || error.response?.data?.message || "حدث خطأ أثناء توليد سند الدفع الجزئي"
      );
    }
    setAnchorEl(null);
  };

  const handleSavePartialPaymentProof = async () => {
    try {
      setIsGeneratingPartialProof(true);

      // إنشاء PDF من HTML
      const html2pdf = (await import('html2pdf.js')).default;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = partialPaymentProofHtml;

      const contractWrapper = tempDiv.querySelector('.contract-wrapper');
      const cleanedContent = contractWrapper ? contractWrapper.outerHTML : partialPaymentProofHtml;

      const filename = `payment_proof_partial_${partialPaymentInstallment.id}_${Date.now()}.pdf`;

      const options = {
        margin: 0,
        filename: filename,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          scrollX: 0,
          scrollY: 0,
          windowWidth: 794,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true,
        }
      };

      const tempElement = document.createElement('div');
      tempElement.style.width = '794px';
      tempElement.style.backgroundColor = 'white';
      tempElement.style.margin = '0 auto';
      tempElement.style.padding = '0';
      tempElement.innerHTML = cleanedContent;

      document.body.appendChild(tempElement);

      await new Promise(resolve => setTimeout(resolve, 500));

      const pdfBlob = await html2pdf()
        .from(tempElement)
        .set(options)
        .outputPdf('blob');

      document.body.removeChild(tempElement);

      // رفع PDF إلى السيرفر
      const formData = new FormData();
      const pdfFilename = `إيصال_سداد_جزئي_الدفعة_${partialPaymentInstallment.id}_${Date.now()}.pdf`;
      formData.append('file', pdfBlob, pdfFilename);

      await Api.post(`/api/repayments/PaymentProof/${partialPaymentInstallment.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // تسجيل الدفع الجزئي
      await markAsPartialPaid(
        partialPaymentInstallment.id,
        partialPaymentInstallment.paidAmountNum
      );

      notifySuccess("تم حفظ سند الدفع الجزئي بنجاح");

      setPartialPaymentProofModalOpen(false);
      setPartialPaymentInstallment(null);
      setPaidAmount("");

      queryClient.invalidateQueries(["loan", loanId]);
      queryClient.invalidateQueries(["repayments", loanId]);
    } catch (error) {
      console.error("Partial payment proof error:", error);
      notifyError(
        error.message || error.response?.data?.message || "حدث خطأ أثناء حفظ سند الدفع الجزئي"
      );
    } finally {
      setIsGeneratingPartialProof(false);
    }
  };

  const handlePostpone = async () => {
    if (!selectedActionInstallment || !newDueDate) {
      notifyError("يرجى إدخال تاريخ الاستحقاق الجديد");
      return;
    }

    try {
      await postponeRepayment(
        selectedActionInstallment.id,
        newDueDate,
        postponeReason
      );
      notifySuccess("تم تأجيل الدفعة بنجاح");
      queryClient.invalidateQueries(["loan", loanId]);
      queryClient.invalidateQueries(["repayments", loanId]);
      setPostponeModalOpen(false);
      setNewDueDate("");
      setPostponeReason("");
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء تأجيل الدفعة");
    }
    setAnchorEl(null);
  };

  const handleEarlyPayment = async () => {
    try {
      const discount = parseFloat(discountAmount) || 0;

      if (discount < 0) {
        notifyError("قيمة الخصم لا يمكن أن تكون سالبة");
        return;
      }

      const installmentsForEarly = allInstallmentsForEarlyPayment ?? sortedInstallments;
      const pendingInstallments = installmentsForEarly.filter(
        (inst) => inst.status === "PENDING"
      );

      if (pendingInstallments.length === 0) {
        notifyError("لا توجد دفعات معلقة للسداد المبكر");
        setEarlyPaymentModalOpen(false);
        return;
      }

      await earlyPayment(loanId, discount);

      notifySuccess("تم السداد المبكر للدفعات المعلقة بنجاح");

      setEarlyPaymentModalOpen(false);
      setDiscountAmount("0");

      queryClient.invalidateQueries(["loan", loanId]);
      queryClient.invalidateQueries(["repayments", loanId]);
    } catch (error) {
      notifyError(
        error.response?.data?.message || "حدث خطأ أثناء السداد المبكر"
      );
    }
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

  const allInstallmentsPaid = () => {
    const totalRepayments = loanData?.pagination?.totalRepayments || 0;
    const paidRepayments = loanData?.pagination?.paidRepayments || 0;

    if (totalRepayments > 0) {
      return paidRepayments === totalRepayments;
    }

    return sortedInstallments.every(
      (installment) => installment.status === "PAID" || installment.status === "EARLY_PAID"
    );
  };

  const isSettlementCompleted = () => {
    return loanData?.SETTLEMENT !== null && loanData?.SETTLEMENT !== undefined;
  };
  const hasEarlyPayment = () => {
    return sortedInstallments.some(
      (installment) =>
        installment.status === "PENDING" && installment.status === "EARLY_PAID"
    );
  };
  const shouldDisableActions = () => {
    return isSettlementCompleted() || hasEarlyPayment();
  };

  const handleSettlement = async () => {
    try {
      setIsGeneratingSettlement(true);

      // جلب كل الدفعات لضمان احتساب إجمالي الخصومات بشكل صحيح (التصفح قد يعرض صفحة واحدة فقط)
      const { repayments: allRepayments } = await fetchAllRepayments();
      const installmentsForSettlement = (allRepayments && allRepayments.length > 0)
        ? [...allRepayments].sort((a, b) => a.id - b.id || new Date(a.dueDate) - new Date(b.dueDate))
        : sortedInstallments;

      const lastInstallment = installmentsForSettlement[installmentsForSettlement.length - 1];

      const defaultEmployeeName = "ربيش سالم ناصر الهمامي";

      const totalContractAmount = Number(loanData?.totalAmount) ||
        (Number(loanData?.amount) || 0) + (Number(loanData?.interestAmount) || 0);
      const totalDiscounts = installmentsForSettlement.reduce(
        (sum, inst) => sum + (Number(inst.discount) || 0),
        0
      );
      const earlyPaymentDiscount = Number(loanData?.earlyPaymentDiscount || 0);
      const effectiveTotalDiscounts = totalDiscounts > 0 ? totalDiscounts : earlyPaymentDiscount;
      const calculatedSettlementAmount = Math.max(0, totalContractAmount - effectiveTotalDiscounts);

      const settlementHtml =
        await settlementReceiptRef.current.generateContract(false, {
          installmentData: lastInstallment,
          loanData: {
            ...loanData,
            calculatedSettlementAmount,
            allInstallments: installmentsForSettlement,
            earlyPaymentDiscount: loanData?.earlyPaymentDiscount,
          },
          clientData: loanData?.client,
          employeeName: defaultEmployeeName,
        });

      setSettlementHtml(settlementHtml);
      setSettlementModalOpen(true);
      setSettlementManuallyClosed(false);

      setIsGeneratingSettlement(false);
    } catch (error) {
      handleApiError(error);
      notifyError("حدث خطأ أثناء توليد سند التسوية");
      setIsGeneratingSettlement(false);
    }
  };

  const handleSaveSettlement = async () => {
    try {
      setIsGeneratingSettlement(true);

      const { repayments: allRepayments } = await fetchAllRepayments();
      const installmentsForSettlement = (allRepayments && allRepayments.length > 0)
        ? [...allRepayments].sort((a, b) => a.id - b.id || new Date(a.dueDate) - new Date(b.dueDate))
        : sortedInstallments;

      const lastInstallment = installmentsForSettlement[installmentsForSettlement.length - 1];
      const defaultEmployeeName = "ربيش سالم ناصر الهمامي";

      const totalContractAmount = Number(loanData?.totalAmount) ||
        (Number(loanData?.amount) || 0) + (Number(loanData?.interestAmount) || 0);
      const totalDiscounts = installmentsForSettlement.reduce(
        (sum, inst) => sum + (Number(inst.discount) || 0),
        0
      );
      const earlyPaymentDiscount = Number(loanData?.earlyPaymentDiscount || 0);
      const effectiveTotalDiscounts = totalDiscounts > 0 ? totalDiscounts : earlyPaymentDiscount;
      const calculatedSettlementAmount = Math.max(0, totalContractAmount - effectiveTotalDiscounts);

      const finalSettlementHtml =
        await settlementReceiptRef.current.generateContract(false, {
          installmentData: lastInstallment,
          loanData: {
            ...loanData,
            calculatedSettlementAmount,
            allInstallments: installmentsForSettlement,
            earlyPaymentDiscount: loanData?.earlyPaymentDiscount,
          },
          clientData: loanData?.client,
          employeeName: defaultEmployeeName,
        }, true);

      await settlementReceiptRef.current.generatePDF(finalSettlementHtml);

      notifySuccess("تم حفظ سند التسوية بنجاح");


      setSettlementModalOpen(false);

      setSettlementJustSaved(true);

      setTimeout(() => {
        notifySuccess("تم تسوية الدفعة النهائي وإغلاقه بنجاح");
      }, 300);

      queryClient.invalidateQueries(["loan", loanId]);

      setTimeout(() => {
        setSettlementJustSaved(false);
      }, 2000);

      return true;
    } catch (error) {
      handleApiError(error);
      notifyError(error.response?.data?.message || "حدث خطأ أثناء حفظ السند");
      return false;
    } finally {
      setIsGeneratingSettlement(false);
    }
  };

  const fetchAllRepayments = async () => {
    const allRepayments = [];
    let currentPage = 1;
    let hasMorePages = true;
    let loanInfo = null;

    while (hasMorePages) {
      const pageData = await getLoanById(loanId, currentPage, limit);

      if (currentPage === 1) {
        loanInfo = pageData;
      }

      if (Array.isArray(pageData?.repayments) && pageData.repayments.length > 0) {
        allRepayments.push(...pageData.repayments);

        const totalPages = pageData?.pagination?.totalPages ||
          (pageData?.pagination?.totalRepayments && limit
            ? Math.ceil(pageData.pagination.totalRepayments / limit)
            : 1);

        hasMorePages = currentPage < totalPages;
        currentPage++;
      } else {
        hasMorePages = false;
      }
    }

    return {
      repayments: allRepayments,
      loanData: loanInfo || loanData
    };
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      notifySuccess("جاري جلب جميع البيانات...");

      const { repayments: allRepayments, loanData: allLoanData } = await fetchAllRepayments();

      const sortedAllRepayments = [...allRepayments].sort((a, b) => {
        return a.id - b.id || new Date(a.dueDate) - new Date(b.dueDate);
      });

      await exportRepaymentsToPDF(sortedAllRepayments, allLoanData);
      notifySuccess("تم تصدير تقرير PDF بنجاح");
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير PDF");
      console.error("PDF export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      notifySuccess("جاري جلب جميع البيانات...");

      const { repayments: allRepayments, loanData: allLoanData } = await fetchAllRepayments();

      const sortedAllRepayments = [...allRepayments].sort((a, b) => {
        return a.id - b.id || new Date(a.dueDate) - new Date(b.dueDate);
      });

      await exportRepaymentsToExcel(sortedAllRepayments, allLoanData);
      notifySuccess("تم تصدير تقرير Excel بنجاح");
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير Excel");
      console.error("Excel export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusColor = (status, installment) => {
    if (checkIfOverdue(installment)) {
      return "error";
    }

    const effectiveStatus =
      status === "PENDING" &&
        installment.attachments &&
        installment.attachments.length > 0
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
      case "EARLY_PAID":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusText = (status, installment) => {
    if (checkIfOverdue(installment)) {
      return "متأخر";
    }

    const effectiveStatus =
      status === "PENDING" &&
        installment.attachments &&
        installment.attachments.length > 0
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
      case "EARLY_PAID":
        return "مدفوع مبكراً";
      default:
        return status;
    }
  };

  const extractFileName = (url) => {
    if (!url) return "ملف غير معروف";

    if (Array.isArray(url)) {
      if (url.length === 0) return "ملف غير معروف";
      url = url[0];
    }

    const parts = url.split("/");
    const encodedFileName = parts[parts.length - 1] || "ملف غير معروف";

    try {
      return decodeURIComponent(encodedFileName);
    } catch {
      return encodedFileName;
    }
  };

  const hasPendingDocuments = (installment) => {
    return (
      installment.attachments &&
      installment.attachments.length > 0 &&
      installment.status === "PENDING"
    );
  };

  const hasFiles = (installment) => {
    return (
      (installment.attachments && installment.attachments.length > 0) ||
      installment.PaymentProof
    );
  };

  const renderMobileInstallmentCards = () => {
    const paidCount = sortedInstallments.filter(
      (inst) => inst.status === "PAID" || inst.status === "EARLY_PAID"
    ).length;
    const totalAmount = sortedInstallments.reduce(
      (sum, inst) => sum + (inst.amount || 0),
      0
    );
    const totalPaid = sortedInstallments.reduce(
      (sum, inst) => sum + (inst.paidAmount || 0),
      0
    );
    const totalRemaining = sortedInstallments.reduce(
      (sum, inst) => sum + (inst.remaining || 0),
      0
    );

    return (
      <Box sx={{ p: 1 }}>
        {/* Select All for Mobile */}
        {permissions.includes("repayments_Post") && !isSettlementCompleted() && sortedInstallments.length > 0 && (
          <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Checkbox
              checked={selectedInstallments.length === sortedInstallments.length && sortedInstallments.length > 0}
              indeterminate={selectedInstallments.length > 0 && selectedInstallments.length < sortedInstallments.length}
              onChange={handleSelectAll}
              size="small"
            />
            <Typography variant="body2" color="text.secondary">
              اختيار الكل
            </Typography>
          </Box>
        )}
        <Stack spacing={2}>
          {sortedInstallments.map((installment) => (
            <Card
              key={installment.id}
              variant="outlined"
              sx={{
                borderRadius: 2,
                border:
                  hasPendingDocuments(installment)
                    ? "2px solid"
                    : "1px solid",
                borderColor: hasPendingDocuments(installment)
                  ? "primary.main"
                  : "divider",
                borderLeft: hasPendingDocuments(installment)
                  ? "4px solid"
                  : "none",
                borderLeftColor: hasPendingDocuments(installment)
                  ? "primary.main"
                  : "transparent",
                backgroundColor:
                  activeInstallmentId === installment.id
                    ? "action.selected"
                    : hasPendingDocuments(installment)
                      ? "action.selected"
                      : "inherit",
                cursor: "pointer",
                "&:hover": {
                  backgroundColor:
                    activeInstallmentId === installment.id
                      ? "action.hover"
                      : hasPendingDocuments(installment)
                        ? "action.selected"
                        : "background.default",
                },
              }}
              onClick={() => handleRowClick(installment)}
            >
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={1.5}>
                  {/* Header */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {permissions.includes("repayments_Post") && !isSettlementCompleted() && (
                        <Checkbox
                          checked={selectedInstallments.includes(installment.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleInstallmentSelect(installment.id);
                          }}
                          size="small"
                          disabled={installment.status === "COMPLETED"}
                        />
                      )}
                      {(installment.status === "PAID" ||
                        installment.status === "EARLY_PAID") && (
                          <Checkbox checked size="small" />
                        )}
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 500 }} color="primary">
                          دفعة #{installment.count}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dayjs(installment.dueDate).format("DD/MM/YYYY")}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        gap: 0.5,
                      }}
                    >
                      <Chip
                        label={getStatusText(installment.status, installment)}
                        color={getStatusColor(
                          installment.status,
                          installment
                        )}
                        size="small"
                        sx={{ fontWeight: "500" }}
                      />
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMenuOpen(e, installment);
                        }}
                        disabled={shouldDisableActions(installment)}
                        sx={{
                          opacity: shouldDisableActions(installment) ? 0.5 : 1,
                          cursor: shouldDisableActions(installment)
                            ? "not-allowed"
                            : "pointer",
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Installment Details */}
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" color="text.secondary">
                        قيمة الدفعة
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {installment.amount?.toFixed(2)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" color="text.secondary">
                        المبلغ الأصلي
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {installment.principalAmount?.toFixed(2) || "0.00"}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" color="text.secondary">
                        الفائدة
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ fontWeight: 500, color: "primary.main" }}
                      >
                        {installment.interestAmount?.toFixed(2) || "0.00"}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" color="text.secondary">
                        المبلغ المدفوع
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, color: installment.paidAmount > 0 ? "green" : "red" }}
                      >
                        {installment.paidAmount > 0
                          ? `${installment.paidAmount.toFixed(2)}`
                          : "0.00"}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" color="text.secondary">
                        مبلغ الخصم
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, color: (installment.discount || 0) > 0 ? "warning.main" : "text.secondary" }}
                      >
                        {(installment.discount || 0) > 0
                          ? `${installment.discount.toFixed(2)}`
                          : "0.00"}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="caption" color="text.secondary">
                        الرصيد المتبقي
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, color: installment.remaining === 0 ? "text.primary" : "error.main" }}
                      >
                        {installment.remaining?.toFixed(2) || "0.00"}
                      </Typography>
                    </Box>

                    {installment.paymentDate && (
                      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                        <Typography variant="caption" color="text.secondary">
                          تاريخ الدفع
                        </Typography>
                        <Typography variant="body2">
                          {dayjs(installment.paymentDate).format("DD/MM/YYYY")}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          ))}

          {/* Summary Card */}
          <Card
            variant="outlined"
            sx={{
              borderRadius: 2,
              backgroundColor: "background.paper",
              border: "2px solid",
              borderColor: "divider",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 500 }} mb={1.5}>
                الإجمالي
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color="text.secondary">
                    الدفعات المدفوعة
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {paidCount}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color="text.secondary">
                    إجمالي الدفعات
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {totalAmount.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color="text.secondary">
                    إجمالي المدفوع
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: "green" }}
                  >
                    {totalPaid.toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color="text.secondary">
                    إجمالي الخصم
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: "warning.main" }}
                  >
                    {sortedInstallments
                      .reduce((sum, inst) => sum + (inst.discount || 0), 0)
                      .toFixed(2)}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="caption" color="text.secondary">
                    إجمالي المتبقي
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, color: "red" }}
                  >
                    {totalRemaining.toFixed(2)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Stack>
      </Box>
    );
  };

 const renderDesktopTable = () => (
  <ScrollableTableContainer>
    <Table stickyHeader size="small">
      <TableHead>
        <StyledTableRow>
          {permissions.includes("repayments_Post") && !isSettlementCompleted() && (
            <StyledTableCell 
              align="center" 
              sx={{ 
                whiteSpace: "nowrap", 
                width: "40px",
                px: 0.5,
                py: 1
              }}
            >
              <Checkbox
                checked={selectedInstallments.length === sortedInstallments.length && sortedInstallments.length > 0}
                indeterminate={selectedInstallments.length > 0 && selectedInstallments.length < sortedInstallments.length}
                onChange={handleSelectAll}
                size="small"
                sx={{ 
                  color: 'white', 
                  '&.Mui-checked': { color: 'white' },
                  padding: 0 
                }}
              />
            </StyledTableCell>
          )}
          <StyledTableCell align="center" sx={{ width: "50px", px: 0.5, py: 1 }}>
            ✓
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ width: "60px", px: 0.5, py: 1 }}>
            #رقم
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ width: "90px", px: 0.5, py: 1 }}>
            تاريخ الاستحقاق
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ width: "80px", px: 0.5, py: 1 }}>
            الدفعة
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ width: "80px", px: 0.5, py: 1 }}>
            الأصل
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ width: "70px", px: 0.5, py: 1 }}>
            الفائدة
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ width: "80px", px: 0.5, py: 1 }}>
            المدفوع
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ width: "70px", px: 0.5, py: 1 }}>
            الخصم
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ width: "80px", px: 0.5, py: 1 }}>
            المتبقي
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ width: "70px", px: 0.5, py: 1 }}>
            الحالة
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ width: "90px", px: 0.5, py: 1 }}>
            تاريخ الدفع
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ width: "60px", px: 0.5, py: 1 }}>
            الإجراءات
          </StyledTableCell>
        </StyledTableRow>
      </TableHead>
      <TableBody>
        {sortedInstallments.map((installment) => (
          <StyledTableRow
            key={installment.id}
            hover
            onClick={() => handleRowClick(installment)}
            sx={{
              cursor: "pointer",
              fontSize: "13px",
              border: hasPendingDocuments(installment)
                ? "2px solid"
                : "none",
              borderColor: hasPendingDocuments(installment)
                ? "primary.main"
                : "transparent",
              borderLeft: hasPendingDocuments(installment)
                ? "4px solid"
                : "none",
              borderLeftColor: hasPendingDocuments(installment)
                ? "primary.main"
                : "transparent",
              backgroundColor:
                activeInstallmentId === installment.id
                  ? "action.selected"
                  : hasPendingDocuments(installment)
                    ? "action.selected"
                    : "inherit",
              "&:hover": {
                backgroundColor:
                  activeInstallmentId === installment.id
                    ? "action.hover"
                    : hasPendingDocuments(installment)
                      ? "action.selected"
                      : "background.default",
              },
            }}
          >
            {permissions.includes("repayments_Post") && !isSettlementCompleted() && (
              <StyledTableCell align="center" sx={{ px: 0.5, py: 1 }}>
                <Checkbox
                  checked={selectedInstallments.includes(installment.id)}
                  onChange={() => handleInstallmentSelect(installment.id)}
                  size="small"
                  disabled={installment.status === "COMPLETED"}
                  sx={{ padding: 0 }}
                />
              </StyledTableCell>
            )}
            <StyledTableCell align="center" sx={{ px: 0.5, py: 1 }}>
              {(installment.status === "PAID" ||
                installment.status === "EARLY_PAID") && (
                  <Checkbox checked size="small" sx={{ padding: 0 }} />
                )}
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ px: 0.5, py: 1 }}>
              {installment.count}
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ px: 0.5, py: 1 }}>
              <Box sx={{ lineHeight: 1.2 }}>
                <Typography variant="body2" sx={{ fontSize: "13px", fontWeight: 500 }}>
                  {dayjs(installment.dueDate).format("DD/MM/YYYY")}
                </Typography>
                {installment.dueDateHijri && (
                  <Typography variant="caption" sx={{ fontSize: "11px", color: "text.secondary" }}>
                    {installment.dueDateHijri}
                  </Typography>
                )}
              </Box>
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ px: 0.5, py: 1, fontWeight: 500, fontSize: "13px" }}>
              {installment.amount?.toFixed(2)}
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ px: 0.5, py: 1, fontWeight: 500, fontSize: "13px" }}>
              {installment.principalAmount?.toFixed(2) || "0.00"}
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ px: 0.5, py: 1, color: "primary.main", fontWeight: 500, fontSize: "13px" }}>
              {installment.interestAmount?.toFixed(2) || "0.00"}
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ 
              px: 0.5, 
              py: 1, 
              color: installment.paidAmount > 0 ? "green" : "red",
              fontWeight: 500,
              fontSize: "13px"
            }}>
              {installment.paidAmount > 0
                ? `${installment.paidAmount.toFixed(2)}`
                : "0.00"}
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ 
              px: 0.5, 
              py: 1,
              color: (installment.discount || 0) > 0 ? "warning.main" : "text.secondary",
              fontWeight: 500,
              fontSize: "13px"
            }}>
              {(installment.discount || 0) > 0
                ? `${installment.discount.toFixed(2)}`
                : "0.00"}
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ 
              px: 0.5, 
              py: 1,
              color: installment.remaining === 0 ? "text.primary" : "error.main",
              fontWeight: 500,
              fontSize: "13px"
            }}>
              {installment.remaining?.toFixed(2) || "0.00"}
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ px: 0.5, py: 1 }}>
              <Chip
                label={getStatusText(installment.status, installment)}
                color={getStatusColor(installment.status, installment)}
                size="small"
                sx={{ fontSize: "11px", height: "24px" }}
              />
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ px: 0.5, py: 1 }}>
              <Box sx={{ lineHeight: 1.2 }}>
                <Typography variant="body2" sx={{ fontSize: "13px", fontWeight: 500 }}>
                  {installment.paymentDate
                    ? dayjs(installment.paymentDate).format("DD/MM/YYYY")
                    : "لم يأتي بعد"}
                </Typography>
                {installment.paymentDateHijri && (
                  <Typography variant="caption" sx={{ fontSize: "11px", color: "text.secondary" }}>
                    {installment.paymentDateHijri}
                  </Typography>
                )}
              </Box>
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ px: 0.5, py: 1 }}>
              <IconButton
                size="small"
                onClick={(e) => handleMenuOpen(e, installment)}
                disabled={shouldDisableActions(installment)}
                sx={{
                  padding: 0.5,
                  opacity: shouldDisableActions(installment) ? 0.5 : 1,
                  cursor: shouldDisableActions(installment) ? "not-allowed" : "pointer",
                }}
              >
                <MoreVertIcon sx={{ fontSize: "18px" }} />
              </IconButton>
            </StyledTableCell>
          </StyledTableRow>
        ))}
        {/* صف الإجمالي */}
        {(() => {
          const paidCount = sortedInstallments.filter(
            (inst) =>
              inst.status === "PAID" || inst.status === "EARLY_PAID"
          ).length;
          const totalAmount = sortedInstallments.reduce(
            (sum, inst) => sum + (inst.amount || 0),
            0
          );
          const totalPaid = sortedInstallments.reduce(
            (sum, inst) => sum + (inst.paidAmount || 0),
            0
          );
          const totalRemaining = sortedInstallments.reduce(
            (sum, inst) => sum + (inst.remaining || 0),
            0
          );

          return (
            <StyledTableRow
              sx={{
                backgroundColor: "background.paper",
                fontSize: "13px",
                "& td": {
                  fontWeight: 500,
                  fontSize: "13px",
                  borderTop: "2px solid",
                  borderTopColor: "divider",
                  px: 0.5,
                  py: 1
                },
              }}
            >
              {permissions.includes("repayments_Post") && !isSettlementCompleted() && (
                <StyledTableCell align="center" sx={{ width: "40px" }}></StyledTableCell>
              )}
              <StyledTableCell align="center" sx={{ width: "50px" }}>
                {paidCount > 0 && (
                  <Typography variant="body2" sx={{ fontSize: "13px", fontWeight: 500 }}>
                    {paidCount}
                  </Typography>
                )}
              </StyledTableCell>
              <StyledTableCell align="center">
                <Typography variant="body2" sx={{ fontSize: "13px", fontWeight: 500 }}>
                  الإجمالي
                </Typography>
              </StyledTableCell>
              <StyledTableCell align="center">-</StyledTableCell>
              <StyledTableCell align="center">
                <Typography variant="body2" sx={{ fontSize: "13px", fontWeight: 500 }}>
                  {totalAmount.toFixed(2)}
                </Typography>
              </StyledTableCell>
              <StyledTableCell align="center">
                <Typography variant="body2" sx={{ fontSize: "13px", fontWeight: 500 }}>
                  {sortedInstallments
                    .reduce((sum, inst) => sum + (inst.principalAmount || 0), 0)
                    .toFixed(2)}
                </Typography>
              </StyledTableCell>
              <StyledTableCell align="center">
                <Typography variant="body2" sx={{ fontSize: "13px", fontWeight: 500, color: "primary.main" }}>
                  {sortedInstallments
                    .reduce((sum, inst) => sum + (inst.interestAmount || 0), 0)
                    .toFixed(2)}
                </Typography>
              </StyledTableCell>
              <StyledTableCell
                align="center"
                sx={{
                  color: "green",
                  fontWeight: 500,
                  fontSize: "13px"
                }}
              >
                {totalPaid.toFixed(2)}
              </StyledTableCell>
              <StyledTableCell align="center">
                <Typography variant="body2" sx={{ fontSize: "13px", fontWeight: 500, color: "warning.main" }}>
                  {sortedInstallments
                    .reduce((sum, inst) => sum + (inst.discount || 0), 0)
                    .toFixed(2)}
                </Typography>
              </StyledTableCell>
              <StyledTableCell
                align="center"
                sx={{
                  color: "red",
                  fontWeight: 500,
                  fontSize: "13px"
                }}
              >
                {totalRemaining.toFixed(2)}
              </StyledTableCell>
              <StyledTableCell align="center">-</StyledTableCell>
              <StyledTableCell align="center">-</StyledTableCell>
              <StyledTableCell align="center">-</StyledTableCell>
            </StyledTableRow>
          );
        })()}
      </TableBody>
    </Table>
  </ScrollableTableContainer>
);

  if (!loanId) {
    return (
      <Box
        sx={{
          bgcolor: "background.default",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
        }}
      >
        <Paper
          sx={{ p: 6, textAlign: "center", maxWidth: 500, borderRadius: 3 }}
        >
          <Typography
            variant="h4"
            fontWeight="bold"
            color="primary"
            gutterBottom
          >
            اختر دفعة
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            يرجى اختيار دفعة لعرض الإحصائيات والتفاصيل
          </Typography>

          <Button
            variant="contained"
            size="large"
            onClick={() => (window.location.href = "/loans")}
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
              borderRadius: 2,
              px: 4,
              py: 1.5,
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
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        حدث خطأ في تحميل بيانات الدفعات
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Helmet>
        <title> دفعات السلفه</title>
        <meta name="description" content="دفعات السلفه" />
      </Helmet>
      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          flex: 1,
          height: isSmallScreen ? "auto" : "calc(100vh - 80px)",
          width: "100%",
        }}
      >
        <Box
          sx={{
            flex: 1,
            p: isSmallScreen ? 2 : 4,
            bgcolor: "background.paper",
            overflowY: "auto",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<ArrowBackIcon sx={{ marginLeft: '8px' }} />}
                onClick={() => navigate('/loans')}
                sx={{
                  color: "primary.main",
                  "&:hover": { color: "primary.dark" },
                }}
              >
                رجوع لجدول السلف
              </Button>
              <Typography variant="h6" fontWeight="bold">
                دفعات السلفة - {loanData?.client?.name}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {!isSettlementCompleted() && (
                <IconButton
                  onClick={() => setReviewStepsVisible(!reviewStepsVisible)}
                  sx={{
                    color: "primary.main",
                    "&:hover": {
                      bgcolor: "action.selected",
                      color: "primary.dark"
                    },
                  }}
                  title={reviewStepsVisible ? "إخفاء خطوات المراجعة" : "إظهار خطوات المراجعة"}
                >
                  {reviewStepsVisible ? <CloseIcon /> : <ArrowRightIcon />}
                </IconButton>
              )}
            </Box>
          </Box>

          {/* أزرار التصدير والسداد المبكر */}
          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<PDFIcon sx={{ marginLeft: "8px" }} />}
              onClick={handleExportPDF}
              disabled={isExporting}
              sx={{
                bgcolor: "#d32f2f",
                "&:hover": { bgcolor: "#b71c1c" },
                height: "36px",
                fontSize: "14px",
                fontWeight: "bold",
                minWidth: "150px",
                borderRadius: 2,
              }}
            >
              تصدير PDF
              {isExporting && (
                <CircularProgress
                  size={14}
                  color="inherit"
                  style={{ marginRight: 8 }}
                />
              )}
            </Button>
            <Button
              variant="outlined"
              startIcon={<ExcelIcon sx={{ marginLeft: "8px" }} />}
              onClick={handleExportExcel}
              disabled={isExporting}
              sx={{
                borderColor: "success.main",
                color: "success.main",
                "&:hover": {
                  bgcolor: "success.50",
                  borderColor: "success.dark",
                },
                height: "36px",
                fontSize: "14px",
                fontWeight: "bold",
                minWidth: "150px",
                borderRadius: 2,
              }}
            >
              تصدير Excel
              {isExporting && (
                <CircularProgress
                  size={14}
                  color="inherit"
                  style={{ marginRight: 8 }}
                />
              )}
            </Button>
            {!isSettlementCompleted() &&
              sortedInstallments.some((inst) => inst.status === "PENDING") &&
              permissions.includes("repayments_Post") && (
                <Button
                  variant="contained"
                  onClick={() => setEarlyPaymentModalOpen(true)}
                  sx={{
                    bgcolor: "success.main",
                    "&:hover": { bgcolor: "success.dark" },
                    height: "36px",
                    fontSize: "14px",
                    fontWeight: "bold",
                    minWidth: "150px",
                    borderRadius: 2,
                  }}
                >
                  سداد مبكر
                </Button>
              )}
          </Box>

          <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            {/* الصف الأول - معلومات السلفة الأساسية */}
            <Grid container spacing={2} justifyContent="center" sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4} textAlign="center">
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  مبلغ السلفة
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="warning.main">
                  {loanData?.amount?.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4} textAlign="center">
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  إجمالي الفائدة
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="error.main">
                  {loanData?.interestAmount?.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4} textAlign="center">
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  المبلغ الإجمالي
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {loanData?.totalAmount?.toLocaleString()}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* الصف الثاني - تفاصيل الدفعات */}
            <Grid container spacing={2} justifyContent="center">
              <Grid item xs={6} sm={2.4} textAlign="center">
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                  المبلغ المدفوع
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="success.dark">
                  {(loanData?.pagination?.totalPaidAmount || 0).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={2.4} textAlign="center">
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                  المبلغ المتبقي
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="error.dark">
                  {(loanData?.pagination?.totalRemainingAmount || 0).toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={2.4} textAlign="center">
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                  إجمالي الخصومات
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="warning.main">
                  {sortedInstallments
                    .reduce((sum, inst) => sum + (inst.discount || 0), 0)
                    .toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={2.4} textAlign="center">
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                  الدفعات المدفوعة
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="primary.main">
                  {loanData?.pagination?.paidRepayments || 0} / {loanData?.pagination?.totalRepayments || 0}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={2.4} textAlign="center">
                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                  الدفعات المتبقية
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="info.main">
                  {(loanData?.pagination?.totalRepayments || 0) - (loanData?.pagination?.paidRepayments || 0)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Bulk Actions */}
          {selectedInstallments.length > 0 && permissions.includes("repayments_Post") && (
            <Paper sx={{ p: 1.5, mb: 2, borderRadius: 2, bgcolor: "background.paper" }}>
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ gap: 1.5 }}>
                <Typography variant="body2" color="text.secondary">
                  تم اختيار {selectedInstallments.length} دفعة
                </Typography>
                <Stack direction="row" sx={{ gap: 2 }}>
                  {/* Show approve button only if no paid installments are selected */}
                  {!selectedInstallments.some(id => {
                    const installment = sortedInstallments.find(inst => inst.id === id);
                    return installment && (installment.status === "PAID" || installment.status === "PARTIAL_PAID" || installment.status === "EARLY_PAID" || installment.status === "COMPLETED");
                  }) && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<ApproveIcon sx={{ marginLeft: "6px" }} />}
                        onClick={handleBulkApprove}
                        disabled={isBulkOperationLoading}
                        sx={{
                          bgcolor: "success.main",
                          "&:hover": { bgcolor: "success.dark" },
                          height: "32px",
                          fontSize: "13px",
                        }}
                      >
                        إنشاء إيصال سداد مجمع
                      </Button>
                    )}
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<RejectIcon sx={{ marginLeft: "6px" }} />}
                    onClick={handleBulkReject}
                    disabled={isBulkOperationLoading}
                    sx={{
                      borderColor: "error.main",
                      color: "error.main",
                      "&:hover": { bgcolor: "rgba(211, 47, 47, 0.1)" },
                      height: "32px",
                      fontSize: "13px",
                    }}
                  >
                    رفض الدفعات المحددة
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setSelectedInstallments([])}
                    disabled={isBulkOperationLoading}
                    sx={{
                      height: "32px",
                      fontSize: "13px",
                    }}
                  >
                    إلغاء اختيار الدفعات المحددة
                  </Button>
                </Stack>
              </Stack>
              {isBulkOperationLoading && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  جاري معالجة العملية...
                </Alert>
              )}
            </Paper>
          )}


          {/* خطوات المراجعة للشاشات الصغيرة */}
          {isSmallScreen && !isSettlementCompleted() && reviewStepsVisible && (
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: "background.default" }}>
              <Typography variant="h6" fontWeight="bold" mb={2}>
                خطوات المراجعة
              </Typography>

              <Stepper
                orientation="vertical"
                activeStep={activeStep}
                sx={{ mb: 2 }}
              >
                {steps.map((label, index) => (
                  <Step key={index}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>

              <Divider sx={{ my: 2 }} />

              {activeInstallmentId ? (
                <Box>
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    الدفعة المحددة: #{selectedInstallment?.count}
                  </Typography>

                  {selectedInstallment && (
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      المبلغ: {selectedInstallment.amount?.toFixed(2)}
                    </Typography>
                  )}

                  {activeStep === 0 && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                      في انتظار رفع الإيصال من العميل
                    </Alert>
                  )}

                  {activeStep === 1 && (
                    <Alert severity="warning" sx={{ mb: 2 }}>
                      جاري مراجعة الإيصال المرفوع
                    </Alert>
                  )}

                  {activeStep === 2 && (
                    <Alert severity="success" sx={{ mb: 2 }}>
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
                      {selectedInstallment?.attachments &&
                        selectedInstallment.attachments.length > 0 && (
                          <Box
                            sx={{
                              mb: 2,
                              p: 2,
                              bgcolor: "background.paper",
                              borderRadius: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              gutterBottom
                            >
                              المستندات:
                            </Typography>
                            {selectedInstallment.attachments.map(
                              (attachment, index) => (
                                <Box
                                  key={index}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    cursor: "pointer",
                                    "&:hover": { bgcolor: "action.hover" },
                                    p: 1,
                                    borderRadius: 1,
                                    mb: 1,
                                  }}
                                  onClick={() => {
                                    window.open(attachment, "_blank");
                                  }}
                                >
                                  <Typography variant="body2" sx={{ flex: 1 }}>
                                    {extractFileName(attachment)}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      downloadFile(attachment, extractFileName(attachment));
                                    }}
                                  >
                                    <Download />
                                  </IconButton>
                                </Box>
                              )
                            )}
                          </Box>
                        )}

                      {/* Display payment proof */}
                      {/* {selectedInstallment?.PaymentProof && (
                        <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            gutterBottom
                          >
                            إيصال الدفع:
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              cursor: "pointer",
                              "&:hover": { bgcolor: "action.hover" },
                              p: 1,
                              borderRadius: 1,
                            }}
                            onClick={() => {
                              window.open(
                                selectedInstallment.PaymentProof,
                                "_blank"
                              );
                            }}
                          >
                            <Typography variant="body2" sx={{ flex: 1 }}>
                              {extractFileName(selectedInstallment.PaymentProof)}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadFile(
                                  selectedInstallment.PaymentProof,
                                  extractFileName(selectedInstallment.PaymentProof)
                                );
                              }}
                            >
                              <Download />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShareFile(
                                  selectedInstallment.PaymentProof,
                                  extractFileName(selectedInstallment.PaymentProof)
                                );
                              }}
                            >
                              <ShareIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      )} */}

                      {/* Display payment proofs */}
                      {selectedInstallment?.RepaymentPayment?.length > 0 && (
                        <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
                          <Typography variant="body2" fontWeight="bold" gutterBottom>
                            إيصالات الدفع:
                          </Typography>

                          {selectedInstallment.RepaymentPayment.map((payment, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                cursor: "pointer",
                                "&:hover": { bgcolor: "action.hover" },
                                p: 1,
                                borderRadius: 1,
                              }}
                              onClick={() => {
                                window.open(payment.proofUrl, "_blank");
                              }}
                            >
                              <Typography variant="body2" sx={{ flex: 1 }}>
                                {extractFileName(payment.proofUrl)}
                              </Typography>

                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadFile(
                                    payment.proofUrl,
                                    extractFileName(payment.proofUrl)
                                  );
                                }}
                              >
                                <Download />
                              </IconButton>

                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShareFile(
                                    payment.proofUrl,
                                    extractFileName(payment.proofUrl)
                                  );
                                }}
                              >
                                {/* share icon */}
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      )}

                    </Box>
                  ) : (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      هذه الدفعة لا يحتوي على أي ملفات
                    </Alert>
                  )}
                </Box>
              ) : (
                <Alert severity="info">اختر دفعة لعرض التفاصيل</Alert>
              )}
            </Paper>
          )}

          {/* رسالة التسوية المكتملة للشاشات الصغيرة */}
          {isSmallScreen && isSettlementCompleted() && (
            <Paper sx={{ p: 2, mb: 3, borderRadius: 2, bgcolor: "background.default" }}>
              <Box sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h6" fontWeight="bold" color="success.main" mb={2}>
                  🎉 تم تسوية السلفة بالكامل
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  جميع الدفعات تم سدادها بنجاح وإغلاق السلفة نهائياً
                </Typography>
              </Box>
            </Paper>
          )}

          {/* Settlement Button - Only show if all installments are paid AND settlement is not completed */}
          {allInstallmentsPaid() && !isSettlementCompleted() && (
            <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
              {permissions.includes("repayments_Post") && (
                <Button
                  variant="contained"
                  onClick={handleSettlement}
                  sx={{
                    bgcolor: "success.main",
                    "&:hover": { bgcolor: "success.dark" },
                    fontWeight: "bold",
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                  }}
                >
                  تسوية الدفعة النهائي
                </Button>
              )}
            </Box>
          )}

          {/* Show message if settlement is already completed */}
          {isSettlementCompleted() && (
            <Alert severity="success" sx={{ mb: 3 }}>
              تم تسوية الدفعة النهائي بنجاح
            </Alert>
          )}

          <Paper sx={{ borderRadius: 2, overflow: "hidden" }}>
            {isSmallScreen ? (
              renderMobileInstallmentCards()
            ) : (
              renderDesktopTable()
            )}
          </Paper>
        </Box>

        {!isSmallScreen && !isSettlementCompleted() && reviewStepsVisible && (
          <Box
            sx={{
              width: "300px",
              borderRight: "1px solid",
              borderRightColor: "divider",
              bgcolor: "background.default",
              height: "100%",
              overflowY: "auto",
              flexShrink: 0,
            }}
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                خطوات المراجعة
              </Typography>

              <Stepper
                orientation="vertical"
                activeStep={activeStep}
                sx={{ mb: 3 }}
              >
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
                    الدفعة المحددة: #{selectedInstallment?.count}
                  </Typography>

                  {selectedInstallment && (
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      المبلغ: {selectedInstallment.amount?.toFixed(2)}
                    </Typography>
                  )}

                  {activeStep === 0 && (
                    <Alert severity="info" sx={{ mb: 2, ml: 2 }}>
                      في انتظار رفع الإيصال من العميل
                    </Alert>
                  )}

                  {activeStep === 1 && (
                    <Alert severity="warning" sx={{ mb: 2, ml: 2 }}>
                      جاري مراجعة الإيصال المرفوع
                    </Alert>
                  )}

                  {activeStep === 2 && (
                    <Alert severity="success" sx={{ mb: 2, ml: 2 }}>
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
                      {selectedInstallment?.attachments &&
                        selectedInstallment.attachments.length > 0 && (
                          <Box
                            sx={{
                              mb: 2,
                              p: 2,
                              bgcolor: "background.paper",
                              borderRadius: 1,
                            }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight="bold"
                              gutterBottom
                            >
                              المستندات:
                            </Typography>
                            {selectedInstallment.attachments.map(
                              (attachment, index) => (
                                <Box
                                  key={index}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    cursor: "pointer",
                                    "&:hover": { bgcolor: "action.hover" },
                                    p: 1,
                                    borderRadius: 1,
                                    mb: 1,
                                  }}
                                  onClick={() => {
                                    window.open(attachment, "_blank");
                                  }}
                                >
                                  <Typography variant="body2" sx={{ flex: 1 }}>
                                    {extractFileName(attachment)}
                                  </Typography>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      downloadFile(attachment, extractFileName(attachment));
                                    }}
                                  >
                                    <Download />
                                  </IconButton>
                                </Box>
                              )
                            )}
                          </Box>
                        )}

                      {/* Display payment proof */}
                      {/* {selectedInstallment?.PaymentProof && (
                        <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            gutterBottom
                          >
                            إيصال الدفع:
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                              cursor: "pointer",
                              "&:hover": { bgcolor: "action.hover" },
                              p: 1,
                              borderRadius: 1,
                            }}
                            onClick={() => {
                              window.open(
                                selectedInstallment.PaymentProof,
                                "_blank"
                              );
                            }}
                          >
                            <Typography variant="body2" sx={{ flex: 1 }}>
                              {extractFileName(selectedInstallment.PaymentProof)}
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                downloadFile(
                                  selectedInstallment.PaymentProof,
                                  extractFileName(selectedInstallment.PaymentProof)
                                );
                              }}
                            >
                              <Download />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShareFile(
                                  selectedInstallment.PaymentProof,
                                  extractFileName(selectedInstallment.PaymentProof)
                                );
                              }}
                            >
                              <ShareIcon />
                            </IconButton>
                          </Box>
                        </Box>
                      )} */}

                      {/* Display payment proofs */}
                      {selectedInstallment?.RepaymentPayment?.length > 0 && (
                        <Box sx={{ p: 2, bgcolor: "background.paper", borderRadius: 1 }}>
                          <Typography variant="body2" fontWeight="bold" gutterBottom>
                            إيصالات الدفع:
                          </Typography>

                          {selectedInstallment.RepaymentPayment.map((payment, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                cursor: "pointer",
                                "&:hover": { bgcolor: "action.hover" },
                                p: 1,
                                borderRadius: 1,
                              }}
                              onClick={() => {
                                window.open(payment.proofUrl, "_blank");
                              }}
                            >
                              <Typography variant="body2" sx={{ flex: 1 }}>
                                {extractFileName(payment.proofUrl)}
                              </Typography>

                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  downloadFile(
                                    payment.proofUrl,
                                    extractFileName(payment.proofUrl)
                                  );
                                }}
                              >
                                <Download />
                              </IconButton>

                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShareFile(
                                    payment.proofUrl,
                                    extractFileName(payment.proofUrl)
                                  );
                                }}
                              >
                                <ShareIcon />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      )}

                    </Box>
                  ) : (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      هذه الدفعة لا يحتوي على أي ملفات
                    </Alert>
                  )}
                </Box>
              ) : (
                <Alert severity="info">اختر دفعة لعرض التفاصيل</Alert>
              )}
            </Box>
          </Box>
        )}

        {/* رسالة التسوية المكتملة للشاشات الكبيرة */}
        {!isSmallScreen && isSettlementCompleted() && (
          <Box
            sx={{
              width: "270px",
              borderRight: "1px solid",
              borderRightColor: "divider",
              bgcolor: "background.default",
              height: "100%",
              overflowY: "auto",
              flexShrink: 0,
            }}
          >
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography variant="h6" fontWeight="bold" color="success.main" mb={2}>
                🎉 تم تسوية السلفة بالكامل
              </Typography>
              <Typography variant="body2" color="text.secondary">
                جميع الدفعات تم سدادها بنجاح وإغلاق السلفة نهائياً
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        
        {selectedActionInstallment?.status !== "PAID" &&
          selectedActionInstallment?.status !== "PARTIAL_PAID" &&
          !shouldDisableActions() &&
          permissions.includes("repayments_Post") && (
            <MenuItem
              onClick={() => handleApprove(selectedActionInstallment)}
              sx={{ color: "green" }}
            >
              <ApproveIcon sx={{ mr: 1, color: "green", marginLeft: "10px" }} />
              موافقة
            </MenuItem>
          )}

        {!shouldDisableActions() && permissions.includes("repayments_Post") && (
          <MenuItem
            onClick={() => handleReject(selectedActionInstallment)}
            sx={{ color: "red" }}
          >
            <RejectIcon sx={{ mr: 1, color: "red", marginLeft: "10px" }} />
            رفض
          </MenuItem>
        )}

        {selectedActionInstallment?.status !== "PAID" &&
          !shouldDisableActions() &&
          permissions.includes("repayments_Add") && (
            <MenuItem
              onClick={() => setPartialPaymentModalOpen(true)}
              sx={{ color: "blue" }}
            >
              <PartialPaymentIcon
                sx={{ mr: 1, color: "blue", marginLeft: "10px" }}
              />
              إضافة دفع جزئي
            </MenuItem>
          )}

        {selectedActionInstallment?.status !== "PAID" &&
          !shouldDisableActions() &&
          permissions.includes("repayments_Add") && (
            <MenuItem
              onClick={() => setPostponeModalOpen(true)}
              sx={{ color: "orange" }}
            >
              <PostponeIcon
                sx={{ mr: 1, color: "orange", marginLeft: "10px" }}
              />
              تأجيل
            </MenuItem>
          )}
        {selectedActionInstallment?.status === "PAID" && (
          <MenuItem
            onClick={() => {
              setSelectedDocumentsInstallment(selectedActionInstallment);
              setDocumentsModalOpen(true);
            }}
          >
            <DocumentIcon sx={{ mr: 1, marginLeft: "10px" }} />
            عرض المستندات
          </MenuItem>
        )}
      </Menu>

      {/* Partial Payment Modal */}
      <PartialPaymentModal
        open={partialPaymentModalOpen}
        onClose={() => setPartialPaymentModalOpen(false)}
        selectedActionInstallment={selectedActionInstallment}
        paidAmount={paidAmount}
        onAmountChange={(e) => setPaidAmount(e.target.value)}
        onConfirm={handlePartialPayment}
      />

      <PostponeModal
        open={postponeModalOpen}
        onClose={() => setPostponeModalOpen(false)}
        newDueDate={newDueDate}
        onDueDateChange={(e) => setNewDueDate(e.target.value)}
        postponeReason={postponeReason}
        onReasonChange={(e) => setPostponeReason(e.target.value)}
        onConfirm={handlePostpone}
      />

      <EarlyPaymentModal
        open={earlyPaymentModalOpen}
        onClose={() => {
          setEarlyPaymentModalOpen(false);
          setDiscountAmount("0");
          setAllInstallmentsForEarlyPayment(null);
        }}
        sortedInstallments={isLoadingAllForEarlyPayment ? [] : (allInstallmentsForEarlyPayment ?? sortedInstallments)}
        isLoadingAllRepayments={isLoadingAllForEarlyPayment}
        discountAmount={discountAmount}
        onDiscountChange={(e) => setDiscountAmount(e.target.value)}
        onConfirm={handleEarlyPayment}
      />
      <PaymentProofGenerator
        ref={paymentProofGeneratorRef}
        installmentData={selectedProofInstallment}
        loanData={loanData}
        clientData={loanData?.client}
        investorData={loanData?.partner}
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
        discount={confirmedDiscount?.discount || 0}
        installmentNumber={selectedProofInstallment?.id || ""}
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
          setSettlementManuallyClosed(true);
        }}
        settlementHtml={settlementHtml}
        onSaveSettlement={handleSaveSettlement}
        loading={isGeneratingSettlement}
        clientName={loanData?.client?.name}
        installmentAmount={loanData?.totalAmount || 0}
        installmentNumber={
          sortedInstallments[sortedInstallments.length - 1]?.count || ""
        }
      />
      <DocumentsModal
        open={documentsModalOpen}
        onClose={() => setDocumentsModalOpen(false)}
        selectedDocumentsInstallment={selectedDocumentsInstallment}
      />

      <DeleteModal
        open={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleConfirmReject}
        title="رفض الدفعة"
        message={`هل أنت متأكد من رفض دفعة رقم ${selectedActionInstallment?.count}؟`}
        isLoading={rejectLoading}
        ButtonText="رفض"
      />

      <PaymentProofPreview
        open={bulkPaymentProofModalOpen}
        onClose={() => {
          setBulkPaymentProofModalOpen(false);
          setBulkPaymentProofHtml("");
        }}
        paymentProofHtml={bulkPaymentProofHtml}
        onSaveProof={handleSaveBulkPaymentProof}
        loading={isGeneratingBulkProof}
        clientName={loanData?.client?.name}
        installmentAmount={sortedInstallments
          .filter(installment => selectedInstallments.includes(installment.id))
          .reduce((sum, inst) => sum + (inst.amount || 0), 0)}
        discount={0}
        installmentNumber={`مجمع (${selectedInstallments.length} دفعات)`}
      />

      {/* Partial Payment Proof Preview */}
      <PaymentProofPreview
        open={partialPaymentProofModalOpen}
        onClose={() => {
          setPartialPaymentProofModalOpen(false);
          setPartialPaymentProofHtml("");
          setPartialPaymentInstallment(null);
        }}
        paymentProofHtml={partialPaymentProofHtml}
        onSaveProof={handleSavePartialPaymentProof}
        loading={isGeneratingPartialProof}
        clientName={loanData?.client?.name}
        installmentAmount={partialPaymentInstallment?.amount || 0}
        discount={0}
        installmentNumber={`دفعة #${partialPaymentInstallment?.count || ""} (دفع جزئي)`}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 3,
          mb: 2
        }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handleChangePage}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Discount Modal */}
      <DiscountModal
        open={discountModalOpen}
        onClose={() => setDiscountModalOpen(false)}
        onConfirm={handleDiscountConfirm}
        installmentAmount={discountInstallment?.amount || 0}
        loading={false}
      />
    </Box>
  );
};

export default Installments;
