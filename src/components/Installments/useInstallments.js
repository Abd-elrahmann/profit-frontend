import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Api, { handleApiError } from '../../config/Api';
import { notifySuccess, notifyError } from '../../utilities/toastify';
import {
  getLoanById,
  approveRepayment,
  rejectRepayment,
  postponeRepayment,
  markAsPartialPaid,
  earlyPayment,
  approveMultipleRepayments,
  rejectMultipleRepayments,
} from '../../pages/Installments/InstallmentsApi';
import { exportRepaymentsToPDF, exportRepaymentsToExcel } from '../../utilities/repaymentsExporter';
import { ensureFontsReady } from '../../utilities/fontLoader';
import { sortInstallments } from './installmentsUtils';
import { DEFAULT_EMPLOYEE_NAME } from './constants';

export function useInstallments() {
  const { loanId } = useParams();
  const queryClient = useQueryClient();

  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedActionInstallment, setSelectedActionInstallment] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedInstallments, setSelectedInstallments] = useState([]);
  const [isBulkOperationLoading, setIsBulkOperationLoading] = useState(false);

  const [postponeModalOpen, setPostponeModalOpen] = useState(false);
  const [newDueDate, setNewDueDate] = useState('');
  const [postponeReason, setPostponeReason] = useState('');

  const [partialPaymentModalOpen, setPartialPaymentModalOpen] = useState(false);
  const [paidAmount, setPaidAmount] = useState('');
  const [partialPaymentProofModalOpen, setPartialPaymentProofModalOpen] = useState(false);
  const [partialPaymentProofHtml, setPartialPaymentProofHtml] = useState('');
  const [isGeneratingPartialProof, setIsGeneratingPartialProof] = useState(false);
  const [partialPaymentInstallment, setPartialPaymentInstallment] = useState(null);

  const [activeInstallmentId, setActiveInstallmentId] = useState(null);

  const [discountModalOpen, setDiscountModalOpen] = useState(false);
  const [discountInstallment, setDiscountInstallment] = useState(null);
  const [confirmedDiscount, setConfirmedDiscount] = useState({ discount: 0, notes: '' });

  const [paymentProofModalOpen, setPaymentProofModalOpen] = useState(false);
  const [selectedProofInstallment, setSelectedProofInstallment] = useState(null);
  const [paymentProofTemplate, setPaymentProofTemplate] = useState('');
  const [paymentProofHtml, setPaymentProofHtml] = useState('');
  const [isGeneratingProof, setIsGeneratingProof] = useState(false);
  const [settlementModalOpen, setSettlementModalOpen] = useState(false);
  const [settlementHtml, setSettlementHtml] = useState('');
  const [isGeneratingSettlement, setIsGeneratingSettlement] = useState(false);
  const [settlementJustSaved, setSettlementJustSaved] = useState(false);
  const [settlementManuallyClosed, setSettlementManuallyClosed] = useState(false);
  const [settlementTemplate, setSettlementTemplate] = useState('');

  const [documentsModalOpen, setDocumentsModalOpen] = useState(false);
  const [bulkPaymentProofModalOpen, setBulkPaymentProofModalOpen] = useState(false);
  const [bulkPaymentProofHtml, setBulkPaymentProofHtml] = useState('');
  const [isGeneratingBulkProof, setIsGeneratingBulkProof] = useState(false);

  const [selectedDocumentsInstallment, setSelectedDocumentsInstallment] = useState(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [reviewStepsVisible, setReviewStepsVisible] = useState(true);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [earlyPaymentModalOpen, setEarlyPaymentModalOpen] = useState(false);
  const [discountAmount, setDiscountAmount] = useState('0');
  const [allInstallmentsForEarlyPayment, setAllInstallmentsForEarlyPayment] = useState(null);
  const [isLoadingAllForEarlyPayment, setIsLoadingAllForEarlyPayment] = useState(false);

  const paymentProofGeneratorRef = useRef(null);
  const settlementReceiptRef = useRef(null);

  const { data: loanData, isLoading, error } = useQuery({
    queryKey: ['loan', loanId, page, limit],
    queryFn: () => getLoanById(loanId, page, limit),
    enabled: !!loanId,
  });

  const installments = Array.isArray(loanData?.repayments) ? loanData.repayments : [];
  const sortedInstallments = sortInstallments(installments);

  const totalPages =
    loanData?.pagination?.totalPages ??
    (loanData?.pagination?.totalRepayments && limit
      ? Math.max(1, Math.ceil(loanData.pagination.totalRepayments / limit))
      : loanData?.repayments?.length && limit
        ? Math.max(1, Math.ceil(loanData.repayments.length / limit))
        : 1);

  const fetchPaymentProofTemplate = async () => {
    try {
      const response = await Api.get('/api/templates/PAYMENT_PROOF');
      setPaymentProofTemplate(response.data.content || '');
    } catch (err) {
      console.warn('Could not fetch payment proof template:', err);
    }
  };

  const fetchSettlementTemplate = async () => {
    try {
      const response = await Api.get('/api/templates/SETTLEMENT');
      setSettlementTemplate(response.data.content || '');
    } catch (err) {
      console.warn('Could not fetch settlement template:', err);
    }
  };

  const fetchAllRepayments = async () => {
    const allRepayments = [];
    let currentPage = 1;
    let hasMorePages = true;
    let loanInfo = null;

    while (hasMorePages) {
      const pageData = await getLoanById(loanId, currentPage, limit);
      if (currentPage === 1) loanInfo = pageData; // eslint-disable-line no-unused-vars
      if (Array.isArray(pageData?.repayments) && pageData.repayments.length > 0) {
        allRepayments.push(...pageData.repayments);
        const totalPages =
          pageData?.pagination?.totalPages ??
          (pageData?.pagination?.totalRepayments && limit
            ? Math.ceil(pageData.pagination.totalRepayments / limit)
            : 1);
        hasMorePages = currentPage < totalPages;
        currentPage++;
      } else {
        hasMorePages = false;
      }
    }
    return { repayments: allRepayments, loanData: loanInfo || loanData };
  };

  const allInstallmentsPaid = () => {
    const totalRepayments = loanData?.pagination?.totalRepayments || 0;
    const paidRepayments = loanData?.pagination?.paidRepayments || 0;
    if (totalRepayments > 0) return paidRepayments === totalRepayments;
    return sortedInstallments.every(
      (inst) => inst.status === 'PAID' || inst.status === 'EARLY_PAID'
    );
  };

  const isSettlementCompleted = () =>
    loanData?.SETTLEMENT !== null && loanData?.SETTLEMENT !== undefined;

  const hasEarlyPayment = () =>
    sortedInstallments.some(
      (inst) => inst.status === 'PENDING' && inst.status === 'EARLY_PAID'
    );

  const shouldDisableActions = () => isSettlementCompleted() || hasEarlyPayment();

  useEffect(() => {
    if (loanId) {
      fetchPaymentProofTemplate();
      fetchSettlementTemplate();
    }
  }, [loanId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const installmentWithDocuments = sortedInstallments.find(
      (inst) =>
        inst.attachments && inst.attachments.length > 0 && inst.status === 'PENDING'
    );
    if (installmentWithDocuments && !activeInstallmentId) {
      handleRowClick(installmentWithDocuments);
    }
  }, [sortedInstallments]); // eslint-disable-line react-hooks/exhaustive-deps

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
  }, [sortedInstallments, settlementTemplate, settlementJustSaved, settlementManuallyClosed]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!earlyPaymentModalOpen || !loanId) return;
    setIsLoadingAllForEarlyPayment(true);
    setAllInstallmentsForEarlyPayment(null);
    fetchAllRepayments()
      .then(({ repayments }) => {
        const sorted = sortInstallments(repayments || []);
        setAllInstallmentsForEarlyPayment(sorted);
      })
      .catch(() => setAllInstallmentsForEarlyPayment([]))
      .finally(() => setIsLoadingAllForEarlyPayment(false));
  }, [earlyPaymentModalOpen, loanId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChangePage = (event, value) => {
    setPage(value);
    setSelectedInstallments([]);
  };

  const handleRowClick = (installment) => {
    setSelectedInstallment(installment);
    setActiveInstallmentId(installment.id);
    if (installment.status === 'PAID') {
      setActiveStep(2);
    } else if (installment.attachments && installment.attachments.length > 0) {
      setActiveStep(1);
    } else {
      setActiveStep(0);
    }
  };

  const handleInstallmentSelect = (installmentId) => {
    setSelectedInstallments((prev) =>
      prev.includes(installmentId) ? prev.filter((id) => id !== installmentId) : [...prev, installmentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedInstallments.length === sortedInstallments.length) {
      setSelectedInstallments([]);
    } else {
      setSelectedInstallments(sortedInstallments.map((inst) => inst.id));
    }
  };

  const handleBulkApprove = async () => {
    if (selectedInstallments.length === 0) {
      notifyError('يرجى اختيار الدفعات المراد اعتمادها');
      return;
    }
    const installmentsToApprove = sortedInstallments.filter((inst) =>
      selectedInstallments.includes(inst.id)
    );
    const alreadyPaid = installmentsToApprove.filter(
      (inst) =>
        inst.status === 'PAID' || inst.status === 'EARLY_PAID' || inst.status === 'COMPLETED'
    );
    if (alreadyPaid.length > 0) {
      notifyError(
        `لا يمكن الموافقة على الدفعات التالية لأنها مدفوعة بالفعل: ${alreadyPaid.map((i) => `دفعة ${i.count}`).join(', ')}`
      );
      return;
    }
    try {
      const { data: countData } = await Api.get('/api/repayments/next-count');
      const receiptNumber = countData?.toString() || 'غير محدد';
      const bulkProofHtml = await paymentProofGeneratorRef.current.generateContract(false, {
        installmentsData: installmentsToApprove,
        loanData,
        clientData: loanData?.client,
        employeeName: DEFAULT_EMPLOYEE_NAME,
        receiptNumber,
      });
      setBulkPaymentProofHtml(bulkProofHtml);
      setBulkPaymentProofModalOpen(true);
    } catch (err) {
      notifyError('حدث خطأ أثناء توليد إيصال السداد المجمع');
      handleApiError(err);
    }
  };

  const handleBulkReject = async () => {
    if (selectedInstallments.length === 0) {
      notifyError('يرجى اختيار الدفعات المراد رفضها');
      return;
    }
    const installmentsToReject = sortedInstallments.filter((inst) =>
      selectedInstallments.includes(inst.id)
    );
    const completedInstallments = installmentsToReject.filter(
      (inst) => inst.status === 'COMPLETED'
    );
    if (completedInstallments.length > 0) {
      notifyError(
        `لا يمكن رفض الدفعات التالية لأنها مكتملة: ${completedInstallments.map((i) => `دفعة ${i.count}`).join(', ')}`
      );
      return;
    }
    try {
      setIsBulkOperationLoading(true);
      await rejectMultipleRepayments(selectedInstallments);
      notifySuccess(`تم رفض ${selectedInstallments.length} دفعة بنجاح`);
      setSelectedInstallments([]);
      queryClient.invalidateQueries(['loan', loanId]);
      queryClient.invalidateQueries(['repayments', loanId]);
    } catch (err) {
      notifyError(err.response?.data?.message || 'حدث خطأ أثناء رفض الدفعات');
    } finally {
      setIsBulkOperationLoading(false);
    }
  };

  const handleApprove = (installment) => {
    setDiscountInstallment(installment);
    setDiscountModalOpen(true);
    setAnchorEl(null);
  };

  const handleDiscountConfirm = async ({ discount, notes }) => {
    try {
      setConfirmedDiscount({ discount, notes });
      setDiscountModalOpen(false);

      const installmentAmount =
        discountInstallment.status === 'PARTIAL_PAID'
          ? discountInstallment.remaining
          : discountInstallment.amount;
      const isFullDiscount = Number(discount) >= Number(installmentAmount);

      if (isFullDiscount) {
        await approveRepayment(
          discountInstallment.id,
          installmentAmount,
          notes?.trim() || 'اشعار خصم لدفعة',
          discount
        );
        notifySuccess('تم تطبيق خصم على الدفعة بنجاح');
        queryClient.invalidateQueries(['loan', loanId]);
        queryClient.invalidateQueries(['repayments', loanId]);
        queryClient.invalidateQueries(['repayment', discountInstallment.id]);
        setDiscountInstallment(null);
        setConfirmedDiscount({ discount: 0, notes: '' });
        return;
      }

      const installmentDataForProof = { ...discountInstallment, amount: installmentAmount };
      setSelectedProofInstallment(installmentDataForProof);

      const { data: countData } = await Api.get('/api/repayments/next-count');
      const receiptNumber = countData?.toString() || 'غير محدد';

      const proofHtml = await paymentProofGeneratorRef.current.generateContract(false, {
        installmentData: installmentDataForProof,
        loanData,
        clientData: loanData?.client,
        employeeName: DEFAULT_EMPLOYEE_NAME,
        discount,
        receiptNumber,
      });
      setPaymentProofHtml(proofHtml);
      setPaymentProofModalOpen(true);
    } catch (err) {
      notifyError('حدث خطأ أثناء توليد إيصال السداد');
      handleApiError(err);
    }
  };

  const handleSavePaymentProof = async () => {
    try {
      setIsGeneratingProof(true);
      const { data: countData } = await Api.get('/api/repayments/next-count');
      const receiptNumber = countData?.toString() || 'غير محدد';

      const finalProofHtml = await paymentProofGeneratorRef.current.generateContract(
        false,
        {
          installmentData: selectedProofInstallment,
          loanData,
          clientData: loanData?.client,
          employeeName: DEFAULT_EMPLOYEE_NAME,
          discount: confirmedDiscount.discount,
          receiptNumber,
        },
        true
      );

      await paymentProofGeneratorRef.current.generatePDF(finalProofHtml);
      notifySuccess('تم حفظ إيصال السداد بنجاح');

      await approveRepayment(
        selectedProofInstallment.id,
        selectedProofInstallment.amount,
        confirmedDiscount.notes || 'تمت الموافقة على السداد',
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
        queryClient.invalidateQueries(['loan', loanId]);
        queryClient.invalidateQueries(['repayments', loanId]);
        queryClient.invalidateQueries(['repayment', selectedProofInstallment.id]);
      }, 400);
    } catch (err) {
      notifyError(err.response?.data?.message || 'حدث خطأ أثناء حفظ الإيصال');
    } finally {
      setIsGeneratingProof(false);
    }
  };

  const handleSaveBulkPaymentProof = async () => {
    try {
      setIsGeneratingBulkProof(true);
      const { data: countData } = await Api.get('/api/repayments/next-count');
      const receiptNumber = countData?.toString() || 'غير محدد';

      const installmentsToApprove = sortedInstallments.filter((inst) =>
        selectedInstallments.includes(inst.id)
      );

      const finalBulkProofHtml = await paymentProofGeneratorRef.current.generateContract(
        false,
        {
          installmentsData: installmentsToApprove,
          loanData,
          clientData: loanData?.client,
          employeeName: DEFAULT_EMPLOYEE_NAME,
          receiptNumber,
        },
        true
      );

      await paymentProofGeneratorRef.current.generatePDF(
        finalBulkProofHtml,
        true,
        selectedInstallments
      );

      notifySuccess('تم حفظ إيصال السداد المجمع بنجاح');
      await approveMultipleRepayments(selectedInstallments, null, 'تمت الموافقة على الدفعات المجمعة');

      setBulkPaymentProofModalOpen(false);
      setSelectedInstallments([]);
      queryClient.invalidateQueries(['loan', loanId]);
      queryClient.invalidateQueries(['repayments', loanId]);
    } catch (err) {
      notifyError(err.response?.data?.message || 'حدث خطأ أثناء حفظ الإيصال المجمع');
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
      await rejectRepayment(selectedActionInstallment.id, 'تم رفض الإيصال');
      notifySuccess('تم رفض السداد');
      queryClient.invalidateQueries(['loan', loanId]);
      queryClient.invalidateQueries(['repayments', loanId]);
      setActiveStep(0);
      setRejectModalOpen(false);
      setSelectedActionInstallment(null);
    } catch (err) {
      notifyError(err.response?.data?.message || 'حدث خطأ أثناء رفض السداد');
    } finally {
      setRejectLoading(false);
    }
  };

  const handlePartialPayment = async () => {
    if (!selectedActionInstallment || !paidAmount) {
      notifyError('يرجى إدخال المبلغ المدفوع');
      return;
    }
    const paidAmountNum = parseFloat(paidAmount);
    if (isNaN(paidAmountNum) || paidAmountNum <= 0) {
      notifyError('يرجى إدخال مبلغ صحيح');
      return;
    }
    if (paidAmountNum > selectedActionInstallment.amount) {
      notifyError('المبلغ المدفوع لا يمكن أن يكون أكبر من قيمة الدفعة');
      return;
    }
    try {
      const { data: countData } = await Api.get('/api/repayments/next-count');
      const receiptNumber = countData?.toString() || 'غير محدد';

      const partialInstallmentData = {
        ...selectedActionInstallment,
        amount: paidAmountNum,
        isPartialPayment: true,
      };

      setPartialPaymentInstallment({
        ...partialInstallmentData,
        paidAmountNum,
        receiptNumber,
      });

      const proofHtml = await paymentProofGeneratorRef.current.generateContract(false, {
        installmentData: partialInstallmentData,
        loanData,
        clientData: loanData?.client,
        employeeName: DEFAULT_EMPLOYEE_NAME,
        discount: 0,
        receiptNumber,
      });

      setPartialPaymentProofHtml(proofHtml);
      setPartialPaymentModalOpen(false);
      setPartialPaymentProofModalOpen(true);
    } catch (err) {
      console.error('Partial payment error:', err);
      notifyError(err.message || err.response?.data?.message || 'حدث خطأ أثناء توليد سند الدفع الجزئي');
    }
    setAnchorEl(null);
  };

  const handleSavePartialPaymentProof = async () => {
    try {
      setIsGeneratingPartialProof(true);
      const html2pdf = (await import('html2pdf.js')).default;

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = partialPaymentProofHtml;
      const contractWrapper = tempDiv.querySelector('.contract-wrapper');
      const cleanedContent = contractWrapper ? contractWrapper.outerHTML : partialPaymentProofHtml;

      const filename = `payment_proof_partial_${partialPaymentInstallment.id}_${Date.now()}.pdf`;
      const options = {
        margin: 0,
        filename,
        image: { type: 'jpeg', quality: 1 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          scrollX: 0,
          scrollY: 0,
          windowWidth: 794,
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true,
        },
      };

      const tempElement = document.createElement('div');
      tempElement.style.width = '794px';
      tempElement.style.backgroundColor = 'white';
      tempElement.style.margin = '0 auto';
      tempElement.style.padding = '0';
      tempElement.innerHTML = cleanedContent;
      document.body.appendChild(tempElement);

      await ensureFontsReady();

      const pdfBlob = await html2pdf()
        .from(tempElement)
        .set(options)
        .outputPdf('blob');

      document.body.removeChild(tempElement);

      const formData = new FormData();
      const pdfFilename = `إيصال_سداد_جزئي_الدفعة_${partialPaymentInstallment.id}_${Date.now()}.pdf`;
      formData.append('file', pdfBlob, pdfFilename);

      await Api.post(
        `/api/repayments/PaymentProof/${partialPaymentInstallment.id}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      await markAsPartialPaid(
        partialPaymentInstallment.id,
        partialPaymentInstallment.paidAmountNum
      );

      notifySuccess('تم حفظ سند الدفع الجزئي بنجاح');

      setPartialPaymentProofModalOpen(false);
      setPartialPaymentInstallment(null);
      setPaidAmount('');

      queryClient.invalidateQueries(['loan', loanId]);
      queryClient.invalidateQueries(['repayments', loanId]);
    } catch (err) {
      console.error('Partial payment proof error:', err);
      notifyError(
        err.message || err.response?.data?.message || 'حدث خطأ أثناء حفظ سند الدفع الجزئي'
      );
    } finally {
      setIsGeneratingPartialProof(false);
    }
  };

  const handlePostpone = async () => {
    if (!selectedActionInstallment || !newDueDate) {
      notifyError('يرجى إدخال تاريخ الاستحقاق الجديد');
      return;
    }
    try {
      await postponeRepayment(
        selectedActionInstallment.id,
        newDueDate,
        postponeReason
      );
      notifySuccess('تم تأجيل الدفعة بنجاح');
      queryClient.invalidateQueries(['loan', loanId]);
      queryClient.invalidateQueries(['repayments', loanId]);
      setPostponeModalOpen(false);
      setNewDueDate('');
      setPostponeReason('');
    } catch (err) {
      notifyError(err.response?.data?.message || 'حدث خطأ أثناء تأجيل الدفعة');
    }
    setAnchorEl(null);
  };

  const handleEarlyPayment = async () => {
    try {
      const discount = parseFloat(discountAmount) || 0;
      if (discount < 0) {
        notifyError('قيمة الخصم لا يمكن أن تكون سالبة');
        return;
      }
      const installmentsForEarly = allInstallmentsForEarlyPayment ?? sortedInstallments;
      const pendingInstallments = installmentsForEarly.filter((inst) => inst.status === 'PENDING');
      if (pendingInstallments.length === 0) {
        notifyError('لا توجد دفعات معلقة للسداد المبكر');
        setEarlyPaymentModalOpen(false);
        return;
      }
      await earlyPayment(loanId, discount);
      notifySuccess('تم السداد المبكر للدفعات المعلقة بنجاح');
      setEarlyPaymentModalOpen(false);
      setDiscountAmount('0');
      queryClient.invalidateQueries(['loan', loanId]);
      queryClient.invalidateQueries(['repayments', loanId]);
    } catch (err) {
      notifyError(err.response?.data?.message || 'حدث خطأ أثناء السداد المبكر');
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

  const handleSettlement = async () => {
    try {
      setIsGeneratingSettlement(true);
      const { repayments: allRepayments } = await fetchAllRepayments();
      const installmentsForSettlement =
        allRepayments?.length > 0
          ? sortInstallments(allRepayments)
          : sortedInstallments;

      const lastInstallment = installmentsForSettlement[installmentsForSettlement.length - 1];

      const totalContractAmount =
        Number(loanData?.totalAmount) ||
        (Number(loanData?.amount) || 0) + (Number(loanData?.interestAmount) || 0);
      const totalDiscounts = installmentsForSettlement.reduce(
        (sum, inst) => sum + (Number(inst.discount) || 0),
        0
      );
      const earlyPaymentDiscount = Number(loanData?.earlyPaymentDiscount || 0);
      const effectiveTotalDiscounts =
        totalDiscounts > 0 ? totalDiscounts : earlyPaymentDiscount;
      const calculatedSettlementAmount = Math.max(
        0,
        totalContractAmount - effectiveTotalDiscounts
      );

      const settlementHtmlResult = await settlementReceiptRef.current.generateContract(false, {
        installmentData: lastInstallment,
        loanData: {
          ...loanData,
          calculatedSettlementAmount,
          allInstallments: installmentsForSettlement,
          earlyPaymentDiscount: loanData?.earlyPaymentDiscount,
        },
        clientData: loanData?.client,
        employeeName: DEFAULT_EMPLOYEE_NAME,
      });

      setSettlementHtml(settlementHtmlResult);
      setSettlementModalOpen(true);
      setSettlementManuallyClosed(false);
    } catch (err) {
      handleApiError(err);
      notifyError('حدث خطأ أثناء توليد سند التسوية');
    } finally {
      setIsGeneratingSettlement(false);
    }
  };

  const handleSaveSettlement = async () => {
    try {
      setIsGeneratingSettlement(true);
      const { repayments: allRepayments } = await fetchAllRepayments();
      const installmentsForSettlement =
        allRepayments?.length > 0
          ? sortInstallments(allRepayments)
          : sortedInstallments;

      const lastInstallment = installmentsForSettlement[installmentsForSettlement.length - 1];

      const totalContractAmount =
        Number(loanData?.totalAmount) ||
        (Number(loanData?.amount) || 0) + (Number(loanData?.interestAmount) || 0);
      const totalDiscounts = installmentsForSettlement.reduce(
        (sum, inst) => sum + (Number(inst.discount) || 0),
        0
      );
      const earlyPaymentDiscount = Number(loanData?.earlyPaymentDiscount || 0);
      const effectiveTotalDiscounts =
        totalDiscounts > 0 ? totalDiscounts : earlyPaymentDiscount;
      const calculatedSettlementAmount = Math.max(
        0,
        totalContractAmount - effectiveTotalDiscounts
      );

      const finalSettlementHtml = await settlementReceiptRef.current.generateContract(
        false,
        {
          installmentData: lastInstallment,
          loanData: {
            ...loanData,
            calculatedSettlementAmount,
            allInstallments: installmentsForSettlement,
            earlyPaymentDiscount: loanData?.earlyPaymentDiscount,
          },
          clientData: loanData?.client,
          employeeName: DEFAULT_EMPLOYEE_NAME,
        },
        true
      );

      await settlementReceiptRef.current.generatePDF(finalSettlementHtml);
      notifySuccess('تم حفظ سند التسوية بنجاح');

      setSettlementModalOpen(false);
      setSettlementJustSaved(true);

      setTimeout(() => {
        notifySuccess('تم تسوية الدفعة النهائي وإغلاقه بنجاح');
      }, 300);

      queryClient.invalidateQueries(['loan', loanId]);

      setTimeout(() => setSettlementJustSaved(false), 2000);
      return true;
    } catch (err) {
      handleApiError(err);
      notifyError(err.response?.data?.message || 'حدث خطأ أثناء حفظ السند');
      return false;
    } finally {
      setIsGeneratingSettlement(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      notifySuccess('جاري جلب جميع البيانات...');
      const { repayments: allRepayments, loanData: allLoanData } = await fetchAllRepayments();
      const sortedAllRepayments = sortInstallments(allRepayments);
      await exportRepaymentsToPDF(sortedAllRepayments, allLoanData);
      notifySuccess('تم تصدير تقرير PDF بنجاح');
    } catch (err) {
      notifyError('حدث خطأ أثناء تصدير PDF');
      console.error('PDF export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      notifySuccess('جاري جلب جميع البيانات...');
      const { repayments: allRepayments, loanData: allLoanData } = await fetchAllRepayments();
      const sortedAllRepayments = sortInstallments(allRepayments);
      await exportRepaymentsToExcel(sortedAllRepayments, allLoanData);
      notifySuccess('تم تصدير تقرير Excel بنجاح');
    } catch (err) {
      notifyError('حدث خطأ أثناء تصدير Excel');
      console.error('Excel export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    loanId,
    loanData,
    isLoading,
    error,
    sortedInstallments,
    totalPages,
    page,
    limit,
    permissions: undefined, // will be set from usePermissions in page
    installmentsState: {
      selectedInstallment,
      anchorEl,
      selectedActionInstallment,
      activeStep,
      page,
      isExporting,
      selectedInstallments,
      isBulkOperationLoading,
      postponeModalOpen,
      newDueDate,
      postponeReason,
      partialPaymentModalOpen,
      paidAmount,
      partialPaymentProofModalOpen,
      partialPaymentProofHtml,
      isGeneratingPartialProof,
      partialPaymentInstallment,
      activeInstallmentId,
      discountModalOpen,
      discountInstallment,
      confirmedDiscount,
      paymentProofModalOpen,
      selectedProofInstallment,
      paymentProofHtml,
      isGeneratingProof,
      settlementModalOpen,
      settlementHtml,
      isGeneratingSettlement,
      settlementJustSaved,
      settlementManuallyClosed,
      documentsModalOpen,
      bulkPaymentProofModalOpen,
      bulkPaymentProofHtml,
      isGeneratingBulkProof,
      selectedDocumentsInstallment,
      rejectModalOpen,
      reviewStepsVisible,
      rejectLoading,
      earlyPaymentModalOpen,
      discountAmount,
      allInstallmentsForEarlyPayment,
      isLoadingAllForEarlyPayment,
    },
    setters: {
      setPostponeModalOpen,
      setNewDueDate,
      setPostponeReason,
      setPartialPaymentModalOpen,
      setPaidAmount,
      setPartialPaymentProofModalOpen,
      setPartialPaymentProofHtml,
      setPartialPaymentInstallment,
      setDiscountModalOpen,
      setDiscountInstallment,
      setConfirmedDiscount,
      setPaymentProofModalOpen,
      setSelectedProofInstallment,
      setReviewStepsVisible,
      setEarlyPaymentModalOpen,
      setDiscountAmount,
      setAllInstallmentsForEarlyPayment,
      setDocumentsModalOpen,
      setSelectedDocumentsInstallment,
      setRejectModalOpen,
      setSelectedActionInstallment,
      setBulkPaymentProofModalOpen,
      setBulkPaymentProofHtml,
      setSelectedInstallments,
      setSettlementModalOpen,
      setSettlementManuallyClosed,
    },
    handlers: {
      handleChangePage,
      handleRowClick,
      handleInstallmentSelect,
      handleSelectAll,
      handleBulkApprove,
      handleBulkReject,
      handleApprove,
      handleDiscountConfirm,
      handleSavePaymentProof,
      handleSaveBulkPaymentProof,
      handleReject,
      handleConfirmReject,
      handlePartialPayment,
      handleSavePartialPaymentProof,
      handlePostpone,
      handleEarlyPayment,
      handleMenuOpen,
      handleMenuClose,
      handleSettlement,
      handleSaveSettlement,
      handleExportPDF,
      handleExportExcel,
    },
    helpers: {
      allInstallmentsPaid,
      isSettlementCompleted,
      shouldDisableActions,
    },
    refs: {
      paymentProofGeneratorRef,
      settlementReceiptRef,
    },
  };
}
