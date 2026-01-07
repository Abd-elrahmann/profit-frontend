import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  Paper,
  Tabs,
  Tab,
  IconButton,
  Chip,
  InputAdornment,
  CircularProgress,
  Pagination,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  Stack,
  FormControl,
  Select,
  InputLabel,
  TablePagination,
  Alert,
} from "@mui/material";
import {
  Add,
  Edit,
  Save,
  Search,
  Download,
  CheckCircle,
  Delete,
  Share,
  PictureAsPdf,
  TableChart,
  Info,
  AccountBalanceWallet,
  Visibility,
  InsertDriveFile,
  Warning,
  Description,
  TrendingUp,
  Assessment,
  Mosque,
  Savings,
} from "@mui/icons-material";
import Api, { handleApiError } from "../../config/Api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { checkUnpostedOpeningJournals } from "../Journals/journalsApi";
import { debounce } from '../../utilities/debounce';
import AddInvestor from "../../components/modals/AddInvestor";
import DeleteModal from "../../components/modals/DeleteModal";
import ContractGenerator from "../../components/ContractGenerator";
import { notifyError, notifySuccess } from "../../utilities/toastify";
import { saveAs } from 'file-saver';
import dayjs from "dayjs";
import "dayjs/locale/ar";
import {StyledTableCell, StyledTableRow} from '../../components/layouts/tableLayout';
import { Helmet } from "react-helmet-async";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import { useTheme } from "../../theme/ThemeContext";
import { exportInvestorsToPDF, exportInvestorsToExcel } from "../../utilities/investorsExporter";
import { useNavigate } from "react-router-dom";

const getInvestors = async (page = 1, searchQuery = '', status = '', showWithdrawnOnly = false) => {
  let queryParams = new URLSearchParams();

  if (searchQuery.trim()) {
    if (/^\d+$/.test(searchQuery.trim())) {
      queryParams.append('nationalId', searchQuery.trim());
    } else {
      queryParams.append('name', searchQuery.trim());
    }
  }

  // استخدام تصنيف المستثمرين الجديد
  if (status.trim()) {
    if (status.trim() === 'قديم') {
      queryParams.append('isNewPartner', 'false');
    } else if (status.trim() === 'جديد') {
      queryParams.append('isNewPartner', 'true');
    } else if (status.trim() === 'منسحب') {
      queryParams.append('withdrawingStatus', 'WITHDRAWING,WITHDRAWN');
    }
  }

  // إضافة فلترة للمنسحبين فقط
  if (showWithdrawnOnly) {
    queryParams.append('withdrawingStatus', 'WITHDRAWING,WITHDRAWN');
  }

  queryParams.append('limit', '10');

  const queryString = queryParams.toString();
  const url = `/api/partners/all/${page}${queryString ? `?${queryString}` : ''}`;

  const response = await Api.get(url);
  return response.data;
};



