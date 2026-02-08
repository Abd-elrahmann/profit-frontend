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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import WarningIcon from "@mui/icons-material/Warning";
import Api, { handleApiError } from "../../config/Api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { checkUnpostedOpeningJournals } from "../Journals/journalsApi";
import { debounce } from '../../utilities/debounce';
import AddInvestor from "../../components/modals/AddInvestor";
import DeleteModal from "../../components/modals/DeleteModal";
import TransactionModal from "../../components/modals/TransactionModal";
import WithdrawModal from "../../components/modals/WithdrawModal";
import ContractGenerator from "../../components/ContractGenerator";
import { notifyError, notifySuccess } from "../../utilities/toastify";
import dayjs from "dayjs";
import "dayjs/locale/ar";
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
  getInvestorStatus,
  calculateWithdrawalPreview,
  extractCapitalAmount,
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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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
  const [showAlert, setShowAlert] = useState(true);
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
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawnInvestors, setWithdrawnInvestors] = useState(new Set());
  
  const [isWithdrawEditMode, setIsWithdrawEditMode] = useState(false);
  const [withdrawPreviewData, setWithdrawPreviewData] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

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

  const { data: investorsData, isLoading: isInvestorsLoading, refetch } = useQuery({
    queryKey: ["investors", currentPage, search, selectedStatus, showWithdrawnOnly, selectedActiveStatus],
    queryFn: () => getInvestors(currentPage, search, selectedStatus, showWithdrawnOnly, selectedActiveStatus),
    retry: 1,
  });

  const { data: investorDetails } = useQuery({
    queryKey: ["investor-details", selectedInvestor?.id],
    queryFn: () => selectedInvestor ? getInvestorDetails(selectedInvestor.id) : null,
    enabled: !!selectedInvestor,
    retry: 1,
  });

  const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ["partner-transactions", selectedInvestor?.id, transactionsPage],
    queryFn: () => selectedInvestor ? getPartnerTransactions(selectedInvestor.id, transactionsPage) : null,
    enabled: !!selectedInvestor,
    retry: 1,
  });

  const { data: openingJournalsCheck } = useQuery({
    queryKey: ["opening-journals-check"],
    queryFn: () => checkUnpostedOpeningJournals(),
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

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Track which fields have changed
    let originalValue;
    switch(field) {
      case 'capitalAmount':
        originalValue = investorDetails.total?.toString() || investorDetails.capitalAmount?.toString();
        break;
      case 'orgProfitPercent':
        originalValue = investorDetails.orgProfitPercent?.toString();
        break;
      case 'name':
        originalValue = investorDetails.name;
        break;
      case 'phone':
        originalValue = investorDetails.phone;
        break;
      case 'address':
        originalValue = investorDetails.address;
        break;
      case 'city':
        originalValue = investorDetails.city;
        break;
      case 'email':
        originalValue = investorDetails.email;
        break;
      case 'createdAt':
        originalValue = investorDetails.createdAt ? dayjs(investorDetails.createdAt).format('YYYY-MM-DD') : '';
        break;
      case 'isActive':
        originalValue = investorDetails.isActive;
        break;
      case 'status':
        originalValue = getInvestorStatus(investorDetails);
        break;
      default:
        originalValue = investorDetails[field];
    }
    
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
      
      let freshInvestorData;
      if (freshInvestorResponse.partner) {
        freshInvestorData = freshInvestorResponse.partner;
      } else if (freshInvestorResponse.data && freshInvestorResponse.data.partner) {
        freshInvestorData = freshInvestorResponse.data.partner;
      } else {
        freshInvestorData = freshInvestorResponse;
      }

      const mergedData = {
        ...freshInvestorData,
        ...updatedInvestorData,
        capitalAmount: Number(updatedInvestorData.capitalAmount || freshInvestorData.capitalAmount) || 0,
        orgProfitPercent: Number(updatedInvestorData.orgProfitPercent || freshInvestorData.orgProfitPercent) || 0,
        investorProfitPercent: (updatedInvestorData.orgProfitPercent || freshInvestorData.orgProfitPercent) 
          ? (100 - Number(updatedInvestorData.orgProfitPercent || freshInvestorData.orgProfitPercent)) 
          : 0
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
        return;
      }
      
      await updateInvestor(selectedInvestor.id, dataToSend);
      queryClient.invalidateQueries({ queryKey: ['investor-details', selectedInvestor.id] });
      queryClient.invalidateQueries({ queryKey: ['investors'] });
      notifySuccess('تم تحديث بيانات المستثمر بنجاح');
      
      const updatedInvestorResponse = await getInvestorDetails(selectedInvestor.id);
      let updatedInvestorData;
      if (updatedInvestorResponse.partner) {
        updatedInvestorData = updatedInvestorResponse.partner;
      } else if (updatedInvestorResponse.data && updatedInvestorResponse.data.partner) {
        updatedInvestorData = updatedInvestorResponse.data.partner;
      } else {
        updatedInvestorData = updatedInvestorResponse;
      }

      const originalCapital = investorDetails?.partner?.capitalAmount || investorDetails?.capitalAmount || 0;
      const newCapital = Number(editFormData.capitalAmount) || Number(dataToSend.capitalAmount) || 0;
      
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
    }
  };

  const handleContractGenerated = () => {
    setIsContractModalOpen(false);
    setContractInvestorData(null);
    setEditMode(false);

    if (selectedInvestor) {
      queryClient.invalidateQueries({ queryKey: ['investor-details', selectedInvestor.id] });
    }

    notifySuccess('تم توليد العقد الجديد بنجاح');
  };

  const handleContractPreviewClose = () => {
    setIsContractModalOpen(false);
    setContractInvestorData(null);
    if (isAddModalOpen) {
      setIsAddModalOpen(false);
    }
  };

  const handleAddInvestor = () => {
    setIsAddModalOpen(true);
  };

  const handleDeleteInvestor = async (investorId) => {
    try {
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
      
      queryClient.invalidateQueries({ queryKey: ["opening-journals-check"] });
      
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
    return calculateWithdrawalPreview(withdrawAmount, investorDetails, withdrawPreviewData, formatArabicDate);
  }, [withdrawAmount, investorDetails, withdrawPreviewData]);

  const handleOpenWithdrawModal = async (isEditMode = false) => {
    if (!selectedInvestor) {
      notifyError("يرجى اختيار مستثمر");
      return;
    }

    // إذا كان المستثمر منسحب، قم بإلغاء الانسحاب مباشرة
    if (investorDetails?.WithdrawingStatus === 'WITHDRAWING' || investorDetails?.WithdrawingStatus === 'WITHDRAWN') {
      try {
        setIsWithdrawing(true);
        await cancelPartnerWithdrawal(selectedInvestor.id);
        
        setWithdrawnInvestors(prev => {
          const newSet = new Set(prev);
          newSet.delete(selectedInvestor.id);
          return newSet;
        });
        
        queryClient.invalidateQueries({ queryKey: ['investor-details', selectedInvestor.id] });
        queryClient.invalidateQueries({ queryKey: ['investors'] });
        queryClient.invalidateQueries({ queryKey: ['withdrawal-details', selectedInvestor.id] });
        
        notifySuccess(`تم إلغاء انسحاب المستثمر ${selectedInvestor.name} بنجاح`);
      } catch (error) {
        notifyError(error.response?.data?.message || 'حدث خطأ أثناء إلغاء الانسحاب');
        handleApiError(error);
      } finally {
        setIsWithdrawing(false);
      }
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

  const handleWithdraw = async () => {
    if (!selectedInvestor) {
      notifyError("يرجى اختيار مستثمر");
      return;
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      notifyError("يرجى إدخال مبلغ صحيح");
      return;
    }

    try {
      setIsWithdrawing(true);
      
      if (isWithdrawEditMode) {
        await updatePartnerWithdrawal(selectedInvestor.id, withdrawAmount);
        
        queryClient.invalidateQueries({ queryKey: ['investor-details', selectedInvestor.id] });
        queryClient.invalidateQueries({ queryKey: ['investors'] });
        queryClient.invalidateQueries({ queryKey: ['withdrawal-details', selectedInvestor.id] });
        
        notifySuccess(`تم تعديل مبلغ الانسحاب للمستثمر ${selectedInvestor.name} بنجاح`);
      } else {
        await createPartnerWithdrawal(selectedInvestor.id, withdrawAmount);

        setWithdrawnInvestors(prev => new Set(prev).add(selectedInvestor.id));
        
        queryClient.invalidateQueries({ queryKey: ['investor-details', selectedInvestor.id] });
        queryClient.invalidateQueries({ queryKey: ['investors'] });
        
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
      
      let freshInvestorData;
      if (freshInvestorResponse.partner) {
        freshInvestorData = freshInvestorResponse.partner;
      } else if (freshInvestorResponse.data && freshInvestorResponse.data.partner) {
        freshInvestorData = freshInvestorResponse.data.partner;
      } else if (freshInvestorResponse.data) {
        freshInvestorData = freshInvestorResponse.data;
      } else {
        freshInvestorData = freshInvestorResponse;
      }

      const capitalAmount = extractCapitalAmount(freshInvestorData, selectedInvestor, investorDetails);
      
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
        capitalAmount: capitalAmount,
        orgProfitPercent: Number(freshInvestorData.orgProfitPercent || selectedInvestor.orgProfitPercent || 0),
        investorProfitPercent: (freshInvestorData.orgProfitPercent || selectedInvestor.orgProfitPercent) 
          ? (100 - Number(freshInvestorData.orgProfitPercent || selectedInvestor.orgProfitPercent)) 
          : 0
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

      await createPartnerTransaction(selectedInvestor.id, {
        type: transactionForm.type,
        amount: parseFloat(transactionForm.amount)
      });

      queryClient.invalidateQueries({ queryKey: ['partner-transactions', selectedInvestor.id] });
      queryClient.invalidateQueries({ queryKey: ['investor-details', selectedInvestor.id] });
      queryClient.invalidateQueries({ queryKey: ['investors'] });
      
      notifySuccess("تم إضافة العملية المالية بنجاح");
      setIsTransactionModalOpen(false);
      setTransactionForm({
        type: "DEPOSIT",
        amount: ""
      });
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء إضافة العملية المالية');
      handleApiError(error);
    }
  };

  const handleDeleteTransaction = async (transactionId) => {
    try {
      await deletePartnerTransaction(transactionId);
      
      queryClient.invalidateQueries({ queryKey: ['partner-transactions', selectedInvestor.id] });
      queryClient.invalidateQueries({ queryKey: ['investor-details', selectedInvestor.id] });
      queryClient.invalidateQueries({ queryKey: ['investors'] });
      
      notifySuccess("تم حذف العملية المالية بنجاح");
      setIsDeleteTransactionModalOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء حذف العملية المالية');
      handleApiError(error);
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
    if (investorsData?.partners?.length > 0 && !selectedInvestor) {
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
  }, [investorsData, selectedInvestor]);

  useEffect(() => {
    if (investorDetails) {
      setEditFormData({
        name: investorDetails.name || '',
        phone: investorDetails.phone || '',
        address: investorDetails.address || '',
        city: investorDetails.city || '',
        email: investorDetails.email || '',
        orgProfitPercent: investorDetails.orgProfitPercent || '',
        capitalAmount: investorDetails.total || '',
        status: getInvestorStatus(investorDetails),
        createdAt: investorDetails.createdAt ? dayjs(investorDetails.createdAt).format('YYYY-MM-DD') : '',
        isActive: investorDetails.isActive !== undefined ? investorDetails.isActive : true,
      });
    }
  }, [investorDetails]);

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

      {/* Opening Journals Alert */}
      {showAlert && openingJournalsCheck?.hasUnpostedOpeningJournals && (
        <Alert
          severity="warning"
          icon={<WarningIcon />}
          action={
            <IconButton size="small" onClick={() => setShowAlert(false)}>
              <CloseIcon />
            </IconButton>
          }
          sx={{
            mx: 2,
            mt: 2,
            mb: 1,
            borderRadius: 2,
            boxShadow: 2,
            border: '2px solid #f59e0b',
            '& .MuiAlert-message': {
              width: '100%',
            },
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              flexWrap: 'wrap'
            }}
          >
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                ⚠️ تنبيه مهم: يوجد {openingJournalsCheck.count} قيد افتتاحي غير معتمد
              </Typography>
              <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                يرجى مراجعة صفحة القيود والتأكد من اعتماد جميع القيود الافتتاحية قبل إجراء أي معاملات لضمان سلامة البيانات المحاسبية.
              </Typography>
            </Box>
            <Button
              size="small"
              color="primary"
              onClick={() => navigate('/journal-entries')}
              sx={{
                fontWeight: 600,
                textTransform: 'none',
                whiteSpace: 'nowrap'
              }}
            >
              الذهاب للقيود
            </Button>
          </Box>
        </Alert>
      )}

      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Investors List Sidebar */}
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
        />

        {/* Main Content */}
        {selectedInvestor && investorDetails ? (
          <Box sx={{ flex: 1, bgcolor: "background.paper", overflowY: "auto", position: 'relative' }}>
            {/* Header */}
            <InvestorHeader
              investorDetails={investorDetails}
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

            <Box sx={{ p: 3 }}>
              {/* Withdrawn Alert */}
              {withdrawnInvestors.has(selectedInvestor?.id) && (
                <Alert 
                  severity="warning" 
                  sx={{ mb: 3 }}
                  icon={<WarningIcon />}
                >
                  <Typography variant="body2" fontWeight="bold">
                    تم إنسحاب هذا المستثمر من توزيعات الأرباح
                  </Typography>
                </Alert>
              )}

              {/* Tabs */}
              <Tabs
                value={tab}
                onChange={handleTabChange}
                textColor="primary"
                indicatorColor="primary"
                sx={{
                  mb: 3,
                  '& .MuiTab-root': {
                    color: 'text.primary',
                    '&.Mui-selected': {
                      color: 'primary.main',
                    },
                  },
                }}
              >
                <Tab label="التفاصيل الشخصية" />
                <Tab label="المعلومات المالية" />
                <Tab label="العمليات المالية" />
                <Tab label="المستندات" />
              </Tabs>

              <Divider sx={{ mb: 3 }} />

              {/* Tab Content */}
              {tab === 0 && (
                <PersonalDetailsTab
                  investorDetails={investorDetails}
                  editMode={editMode}
                  editFormData={editFormData}
                  onEditModeToggle={() => setEditMode(!editMode)}
                  onInputChange={handleInputChange}
                  onSaveChanges={handleSaveChanges}
                  permissions={permissions}
                  isDarkMode={isDarkMode}
                />
              )}

              {tab === 1 && (
                <FinancialInfoTab
                  investorDetails={investorDetails}
                  editMode={editMode}
                  editFormData={editFormData}
                  hasDataChanged={hasDataChanged}
                  onEditModeToggle={() => {
                    const newEditMode = !editMode;
                    setEditMode(newEditMode);
                    if (!newEditMode) {
                      setEditFormData({
                        name: investorDetails.name || '',
                        phone: investorDetails.phone || '',
                        address: investorDetails.address || '',
                        city: investorDetails.city || '',
                        email: investorDetails.email || '',
                        orgProfitPercent: investorDetails.orgProfitPercent || '',
                        capitalAmount: investorDetails.total || '',
                        status: getInvestorStatus(investorDetails),
                        createdAt: investorDetails.createdAt ? dayjs(investorDetails.createdAt).format('YYYY-MM-DD') : '',
                      });
                      setHasDataChanged(false);
                    }
                  }}
                  onInputChange={handleInputChange}
                  onSaveChanges={handleSaveChanges}
                  onGenerateContract={() => handleGenerateContractAfterUpdate({
                    ...investorDetails,
                    ...editFormData,
                    partnerProfitPercent: investorDetails.partnerProfitPercent || (100 - parseInt(editFormData.orgProfitPercent || investorDetails.orgProfitPercent))
                  })}
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
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
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
        )}
      </Box>

      {/* Modals */}
      <AddInvestor
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => {
          setIsAddModalOpen(false);
          refetch();
          queryClient.invalidateQueries({ queryKey: ["opening-journals-check"] });
        }}
      />

      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setInvestorToDelete(null);
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
        onClose={() => setIsTransactionModalOpen(false)}
        transactionForm={transactionForm}
        onInputChange={handleTransactionInputChange}
        onSave={handleSaveTransaction}
        permissions={permissions}
      />

      <DeleteModal
        open={isDeleteTransactionModalOpen}
        onClose={() => {
          setIsDeleteTransactionModalOpen(false);
          setTransactionToDelete(null);
        }}
        onConfirm={() => {
          if (transactionToDelete?.id) {
            handleDeleteTransaction(transactionToDelete.id);
          }
        }}
        title="حذف العملية المالية"
        message={`هل أنت متأكد من حذف العملية المالية برقم المرجع ${transactionToDelete?.reference}؟`}
        ButtonText="حذف"
      />

      <WithdrawModal
        isOpen={isWithdrawModalOpen}
        onClose={() => {
          setIsWithdrawModalOpen(false);
          setWithdrawAmount("");
          setWithdrawPreviewData(null);
          setIsWithdrawEditMode(false);
        }}
        isEditMode={isWithdrawEditMode}
        setIsEditMode={setIsWithdrawEditMode}
        withdrawAmount={withdrawAmount}
        setWithdrawAmount={setWithdrawAmount}
        withdrawalPreview={withdrawalPreview}
        isLoadingPreview={isLoadingPreview}
        investorDetails={investorDetails}
        permissions={permissions}
        isWithdrawing={isWithdrawing}
        onWithdraw={handleWithdraw}
        setWithdrawPreviewData={setWithdrawPreviewData}
        isDarkMode={isDarkMode}
      />

    </Box>
  );
}
