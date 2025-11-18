import React, { useState, useEffect } from "react";
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
} from "@mui/material";
import {
  Add,
  Edit,
  Save,
  Search,
  Download,
  CheckCircle,
  Print,
  Delete,
  Share,
  PictureAsPdf,
  TableChart,
} from "@mui/icons-material";
import Api, { handleApiError } from "../../config/Api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce } from 'lodash';
import AddInvestor from "../../components/modals/AddInvestor";
import DeleteModal from "../../components/modals/DeleteModal";
import { notifyError, notifySuccess } from "../../utilities/toastify";
import { saveAs } from 'file-saver';
import dayjs from "dayjs";
import {StyledTableCell, StyledTableRow} from '../../components/layouts/tableLayout';
import { Helmet } from "react-helmet-async";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import { exportInvestorsToPDF, exportInvestorsToExcel } from "../../utilities/investorsExporter";
const getInvestors = async (page = 1, searchQuery = '', status = '') => {
  let queryParams = new URLSearchParams();
  
  if (searchQuery.trim()) {
    if (/^\d+$/.test(searchQuery.trim())) {
      queryParams.append('nationalId', searchQuery.trim());
    } else {
      queryParams.append('name', searchQuery.trim());
    }
  }
  
  if (status.trim()) {
    queryParams.append('isActive', status.trim() === 'نشط' ? 'true' : 'false');
  }

  queryParams.append('limit', '10');
  
  const queryString = queryParams.toString();
  const url = `/api/partners/all/${page}${queryString ? `?${queryString}` : ''}`;
  
  const response = await Api.get(url);
  return response.data;
};