const getPartnerDetailsForExport = async (partnerId) => {
  try {
    const response = await Api.get(`/api/partner-report/partner/${partnerId}`);
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const getInvestorDetails = async (investorId) => {
  const response = await Api.get(`/api/partners/${investorId}`);
  return response.data;
};


const getPartnerTransactions = async (partnerId, page = 1) => {
  const response = await Api.get(`/api/partners/transaction/${partnerId}/${page}`);
  return response.data;
};

const createPartnerTransaction = async (partnerId, transactionData) => {
  const response = await Api.post(`/api/partners/transaction/${partnerId}`, transactionData);
  return response.data;
};

const deletePartnerTransaction = async (transactionId) => {
  const response = await Api.delete(`/api/partners/transaction/${transactionId}`);
  return response.data;
};

export default function Investors() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedInvestor, setSelectedInvestor] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [investorToDelete, setInvestorToDelete] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [editFormData, setEditFormData] = useState({});
  const [hasDataChanged, setHasDataChanged] = useState(false);
  
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
  const [mudarabahTemplate, setMudarabahTemplate] = useState('');
  const contractGeneratorRef = useRef(null);

  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawnInvestors, setWithdrawnInvestors] = useState(new Set());
  
  const [isWithdrawEditMode, setIsWithdrawEditMode] = useState(false);
  const [withdrawPreviewData, setWithdrawPreviewData] = useState(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const [showWithdrawnOnly, setShowWithdrawnOnly] = useState(false);

  const { permissions } = usePermissions();
  const queryClient = useQueryClient();

  const { data: investorsData, isLoading: isInvestorsLoading, refetch } = useQuery({
    queryKey: ["investors", currentPage, search, selectedStatus, showWithdrawnOnly],
    queryFn: () => getInvestors(currentPage, search, selectedStatus, showWithdrawnOnly),
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

  // Check for unposted opening journals
  const { data: openingJournalsCheck } = useQuery({
    queryKey: ["opening-journals-check"],
    queryFn: () => checkUnpostedOpeningJournals(),
    retry: 1,
  });

  const formatArabicDate = (date) => {
    return dayjs(date)
      .locale("ar")
      .format("D [من] MMMM [الساعة] h:mm") // format without A
      + " "
      + (dayjs(date).hour() < 12 ? "صباحًا" : "مساءً");
  };

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
    if (field === 'capitalAmount' || field === 'orgProfitPercent') {
      const originalValue = field === 'capitalAmount'
        ? investorDetails.capitalAmount?.toString()
        : investorDetails.orgProfitPercent?.toString();
      setHasDataChanged(value !== originalValue);
    }
  };

  const handleTransactionInputChange = (field, value) => {
    setTransactionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const fetchMudarabahTemplate = async () => {
    try {
      const response = await Api.get('/api/templates/mudarabah');
      setMudarabahTemplate(response.data.content || '');
    } catch (error) {
      console.warn('Could not fetch Mudarabah template:', error);
      notifyError('حدث خطأ أثناء تحميل قالب العقد');
    }
  };

  const handleGenerateContractAfterUpdate = async (updatedInvestorData) => {
    try {
      await fetchMudarabahTemplate();
      setContractInvestorData(updatedInvestorData);
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
      // تحويل status إلى القيم المناسبة
      let isNewPartner = false;
      let withdrawingStatus = null;
      if (editFormData.status === 'NEW') {
        isNewPartner = true;
        withdrawingStatus = null;
      } else if (editFormData.status === 'OLD') {
        isNewPartner = false;
        withdrawingStatus = null;
      } else if (editFormData.status === 'WITHDRAWN') {
        // للمنسحبين نحتاج للحفاظ على القيمة الحالية أو تعيينها لـ WITHDRAWN
        withdrawingStatus = 'WITHDRAWN';
      }

      const { status: _status, ...restFormData } = editFormData;
      const dataToSend = {
        ...restFormData,
        isNewPartner,
        capitalAmount: editFormData.capitalAmount ? parseInt(editFormData.capitalAmount) : undefined,
        orgProfitPercent: editFormData.orgProfitPercent ? parseInt(editFormData.orgProfitPercent) : undefined,
        createdAt: editFormData.createdAt || undefined,
      };

      // إضافة withdrawingStatus فقط إذا كان منسحباً
      if (withdrawingStatus) {
        dataToSend.withdrawingStatus = withdrawingStatus;
      }
      
      await Api.patch(`/api/partners/${selectedInvestor.id}`, dataToSend);
      queryClient.invalidateQueries({ queryKey: ['investor-details', selectedInvestor.id] });
      queryClient.invalidateQueries({ queryKey: ['investors'] });
      notifySuccess('تم تحديث بيانات المستثمر بنجاح');
      
      const originalCapital = investorDetails.capitalAmount;
      const newCapital = parseInt(editFormData.capitalAmount);
      
      if (originalCapital !== newCapital) {
        handleGenerateContractAfterUpdate({
          ...investorDetails,
          ...dataToSend,
          partnerProfitPercent: investorDetails.partnerProfitPercent || (100 - parseInt(editFormData.orgProfitPercent))
        });
      } else {
        setEditMode(false);
        setHasDataChanged(false);
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

    // إعادة تحميل بيانات المستثمر لإظهار المستند الجديد
    if (selectedInvestor) {
      queryClient.invalidateQueries({ queryKey: ['investor-details', selectedInvestor.id] });
    }

    notifySuccess('تم توليد العقد الجديد بنجاح');
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
      
      await Api.delete(`/api/partners/${investorId}`);
      
      setIsDeleteModalOpen(false);
      setInvestorToDelete(null);
      
      // Refetch data
      const refetchedData = await refetch();
      
      // اختيار المستثمر التالي للعرض فقط (بدون تغيير حالته في قاعدة البيانات)
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
      
      // Convert partner details to array format for exporter
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

  const calculateWithdrawalPreview = (monthlyAmount) => {
    if (!investorDetails || !monthlyAmount || monthlyAmount <= 0) {
      return null;
    }

    const normalizeDecimal = (value) => parseFloat(Number(value).toFixed(2));

    // استخدام قيمة التعثرات من الـ API
    let partnerDefaultShare = withdrawPreviewData?.partnerDefaultShare || 0;
    
    if (partnerDefaultShare < 0) partnerDefaultShare = 0;
    partnerDefaultShare = normalizeDecimal(partnerDefaultShare);

    const totalAmount = investorDetails.capitalAmount + (investorDetails.totalProfit || 0);
    const remainingCapital = normalizeDecimal(totalAmount - partnerDefaultShare);
    
    const savingsAmount = investorDetails.totalSaving || 0;
    
    const monthlyPayment = normalizeDecimal(monthlyAmount);
    const schedule = [];
    let remaining = remainingCapital;
    let monthIndex = 1;
    const startDate = new Date();

    while (remaining > 0 && schedule.length < 100) {
      const amount = remaining - monthlyPayment > 0 ? monthlyPayment : remaining;
      
      const payDate = new Date(startDate);
      payDate.setMonth(startDate.getMonth() + monthIndex);

      schedule.push({
        month: monthIndex,
        date: formatArabicDate(payDate),
        amount: normalizeDecimal(amount),
        remaining: normalizeDecimal(remaining - amount)
      });

      remaining = normalizeDecimal(remaining - amount);
      monthIndex++;
    }

    return {
      originalCapital: investorDetails.capitalAmount,
      totalProfit: investorDetails.totalProfit || 0,
      totalAmount: totalAmount,
      estimatedDefaultShare: partnerDefaultShare,
      remainingCapital: remainingCapital,
      savingsAmount: savingsAmount,
      monthlyPayment: monthlyPayment,
      totalMonths: schedule.length,
      schedule: schedule
    };
  };

  const handleOpenWithdrawModal = async (isEditMode = false) => {
    if (!selectedInvestor) {
      notifyError("يرجى اختيار مستثمر");
      return;
    }

    // Reset all modal state first
    setWithdrawAmount("");
    setWithdrawPreviewData(null);
    setIsWithdrawEditMode(false);

    // Then set the correct mode if it's edit mode
    if (isEditMode) {
      setIsWithdrawEditMode(true);
    }
    setIsLoadingPreview(true);
    setIsWithdrawModalOpen(true);
    
    // Pre-fill amount if editing
    if (isEditMode) {
      setWithdrawAmount("");
    } else {
      setWithdrawAmount("");
    }

    try {
      const response = await Api.get(`/api/partner-withdraw/preview/${selectedInvestor.id}`);
      setWithdrawPreviewData(response.data);

      // Set the monthly amount from API response for edit mode
      if (isEditMode && response.data?.monthlyAmount) {
        setWithdrawAmount(response.data.monthlyAmount.toString());
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

    if (investorDetails?.isActive && !investorDetails?.isFrozen) {
      notifyError("هذا المستثمر نشط. لكي يتم تفعيل الإنسحاب لابد أن يكون المستثمر غير نشط");
      return;
    }

    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      notifyError("يرجى إدخال مبلغ صحيح");
      return;
    }

    try {
      setIsWithdrawing(true);
      
      if (isWithdrawEditMode) {
        // تعديل مبلغ الانسحاب
        await Api.patch(`/api/partner-withdraw/${selectedInvestor.id}`, {
          amount: parseFloat(withdrawAmount)
        });
        
        queryClient.invalidateQueries({ queryKey: ['investor-details', selectedInvestor.id] });
        queryClient.invalidateQueries({ queryKey: ['investors'] });
        queryClient.invalidateQueries({ queryKey: ['withdrawal-details', selectedInvestor.id] });
        
        notifySuccess(`تم تعديل مبلغ الانسحاب للمستثمر ${selectedInvestor.name} بنجاح`);
      } else {
        // إنشاء انسحاب جديد
        await Api.post(`/api/partner-withdraw/${selectedInvestor.id}`, {
          amount: parseFloat(withdrawAmount)
        });

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

  // Handle opening contract preview for missing mudarabah contract
  const handleOpenContractPreview = async () => {
    if (!selectedInvestor) {
      notifyError("يرجى اختيار مستثمر");
      return;
    }

    try {
      // Fetch mudarabah template
      const templateResponse = await Api.get('/api/templates/mudarabah');
      setMudarabahTemplate(templateResponse.data.content || '');

      // Prepare investor data for contract generation
      const investorData = {
        ...investorDetails,
        investorProfitPercent: investorDetails.orgProfitPercent ? (100 - investorDetails.orgProfitPercent) : 0
      };

      setContractInvestorData(investorData);
      setIsContractModalOpen(true);

      // Generate contract after a short delay
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
      
      saveAs(blob, newFileName);
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء تحميل الملف');
      handleApiError(error);
    }
  };

  // دالة للتحقق إذا كان الملف صورة
  const isImageFile = (url) => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext));
  };

  // دالة لعرض المعاينة المصغرة
  const renderFileThumbnail = (fileUrl, label) => {
    if (!fileUrl) return null;

    if (isImageFile(fileUrl)) {
      return (
        <Box
          component="img"
          src={fileUrl}
          alt={label}
          sx={{
            width: '100%',
            height: 180,
            objectFit: 'cover',
            borderRadius: 1,
            cursor: 'pointer',
            transition: 'transform 0.2s',
            '&:hover': {
              transform: 'scale(1.02)',
            },
          }}
          onClick={() => window.open(fileUrl, '_blank')}
        />
      );
    } else {
      // عرض أيقونة للملفات غير الصور (PDF, etc.)
      return (
        <Box
          sx={{
            width: '100%',
            height: 180,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: isDarkMode ? 'background.default' : '#f5f5f5',
            borderRadius: 1,
            cursor: 'pointer',
            transition: 'background-color 0.2s',
            '&:hover': {
              backgroundColor: isDarkMode ? 'action.hover' : '#e0e0e0',
            },
          }}
          onClick={() => window.open(fileUrl, '_blank')}
        >
          <InsertDriveFile sx={{ fontSize: 60, color: '#757575' }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            اضغط للعرض
          </Typography>
        </Box>
      );
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

      // Check if clipboard API is available before using it
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fileUrl);
        notifySuccess("جهازك لا يدعم مشاركة الملفات — تم نسخ رابط الملف ✅");
      } else {
        // Fallback: try to use the older execCommand method
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
      });
    }
  }, [investorDetails]);

  // دالة لتحديد تصنيف المستثمر
  const getInvestorStatus = (investor) => {
    if (investor?.WithdrawingStatus === 'WITHDRAWING' || investor?.WithdrawingStatus === 'WITHDRAWN') return 'WITHDRAWN';
    if (investor?.isNewPartner) return 'NEW';
    return 'OLD';
  };

  const getStatusColor = (investor) => {
    const status = typeof investor === 'object' ? getInvestorStatus(investor) : investor;
    switch (status) {
      case 'NEW':
        return 'success';
      case 'OLD':
        return 'info';
      case 'WITHDRAWN':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusText = (investor) => {
    const status = typeof investor === 'object' ? getInvestorStatus(investor) : investor;
    switch (status) {
      case 'NEW':
        return 'جديد';
      case 'OLD':
        return 'قديم';
      case 'WITHDRAWN':
        return 'منسحب';
      default:
        return 'غير معروف';
    }
  };

  const getTransactionTypeText = (type) => {
    switch (type) {
      case "DEPOSIT":
        return "إيداع";
      case "WITHDRAWAL":
        return "سحب من رأس المال";
      case "PROFIT_WITHDRAWAL":
        return "سحب أرباح";
      case "SAVING_WITHDRAWAL":
        return "سحب ادخار";
      default:
        return type;
    }
  };

  const getTransactionTypeColor = (type) => {
    switch (type) {
      case "DEPOSIT":
        return "success";
      case "WITHDRAWAL":
        return "error";
      case "PROFIT_WITHDRAWAL":
        return "warning";
      case "SAVING_WITHDRAWAL":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      <Helmet>
        <title>المستثمرين</title>
        <meta name="description" content="المستثمرين" />
      </Helmet>

      {openingJournalsCheck?.hasUnpostedOpeningJournals && (
  <Alert
    severity="warning"
    icon={<Warning />}
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
      {/* النص */}
      <Box>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          ⚠️ تنبيه مهم: يوجد {openingJournalsCheck.count} قيد افتتاحي غير معتمد
        </Typography>
        <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
          يرجى مراجعة صفحة القيود والتأكد من اعتماد جميع القيود الافتتاحية قبل إجراء أي معاملات لضمان سلامة البيانات المحاسبية.
        </Typography>
      </Box>

      {/* الزر */}
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


      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          bgcolor: "background.paper",
          borderBottom: "1px solid #ddd",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h5" fontWeight="bold">
            إدارة المستثمرين
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Visibility sx={{marginLeft: '10px'}} />}
            onClick={() => navigate('/investors-withdraw')}
            sx={{
              borderColor: "primary.main",
              color: "primary.main",
              "&:hover": { 
                bgcolor: "primary.50",
                borderColor: "primary.dark",
              },
              fontWeight: "bold",
              borderRadius: 2,
              px: 2,
              py: 0.75,
            }}
          >
            عرض المستثمرين المنسحبين
          </Button>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          {permissions.includes("partners_Add") && (
          <Button
            variant="contained"
            startIcon={<Add sx={{marginLeft: '10px'}} />}
            onClick={handleAddInvestor}
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
              fontWeight: "bold",
              borderRadius: 2,
              px: 2.5,
              py: 1,
            }}
          >
            إضافة مستثمر جديد
          </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
        <Box
          sx={{
            width: '350px',
            borderRight: "1px solid #ddd",
            bgcolor: isDarkMode ? 'background.default' : '#fafafa',
            height: "100%",
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0
          }}
        >
          <Box sx={{ p: 3, borderBottom: "1px solid #ddd", bgcolor: isDarkMode ? 'background.paper' : '#fafafa', flexShrink: 0 }}>
            <TextField
              placeholder="البحث بالاسم أو رقم الهوية"
              fullWidth
              size="small"
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
              <Chip
                label="الكل"
                color={selectedStatus === "" ? "primary" : "default"}
                variant="outlined"
                onClick={() => {
                  setSelectedStatus("");
                  setCurrentPage(1);
                }}
              />
              <Chip
                label="قديم"
                color={selectedStatus === "قديم" ? "info" : "default"}
                variant="outlined"
                onClick={() => {
                  setSelectedStatus(prev => prev === "قديم" ? "" : "قديم");
                  setCurrentPage(1);
                }}
              />
              <Chip
                label="جديد"
                color={selectedStatus === "جديد" ? "success" : "default"}
                variant="outlined"
                onClick={() => {
                  setSelectedStatus(prev => prev === "جديد" ? "" : "جديد");
                  setCurrentPage(1);
                }}
              />
              <Chip
                label="منسحب"
                color={selectedStatus === "منسحب" ? "warning" : "default"}
                variant="outlined"
                onClick={() => {
                  setSelectedStatus(prev => prev === "منسحب" ? "" : "منسحب");
                  setCurrentPage(1);
                }}
              />
            </Box>

            {/* زر قائمة المنسحبين */}
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                size="small"
                onClick={() => {
                  setShowWithdrawnOnly(prev => !prev);
                  setSelectedStatus(""); // إعادة تعيين الفلاتر الأخرى
                  setSearch(""); // إعادة تعيين البحث
                  setCurrentPage(1);
                }}
                sx={{
                  bgcolor: showWithdrawnOnly ? "warning.main" : "primary.main",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: 2,
                  px: 3,
                  py: 1,
                  "&:hover": {
                    bgcolor: showWithdrawnOnly ? "warning.dark" : "primary.main",
                  },
                  minWidth: '200px'
                }}
              >
                {showWithdrawnOnly ? "عرض المستثمرين الحاليين" : "قائمة المنسحبين"}
              </Button>
            </Box>
          </Box>

          {investorsData && !isInvestorsLoading && investorsData.partners && investorsData.partners.length > 0 && (
            <Box sx={{ p: 2, borderBottom: '1px solid #eee', bgcolor: isDarkMode ? 'background.paper' : '#f9f9f9', flexShrink: 0 }}>
              <Typography variant="body2" color="text.primary">
                صفحة {investorsData.currentPage} من {investorsData.totalPages} - إجمالي {investorsData.totalPartners} {showWithdrawnOnly ? 'مستثمر منسحب' : 'مستثمر'}
              </Typography>
            </Box>
          )}

          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {isInvestorsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3, minHeight: '200px' }}>
                <CircularProgress />
              </Box>
            ) : !investorsData || !investorsData.partners || investorsData.partners.length === 0 ? (
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                p: 4,
                flexDirection: 'column',
                minHeight: 'calc(100vh - 400px)',
                height: '100%'
              }}>
                <Typography variant="body1" color="text.secondary" textAlign="center" mb={2}>
                  {search || selectedStatus ? 'لم يتم العثور على مستثمرين مطابقين للبحث' : showWithdrawnOnly ? 'لا توجد مستثمرين منسحبين مسجلين في النظام' : 'لا توجد مستثمرين مسجلين في النظام'}
                </Typography>
              </Box>
            ) : (
              <>
                {investorsData.partners.map((investor) => {
                  const isSelected = selectedInvestor?.id === investor.id;
                  return (
                    <Card
                      key={investor.id}
                      onClick={() => handleInvestorSelect(investor)}
                      sx={{
                        mb: 1,
                        mx: 2,
                        mt: 2,
                        cursor: "pointer",
                        minHeight: '200px',
                        border: isSelected ? "2px solid" : "1px solid #E5E7EB",
                        borderColor: isSelected ? "primary.main" : "#E5E7EB",
                        bgcolor: isSelected ? "primary.50" : "background.paper",
                        transition: "0.2s",
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Box sx={{ flex: 1, mr: 2 }}>
                            <Typography fontWeight="bold" sx={{ fontSize: '0.95rem', mb: 0.5 }}>
                              {investor.name}
                            </Typography>
                            {(investor.WithdrawingStatus === 'WITHDRAWING' || investor.WithdrawingStatus === 'WITHDRAWN') && (
                              <Chip
                                label={investor.WithdrawingStatus === 'WITHDRAWING' ? 'جاري السحب' : 'تم السحب'}
                                size="small"
                                color={investor.WithdrawingStatus === 'WITHDRAWING' ? 'warning' : 'info'}
                                sx={{ fontSize: '0.65rem', height: '20px', mb: 0.5 }}
                              />
                            )}
                          </Box>
                          <Chip
                            label={getStatusText(investor)}
                            size="small"
                            color={getStatusColor(investor)}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" fontWeight={"bold"} sx={{ mb: 1 }}>
                          رأس المال: {(investor.capitalAmount + investor.newCapitalAmount + (investor.totalProfit || 0))?.toLocaleString()}
                        </Typography>
                        <Box sx={{ fontSize: '0.87rem' }}>
                          <Typography variant="body2" color="text.primary" component="div" sx={{ mb: 1 }}>
                            رأس مال أصلي <Box component="span" sx={{ fontWeight: 'bold', color: investor.capitalAmount > 0 ? 'primary.main' : 'inherit' }}>{investor.capitalAmount?.toLocaleString()}</Box>
                          </Typography>
                          <Typography variant="body2" color="text.primary" component="div" sx={{ mb: 1 }}>
                            رأس مال جديد <Box component="span" sx={{ fontWeight: 'bold', color: investor.newCapitalAmount > 0 ? 'success.main' : 'inherit' }}>{investor.newCapitalAmount?.toLocaleString()}</Box>
                          </Typography>
                          {(investor.totalProfit || 0) > 0 && (
                            <Typography variant="body2" color="text.primary" component="div" sx={{ mb: 1 }}>
                              أرباح <Box component="span" sx={{ fontWeight: 'bold', color: (investor.totalProfit || 0) > 0 ? 'primary.main' : 'inherit' }}>{investor.totalProfit?.toLocaleString() || 0}</Box>
                            </Typography>
                          )}
                        </Box>
                        {(investor.totalAvilableSaving || 0) > 0 && (
                          <Typography variant="body2" color="text.primary" component="div" sx={{ mb: 1 }}>
                            المدخرات المتاحة للسحب <Box component="span" sx={{ fontWeight: 'bold', color: (investor.totalAvilableSaving || 0) > 0 ? 'primary.main' : 'inherit' }}>{(investor.totalAvilableSaving || 0)?.toLocaleString()}</Box>
                          </Typography>
                        )}
                        <Typography variant="body2" color="success.main" fontWeight={"bold"}>
                          الأرباح القادمة: {(investor.upcomingProfit || 0)}
                        </Typography>
                        <Box display="flex" justifyContent="flex-end" mt={-5}>
                          {permissions.includes("partners_Delete") && (
                          <IconButton 
                            size="medium" 
                            color="error"
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteModal(investor);
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
                
                {investorsData && investorsData.totalPages > 1 && (
                  <Box sx={{ 
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    p: 2,
                    gap: 2,
                    borderTop: '1px solid #eee',
                    bgcolor: 'background.paper',
                  }}>
                    <Pagination
                      count={investorsData.totalPages}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                      size="small"
                      siblingCount={1}
                      boundaryCount={1}
                      sx={{
                        '& .MuiPaginationItem-root': {
                          fontSize: '0.875rem',
                        }
                      }}
                    />
                  </Box>
                )}
              </>
            )}
          </Box>
        </Box>

        {selectedInvestor && investorDetails ? (
          <Box sx={{ flex: 1, bgcolor: "background.paper", overflowY: "auto", position: 'relative' }}>
            <Box
              sx={{
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                bgcolor: 'background.paper',
                p: 2,
                borderBottom: '1px solid #ddd',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Box sx={{ minWidth: '200px' }}>
                <Typography variant="h6" fontWeight="bold" noWrap>
                  {investorDetails.name}
                </Typography>
                <Typography color="text.secondary" variant="body2" noWrap>
                  رقم الهوية: {investorDetails.nationalId}
                </Typography>
                {investorDetails.duration && (
                  <Typography color="primary.main" variant="body2" noWrap fontWeight="bold">
                    المدة: {
                      [
                        investorDetails.duration.years > 0 && `${investorDetails.duration.years} سنة`,
                        investorDetails.duration.months > 0 && `${investorDetails.duration.months} شهر`,
                        investorDetails.duration.days > 0 && `${investorDetails.duration.days} يوم`
                      ].filter(Boolean).join(' و ') || 'أقل من يوم'
                    }
                  </Typography>
                )}
              </Box>
              
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: 'flex-end' }}>
                {permissions.includes("partners_Export") && (
                <Button
                  variant="outlined"
                  startIcon={<PictureAsPdf sx={{marginLeft: '10px'}} />}
                  onClick={handleExportSpecificPartnerPDF}
                  disabled={isExporting}
                  sx={{
                    borderColor: "#d32f2f",
                    color: "#d32f2f",
                    "&:hover": { bgcolor: "rgba(211, 47, 47, 0.1)" },
                    borderRadius: 2,
                    px: 2,
                    fontWeight: "bold",
                  }}
                >
                  تصدير PDF
                </Button>
                )}
                {permissions.includes("partners_Export") && (
                <Button
                  variant="outlined"
                  startIcon={<TableChart sx={{marginLeft: '10px'}} />}
                  onClick={handleExportSpecificPartnerExcel}
                  disabled={isExporting}
                  sx={{
                    borderColor: "#2e7d32",
                    color: "#2e7d32",
                    "&:hover": { bgcolor: "rgba(46, 125, 50, 0.1)" },
                    borderRadius: 2,
                    px: 2,
                    fontWeight: "bold",
                  }}
                >
                  تصدير Excel
                </Button>
                )}
                {permissions.includes("partners_Add") && (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<AccountBalanceWallet sx={{marginLeft: '10px'}} />}
                    onClick={() => handleOpenWithdrawModal(false)}
                    disabled={isWithdrawing || investorDetails?.WithdrawingStatus === 'WITHDRAWING' || investorDetails?.WithdrawingStatus === 'WITHDRAWN'}
                    sx={{
                      borderColor: "#d32f2f",
                      color: "#d32f2f",
                      "&:hover": { bgcolor: "rgba(211, 47, 47, 0.1)" },
                      borderRadius: 2,
                      px: 2,
                      fontWeight: "bold",
                    }}
                  >
                    انسحاب المستثمر
                  </Button>
                  
                  {investorDetails?.WithdrawingStatus === 'WITHDRAWING' && (
                    <Button
                      variant="outlined"
                      startIcon={<Edit sx={{marginLeft: '10px'}} />}
                      onClick={handleOpenEditWithdrawModal}
                      disabled={isWithdrawing}
                      sx={{
                        borderColor: "#ed6c02",
                        color: "#ed6c02",
                        "&:hover": { bgcolor: "rgba(237, 108, 2, 0.1)" },
                        borderRadius: 2,
                        px: 2,
                        fontWeight: "bold",
                      }}
                    >
                      تعديل مبلغ الانسحاب
                    </Button>
                  )}
                </>
                )}
              </Box>
            </Box>

            <Box sx={{ p: 3 }}>
              {withdrawnInvestors.has(selectedInvestor?.id) && (
                <Alert 
                  severity="warning" 
                  sx={{ mb: 3 }}
                  icon={<Info />}
                >
                  <Typography variant="body2" fontWeight="bold">
                    تم إنسحاب هذا المستثمر من توزيعات الأرباح
                  </Typography>
                </Alert>
              )}
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

              {tab === 0 && (
                <Box>
                  <Paper sx={{ p: 3, mb: 3, bgcolor: "background.paper" }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                      <Typography variant="h6">المعلومات الشخصية</Typography>
                      <Box sx={{ display: "flex", gap: 2 }}>
                        {permissions.includes("partners_Update") && (
                        <Button
                          variant="outlined"
                          startIcon={<Edit sx={{marginLeft: '10px'}} />}
                          onClick={() => setEditMode(!editMode)}
                          size="small"
                        >
                          {editMode ? 'إلغاء التعديل' : 'تعديل'}
                        </Button>
                        )}
                        {permissions.includes("partners_Add") && (
                        <Button
                          variant="contained"
                          startIcon={<Save sx={{marginLeft: '10px'}} />}
                          sx={{ bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" } }}
                          disabled={!editMode}
                          onClick={handleSaveChanges}
                          size="small"
                        >
                          حفظ التغييرات
                        </Button>
                        )}
                      </Box>
                    </Box>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" mb={1} fontWeight={500}>الاسم الكامل</Typography>
                        <TextField 
                          value={editMode ? editFormData.name : investorDetails.name} 
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          fullWidth
                          disabled={!editMode}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: editMode ? (isDarkMode ? 'background.paper' : '#fff') : (isDarkMode ? 'background.default' : '#f9fafb'),
                              borderRadius: '6px',
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" mb={1} fontWeight={500}>البريد الإلكتروني</Typography>
                        <TextField 
                          value={editMode ? editFormData.email : investorDetails.email || 'لا يوجد بريد إلكتروني'} 
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          fullWidth
                          disabled={!editMode}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: editMode ? (isDarkMode ? 'background.paper' : '#fff') : (isDarkMode ? 'background.default' : '#f9fafb'),
                              borderRadius: '6px',
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" mb={1} fontWeight={500}>رقم الهوية الوطنية</Typography>
                        <TextField 
                          value={investorDetails.nationalId} 
                          fullWidth
                          disabled
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: isDarkMode ? 'background.default' : '#f9fafb',
                              borderRadius: '6px',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" mb={1} fontWeight={500}>رقم الجوال</Typography>
                        <TextField
                          value={editMode ? editFormData.phone : investorDetails.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          fullWidth
                          disabled={!editMode}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: editMode ? (isDarkMode ? 'background.paper' : '#fff') : (isDarkMode ? 'background.default' : '#f9fafb'),
                              borderRadius: '6px',
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="body2" mb={1} fontWeight={500}>العنوان</Typography>
                        <TextField
                          value={editMode ? editFormData.address : investorDetails.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          fullWidth
                          disabled={!editMode}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: editMode ? (isDarkMode ? 'background.paper' : '#fff') : (isDarkMode ? 'background.default' : '#f9fafb'),
                              borderRadius: '6px',
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" mb={1} fontWeight={500}>المدينة</Typography>
                        <TextField
                          value={editMode ? editFormData.city : investorDetails.city || ''}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          fullWidth
                          disabled={!editMode}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: editMode ? (isDarkMode ? 'background.paper' : '#fff') : (isDarkMode ? 'background.default' : '#f9fafb'),
                              borderRadius: '6px',
                              '&:hover fieldset': {
                                borderColor: 'primary.main',
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" mb={1} fontWeight={500}>تاريخ الانضمام الميلادي</Typography>
                        <TextField
                          type="date"
                          value={editMode ? editFormData.createdAt : (investorDetails.createdAt ? dayjs(investorDetails.createdAt).format('YYYY-MM-DD') : '')}
                          onChange={(e) => handleInputChange('createdAt', e.target.value)}
                          fullWidth
                          disabled={!editMode}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: editMode ? (isDarkMode ? 'background.paper' : '#fff') : (isDarkMode ? 'background.default' : '#f9fafb'),
                              borderRadius: '6px',
                              '&:hover fieldset': {
                                borderColor: editMode ? 'primary.main' : undefined,
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" mb={1} fontWeight={500}>تاريخ الانضمام الهجري</Typography>
                        <TextField
                          value={investorDetails.HIjriCreatedAt || ''}
                          fullWidth
                          disabled
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: isDarkMode ? 'background.default' : '#f9fafb',
                              borderRadius: '6px',
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" mb={1} fontWeight={500}>الحالة</Typography>
                        {editMode ? (
                          <Box>
                            <TextField
                              select
                              value={editFormData.status !== undefined ? editFormData.status : getInvestorStatus(investorDetails)}
                              onChange={(e) => handleInputChange('status', e.target.value)}
                              fullWidth
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  backgroundColor: isDarkMode ? 'background.paper' : '#ffffff',
                                  borderRadius: '6px',
                                },
                              }}
                            >
                              <MenuItem value="NEW">جديد</MenuItem>
                              <MenuItem value="OLD">قديم</MenuItem>
                              <MenuItem value="WITHDRAWN">منسحب</MenuItem>
                            </TextField>
                            {editFormData.status !== getInvestorStatus(investorDetails) && (
                              <Alert severity="info" sx={{ mt: 1, fontSize: '0.85rem' }}>
                                {editFormData.status === 'NEW' ?
                                  'سيتم تصنيف المستثمر كجديد' :
                                  editFormData.status === 'OLD' ?
                                  'سيتم تصنيف المستثمر كقديم' :
                                  'سيتم تصنيف المستثمر كمنسحب'}
                              </Alert>
                            )}
                          </Box>
                        ) : (
                          <TextField
                            value={getStatusText(investorDetails)}
                            fullWidth
                            disabled
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                backgroundColor: isDarkMode ? 'background.default' : '#f9fafb',
                                borderRadius: '6px',
                              },
                            }}
                          />
                        )}
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="body2" mb={1} fontWeight={500}>تصنيف المستثمر</Typography>
                        <TextField
                          value={getStatusText(investorDetails)}
                          fullWidth
                          disabled
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              backgroundColor: isDarkMode ? 'background.default' : '#f9fafb',
                              borderRadius: '6px',
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              )}

              {tab === 1 && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ mb: 3 }}>المعلومات المالية</Typography>

                  {/* Investment Group */}
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <AccountBalanceWallet sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'primary.main' }}>
                        الاستثمار
                      </Typography>
                    </Box>
                    <Grid container spacing={2} justifyContent="center">
                      <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{
                          border: '1px solid',
                          borderColor: 'primary.light',
                          bgcolor: 'primary.50',
                          minWidth: '280px',
                          maxWidth: '350px',
                          mx: 'auto'
                        }}>
                          <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                              رأس المال الأصلي
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ fontSize: '1.25rem' }}>
                              {investorDetails.capitalAmount?.toLocaleString() || 0}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{
                          border: '1px solid',
                          borderColor: 'info.light',
                          bgcolor: 'info.50',
                          minWidth: '280px',
                          maxWidth: '350px',
                          mx: 'auto'
                        }}>
                          <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                              رأس المال الجديد
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="info.main" sx={{ fontSize: '1.25rem' }}>
                              {investorDetails.newCapitalAmount?.toLocaleString() || 0}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{
                          border: '1px solid',
                          borderColor: 'success.light',
                          bgcolor: 'success.50',
                          minWidth: '280px',
                          maxWidth: '350px',
                          mx: 'auto'
                        }}>
                          <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                              إجمالي مبلغ الاستثمار
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ fontSize: '1.25rem' }}>
                              {investorDetails.total?.toLocaleString()}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{
                          border: '1px solid',
                          borderColor: 'warning.light',
                          bgcolor: 'warning.50',
                          minWidth: '280px',
                          maxWidth: '350px',
                          mx: 'auto'
                        }}>
                          <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                              نسبة رأس المال الجديد
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="warning.main" sx={{ fontSize: '1.25rem' }}>
                              {investorDetails.newCapitalPercent || 0}%
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Profits Group */}
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'primary.main' }}>
                        الأرباح والمدخرات
                      </Typography>
                    </Box>
                    <Grid container spacing={2} justifyContent="center">
                      <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{
                          border: '1px solid',
                          borderColor: 'primary.light',
                          bgcolor: 'primary.50',
                          minWidth: '280px',
                          maxWidth: '350px',
                          mx: 'auto'
                        }}>
                          <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                              الأرباح القادمة
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ fontSize: '1.25rem' }}>
                              {Math.round(investorDetails.upcomingProfit || 0)?.toLocaleString() || 0}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{
                          border: '1px solid',
                          borderColor: 'secondary.light',
                          bgcolor: 'secondary.50',
                          minWidth: '280px',
                          maxWidth: '350px',
                          mx: 'auto'
                        }}>
                          <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                              إجمالي الأرباح الفعلي
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ fontSize: '1.25rem' }}>
                              {investorDetails.totalProfit?.toLocaleString() || 0}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{
                          border: '1px solid',
                          borderColor: 'info.light',
                          bgcolor: 'info.50',
                          minWidth: '280px',
                          maxWidth: '350px',
                          mx: 'auto'
                        }}>
                          <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                              إجمالي الادخار
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="info.main" sx={{ fontSize: '1.25rem' }}>
                              {investorDetails.totalSaving?.toLocaleString() || 0}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Savings Details Group */}
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Savings sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'primary.main' }}>
                        تفاصيل المدخرات
                      </Typography>
                    </Box>
                    <Grid container spacing={2} justifyContent="center">
                      <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{
                          border: '1px solid',
                          borderColor: 'success.light',
                          bgcolor: 'success.50',
                          minWidth: '280px',
                          maxWidth: '350px',
                          mx: 'auto'
                        }}>
                          <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                              الرصيد المتاح للسحب
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ fontSize: '1.25rem' }}>
                              {investorDetails.totalAvilableSaving?.toLocaleString() || 0}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{
                          border: '1px solid',
                          borderColor: 'warning.light',
                          bgcolor: 'warning.50',
                          minWidth: '280px',
                          maxWidth: '350px',
                          mx: 'auto'
                        }}>
                          <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                              المبلغ المسحوب
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="warning.main" sx={{ fontSize: '1.25rem' }}>
                              {investorDetails.totalWithdrawal?.toLocaleString() || 0}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{
                          border: '1px solid',
                          borderColor: 'error.light',
                          bgcolor: 'error.50',
                          minWidth: '280px',
                          maxWidth: '350px',
                          mx: 'auto'
                        }}>
                          <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                              المبلغ المتبقي
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="error.main" sx={{ fontSize: '1.25rem' }}>
                              {((investorDetails.totalAvilableSaving || 0) - (investorDetails.totalWithdrawal || 0)).toLocaleString()}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Ratios Group */}
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Assessment sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'primary.main' }}>
                        النسب والمعدلات
                      </Typography>
                    </Box>
                    <Grid container spacing={2} justifyContent="center">
                      <Grid item xs={12} sm={6}>
                        <Card sx={{
                          border: '1px solid',
                          borderColor: 'success.light',
                          bgcolor: 'success.50',
                          minWidth: '280px',
                          maxWidth: '350px',
                          mx: 'auto'
                        }}>
                          <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                              نسبة أرباح المستثمر بالنسبة لباقي المستثمرين
                            </Typography>
                            <Typography variant="h5" fontWeight="bold" color="success.main">
                              {investorDetails.partnerProfitPercent}%
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Card sx={{
                          border: '1px solid',
                          borderColor: 'warning.light',
                          bgcolor: 'warning.50',
                          minWidth: '280px',
                          maxWidth: '350px',
                          mx: 'auto'
                        }}>
                          <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                              نسبة أرباح المنشأة
                            </Typography>
                            <Typography variant="h5" fontWeight="bold" color="warning.main">
                              {investorDetails.orgProfitPercent}%
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Zakat Group */}
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                      <Mosque sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1" fontWeight="bold" sx={{ color: 'primary.main' }}>
                        الزكاة السنوية
                      </Typography>
                    </Box>
                    <Grid container spacing={2} justifyContent="center">
                      <Grid item xs={12} sm={4}>
                        <Card sx={{
                          border: '1px solid',
                          borderColor: 'warning.light',
                          bgcolor: 'warning.50',
                          minWidth: '280px',
                          maxWidth: '350px',
                          mx: 'auto'
                        }}>
                          <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                              المستحقة
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="warning.main" sx={{ fontSize: '1.1rem' }}>
                              {investorDetails.yearlyZakatRequired?.toLocaleString() || 0}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Card sx={{
                          border: '1px solid',
                          borderColor: 'success.light',
                          bgcolor: 'success.50',
                          minWidth: '280px',
                          maxWidth: '350px',
                          mx: 'auto'
                        }}>
                          <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                              المدفوعة
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ fontSize: '1.1rem' }}>
                              {investorDetails.yearlyZakatPaid?.toLocaleString() || 0}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Card sx={{
                          border: '1px solid',
                          borderColor: 'error.light',
                          bgcolor: 'error.50',
                          minWidth: '280px',
                          maxWidth: '350px',
                          mx: 'auto'
                        }}>
                          <CardContent sx={{ p: 3, textAlign: 'center' }}>
                            <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontSize: '0.85rem' }}>
                              الرصيد
                            </Typography>
                            <Typography variant="h6" fontWeight="bold" color="error.main" sx={{ fontSize: '1.1rem' }}>
                              {investorDetails.yearlyZakatBalance?.toLocaleString() || 0}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Saving Progress Alert */}
                  {(() => {
                    const capital = investorDetails.capitalAmount || 0;
                    const saving = investorDetails.totalSaving || 0;
                    const difference = capital - saving;

                    if (saving === 0) return null;

                    return (
                      <Alert
                        severity={difference <= 0 ? "success" : "info"}
                        icon={<Info />}
                        sx={{ mb: 3, mt: 2 }}
                      >
                        <Typography variant="body2">
                          رأس مالك {capital.toLocaleString()} • ادخارك {saving.toLocaleString()}
                          {difference > 0 && (
                            <Typography component="span" fontWeight="bold" color="primary.main">
                              {" • ناقص " + difference.toLocaleString() + " عشان ينتهي ادخارك"}
                            </Typography>
                          )}
                          {difference === 0 && (
                            <Typography component="span" fontWeight="bold" color="success.main">
                              {" • رائع! وصل ادخارك لرأس المال بالضبط 🎉"}
                            </Typography>
                          )}
                          {difference < 0 && (
                            <Typography component="span" fontWeight="bold" color="success.main">
                              {" • مبروك! تجاوز ادخارك رأس المال بـ " + Math.abs(difference).toLocaleString() + " 🎊"}
                            </Typography>
                          )}
                        </Typography>
                      </Alert>
                    );
                  })()}

                  <Box sx={{ display: "flex", gap: 2, mb: 3, justifyContent: 'flex-end' }}>
                    {permissions.includes("partners_Update") && (
                    <Button
                      variant="outlined"
                      startIcon={<Edit sx={{marginLeft: '10px'}} />}
                      onClick={() => {
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
                      size="small"
                    >
                      {editMode ? 'إلغاء التعديل' : 'تعديل'}
                    </Button>
                    )}
                    {permissions.includes("partners_Add") && (
                    <Button
                      variant="contained"
                      startIcon={<Save sx={{marginLeft: '10px'}} />}
                      sx={{ bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" } }}
                      disabled={!editMode}
                      onClick={handleSaveChanges}
                      size="small"
                    >
                      حفظ التغييرات
                    </Button>
                    )}
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>رأس المال</Typography>
                      <TextField
                        value={editMode ? editFormData.capitalAmount || investorDetails.total : investorDetails.total?.toLocaleString()}
                        onChange={(e) => handleInputChange('capitalAmount', e.target.value)}
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: editMode ? (isDarkMode ? 'background.paper' : '#fff') : (isDarkMode ? 'background.default' : '#f9fafb'),
                            borderRadius: '6px',
                            width: '280px',
                            '&:hover fieldset': {
                              borderColor: editMode ? 'primary.main' : undefined,
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>نسبة أرباح المنشأة</Typography>
                      <TextField 
                        value={editMode ? editFormData.orgProfitPercent : investorDetails.orgProfitPercent} 
                        onChange={(e) => handleInputChange('orgProfitPercent', e.target.value)}
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: editMode ? (isDarkMode ? 'background.paper' : '#fff') : (isDarkMode ? 'background.default' : '#f9fafb'),
                            borderRadius: '6px',
                            width: '280px',
                            '&:hover fieldset': {
                              borderColor: 'primary.main',
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>نسبة أرباح المستثمر بالنسبة لباقي المستثمرين</Typography>
                      <TextField
                        value={investorDetails.partnerProfitPercent}
                        fullWidth
                        disabled
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: isDarkMode ? 'background.default' : '#f9fafb',
                            borderRadius: '6px',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>حساب رأس المال</Typography>
                      <TextField 
                        value={investorDetails.AccountEquity?.name} 
                        fullWidth
                        disabled
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: isDarkMode ? 'background.default' : '#f9fafb',
                            borderRadius: '6px',
                            width: '280px',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>حساب المستحقات</Typography>
                      <TextField 
                        value={investorDetails.AccountPayable?.name} 
                        fullWidth
                        disabled
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: isDarkMode ? 'background.default' : '#f9fafb',
                            borderRadius: '6px',
                            width: '280px',
                          },
                        }}
                      />
                    </Grid>
                  </Grid>

                  {hasDataChanged ? (
                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                      <Button
                        variant="outlined"
                        startIcon={<PictureAsPdf sx={{ marginLeft: '10px' }} />}
                        onClick={() => handleGenerateContractAfterUpdate({
                          ...investorDetails,
                          ...editFormData,
                          partnerProfitPercent: investorDetails.partnerProfitPercent || (100 - parseInt(editFormData.orgProfitPercent || investorDetails.orgProfitPercent))
                        })}
                        sx={{
                          borderColor: "#d32f2f",
                          color: "#d32f2f",
                          "&:hover": { bgcolor: "rgba(211, 47, 47, 0.1)" },
                        }}
                      >
                        توليد عقد مضاربة جديد
                      </Button>
                    </Box>
                  ) : null}
                </Paper>
              )}

              {tab === 2 && (
                <Box>
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    {permissions.includes("partners_Add") && (
                    <Button
                      variant="contained"
                      startIcon={<Add sx={{ marginLeft: '10px' }} />}
                      onClick={handleAddTransaction}
                      sx={{
                        bgcolor: "primary.main",
                        "&:hover": { bgcolor: "primary.dark" },
                        fontWeight: "bold",
                      }}
                    >
                      إضافة عملية مالية
                    </Button>
                    )}
                  </Box>

                  <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                    <TableContainer>
                      <Table stickyHeader>
                        <TableHead sx={{ bgcolor: isDarkMode ? 'background.default' : 'grey.50' }}>
                          <StyledTableRow>
                            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>رقم المرجع</StyledTableCell>
                            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>نوع العملية</StyledTableCell>
                            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>المبلغ</StyledTableCell>
                            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>التاريخ</StyledTableCell>
                            <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>الإجراءات</StyledTableCell>
                          </StyledTableRow>
                        </TableHead>
                        <TableBody>
                          {isTransactionsLoading ? (
                            <StyledTableRow>
                              <StyledTableCell colSpan={5} align="center">
                                <CircularProgress size={20} />
                              </StyledTableCell>
                            </StyledTableRow>
                          ) : transactionsData?.transactions?.length === 0 ? (
                            <StyledTableRow>
                              <StyledTableCell colSpan={5} align="center">
                                <Typography>لا توجد عمليات مالية</Typography>
                              </StyledTableCell>
                            </StyledTableRow>
                          ) : (
                            transactionsData?.transactions?.map((transaction) => (
                              <StyledTableRow key={transaction.id} hover>
                                <StyledTableCell align="center">{transaction.reference}</StyledTableCell>
                                <StyledTableCell align="center">
                                  <Chip
                                    label={getTransactionTypeText(transaction.type)}
                                    color={getTransactionTypeColor(transaction.type)}
                                    size="small"
                                  />
                                </StyledTableCell>
                              <StyledTableCell align="center" sx={{
                                color: transaction.type === "DEPOSIT" ? "success.main" : "error.main",
                                fontWeight: "bold"
                              }}>
                                {transaction.amount?.toLocaleString()}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                <Box>
                                  <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                                    {formatArabicDate(transaction.date)}
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '0.85rem' }}>
                                    {transaction.dateHijri}
                                  </Typography>
                                </Box>
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                  {permissions.includes("partners_Delete") && (
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => openDeleteTransactionModal(transaction)}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                  )}
                                </StyledTableCell>
                              </StyledTableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    {transactionsData && transactionsData.totalPages > 1 && (
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center',
                        p: 2, 
                        borderTop: '1px solid #eee',
                      }}>
                        <Pagination
                          count={transactionsData.totalPages}
                          page={transactionsPage}
                          onChange={handleTransactionsPageChange}
                          color="primary"
                          size="small"
                          siblingCount={1}
                          boundaryCount={1}
                        />
                      </Box>
                    )}
                  </Paper>
                </Box>
              )}

              {/* المستندات */}
              {tab === 3 && (
                <Box>
                  {/* Existing Documents */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>المستندات المرفوعة</Typography>

                    {/* Alert for missing Mudarabah Contract */}
                    {!investorDetails.mudarabahFileUrl && (
                      <Alert severity="warning" sx={{ mb: 3, alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                          <Warning fontSize="small" />
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" fontWeight="bold">
                              هذا المستثمر لم يتم حفظ عقد المضاربة الخاص به
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              يرجى فتح معاينة العقد وحفظه لضمان اكتمال المستندات
                            </Typography>
                          </Box>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Description />}
                            onClick={handleOpenContractPreview}
                            sx={{
                              borderColor: 'warning.main',
                              color: 'warning.main',
                              '&:hover': {
                                borderColor: 'warning.dark',
                                bgcolor: 'warning.50'
                              }
                            }}
                          >
                            فتح معاينة العقد
                          </Button>
                        </Box>
                      </Alert>
                    )}

                    <Grid container spacing={2}>
                      {/* Mudarabah Contract */}
                      {investorDetails.mudarabahFileUrl && (
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                          <Paper
                            sx={{
                              p: 2,
                              height: '100%',
                              display: "flex",
                              flexDirection: "column",
                              borderRadius: 2,
                              overflow: 'hidden',
                            }}
                            elevation={2}
                          >
                            {/* معاينة الملف */}
                            {renderFileThumbnail(investorDetails.mudarabahFileUrl, "عقد المضاربة")}

                            {/* اسم المستند وأزرار العمليات */}
                            <Box sx={{ mt: 2 }}>
                              <Box
                                display="flex"
                                alignItems="center"
                                gap={1}
                                mb={1}
                              >
                                <CheckCircle
                                  color="success"
                                  fontSize="small"
                                />
                                <Typography fontWeight="500" variant="body2">
                                  عقد المضاربة
                                </Typography>
                              </Box>

                              {/* أزرار العمليات */}
                              {permissions.includes("partners_Export") && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDownloadFile(investorDetails.mudarabahFileUrl)}
                                    title="تحميل"
                                  >
                                    <Download fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleShareFile(investorDetails.mudarabahFileUrl)}
                                    title="مشاركة"
                                  >
                                    <Share fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => window.open(investorDetails.mudarabahFileUrl, '_blank')}
                                    title="عرض"
                                  >
                                    <Visibility fontSize="small" />
                                  </IconButton>
                                </Box>
                              )}
                            </Box>
                          </Paper>
                        </Grid>
                      )}

                      {/* Withdrawal Receipt */}
                      {investorDetails.withdrawalReceipt && (
                        <Grid item xs={12} sm={6} md={4} lg={3}>
                          <Paper
                            sx={{
                              p: 2,
                              height: '100%',
                              display: "flex",
                              flexDirection: "column",
                              borderRadius: 2,
                              overflow: 'hidden',
                            }}
                            elevation={2}
                          >
                            {/* معاينة الملف */}
                            {renderFileThumbnail(investorDetails.withdrawalReceipt, "مخالصة مالية نهائية")}

                            {/* اسم المستند وأزرار العمليات */}
                            <Box sx={{ mt: 2 }}>
                              <Box
                                display="flex"
                                alignItems="center"
                                gap={1}
                                mb={1}
                              >
                                <PictureAsPdf
                                  color="error"
                                  fontSize="small"
                                />
                                <Typography fontWeight="500" variant="body2">
                                  مخالصة مالية نهائية
                                </Typography>
                              </Box>
                              <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                                عقد انسحاب المساهم
                              </Typography>

                              {/* أزرار العمليات */}
                              {permissions.includes("partners_Export") && (
                                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDownloadFile(investorDetails.withdrawalReceipt)}
                                    title="تحميل"
                                  >
                                    <Download fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleShareFile(investorDetails.withdrawalReceipt)}
                                    title="مشاركة"
                                  >
                                    <Share fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => window.open(investorDetails.withdrawalReceipt, '_blank')}
                                    title="عرض"
                                  >
                                    <Visibility fontSize="small" />
                                  </IconButton>
                                </Box>
                              )}
                            </Box>
                          </Paper>
                        </Grid>
                      )}

                      {/* No documents message */}
                      {!investorDetails.mudarabahFileUrl && !investorDetails.withdrawalReceipt && (
                        <Grid item xs={12}>
                          <Paper sx={{ p: 3, textAlign: 'center', mb: 3 }}>
                            <Typography color="text.secondary">لا توجد مستندات مرفوعة</Typography>
                          </Paper>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        ) : (
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" color="text.secondary">
              {selectedInvestor ? 'جاري تحميل البيانات...' : 'اختر مستثمراً لعرض التفاصيل'}
            </Typography>
            {selectedInvestor && <CircularProgress size={40} />}
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

      {/* Contract Generator Modal */}
      {contractInvestorData && mudarabahTemplate && (
        <ContractGenerator
          ref={contractGeneratorRef}
          investorData={contractInvestorData}
          templateContent={mudarabahTemplate}
          onContractGenerated={handleContractGenerated}
          contractType="MUDARABAH_UPDATE"
        />
      )}

      {/* Add Transaction Modal */}
      <Dialog 
        open={isTransactionModalOpen} 
        onClose={() => setIsTransactionModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            إضافة عملية مالية
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <FormControl fullWidth size="small">
              <TextField
                select
                label="نوع العملية"
                value={transactionForm.type}
                onChange={(e) => handleTransactionInputChange('type', e.target.value)}
              >
                <MenuItem value="DEPOSIT">إيداع</MenuItem>
                <MenuItem value="WITHDRAWAL">سحب من رأس المال</MenuItem>
                <MenuItem value="PROFIT_WITHDRAWAL">سحب أرباح</MenuItem>
                <MenuItem value="SAVING_WITHDRAWAL">سحب ادخار</MenuItem>
              </TextField>
            </FormControl>
            
            <TextField
              label="المبلغ"
              type="number"
              value={transactionForm.amount}
              onChange={(e) => handleTransactionInputChange('amount', e.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, flexDirection: 'row-reverse' }}>
          <Button 
            onClick={() => setIsTransactionModalOpen(false)}
            color="inherit"
          >
            إلغاء
          </Button>
          {permissions.includes("partners_Add") && (
          <Button 
            onClick={handleSaveTransaction}
            variant="contained"
            sx={{
              bgcolor: "primary.main",
              "&:hover": { bgcolor: "primary.dark" },
            }}
          >
            حفظ
          </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Transaction Modal */}
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

      {/* Withdraw Modal */}
      <Dialog 
        open={isWithdrawModalOpen} 
        onClose={() => {
          setIsWithdrawModalOpen(false);
          setWithdrawAmount("");
          setWithdrawPreviewData(null);
          setIsWithdrawEditMode(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">
            {isWithdrawEditMode ? 'تعديل مبلغ الانسحاب الشهري' : 'إنسحاب المستثمر من توزيعات الأرباح'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            {isLoadingPreview ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : isWithdrawEditMode ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  🔔 يمكنك تعديل المبلغ الشهري للانسحاب. سيتم إعادة حساب جدول السداد تلقائياً
                </Typography>
              </Alert>
            ) : (investorDetails?.WithdrawingStatus === 'WITHDRAWING' || investorDetails?.WithdrawingStatus === 'WITHDRAWN') && !isWithdrawEditMode ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  ⚠️ هذا المستثمر في حالة انسحاب بالفعل (الحالة: {
                    investorDetails?.WithdrawingStatus === 'WITHDRAWING' ? 'جاري السحب' : 'تم الانسحاب'
                  })
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  لا يمكن إنشاء طلب انسحاب جديد لمستثمر منسحب. يرجى مراجعة صفحة المستثمرين المنسحبين.
                </Typography>
              </Alert>
            ) : (investorDetails?.isActive && !investorDetails?.isFrozen) ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  هذا المستثمر نشط. لكي يتم تفعيل الإنسحاب لابد أن يكون المستثمر غير نشط
                </Typography>
              </Alert>
            ) : (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  🔔 أدخل المبلغ الشهري وسيتم عرض محاكاة السداد والمعادلات الحسابية
                </Typography>
              </Alert>
            )}
            
            {/* Current Information */}
            <Paper sx={{ p: 2.5, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>رأس المال الأصلي</Typography>
                  <Typography variant="h6" fontWeight="bold" color="primary">
                    {investorDetails?.capitalAmount?.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>نسبة أرباح المنشأة</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {investorDetails?.orgProfitPercent}%
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>المدخرات</Typography>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    {investorDetails?.totalSaving?.toLocaleString() || 0}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" mb={0.5}>إجمالي الأرباح</Typography>
                  <Typography variant="h6" fontWeight="bold" color="info.main">
                    {investorDetails?.totalProfit?.toLocaleString() || 0}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {isWithdrawEditMode && investorDetails?.withdrawalInfo?.monthlyAmount && (
              <Paper sx={{ p: 2, bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
                <Typography variant="body2" color="text.secondary" mb={0.5}>المبلغ الشهري الحالي</Typography>
                <Typography variant="h6" fontWeight="bold" color="warning.main">
                  {investorDetails?.withdrawalInfo?.monthlyAmount?.toLocaleString() || "غير محدد"}
                </Typography>
              </Paper>
            )}

            <TextField
              label={isWithdrawEditMode ? "المبلغ الشهري الجديد للسحب" : "المبلغ الشهري للسحب"}
              type="number"
              value={withdrawAmount}
              onChange={(e) => {
                const value = e.target.value;
                // السماح فقط بالأرقام والنقطة العشرية
                if (value === '' || /^\d*\.?\d*$/.test(value)) {
                  setWithdrawAmount(value);
                }
              }}
              fullWidth
              disabled={
                !isWithdrawEditMode && (
                  (investorDetails?.isActive && !investorDetails?.isFrozen) || 
                  investorDetails?.WithdrawingStatus === 'WITHDRAWING' || 
                  investorDetails?.WithdrawingStatus === 'WITHDRAWN'
                )
              }
              InputProps={{
                inputProps: { min: 0, step: 0.01 }
              }}
              helperText={
                isWithdrawEditMode
                  ? "أدخل المبلغ الشهري الجديد الذي يتم سحبه"
                  : (investorDetails?.WithdrawingStatus === 'WITHDRAWING' || investorDetails?.WithdrawingStatus === 'WITHDRAWN')
                    ? "المستثمر منسحب بالفعل"
                    : (investorDetails?.isActive && !investorDetails?.isFrozen) 
                      ? "لا يمكن تنفيذ الإنسحاب لأن المستثمر نشط" 
                      : "أدخل المبلغ الشهري الذي يتم سحبه"
              }
            />

            {withdrawAmount && parseFloat(withdrawAmount) > 0 && (isWithdrawEditMode || (!(investorDetails?.isActive && !investorDetails?.isFrozen) && 
             investorDetails?.WithdrawingStatus !== 'WITHDRAWING' && 
             investorDetails?.WithdrawingStatus !== 'WITHDRAWN')) && (() => {
              const numAmount = parseFloat(Number(withdrawAmount).toFixed(2));
              const preview = calculateWithdrawalPreview(numAmount);
              return preview ? (
                <>
                  <Divider sx={{ my: 1 }} />
                  
                  {/* Calculation Summary */}
                  <Paper sx={{ p: 2.5, bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
                    <Typography variant="subtitle2" fontWeight="bold" mb={2} color="success.main">
                      📊 محاكاة العملية الحسابية :
                    </Typography>
                    <Grid container spacing={2}>
                      {/* Step 1: Original Capital */}
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" color="text.secondary" mb={0.5}>
                            ① رأس المال الأصلي
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {preview.originalCapital.toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Step 2: Total Profit */}
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" color="text.secondary" mb={0.5}>
                            ② إجمالي الأرباح
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="bold" color="success.main">
                            + {preview.totalProfit.toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Step 3: Total Amount */}
                      <Grid item xs={12} sm={4}>
                        <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" color="text.secondary" mb={0.5}>
                            ③ إجمالي المبلغ
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="bold" color="primary">
                            {preview.totalAmount.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            = {preview.originalCapital.toLocaleString()} + {preview.totalProfit.toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Step 4: Default Share */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" color="text.secondary" mb={0.5}>
                            ④ خصم التعثر (يُحسب من النظام)
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="bold" color={preview.estimatedDefaultShare > 0 ? 'error' : 'success'}>
                            {preview.estimatedDefaultShare > 0 ? `- ${preview.estimatedDefaultShare.toLocaleString()}` : 'لا يوجد'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            نسبة تشغيلية = (100 - {investorDetails.orgProfitPercent}%) / 100
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Step 5: Remaining Capital for Schedule */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '2px solid', borderColor: 'primary.main' }}>
                          <Typography variant="body2" color="text.secondary" mb={0.5}>
                            ⑤ رأس المال للجدول
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="primary">
                            {preview.remainingCapital.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            = {preview.totalAmount.toLocaleString()} - {preview.estimatedDefaultShare.toLocaleString()}
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Savings (separate from schedule) */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ p: 1.5, bgcolor: isDarkMode ? 'background.default' : '#fffef0', borderRadius: 1, border: '1px solid #ffd700' }}>
                          <Typography variant="body2" color="text.secondary" mb={0.5}>
                            💰 الادخار (يُصرف منفصل)
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="bold" color="warning.main">
                            {preview.savingsAmount.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            لا يدخل في حساب الجدول
                          </Typography>
                        </Box>
                      </Grid>

                      {/* Number of payments */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ p: 1.5, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                          <Typography variant="body2" color="text.secondary" mb={0.5}>
                            📅 عدد الدفعات
                          </Typography>
                          <Typography variant="subtitle1" fontWeight="bold" color="info">
                            {preview.totalMonths} دفعة
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(() => {
                              const years = Math.floor(preview.totalMonths / 12);
                              const months = preview.totalMonths % 12;
                              if (years > 0 && months > 0) {
                                return `${years} سنة و ${months} شهر`;
                              } else if (years > 0) {
                                return `${years} سنة`;
                              } else {
                                return `${months} شهر`;
                              }
                            })()}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Paper>

                  {/* Schedule Preview */}
                  <Paper sx={{ p: 2.5, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
                    <Typography variant="subtitle2" fontWeight="bold" mb={2} color="info.main">
                      📅 جدول السداد الكامل ({preview.totalMonths} دفعة):
                    </Typography>
                    <TableContainer sx={{ maxHeight: 500 }}>
                      <Table size="small" stickyHeader>
                        <TableHead sx={{ bgcolor: 'info.100' }}>
                          <StyledTableRow>
                            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>الدفعة</StyledTableCell>
                            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>التاريخ</StyledTableCell>
                            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>المبلغ</StyledTableCell>
                            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>المتبقي</StyledTableCell>
                          </StyledTableRow>
                        </TableHead>
                        <TableBody>
                          {preview.schedule.map((item, index) => (
                            <StyledTableRow key={index} hover sx={{ 
                              bgcolor: index % 2 === 0 ? 'transparent' : 'rgba(25, 103, 210, 0.05)',
                              '&:hover': { bgcolor: 'rgba(25, 103, 210, 0.1)' }
                            }}>
                              <StyledTableCell align="center">{item.month}</StyledTableCell>
                              <StyledTableCell align="center">{item.date}</StyledTableCell>
                              <StyledTableCell align="center" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                                {item.amount.toLocaleString('en-US')}
                              </StyledTableCell>
                              <StyledTableCell align="center" sx={{ color: 'primary.main', fontWeight: 'bold' }}>
                                {item.remaining.toLocaleString('en-US')}
                              </StyledTableCell>
                            </StyledTableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>

                  <Alert severity="info" icon={<Info />}>
                    <Typography variant="body2">
                      ℹ️ <strong> منطق حساب الإنسحاب</strong>
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ mt: 1 }}>
                      • يتم حساب التعثر من القروض المتعثرة (حالة = متعثر) × النسبة التشغيلية<br/>
                      • رأس المال للجدول = (رأس المال + الأرباح) - خصم التعثر<br/>
                      • الادخار يُصرف منفصل ولا يدخل في جدول الدفعات<br/>
                      • عند التنفيذ الفعلي، سيتم حساب التعثر الحقيقي من القروض
                    </Typography>
                  </Alert>
                </>
              ) : null;
            })()}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 3, flexDirection: 'row-reverse' }}>
          <Button 
            onClick={() => {
              setIsWithdrawModalOpen(false);
              setWithdrawAmount("");
              setWithdrawPreviewData(null);
              setIsWithdrawEditMode(false);
            }}
            color="inherit"
            disabled={isWithdrawing}
          >
            إلغاء
          </Button>
          {permissions.includes("partners_Add") && (
          <Button 
            onClick={handleWithdraw}
            variant="contained"
            disabled={
              isWithdrawing || 
              !withdrawAmount || 
              parseFloat(withdrawAmount) <= 0 || 
              (!isWithdrawEditMode && (
                (investorDetails?.isActive && !investorDetails?.isFrozen) ||
                investorDetails?.WithdrawingStatus === 'WITHDRAWING' ||
                investorDetails?.WithdrawingStatus === 'WITHDRAWN'
              ))
            }
            sx={{
              bgcolor: isWithdrawEditMode ? "primary.main" : "#d32f2f",
              "&:hover": { bgcolor: isWithdrawEditMode ? "primary.dark" : "#b71c1c" },
            }}
          >
            {isWithdrawing ? <CircularProgress size={20} sx={{ color: 'white' }} /> : (isWithdrawEditMode ? 'تأكيد التعديل' : 'تأكيد الإنسحاب')}
          </Button>
          )}
        </DialogActions>
      </Dialog>

    </Box>
  );
}