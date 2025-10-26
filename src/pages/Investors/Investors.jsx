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
  ChevronLeft,
  ChevronRight,
} from "@mui/icons-material";
import Api, { handleApiError } from "../../config/Api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce } from 'lodash';
import AddInvestor from "../../components/modals/AddInvestor";
import DeleteModal from "../../components/modals/DeleteModal";
import { notifyError, notifySuccess } from "../../utilities/toastify";

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

const getInvestorDetails = async (investorId) => {
  const response = await Api.get(`/api/partners/${investorId}`);
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

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleInvestorSelect = (investor) => {
    setSelectedInvestor(investor);
    setEditMode(false);
  };

  const handleInputChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveChanges = async () => {
    try {
      await Api.patch(`/api/partners/${selectedInvestor.id}`, editFormData);
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
      await Api.delete(`/api/partners/${investorId}`);
      notifySuccess('تم حذف المستثمر بنجاح');
      refetch();
      if (selectedInvestor?.id === investorId) {
        setSelectedInvestor(null);
      }
      setIsDeleteModalOpen(false);
      setInvestorToDelete(null);
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء حذف المستثمر');
      handleApiError(error);
    }
  };

  const openDeleteModal = (investor) => {
    setInvestorToDelete(investor);
    setIsDeleteModalOpen(true);
  };

  useEffect(() => {
    if (investorsData?.partners?.length > 0 && !selectedInvestor) {
      setSelectedInvestor(investorsData.partners[0]);
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

  return (
    <Box sx={{ bgcolor: "#f6f6f8", minHeight: "100vh" }}>
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
            startIcon={<Download sx={{marginLeft: '10px'}} />}
            sx={{ fontWeight: "bold" }}
          >
            تصدير
          </Button>
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
            overflowY: "auto",
            flexShrink: 0
          }}
        >
          <Box sx={{ p: 3, borderBottom: "1px solid #ddd", bgcolor: "#fafafa" }}>
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
          {investorsData && !isInvestorsLoading && (
            <Box sx={{ p: 2, borderBottom: '1px solid #eee', bgcolor: '#f9f9f9' }}>
              <Typography variant="body2" color="black">
                صفحة {investorsData.currentPage} من {investorsData.totalPages} - إجمالي {investorsData.totalPartners} مستثمر
              </Typography>
            </Box>
          )}

          {isInvestorsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : investorsData?.partners?.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4, flexDirection: 'column' }}>
              <Typography variant="h6" color="text.secondary" mb={1}>
                لا توجد مستثمرين
              </Typography>
              <Typography variant="body2" color="black">
                {search || selectedStatus ? 'لم يتم العثور على مستثمرين مطابقين للبحث' : 'لا توجد مستثمرين مسجلين'}
              </Typography>
            </Box>
          ) : investorsData?.partners?.map((investor) => {
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
                  </Box>
                </CardContent>
              </Card>
            );
          })}
          
          {/* Pagination */}
          {investorsData && investorsData.totalPages > 1 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              p: 2, 
              borderTop: '1px solid #eee',
              bgcolor: '#fafafa'
            }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ChevronRight />}
                disabled={currentPage === 1}
                onClick={() => handlePageChange(null, currentPage - 1)}
                sx={{
                  minWidth: '80px',
                  '&:disabled': {
                    opacity: 0.5
                  }
                }}
              >
                السابق
              </Button>

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

              <Button
                variant="outlined"
                size="small"
                endIcon={<ChevronLeft />}
                disabled={currentPage === investorsData.totalPages}
                onClick={() => handlePageChange(null, currentPage + 1)}
                sx={{
                  minWidth: '80px',
                  '&:disabled': {
                    opacity: 0.5
                  }
                }}
              >
                التالي
              </Button>
            </Box>
          )}
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
                <Button 
                  variant="outlined" 
                  startIcon={<Edit sx={{marginLeft: '10px'}} />}
                  onClick={() => setEditMode(!editMode)}
                >
                  {editMode ? 'إلغاء التعديل' : 'تعديل'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Save sx={{marginLeft: '10px'}} />}
                  sx={{ bgcolor: "#0d40a5", "&:hover": { bgcolor: "#0b3589" } }}
                  disabled={!editMode}
                  onClick={handleSaveChanges}
                >
                  حفظ التغييرات
                </Button>
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

            {/* المستندات */}
            {tab === 2 && (
              <Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6">المستندات المرفوعة</Typography>
                </Box>
                {investorDetails.mudarabahFileUrl ? (
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Paper sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <Box display="flex" alignItems="center" gap={1}>
                          <CheckCircle color="success" fontSize="small" />
                          <Box>
                            <Typography fontWeight="500">عقد المضاربة</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {investorDetails.mudarabahFileUrl.split('/').pop()}
                            </Typography>
                          </Box>
                        </Box>
                        <Box>
                          <IconButton onClick={() => window.open(investorDetails.mudarabahFileUrl, '_blank')}>
                            <Print />
                          </IconButton>
                          <IconButton 
                            onClick={() => {
                              const link = document.createElement('a');
                              link.href = investorDetails.mudarabahFileUrl;
                              link.download = investorDetails.mudarabahFileUrl.split('/').pop();
                              link.click();
                            }}
                          >
                            <Download />
                          </IconButton>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                ) : (
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="text.secondary">لا توجد مستندات مرفوعة</Typography>
                  </Paper>
                )}
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
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={() => handleDeleteInvestor(investorToDelete?.id)}
        title="حذف المستثمر"
        message={`هل أنت متأكد من حذف المستثمر ${investorToDelete?.name}؟`}
        ButtonText="حذف"
      />
    </Box>
  );
}