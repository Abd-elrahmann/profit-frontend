import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Divider,
  Alert,
  Skeleton,
  Button,
  useMediaQuery,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import Api, { handleApiError } from "../../config/Api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce } from '../../utilities/debounce';
import DeleteModal from "../../components/modals/DeleteModal";
import TransactionModal from "../../components/modals/TransactionModal";
import WithdrawModal from "../../components/modals/WithdrawModal";
import ContractGenerator from "../../components/ContractGenerator";
import { notifyError, notifySuccess } from "../../utilities/toastify";
import { Helmet } from "react-helmet-async";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import { useTheme } from "../../theme/ThemeContext";
import { useNavigate } from "react-router-dom";

import InvestorsList from "../../components/investors/InvestorsList";
import InvestorHeader from "../../components/investors/InvestorHeader";
import PersonalDetailsTab from "../../components/investors/PersonalDetailsTab";
import FinancialInfoTab from "../../components/investors/FinancialInfoTab";
import TransactionsTab from "../../components/investors/TransactionsTab";
import DocumentsTab from "../../components/investors/DocumentsTab";

import {  
  formatArabicDate,
  calculateWithdrawalPreview,
  extractCapitalAmount,
  extractInvestorDataFromResponse,
  buildEditFormData,
  getOriginalFieldValue,
  invalidateInvestorQueries,
  invalidateAllInvestorQueries,
  QUERY_KEYS,
} from "../../components/investors/investorsUtils";
import {
  getInvestors,
  getPartnerDetailsForExport,
  getInvestorDetails,
  getPartnerTransactions,
  createPartnerTransaction,
  deletePartnerTransaction,
  updateInvestor,
  deleteInvestor as deleteInvestorApi,
  getMudarabahTemplate,
  getWithdrawalPreview,
  createPartnerWithdrawal,
  updatePartnerWithdrawal,
  cancelPartnerWithdrawal,
} from "../../components/investors/investorsApi";