// Get all investors for export (without pagination)
const getAllInvestorsForExport = async (searchQuery = '', status = '') => {
  try {
    let queryParams = new URLSearchParams();
    
    if (searchQuery.trim()) {
      if (/^\d+$/.test(searchQuery.trim())) {
        queryParams.append('nationalId', searchQuery.trim());
      } else {
        queryParams.append('name', searchQuery.trim());
      }
    }
    
    if (status.trim()) {
      queryParams.append('isActive', status.trim() === 'نشط' ? 'true' : 'false');
    }

    // Fetch first page to get total count
    queryParams.append('limit', '10');
    const firstPageUrl = `/api/partners/all/1${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const firstResponse = await Api.get(firstPageUrl);
    
    const allInvestors = [...(firstResponse.data.partners || [])];
    const total = firstResponse.data.totalPartners || allInvestors.length;
    const limit = 10; // Default limit per page
    const totalPages = Math.ceil(total / limit);
    
    // Fetch remaining pages if there are more
    if (totalPages > 1) {
      for (let page = 2; page <= totalPages; page++) {
        queryParams.set('page', page);
        const pageUrl = `/api/partners/all/${page}?${queryParams.toString()}`;
        const pageResponse = await Api.get(pageUrl);
        allInvestors.push(...(pageResponse.data.partners || []));
      }
    }
    
    // Fetch details and transactions for each investor
    const investorsWithDetails = await Promise.all(
      allInvestors.map(async (investor) => {
        try {
          // Get investor details
          const detailsResponse = await Api.get(`/api/partners/${investor.id}`);
          const details = detailsResponse.data;
          
          // Get transactions (fetch multiple pages for export)
          let transactions = [];
          try {
            const firstTransactionsResponse = await Api.get(`/api/partners/transaction/${investor.id}/1`);
            transactions = [...(firstTransactionsResponse.data.transactions || [])];
            const totalTransactions = firstTransactionsResponse.data.total || 0;
            const transactionsLimit = 10; // Default limit per page
            const totalTransactionsPages = Math.ceil(totalTransactions / transactionsLimit);
            
            // Fetch remaining transaction pages (limit to 5 pages max to avoid too many requests)
            const maxPages = Math.min(totalTransactionsPages, 5);
            for (let page = 2; page <= maxPages; page++) {
              const pageResponse = await Api.get(`/api/partners/transaction/${investor.id}/${page}`);
              transactions.push(...(pageResponse.data.transactions || []));
            }
          } catch (error) {
            console.warn(`Could not fetch transactions for investor ${investor.id}:`, error);
          }
          
          return {
            ...investor,
            ...details,
            transactions
          };
        } catch (error) {
          console.warn(`Could not fetch details for investor ${investor.id}:`, error);
          return investor;
        }
      })
    );
    
    return investorsWithDetails;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

const getInvestorDetails = async (investorId) => {
  const response = await Api.get(`/api/partners/${investorId}`);
  return response.data;
};

// New API functions for transactions
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
  
  // New states for transactions
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionForm, setTransactionForm] = useState({
    type: "DEPOSIT",
    amount: ""
  });
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionToDelete, setTransactionToDelete] = useState(null);
  const [isDeleteTransactionModalOpen, setIsDeleteTransactionModalOpen] = useState(false);
  const { permissions } = usePermissions();
  const queryClient = useQueryClient();

  const { data: investorsData, isLoading: isInvestorsLoading, refetch } = useQuery({
    queryKey: ["investors", currentPage, search, selectedStatus],
    queryFn: () => getInvestors(currentPage, search, selectedStatus),
    retry: 1,
  });

  const { data: investorDetails } = useQuery({
    queryKey: ["investor-details", selectedInvestor?.id],
    queryFn: () => selectedInvestor ? getInvestorDetails(selectedInvestor.id) : null,
    enabled: !!selectedInvestor,
    retry: 1,
  });

  // New query for transactions
  const { data: transactionsData, isLoading: isTransactionsLoading } = useQuery({
    queryKey: ["partner-transactions", selectedInvestor?.id, transactionsPage],
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
    setTransactionsPage(1); // Reset transactions page when selecting new investor
  };

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTransactionInputChange = (field, value) => {
    setTransactionForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const dataToSend = {
        ...editFormData,
        capitalAmount: editFormData.capitalAmount ? parseInt(editFormData.capitalAmount) : undefined,
        orgProfitPercent: editFormData.orgProfitPercent ? parseInt(editFormData.orgProfitPercent) : undefined
      };
      
      await Api.patch(`/api/partners/${selectedInvestor.id}`, dataToSend);
      queryClient.invalidateQueries({ queryKey: ['investor-details', selectedInvestor.id] });
      queryClient.invalidateQueries({ queryKey: ['investors'] });
      notifySuccess('تم تحديث بيانات المستثمر بنجاح');
      
      setEditMode(false);
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء تحديث البيانات');
      handleApiError(error);
    }
  };

  const handleAddInvestor = () => {
    setIsAddModalOpen(true);
  };

  const handleDeleteInvestor = async (investorId) => {
    try {
      // Find the index of the investor to delete
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
      
      // Make next investor active if exists
      if (nextInvestorId) {
        try {
          // Find the investor in the refetched data
          const nextInvestor = refetchedData.data?.partners?.find(inv => inv.id === nextInvestorId);
          if (nextInvestor) {
            await Api.patch(`/api/partners/${nextInvestorId}`, { isActive: true });
            queryClient.invalidateQueries({ queryKey: ['investors'] });
            notifySuccess(`تم حذف المستثمر بنجاح وتم تفعيل المستثمر التالي: ${nextInvestor.name}`);
            
            // Update selected investor
            if (selectedInvestor?.id === investorId) {
              setSelectedInvestor(nextInvestor);
            }
          } else {
            notifySuccess('تم حذف المستثمر بنجاح');
            if (selectedInvestor?.id === investorId) {
              setSelectedInvestor(refetchedData.data?.partners?.[0] || null);
            }
          }
        } catch (error) {
          console.error('Error activating next investor:', error);
          notifySuccess('تم حذف المستثمر بنجاح');
          if (selectedInvestor?.id === investorId) {
            setSelectedInvestor(refetchedData.data?.partners?.[0] || null);
          }
        }
      } else {
        notifySuccess('تم حذف المستثمر بنجاح');
        if (selectedInvestor?.id === investorId) {
          setSelectedInvestor(refetchedData.data?.partners?.[0] || null);
        }
      }
    } catch (error) { 
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء حذف المستثمر');
      handleApiError(error);
    }
  };

  const openDeleteModal = (investor) => {
    setInvestorToDelete(investor);
    setIsDeleteModalOpen(true);
  };

  // Export handlers
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    try {
      setIsExporting(true);
      notifySuccess("جاري جلب بيانات المستثمرين...");
      const allInvestors = await getAllInvestorsForExport(search, selectedStatus);
      
      if (!allInvestors || allInvestors.length === 0) {
        notifyError("لا توجد بيانات للتصدير");
        return;
      }
      
      await exportInvestorsToPDF(allInvestors);
      notifySuccess(`تم تصدير ${allInvestors.length} مستثمر إلى PDF بنجاح`);
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير PDF");
      console.error('PDF export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      notifySuccess("جاري جلب بيانات المستثمرين...");
      const allInvestors = await getAllInvestorsForExport(search, selectedStatus);
      
      if (!allInvestors || allInvestors.length === 0) {
        notifyError("لا توجد بيانات للتصدير");
        return;
      }
      
      await exportInvestorsToExcel(allInvestors);
      notifySuccess(`تم تصدير ${allInvestors.length} مستثمر إلى Excel بنجاح`);
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير Excel");
      console.error('Excel export error:', error);
    } finally {
      setIsExporting(false);
    }
  };

  // New transaction handlers
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

      // Invalidate queries to refresh data
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
      
      const originalName = investorDetails.mudarabahFileUrl.split('/').pop();
      const extension = originalName.split('.').pop();
      const newFileName = `mudarabah_${investorDetails.name}.${extension}`;
      
      saveAs(blob, newFileName);
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء تحميل الملف');
      handleApiError(error);
    }
  };

  const handlePrintFile = async (fileUrl) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const printWindow = window.open(blobUrl, '_blank');
      
      printWindow?.addEventListener('load', () => {
        printWindow.print();
        printWindow.addEventListener('afterprint', () => {
          URL.revokeObjectURL(blobUrl);
        });
      }, { once: true });
      
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء محاولة الطباعة');
      handleApiError(error);
    }
  };

  const handleShareFile = async (fileUrl) => {
    try {
      // Fetch file from server
      const response = await fetch(fileUrl);
      const blob = await response.blob();
  
      // Build filename with investor name
      const originalName = fileUrl.split('/').pop();
      const ext = originalName.split('.').pop();
      const fileName = `mudarabah_${investorDetails.name}.${ext}`;
  
      const file = new File([blob], fileName, { type: blob.type });
  
      // ✅ If browser supports file sharing
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: fileName,
          text: `مشاركة عقد المضاربة للعميل: ${investorDetails.name}`,
          files: [file],
        });
        return;
      }
  
      // ❌ If file sharing is not supported (desktop fallback)
      await navigator.clipboard.writeText(fileUrl);
      notifySuccess("جهازك لا يدعم مشاركة الملفات — تم نسخ رابط الملف ✅");
  
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
        email: investorDetails.email || '',
        orgProfitPercent: investorDetails.orgProfitPercent || '',
        capitalAmount: investorDetails.capitalAmount || '',
      });
    }
  }, [investorDetails]);

  const getStatusColor = (isActive) => {
    return isActive ? 'success' : 'error';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'نشط' : 'غير نشط';
  };

  const getTransactionTypeText = (type) => {
    switch (type) {
      case "DEPOSIT":
        return "إيداع";
      case "WITHDRAWAL":
        return "سحب";
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
      default:
        return "default";
    }
  };

  return (
    <Box sx={{ bgcolor: "#f6f6f8", minHeight: "100vh" }}>
      <Helmet>
        <title>المستثمرين</title>
        <meta name="description" content="المستثمرين" />
      </Helmet>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 2,
          bgcolor: "#fff", 
          borderBottom: "1px solid #ddd",
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight="bold">
            إدارة المستثمرين
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdf sx={{marginLeft: '10px'}} />}
            onClick={handleExportPDF}
            disabled={isExporting || !investorsData?.partners || investorsData.partners.length === 0}
            sx={{
              borderColor: "#d32f2f",
              color: "#d32f2f",
              "&:hover": { bgcolor: "rgba(211, 47, 47, 0.1)" },
              borderRadius: 2,
              px: 2,
              fontWeight: "bold",
            }}
          >
            PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<TableChart sx={{marginLeft: '10px'}} />}
            onClick={handleExportExcel}
            disabled={isExporting || !investorsData?.partners || investorsData.partners.length === 0}
            sx={{
              borderColor: "#2e7d32",
              color: "#2e7d32",
              "&:hover": { bgcolor: "rgba(46, 125, 50, 0.1)" },
              borderRadius: 2,
              px: 2,
              fontWeight: "bold",
            }}
          >
            Excel
          </Button>
          {permissions.includes("partners_Add") && (
          <Button
            variant="contained"
            startIcon={<Add sx={{marginLeft: '10px'}} />}
            onClick={handleAddInvestor}
            sx={{
              bgcolor: "#0d40a5",
              "&:hover": { bgcolor: "#0b3589" },
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

      {/* Main layout */}
      <Box sx={{ display: 'flex', height: 'calc(100vh - 120px)' }}>
        {/* Left section – investors list */}
        <Box
          sx={{
            width: '350px',
            borderRight: "1px solid #ddd",
            bgcolor: "#fafafa",
            height: "100%",
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0
          }}
        >
          <Box sx={{ p: 3, borderBottom: "1px solid #ddd", bgcolor: "#fafafa", flexShrink: 0 }}>
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
                label="نشط" 
                color={selectedStatus === "نشط" ? "primary" : "default"} 
                variant="outlined" 
                onClick={() => {
                  setSelectedStatus(prev => prev === "نشط" ? "" : "نشط");
                  setCurrentPage(1);
                }}
              />
              <Chip 
                label="غير نشط" 
                color={selectedStatus === "غير نشط" ? "primary" : "default"} 
                variant="outlined" 
                onClick={() => {
                  setSelectedStatus(prev => prev === "غير نشط" ? "" : "غير نشط");
                  setCurrentPage(1);
                }}
              />
            </Box>
          </Box>

          {/* Results info */}
          {investorsData && !isInvestorsLoading && investorsData.partners && investorsData.partners.length > 0 && (
            <Box sx={{ p: 2, borderBottom: '1px solid #eee', bgcolor: '#f9f9f9', flexShrink: 0 }}>
              <Typography variant="body2" color="black">
                صفحة {investorsData.currentPage} من {investorsData.totalPages} - إجمالي {investorsData.totalPartners} مستثمر
              </Typography>
            </Box>
          )}

          {/* Content area - scrollable */}
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
                <Typography variant="h5" color="text.secondary" mb={2} fontWeight="bold">
                  لا يوجد مستثمرين
                </Typography>
                <Typography variant="body1" color="text.secondary" textAlign="center" mb={2}>
                  {search || selectedStatus ? 'لم يتم العثور على مستثمرين مطابقين للبحث' : 'لا توجد مستثمرين مسجلين في النظام'}
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
                        height: '100px',
                        border: isSelected ? "2px solid #1E40AF" : "1px solid #E5E7EB",
                        bgcolor: isSelected ? "#EEF2FF" : "background.paper",
                        transition: "0.2s",
                        "&:hover": { bgcolor: "#F3F4F6" },
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
                          <Typography fontWeight="bold">{investor.name}</Typography>
                          <Chip
                            label={getStatusText(investor.isActive)}
                            size="small"
                            color={getStatusColor(investor.isActive)}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          رأس المال: {investor.capitalAmount?.toLocaleString()} ريال
                        </Typography>
                        <Box display="flex" justifyContent="flex-end" mt={1}>
                          {permissions.includes("partners_Delete") && (
                          <IconButton 
                            size="small" 
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
                
                {/* Pagination */}
                {investorsData && investorsData.totalPages > 1 && (
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    p: 2, 
                    gap: 2,
                    borderTop: '1px solid #eee',
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

        {/* Right section – investor details */}
        {selectedInvestor && investorDetails ? (
          <Box sx={{ flex: 1, p: 4, bgcolor: "#fff", overflowY: "auto" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  {investorDetails.name}
                </Typography>
                <Typography color="text.secondary">
                  رقم الهوية: {investorDetails.nationalId}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", gap: 2 }}>
                {permissions.includes("partners_Update") && (
                <Button 
                  variant="outlined" 
                  startIcon={<Edit sx={{marginLeft: '10px'}} />}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? 'إلغاء التعديل' : 'تعديل'}
                </Button>
                )}
                {permissions.includes("partners_Add") && (
                <Button
                  variant="contained"
                  startIcon={<Save sx={{marginLeft: '10px'}} />}
                  sx={{ bgcolor: "#0d40a5", "&:hover": { bgcolor: "#0b3589" } }}
                  disabled={!editMode}
                  onClick={handleSaveChanges}
                >
                  حفظ التغييرات
                </Button>
                )}
              </Box>
            </Box>

            {/* Summary Cards */}
            <Grid container spacing={2} mb={3} sx={{width: '100%'}}>
              <Grid item xs={12} md={4}>
                <Card sx={{width: '250px'}}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body1">
                      إجمالي مبلغ الاستثمار
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="success">
                      {investorDetails.capitalAmount?.toLocaleString()} ريال
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{width: '250px'}}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body1">
                      نسبة أرباح المنشأة
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {investorDetails.orgProfitPercent}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card sx={{width: '250px'}}>
                  <CardContent>
                    <Typography color="text.secondary" variant="body1">
                      نسبة أرباح المستثمر
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {investorDetails.partnerProfitPercent}%
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Tabs */}
            <Tabs
              value={tab}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              sx={{ mb: 3 }}
            >
              <Tab label="التفاصيل الشخصية" />
              <Tab label="المعلومات المالية" />
              <Tab label="العمليات المالية" />
              <Tab label="المستندات" />
            </Tabs>

            <Divider sx={{ mb: 3 }} />

            {/* التفاصيل الشخصية */}
            {tab === 0 && (
              <Box>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" mb={3}>المعلومات الشخصية</Typography>
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
                            backgroundColor: editMode ? '#fff' : '#f9fafb',
                            borderRadius: '6px',
                            '&:hover fieldset': {
                              borderColor: '#0d40a5',
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
                            backgroundColor: editMode ? '#fff' : '#f9fafb',
                            borderRadius: '6px',
                            '&:hover fieldset': {
                              borderColor: '#0d40a5',
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
                            backgroundColor: '#f9fafb',
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
                            backgroundColor: editMode ? '#fff' : '#f9fafb',
                            borderRadius: '6px',
                            '&:hover fieldset': {
                              borderColor: '#0d40a5',
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
                            backgroundColor: editMode ? '#fff' : '#f9fafb',
                            borderRadius: '6px',
                            '&:hover fieldset': {
                              borderColor: '#0d40a5',
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>تاريخ الانضمام</Typography>
                      <TextField
                        value={investorDetails.createdAt ? new Date(investorDetails.createdAt).toLocaleDateString('en-US') : ''}
                        fullWidth
                        disabled
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#f9fafb',
                            borderRadius: '6px',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>الحالة</Typography>
                      <TextField
                        value={getStatusText(investorDetails.isActive)}
                        fullWidth
                        disabled
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#f9fafb',
                            borderRadius: '6px',
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              </Box>
            )}

            {/* المعلومات المالية */}
            {tab === 1 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" mb={3}>المعلومات المالية</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" mb={1} fontWeight={500}>رأس المال</Typography>
                    <TextField 
                      value={editMode ? editFormData.capitalAmount : investorDetails.capitalAmount?.toLocaleString()} 
                      onChange={(e) => handleInputChange('capitalAmount', e.target.value)}
                      fullWidth
                      disabled={!editMode}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: editMode ? '#fff' : '#f9fafb',
                          borderRadius: '6px',
                          '&:hover fieldset': {
                            borderColor: '#0d40a5',
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
                          backgroundColor: editMode ? '#fff' : '#f9fafb',
                          borderRadius: '6px',
                          '&:hover fieldset': {
                            borderColor: '#0d40a5',
                          },
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" mb={1} fontWeight={500}>نسبة أرباح المستثمر</Typography>
                    <TextField 
                      value={investorDetails.partnerProfitPercent} 
                      fullWidth
                      disabled
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#f9fafb',
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
                          backgroundColor: '#f9fafb',
                          borderRadius: '6px',
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
                          backgroundColor: '#f9fafb',
                          borderRadius: '6px',
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* العمليات المالية */}
            {tab === 2 && (
              <Box>
                {/* Add Transaction Button */}
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  {permissions.includes("partners_Add") && (
                  <Button
                    variant="contained"
                    startIcon={<Add sx={{ marginLeft: '10px' }} />}
                    onClick={handleAddTransaction}
                    sx={{
                      bgcolor: "#0d40a5",
                      "&:hover": { bgcolor: "#0b3589" },
                      fontWeight: "bold",
                    }}
                  >
                    إضافة عملية مالية
                  </Button>
                  )}
                </Box>

                {/* Transactions Table */}
                <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                  <TableContainer>
                    <Table stickyHeader>
                      <TableHead sx={{ bgcolor: "#F3F4F6" }}>
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
                                {transaction.amount?.toLocaleString()} ريال
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {dayjs(transaction.date).format("DD/MM/YYYY HH:mm a")}
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

                  {/* Pagination for Transactions */}
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
                  {investorDetails.mudarabahFileUrl ? (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Paper sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <CheckCircle color="success" fontSize="small" />
                            <Box>
                              <Typography fontWeight="500">عقد المضاربة</Typography>
                            </Box>
                          </Box>
                          <Box>
                            <IconButton onClick={() => handlePrintFile(investorDetails.mudarabahFileUrl)}>
                              <Print />
                            </IconButton>
                            <IconButton 
                              onClick={() => handleDownloadFile(investorDetails.mudarabahFileUrl)}
                              title="تحميل"
                            >
                              <Download />
                            </IconButton>
                            <IconButton 
                              onClick={() => handleShareFile(investorDetails.mudarabahFileUrl)}
                              title="مشاركة"
                            >
                              <Share />
                            </IconButton>
                          </Box>
                        </Paper>
                      </Grid>
                    </Grid>
                  ) : (
                    <Paper sx={{ p: 3, textAlign: 'center', mb: 3 }}>
                      <Typography color="text.secondary">لا توجد مستندات مرفوعة</Typography>
                    </Paper>
                  )}
                </Box>
              </Box>
            )}
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
                <MenuItem value="WITHDRAWAL">سحب</MenuItem>
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
              bgcolor: "#0d40a5",
              "&:hover": { bgcolor: "#0b3589" },
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
    </Box>
  );
}