export default function Investors() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedActiveStatus, setSelectedActiveStatus] = useState("");
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [investorToDelete, setInvestorToDelete] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editFormData, setEditFormData] = useState({});
  const [hasDataChanged, setHasDataChanged] = useState(false);
  const [changedFields, setChangedFields] = useState({});
  
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    type: "DEPOSIT",
    amount: ""
  });
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isDeleteTransactionModalOpen, setIsDeleteTransactionModalOpen] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractInvestorData, setContractInvestorData] = useState(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState(null);
  const [mudarabahTemplate, setMudarabahTemplate] = useState('');
  const contractGeneratorRef = useRef(null);

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [firstPaymentDate, setFirstPaymentDate] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawnInvestors, setWithdrawnInvestors] = useState(new Set());
  const [isCancelWithdrawModalOpen, setIsCancelWithdrawModalOpen] = useState(false);
  
  const [isWithdrawEditMode, setIsWithdrawEditMode] = useState(false);
  const [withdrawPreviewData, setWithdrawPreviewData] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingTransaction, setIsSavingTransaction] = useState(false);
  const [isDeletingTransaction, setIsDeletingTransaction] = useState(false);

  const handleExportMenuOpen = (event) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportMenuClose = () => {
    setExportMenuAnchor(null);
  };

  // eslint-disable-next-line no-unused-vars
  const [showWithdrawnOnly, setShowWithdrawnOnly] = useState(false);

  const { permissions } = usePermissions();
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const isSmallScreen = isMobile || isTablet;

  const { data: investorsData, isLoading: isInvestorsLoading, refetch } = useQuery({
    queryKey: [QUERY_KEYS.INVESTORS, currentPage, search, selectedStatus, showWithdrawnOnly, selectedActiveStatus],
    queryFn: () => getInvestors(currentPage, search, selectedStatus, showWithdrawnOnly, selectedActiveStatus),
    retry: 1,
  });

  const { data: investorDetails } = useQuery({
    queryKey: [QUERY_KEYS.INVESTOR_DETAILS, selectedInvestor?.id],
    queryFn: () => selectedInvestor ? getInvestorDetails(selectedInvestor.id) : null,
    enabled: !!selectedInvestor,
    retry: 1,
  });

  const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery({
    queryKey: [QUERY_KEYS.PARTNER_TRANSACTIONS, selectedInvestor?.id, transactionsPage],
    queryFn: () => selectedInvestor ? getPartnerTransactions(selectedInvestor.id, transactionsPage) : null,
    enabled: !!selectedInvestor,
    retry: 1,
  });

  const debouncedSearch = debounce((value) => {
    setSearch(value);
    setCurrentPage(1);
  }, 500);

  const handleSearchChange = (event) => {
    debouncedSearch(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleTransactionsPageChange = (event, newPage) => {
    setTransactionsPage(newPage);
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleInvestorSelect = (investor) => {
    setSelectedInvestor(investor);
    setEditMode(false);
    setTransactionsPage(1);
  };

  const contentScrollRef = React.useRef(null);
  const listScrollRef = React.useRef(null);
  useEffect(() => {
    if (selectedInvestor) {
      listScrollRef.current?.scrollTo?.(0, 0);
      document.querySelector('main')?.scrollTo?.(0, 0);
      window.scrollTo(0, 0);
    }
    if (selectedInvestor && investorDetails) {
      contentScrollRef.current?.scrollTo?.(0, 0);
    }
  }, [selectedInvestor?.id, investorDetails?.id]);

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    const originalValue = getOriginalFieldValue(field, investorDetails, selectedInvestor);
    const hasChanged = value !== originalValue;
    
    setChangedFields(prev => {
      const updated = { ...prev };
      if (hasChanged) {
        updated[field] = value;
      } else {
        delete updated[field];
      }
      return updated;
    });
    
    setHasDataChanged(Object.keys({ ...changedFields, ...(hasChanged ? { [field]: value } : {}) }).length > 0);
  };

  const handleTransactionInputChange = (field, value) => {
    setTransactionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const fetchMudarabahTemplate = async () => {
    try {
      const response = await getMudarabahTemplate();
      setMudarabahTemplate(response.content || '');
    } catch (error) {
      console.warn('Could not fetch Mudarabah template:', error);
      notifyError('حدث خطأ أثناء تحميل قالب العقد');
    }
  };

  const handleGenerateContractAfterUpdate = async (updatedInvestorData) => {
    try {
      const freshInvestorResponse = await getInvestorDetails(selectedInvestor.id);
      const freshInvestorData = extractInvestorDataFromResponse(freshInvestorResponse);

      const capitalAmount = updatedInvestorData.capitalAmount 
        ? Number(updatedInvestorData.capitalAmount)
        : extractCapitalAmount(freshInvestorData, selectedInvestor, investorDetails);

      const orgProfitPercent = Number(updatedInvestorData.orgProfitPercent || freshInvestorData.orgProfitPercent) || 0;
      
      const mergedData = {
        ...freshInvestorData,
        ...updatedInvestorData,
        capitalAmount,
        orgProfitPercent,
        investorProfitPercent: orgProfitPercent ? (100 - orgProfitPercent) : 0
      };

      await fetchMudarabahTemplate();
      setContractInvestorData(mergedData);
      setIsContractModalOpen(true);
      
      setTimeout(() => {
        if (contractGeneratorRef.current) {
          contractGeneratorRef.current.generateContract();
        }
      }, 500);
    } catch (error) {
      console.error('Error preparing contract generation:', error);
      notifyError('حدث خطأ أثناء تحضير توليد العقد');
    }
  };

  const handleSaveChanges = async () => {
    try {
      setIsSaving(true);
      
      // Build dataToSend with only changed fields
      const dataToSend = {};
      
      // Handle status field changes
      if (changedFields.status) {
        if (changedFields.status === 'NEW') {
          dataToSend.isNewPartner = true;
        } else if (changedFields.status === 'OLD') {
          dataToSend.isNewPartner = false;
        } else if (changedFields.status === 'WITHDRAWN') {
          dataToSend.withdrawingStatus = 'WITHDRAWN';
        }
      }
      
      // Add other changed fields
      Object.keys(changedFields).forEach(field => {
        if (field === 'status') return; // Already handled above
        
        const value = changedFields[field];
        
        if (field === 'capitalAmount') {
          dataToSend.capitalAmount = parseInt(value);
        } else if (field === 'orgProfitPercent') {
          dataToSend.orgProfitPercent = parseInt(value);
        } else if (field === 'createdAt') {
          dataToSend.createdAt = value;
        } else if (field === 'isActive') {
          dataToSend.isActive = value;
        } else {
          dataToSend[field] = value;
        }
      });
      
      // Only send request if there are changes
      if (Object.keys(dataToSend).length === 0) {
        notifyError('لا توجد تغييرات للحفظ');
        setIsSaving(false);
        return;
      }
      
      await updateInvestor(selectedInvestor.id, dataToSend);
      invalidateInvestorQueries(queryClient, selectedInvestor.id);
      notifySuccess('تم تحديث بيانات المستثمر بنجاح');
      
      const updatedInvestorResponse = await getInvestorDetails(selectedInvestor.id);
      const updatedInvestorData = extractInvestorDataFromResponse(updatedInvestorResponse);

      // استخدام extractCapitalAmount للحصول على رأس المال الأصلي الصحيح
      const originalCapital = extractCapitalAmount(investorDetails, selectedInvestor, investorDetails);
      const newCapital = Number(editFormData.capitalAmount) || Number(dataToSend.capitalAmount) || 0;
      
      // تحديث editFormData بالقيمة الجديدة من السيرفر
      const updatedCapitalAmount = extractCapitalAmount(updatedInvestorData, selectedInvestor, updatedInvestorData);
      setEditFormData(prev => ({
        ...prev,
        capitalAmount: updatedCapitalAmount || prev.capitalAmount,
        orgProfitPercent: updatedInvestorData.orgProfitPercent || prev.orgProfitPercent,
      }));
      
      if (originalCapital !== newCapital && newCapital > 0) {
        handleGenerateContractAfterUpdate({
          ...updatedInvestorData,
          capitalAmount: newCapital,
          orgProfitPercent: Number(editFormData.orgProfitPercent) || Number(updatedInvestorData.orgProfitPercent) || 0,
          investorProfitPercent: (100 - (Number(editFormData.orgProfitPercent) || Number(updatedInvestorData.orgProfitPercent) || 0))
        });
      } else {
        setEditMode(false);
        setHasDataChanged(false);
        setChangedFields({});
      }
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء تحديث البيانات');
      handleApiError(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleContractGenerated = () => {
    setIsContractModalOpen(false);
    setContractInvestorData(null);
    setEditMode(false);
    setHasDataChanged(false);
    setChangedFields({});

    if (selectedInvestor) {
      invalidateInvestorQueries(queryClient, selectedInvestor.id);
    }

    notifySuccess('تم توليد العقد الجديد بنجاح');
  };

  const handleContractPreviewClose = () => {
    setIsContractModalOpen(false);
    setContractInvestorData(null);
  };

  const handleAddInvestor = () => {
    navigate('/investors/add');
  };

  const handleDeleteInvestor = async (investorId) => {
    try {
      setIsDeleting(true);
      
      const currentIndex = investorsData?.partners?.findIndex(inv => inv.id === investorId) ?? -1;
      const nextInvestorId = currentIndex >= 0 && currentIndex < investorsData.partners.length - 1 
        ? investorsData.partners[currentIndex + 1]?.id
        : currentIndex > 0 
          ? investorsData.partners[currentIndex - 1]?.id
          : null;
      
      await deleteInvestorApi(investorId);
      
      setIsDeleteModalOpen(false);
      setInvestorToDelete(null);
      
      const refetchedData = await refetch();
      
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.OPENING_JOURNALS_CHECK] });
      queryClient.invalidateQueries({ queryKey: ['unposted-journals-all'] });
      
      if (selectedInvestor?.id === investorId) {
        if (nextInvestorId) {
          const nextInvestor = refetchedData.data?.partners?.find(inv => inv.id === nextInvestorId);
          setSelectedInvestor(nextInvestor || refetchedData.data?.partners?.[0] || null);
        } else {
          setSelectedInvestor(refetchedData.data?.partners?.[0] || null);
        }
      }
      
      notifySuccess('تم حذف المستثمر بنجاح');
    } catch (error) { 
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء حذف المستثمر');
      handleApiError(error);
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteModal = (investor) => {
    setInvestorToDelete(investor);
    setIsDeleteModalOpen(true);
  };

  const handleExportSpecificPartnerPDF = async () => {
    if (!selectedInvestor) {
      notifyError("يرجى اختيار مستثمر للتصدير");
      return;
    }
    
    try {
      setIsExporting(true);
      notifySuccess("جاري جلب بيانات المستثمر...");
      const partnerDetails = await getPartnerDetailsForExport(selectedInvestor.id);
      
      if (!partnerDetails) {
        notifyError("لا توجد بيانات للتصدير");
        return;
      }
      
      const { exportInvestorsToPDF } = await import("../../utilities/investorsExporter");
      const partnerData = [partnerDetails];
      await exportInvestorsToPDF(partnerData);
      notifySuccess(`تم تصدير بيانات ${selectedInvestor.name} إلى PDF بنجاح`);
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير PDF");
      console.error('PDF export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportSpecificPartnerExcel = async () => {
    if (!selectedInvestor) {
      notifyError("يرجى اختيار مستثمر للتصدير");
      return;
    }
    
    try {
      setIsExporting(true);
      notifySuccess("جاري جلب بيانات المستثمر...");
      const partnerDetails = await getPartnerDetailsForExport(selectedInvestor.id);
      
      if (!partnerDetails) {
        notifyError("لا توجد بيانات للتصدير");
        return;
      }

      const { exportInvestorsToExcel } = await import("../../utilities/investorsExporter");
      const partnerData = [partnerDetails];
      await exportInvestorsToExcel(partnerData);
      notifySuccess(`تم تصدير بيانات ${selectedInvestor.name} إلى Excel بنجاح`);
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير Excel");
      console.error('Excel export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const withdrawalPreview = useMemo(() => {
    return calculateWithdrawalPreview(withdrawAmount, investorDetails, withdrawPreviewData, formatArabicDate, firstPaymentDate);
  }, [withdrawAmount, investorDetails, withdrawPreviewData, firstPaymentDate]);

  const handleCancelWithdrawal = async () => {
    try {
      setIsWithdrawing(true);
      await cancelPartnerWithdrawal(selectedInvestor.id);
      
      setWithdrawnInvestors(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedInvestor.id);
        return newSet;
      });
      
      invalidateAllInvestorQueries(queryClient, selectedInvestor.id);
      queryClient.invalidateQueries({ queryKey: ['unposted-journals-all'] });
      
      notifySuccess(`تم إلغاء انسحاب المستثمر ${selectedInvestor.name} بنجاح`);
      setIsCancelWithdrawModalOpen(false);
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء إلغاء الانسحاب');
      handleApiError(error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleOpenWithdrawModal = async (isEditMode = false) => {
    if (!selectedInvestor) {
      notifyError("يرجى اختيار مستثمر");
      return;
    }

    // إذا كان المستثمر منسحب، افتح مودال التأكيد
    if (investorDetails?.WithdrawingStatus === 'WITHDRAWING' || investorDetails?.WithdrawingStatus === 'WITHDRAWN') {
      setIsCancelWithdrawModalOpen(true);
      return;
    }

    setWithdrawAmount("");
    setWithdrawPreviewData(null);
    setIsWithdrawEditMode(false);

    if (isEditMode) {
      setIsWithdrawEditMode(true);
    }
    setIsLoadingPreview(true);
    setIsWithdrawModalOpen(true);

    try {
      const response = await getWithdrawalPreview(selectedInvestor.id);
      setWithdrawPreviewData(response);

      if (isEditMode && response?.monthlyAmount) {
        setWithdrawAmount(response.monthlyAmount.toString());
      }
    } catch (error) {
      console.error('Error fetching preview data:', error);
      notifyError('حدث خطأ أثناء جلب بيانات التعثرات');
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleWithdraw = async (firstPaymentDate) => {
    if (!selectedInvestor) {
      notifyError("يرجى اختيار مستثمر");
      return;
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      notifyError("يرجى إدخال مبلغ صحيح");
      return;
    }

    if (!firstPaymentDate) {
      notifyError("يرجى إدخال تاريخ أول دفعة");
      return;
    }

    try {
      setIsWithdrawing(true);
      
      if (isWithdrawEditMode) {
        await updatePartnerWithdrawal(selectedInvestor.id, withdrawAmount, firstPaymentDate);
        invalidateAllInvestorQueries(queryClient, selectedInvestor.id);
        queryClient.invalidateQueries({ queryKey: ['unposted-journals-all'] });
        notifySuccess(`تم تعديل مبلغ الانسحاب للمستثمر ${selectedInvestor.name} بنجاح`);
      } else {
        await createPartnerWithdrawal(selectedInvestor.id, withdrawAmount, firstPaymentDate);
        setWithdrawnInvestors(prev => new Set(prev).add(selectedInvestor.id));
        invalidateInvestorQueries(queryClient, selectedInvestor.id);
        queryClient.invalidateQueries({ queryKey: ['unposted-journals-all'] });
        notifySuccess(`تم إنسحاب المستثمر ${selectedInvestor.name} من توزيعات الأرباح بنجاح`);
      }
      
      setIsWithdrawModalOpen(false);
      setWithdrawAmount("");
      setWithdrawPreviewData(null);
      setIsWithdrawEditMode(false);
    } catch (error) {
      notifyError(error.response?.data?.message || (isWithdrawEditMode ? 'حدث خطأ أثناء تعديل مبلغ الانسحاب' : 'حدث خطأ أثناء إنسحاب المستثمر'));
      handleApiError(error);
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleOpenEditWithdrawModal = () => {
    handleOpenWithdrawModal(true);
  };

  const handleOpenContractPreview = async () => {
    if (!selectedInvestor) {
      notifyError("يرجى اختيار مستثمر");
      return;
    }

    try {
      const freshInvestorResponse = await getInvestorDetails(selectedInvestor.id);
      const freshInvestorData = extractInvestorDataFromResponse(freshInvestorResponse);

      const capitalAmount = extractCapitalAmount(freshInvestorData, selectedInvestor, investorDetails);
      const orgProfitPercent = Number(freshInvestorData.orgProfitPercent || selectedInvestor.orgProfitPercent || 0);
      
      const templateResponse = await Api.get('/api/templates/mudarabah');
      setMudarabahTemplate(templateResponse.data.content || '');

      const investorData = {
        id: freshInvestorData.id || selectedInvestor.id,
        name: freshInvestorData.name || selectedInvestor.name || '',
        nationalId: freshInvestorData.nationalId || selectedInvestor.nationalId || '',
        address: freshInvestorData.address || selectedInvestor.address || '',
        city: freshInvestorData.city || selectedInvestor.city || '',
        phone: freshInvestorData.phone || selectedInvestor.phone || '',
        email: freshInvestorData.email || selectedInvestor.email || '',
        capitalAmount,
        orgProfitPercent,
        investorProfitPercent: orgProfitPercent ? (100 - orgProfitPercent) : 0
      };
      setContractInvestorData(investorData);
      setIsContractModalOpen(true);

      setTimeout(() => {
        if (contractGeneratorRef.current) {
          contractGeneratorRef.current.generateContract();
        }
      }, 500);

    } catch (error) {
      console.error('Error opening contract preview:', error);
      notifyError('حدث خطأ أثناء فتح معاينة العقد');
      handleApiError(error);
    }
  };

  const handleAddTransaction = () => {
    setTransactionForm({
      type: "DEPOSIT",
      amount: ""
    });
    setIsTransactionModalOpen(true);
  };

  const handleSaveTransaction = async () => {
    try {
      if (!transactionForm.amount || parseFloat(transactionForm.amount) <= 0) {
        notifyError("يرجى إدخال مبلغ صحيح");
        return;
      }

      setIsSavingTransaction(true);

      await createPartnerTransaction(selectedInvestor.id, {
        type: transactionForm.type,
        amount: parseFloat(transactionForm.amount)
      });

      invalidateInvestorQueries(queryClient, selectedInvestor.id);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PARTNER_TRANSACTIONS, selectedInvestor.id] });
      queryClient.invalidateQueries({ queryKey: ['unposted-journals-all'] });
      
      notifySuccess("تم إضافة العملية المالية بنجاح");
      setIsTransactionModalOpen(false);
      setTransactionForm({
        type: "DEPOSIT",
        amount: ""
      });
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء إضافة العملية المالية');
      handleApiError(error);
    } finally {
      setIsSavingTransaction(false);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      setIsDeletingTransaction(true);
      
      await deletePartnerTransaction(transactionId);
      
      invalidateInvestorQueries(queryClient, selectedInvestor.id);
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PARTNER_TRANSACTIONS, selectedInvestor.id] });
      queryClient.invalidateQueries({ queryKey: ['unposted-journals-all'] });
      
      notifySuccess("تم حذف العملية المالية بنجاح");
      setIsDeleteTransactionModalOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء حذف العملية المالية');
      handleApiError(error);
    } finally {
      setIsDeletingTransaction(false);
    }
  };

  const openDeleteTransactionModal = (transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteTransactionModalOpen(true);
  };

  const handleDownloadFile = async (fileUrl) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      
      const originalName = decodeURIComponent(investorDetails.mudarabahFileUrl.split('/').pop());
      const extension = originalName.split('.').pop();
      const newFileName = `mudarabah_${investorDetails.name}.${extension}`;
      
      const fileSaver = await import('file-saver');
      fileSaver.saveAs(blob, newFileName);
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء تحميل الملف');
      handleApiError(error);
    }
  };

  const handleShareFile = async (fileUrl) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      const originalName = decodeURIComponent(fileUrl.split('/').pop());
      const ext = originalName.split('.').pop();
      const fileName = `mudarabah_${investorDetails.name}.${ext}`;

      const file = new File([blob], fileName, { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: fileName,
          text: `مشاركة عقد المضاربة للعميل: ${investorDetails.name}`,
          files: [file],
        });
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fileUrl);
        notifySuccess("جهازك لا يدعم مشاركة الملفات — تم نسخ رابط الملف ✅");
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = fileUrl;
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand('copy');
          notifySuccess("جهازك لا يدعم مشاركة الملفات — تم نسخ رابط الملف ✅");
        } catch (err) {
          console.warn('Fallback copy method also failed:', err);
          notifyError("تعذرت نسخ رابط الملف تلقائياً — يرجى نسخه يدوياً");
        } finally {
          document.body.removeChild(textArea);
        }
      }

    } catch (error) {
      console.error("Share error:", error);
      notifyError("تعذرت مشاركة الملف");
    }
  };
  
  useEffect(() => {
    if (investorsData?.partners?.length > 0 && !selectedInvestor && !isMobile) {
      setSelectedInvestor(investorsData.partners[0]);
    }
    else if (selectedInvestor && investorsData?.partners?.length > 0) {
      const stillExists = investorsData.partners.some(investor => investor.id === selectedInvestor.id);
      if (!stillExists) {
        setSelectedInvestor(investorsData.partners[0]);
      }
    }
    else if (selectedInvestor && (!investorsData?.partners || investorsData.partners.length === 0)) {
      setSelectedInvestor(null);
    }
  }, [investorsData, selectedInvestor, isMobile]);

  useEffect(() => {
    if (investorDetails) {
      setEditFormData(buildEditFormData(investorDetails, selectedInvestor));
    }
  }, [investorDetails, selectedInvestor]);

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
        <title>المستثمرين</title>
        <meta name="description" content="المستثمرين" />
      </Helmet>

      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {(!isMobile || !selectedInvestor) && (
        <InvestorsList
          investorsData={investorsData}
          isLoading={isInvestorsLoading}
          selectedInvestor={selectedInvestor}
          showWithdrawnOnly={showWithdrawnOnly}
          search={search}
          selectedStatus={selectedStatus}
          selectedActiveStatus={selectedActiveStatus}
          onSearchChange={handleSearchChange}
          onStatusChange={(status) => {
            setSelectedStatus(prev => prev === status ? "" : status);
            setCurrentPage(1);
          }}
          onActiveStatusChange={(status) => {
            setSelectedActiveStatus(prev => prev === status ? "" : status);
            setCurrentPage(1);
          }}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onInvestorSelect={handleInvestorSelect}
          onAddInvestor={handleAddInvestor}
          onViewWithdrawn={() => navigate('/investors-withdraw')}
          permissions={permissions}
          isDarkMode={isDarkMode}
          listScrollRef={listScrollRef}
          isMobile={isMobile}
        />
        )}

        {(!isMobile || selectedInvestor) && (
          selectedInvestor && investorDetails ? (
            <Box sx={{ flex: 1, bgcolor: "background.paper", display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            <InvestorHeader
              investorDetails={investorDetails}
              isMobile={isMobile}
              onBackToList={() => setSelectedInvestor(null)}
              isExporting={isExporting}
              exportMenuAnchor={exportMenuAnchor}
              onExportMenuOpen={handleExportMenuOpen}
              onExportMenuClose={handleExportMenuClose}
              onExportExcel={handleExportSpecificPartnerExcel}
              onExportPDF={handleExportSpecificPartnerPDF}
              onWithdraw={() => handleOpenWithdrawModal(false)}
              onEdit={handleOpenEditWithdrawModal}
              onDelete={() => openDeleteModal(investorDetails)}
              permissions={permissions}
            />

            <Box ref={contentScrollRef} sx={{ flex: 1, overflowY: 'auto', p: { xs: 2, sm: 3 } }}>
              {/* Withdrawn Alert */}
              {(withdrawnInvestors.has(selectedInvestor?.id) || 
                investorDetails?.WithdrawingStatus === 'WITHDRAWING' || 
                investorDetails?.WithdrawingStatus === 'WITHDRAWN') && (
                <Alert 
                  severity="warning" 
                  sx={{ mb: 3 }}
                  icon={<WarningIcon />}
                >
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 0.5 }}>
                    تم إنسحاب هذا المستثمر من توزيعات الأرباح
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    لا يمكن تعديل أي بيانات خاصة بهذا المساهم
                  </Typography>
                </Alert>
              )}

              {/* Tabs */}
              {(isMobile || isSmallScreen) ? (
                <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                  <FormControl sx={{ minWidth: 200, maxWidth: 320, width: "100%" }}>
                    <Select
                      value={tab}
                      onChange={(e) => handleTabChange(null, e.target.value)}
                      size="small"
                      sx={{
                        "& .MuiSelect-select": { textAlign: "center", py: 1.25 },
                      }}
                    >
                      <MenuItem value={0}>التفاصيل الشخصية</MenuItem>
                      <MenuItem value={1}>المعلومات المالية</MenuItem>
                      <MenuItem value={2}>العمليات المالية</MenuItem>
                      <MenuItem value={3}>المستندات</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              ) : (
                <Tabs
                  value={tab}
                  onChange={handleTabChange}
                  textColor="primary"
                  indicatorColor="primary"
                  sx={{
                    mb: 3,
                    "& .MuiTab-root": {
                      color: "text.primary",
                      "&.Mui-selected": { color: "primary.main" },
                    },
                  }}
                >
                  <Tab label="التفاصيل الشخصية" />
                  <Tab label="المعلومات المالية" />
                  <Tab label="العمليات المالية" />
                  <Tab label="المستندات" />
                </Tabs>
              )}

              <Divider sx={{ mb: 3 }} />

              {/* Tab Content */}
              {tab === 0 && (
                <PersonalDetailsTab
                  investorDetails={investorDetails}
                  editMode={editMode}
                  editFormData={editFormData}
                  isMobile={isMobile}
                  onEditModeToggle={() => setEditMode(!editMode)}
                  onInputChange={handleInputChange}
                  onSaveChanges={handleSaveChanges}
                  isSaving={isSaving}
                  permissions={permissions}
                />
              )}

              {tab === 1 && (
                <FinancialInfoTab
                  investorDetails={investorDetails}
                  isMobile={isMobile}
                  editMode={editMode}
                  editFormData={editFormData}
                  hasDataChanged={hasDataChanged}
                  onEditModeToggle={() => {
                    const newEditMode = !editMode;
                    setEditMode(newEditMode);
                    if (!newEditMode) {
                      setEditFormData(buildEditFormData(investorDetails, selectedInvestor));
                      setHasDataChanged(false);
                      setChangedFields({});
                    }
                  }}
                  onInputChange={handleInputChange}
                  onSaveChanges={handleSaveChanges}
                  onGenerateContract={() => handleGenerateContractAfterUpdate({
                    ...investorDetails,
                    ...editFormData,
                    partnerProfitPercent: investorDetails.partnerProfitPercent || (100 - parseInt(editFormData.orgProfitPercent || investorDetails.orgProfitPercent))
                  })}
                  isSaving={isSaving}
                  permissions={permissions}
                  isDarkMode={isDarkMode}
                />
              )}

              {tab === 2 && (
                <TransactionsTab
                  transactionsData={transactionsData}
                  isLoading={isTransactionsLoading}
                  transactionsPage={transactionsPage}
                  onPageChange={handleTransactionsPageChange}
                  onAddTransaction={handleAddTransaction}
                  onDeleteTransaction={openDeleteTransactionModal}
                  permissions={permissions}
                  isDarkMode={isDarkMode}
                  isMobile={isSmallScreen}
                />
              )}

              {tab === 3 && (
                <DocumentsTab
                  investorDetails={investorDetails}
                  onDownloadFile={handleDownloadFile}
                  onShareFile={handleShareFile}
                  onOpenContractPreview={handleOpenContractPreview}
                  permissions={permissions}
                  isDarkMode={isDarkMode}
                />
              )}
            </Box>
            </Box>
          ) : (
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 2 }}>
            <Typography variant="h6" color="text.secondary">
              {selectedInvestor ? 'جاري تحميل البيانات...' : 'اختر مستثمراً لعرض التفاصيل'}
            </Typography>
            {selectedInvestor && (
              <Box sx={{ width: '100%', p: 2 }}>
                <Skeleton variant="rectangular" height={200} sx={{ mb: 2, borderRadius: 1 }} />
                <Skeleton variant="text" width="80%" height={32} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="60%" height={24} />
              </Box>
            )}
            </Box>
          )
        )}
      </Box>

      {/* Modals */}
      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteModalOpen(false);
            setInvestorToDelete(null);
          }
        }}
        onConfirm={() => {
          if (investorToDelete?.id) {
            handleDeleteInvestor(investorToDelete.id);
          } else {
            console.error('No investor ID found for deletion');
          }
        }}
        title="حذف المستثمر"
        message={`هل أنت متأكد من حذف المستثمر ${investorToDelete?.name}؟`}
        ButtonText="حذف"
        isLoading={isDeleting}
      />

      {contractInvestorData && mudarabahTemplate && (
        <ContractGenerator
          ref={contractGeneratorRef}
          investorData={contractInvestorData}
          templateContent={mudarabahTemplate}
          onContractGenerated={handleContractGenerated}
          onPreviewClose={handleContractPreviewClose}
          contractType="MUDARABAH_UPDATE"
        />
      )}

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => !isSavingTransaction && setIsTransactionModalOpen(false)}
        transactionForm={transactionForm}
        onInputChange={handleTransactionInputChange}
        onSave={handleSaveTransaction}
        isSaving={isSavingTransaction}
        permissions={permissions}
      />

      <DeleteModal
        open={isDeleteTransactionModalOpen}
        onClose={() => {
          if (!isDeletingTransaction) {
            setIsDeleteTransactionModalOpen(false);
            setTransactionToDelete(null);
          }
        }}
        onConfirm={() => {
          if (transactionToDelete?.id) {
            handleDeleteTransaction(transactionToDelete.id);
          }
        }}
        title="حذف العملية المالية"
        message={`هل أنت متأكد من حذف العملية المالية برقم المرجع ${transactionToDelete?.reference}؟`}
        ButtonText="حذف"
        isLoading={isDeletingTransaction}
      />

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => {
          setIsWithdrawModalOpen(false);
          setWithdrawAmount("");
          setFirstPaymentDate("");
          setWithdrawPreviewData(null);
          setIsWithdrawEditMode(false);
        }}
        isEditMode={isWithdrawEditMode}
        setIsEditMode={setIsWithdrawEditMode}
        withdrawAmount={withdrawAmount}
        setWithdrawAmount={setWithdrawAmount}
        firstPaymentDate={firstPaymentDate}
        setFirstPaymentDate={setFirstPaymentDate}
        withdrawalPreview={withdrawalPreview}
        isLoadingPreview={isLoadingPreview}
        investorDetails={investorDetails}
        permissions={permissions}
        isWithdrawing={isWithdrawing}
        onWithdraw={handleWithdraw}
        setWithdrawPreviewData={setWithdrawPreviewData}
        isDarkMode={isDarkMode}
      />

      <DeleteModal
        open={isCancelWithdrawModalOpen}
        onClose={() => setIsCancelWithdrawModalOpen(false)}
        onConfirm={handleCancelWithdrawal}
        title="إلغاء الانسحاب"
        message={`هل أنت متأكد من إلغاء انسحاب المستثمر ${selectedInvestor?.name}؟ سيتم حذف جدول السحب وإعادة المستثمر لحالته الطبيعية.`}
        ButtonText="إلغاء الانسحاب"
      />

    </Box>
  );
}
