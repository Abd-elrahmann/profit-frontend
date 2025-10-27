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
import AddClient from "../../components/modals/AddClient";
import DeleteModal from "../../components/modals/DeleteModal";
import EditDocuments from "../../components/modals/EditDocuments";
import { saveAs } from 'file-saver';
import { notifyError, notifySuccess } from "../../utilities/toastify";
const getClients = async (page = 1, searchQuery = '', status = '') => {
  let queryParams = new URLSearchParams();
  
  // Add search query for name OR nationalId if provided, not both
  if (searchQuery.trim()) {
    // Try to match if input looks like a national ID (numbers only)
    if (/^\d+$/.test(searchQuery.trim())) {
      queryParams.append('nationalId', searchQuery.trim());
    } else {
      queryParams.append('name', searchQuery.trim());
    }
  }
  
  // Add status filter if provided
  if (status.trim()) {
    queryParams.append('status', status.trim());
  }

  // Add default limit
  queryParams.append('limit', '10');
  
  const queryString = queryParams.toString();
  const url = `/api/clients/all/${page}${queryString ? `?${queryString}` : ''}`;
  
  const response = await Api.get(url);
  return response.data;
};

const getClientDetails = async (clientId) => {
  const response = await Api.get(`/api/clients/${clientId}`);
  return response.data;
};

export default function Clients() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedClient, setSelectedClient] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [clientFormData, setClientFormData] = useState({});
  const [kafeelFormData, setKafeelFormData] = useState({});
  const queryClient = useQueryClient();

  const { data: clientsData, isLoading: isClientsLoading, refetch } = useQuery({
    queryKey: ["clients", currentPage, search, selectedStatus],
    queryFn: () => getClients(currentPage, search, selectedStatus),
    retry: 1,
  });

  const { data: clientDetails } = useQuery({
    queryKey: ["client-details", selectedClient?.id],
    queryFn: () => selectedClient ? getClientDetails(selectedClient.id) : null,
    enabled: !!selectedClient,
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

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setEditMode(false);
  };

  const handleClientInputChange = (field, value) => {
    setClientFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleKafeelInputChange = (field, value) => {
    setKafeelFormData(prev => ({
      ...prev,
      [field]: field === 'salary' || field === 'obligations' ? parseFloat(value) || 0 : value
    }));
  };
  const handleSaveChanges = async () => {
    try {
      // Save client data
      if (tab === 0) {
        await Api.patch(`/api/clients/${selectedClient.id}/client-data`, clientFormData);
        notifySuccess('تم تحديث بيانات العميل بنجاح');
      }
      // Save kafeel data
      else if (tab === 2) {
        await Api.patch(`/api/clients/${selectedClient.id}/kafeel-data`, kafeelFormData);
        notifySuccess('تم تحديث بيانات الكفيل بنجاح');
      }
      
      queryClient.invalidateQueries({ queryKey: ['client-details', selectedClient.id] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      
      setEditMode(false);
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء تحديث البيانات');
      handleApiError(error);
    }
  };

  const handleAddClient = () => {
    setIsAddModalOpen(true);
  };

  const handleDeleteClient = async (clientId) => {
    try {
      await Api.delete(`/api/clients/${clientId}`);
      notifySuccess('تم حذف العميل بنجاح');
      refetch();
      if (selectedClient?.id === clientId) {
        setSelectedClient(null);
      }
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء حذف العميل');
      handleApiError(error);
    }
  };

  const openDeleteModal = (client) => {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const handleDownloadFile = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      saveAs(blob, fileName);
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء تحميل الملف');
      handleApiError(error);
    }
  };

  const handlePrintFile = async (fileUrl) => {
    try {
      const printWindow = window.open(fileUrl, '_blank');
      printWindow?.print();
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء محاولة الطباعة');
      handleApiError(error);
    }
  };

  

  useEffect(() => {
    if (clientsData?.clients?.length > 0 && !selectedClient) {
      setSelectedClient(clientsData.clients[0].client);
    }
  }, [clientsData, selectedClient]);

  useEffect(() => {
    if (clientDetails?.client) {
      setClientFormData({
        name: clientDetails.client.name || '',
        phone: clientDetails.client.phone || '',
        city: clientDetails.client.city || '',
        district: clientDetails.client.district || '',
        address: clientDetails.client.address || '',
        employer: clientDetails.client.employer || '',
        creationReason: clientDetails.client.creationReason || '',
        notes: clientDetails.client.notes || '',
        birthDate: clientDetails.client.birthDate ? new Date(clientDetails.client.birthDate).toISOString().split('T')[0] : '',
      });
    }
    if (clientDetails?.kafeel) {
      setKafeelFormData({
        name: clientDetails.kafeel.name || '',
        nationalId: clientDetails.kafeel.nationalId || '',
        birthDate: clientDetails.kafeel.birthDate ? new Date(clientDetails.kafeel.birthDate).toISOString().split('T')[0] : '',
        city: clientDetails.kafeel.city || '',
        district: clientDetails.kafeel.district || '',
        employer: clientDetails.kafeel.employer || '',
        salary: clientDetails.kafeel.salary || '',
        obligations: clientDetails.kafeel.obligations || '',
        phone: clientDetails.kafeel.phone || '',
        email: clientDetails.kafeel.email || '',
      });
    }
  }, [clientDetails]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'ملتزم': return 'success';
      case 'متأخر': return 'warning';
      case 'متعثر': return 'error';
      default: return 'default';
    }
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
        <Typography variant="h5" fontWeight="bold">
          العملاء
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add sx={{marginLeft: '10px'}} />}
          onClick={handleAddClient}
          sx={{
            bgcolor: "#0d40a5",
            "&:hover": { bgcolor: "#0b3589" },
            borderRadius: 2,
            px: 2.5,
            py: 1,
          }}
        >
          إضافة عميل جديد
        </Button>
      </Box>

      {/* Main layout */}
      <Box sx={{ display: 'flex', height: 'calc(100vh - 80px)' }}>
        {/* Left section – clients list */}
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
                label="ملتزم" 
                color={selectedStatus === "ملتزم" ? "primary" : "default"} 
                variant="outlined" 
                onClick={() => {
                  setSelectedStatus(prev => prev === "ملتزم" ? "" : "ملتزم");
                  setCurrentPage(1);
                }}
              />
              <Chip 
                label="متأخر" 
                color={selectedStatus === "متأخر" ? "primary" : "default"} 
                variant="outlined" 
                onClick={() => {
                  setSelectedStatus(prev => prev === "متأخر" ? "" : "متأخر");
                  setCurrentPage(1);
                }}
              />
              <Chip 
                label="متعثر" 
                color={selectedStatus === "متعثر" ? "primary" : "default"} 
                variant="outlined" 
                onClick={() => {
                  setSelectedStatus(prev => prev === "متعثر" ? "" : "متعثر");
                  setCurrentPage(1);
                }}
              />
            </Box>
          </Box>

          {/* Results info */}
          {clientsData && !isClientsLoading && (
            <Box sx={{ p: 2, borderBottom: '1px solid #eee', bgcolor: '#f9f9f9' }}>
              <Typography variant="body2" color="black">
                صفحة {clientsData.currentPage} من {clientsData.totalPages} - إجمالي {clientsData.totalClients} عميل
              </Typography>
            </Box>
          )}

          {isClientsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : clientsData?.clients?.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4, flexDirection: 'column' }}>
              <Typography variant="h6" color="text.secondary" mb={1}>
                لا توجد عملاء
              </Typography>
              <Typography variant="body2" color="black">
                {search || selectedStatus ? 'لم يتم العثور على عملاء مطابقين للبحث' : 'لا توجد عملاء مسجلين'}
              </Typography>
            </Box>
          ) : clientsData?.clients?.map((item) => {
            const client = item.client;
            const isSelected = selectedClient?.id === client.id;
            return (
              <Box
                key={client.id}
                sx={{
                  p: 2,
                  borderBottom: "1px solid #eee",
                  cursor: "pointer",
                  bgcolor: isSelected ? "#e8efff" : "inherit",
                  "&:hover": { bgcolor: "#f1f1f1" },
                }}
                onClick={() => handleClientSelect(client)}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography fontWeight="bold" color={isSelected ? "primary.main" : "text.primary"}>
                      {client.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      رقم الهوية: {client.nationalId}
                    </Typography>
                  </Box>
                </Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                  <Chip 
                    label={client.status} 
                    size="small" 
                    color={getStatusColor(client.status)}
                    variant="outlined"
                  />
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      openDeleteModal(client);
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            );
          })}
          
          {/* Pagination */}
          {clientsData && clientsData.totalPages > 1 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              p: 2, 
              borderTop: '1px solid #eee',
              bgcolor: '#fafafa'
            }}>
              {/* Previous Button */}
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

              {/* Page Numbers */}
              <Pagination
                count={clientsData.totalPages}
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

              {/* Next Button */}
              <Button
                variant="outlined"
                size="small"
                endIcon={<ChevronLeft />}
                disabled={currentPage === clientsData.totalPages}
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

        {/* Right section – client details */}
        {selectedClient && clientDetails ? (
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
                  {clientDetails.client.name}
                </Typography>
                <Typography color="text.secondary">رقم الهوية: {clientDetails.client.nationalId}</Typography>
              </Box>
              {tab !== 1 && (
              <Box sx={{ display: "flex", gap: 2 }}>
                {tab === 3 ? (
                  // Documents tab - Edit button opens modal
                  <>
                    <Button 
                      variant="outlined" 
                      startIcon={<Edit sx={{marginLeft: '10px'}} />}
                      onClick={() => setIsDocumentsModalOpen(true)}
                    >
                      تعديل
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<Save sx={{marginLeft: '10px'}} />}
                      sx={{ bgcolor: "#0d40a5", "&:hover": { bgcolor: "#0b3589" } }}
                      disabled={!editMode}
                    >
                      حفظ التغييرات
                    </Button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </Box>
              )}
            </Box>

            {/* Tabs */}
            <Tabs
              value={tab}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              sx={{ mb: 3 }}
            >
              <Tab label="الملف الشخصي" />
              <Tab label="المعلومات المالية" />
              <Tab label="الكفيل" />
              <Tab label="المرفقات" />
            </Tabs>

            {/* الملف الشخصي */}
            {tab === 0 && (
              <Box>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" mb={3}>المعلومات الشخصية</Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>الاسم الكامل</Typography>
                      <TextField 
                        value={editMode ? clientFormData.name : clientDetails.client.name} 
                        onChange={(e) => handleClientInputChange('name', e.target.value)}
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: editMode ? '#fff' : '#f9fafb',
                            borderRadius: '6px',
                            width:'280px',
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
                        value={editMode ? clientFormData.email : clientDetails.client.email || 'لا يوجد بريد إلكتروني'} 
                        onChange={(e) => handleClientInputChange('email', e.target.value)}
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#f9fafb',
                            borderRadius: '6px',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>رقم الهوية الوطنية</Typography>
                      <TextField 
                        value={clientDetails.client.nationalId } 
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
                        value={editMode ? clientFormData.phone : clientDetails.client.phone}
                        onChange={(e) => handleClientInputChange('phone', e.target.value)}
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
                      <Typography variant="body2" mb={1} fontWeight={500}>تاريخ الميلاد</Typography>
                      <TextField
                        value={editMode ? clientFormData.birthDate : (clientDetails.client.birthDate ? new Date(clientDetails.client.birthDate).toISOString().split('T')[0] : '')}
                        onChange={(e) => handleClientInputChange('birthDate', e.target.value)}
                        fullWidth
                        type="date"
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
                      <Typography variant="body2" mb={1} fontWeight={500}>المدينة</Typography>
                      <TextField
                        value={editMode ? clientFormData.city : clientDetails.client.city}
                        onChange={(e) => handleClientInputChange('city', e.target.value)}
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
                      <Typography variant="body2" mb={1} fontWeight={500}>الحي</Typography>
                      <TextField
                        value={editMode ? clientFormData.district : clientDetails.client.district}
                        onChange={(e) => handleClientInputChange('district', e.target.value)}
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: editMode ? '#fff' : '#f9fafb',
                            borderRadius: '6px',
                            width:'280px',
                            '&:hover fieldset': {
                              borderColor: '#0d40a5',
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" mb={1} fontWeight={500}>العنوان التفصيلي</Typography>
                      <TextField
                        value={editMode ? clientFormData.address : (clientDetails.client.address || '')}
                        onChange={(e) => handleClientInputChange('address', e.target.value)}
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: editMode ? '#fff' : '#f9fafb',
                            borderRadius: '6px',
                            width:'350px',
                            '&:hover fieldset': {
                              borderColor: '#0d40a5',
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>جهة العمل</Typography>
                      <TextField
                        value={editMode ? clientFormData.employer : clientDetails.client.employer}
                        onChange={(e) => handleClientInputChange('employer', e.target.value)}
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
                      <Typography variant="body2" mb={1} fontWeight={500}>سبب الإنشاء</Typography>
                      <TextField
                        value={editMode ? clientFormData.creationReason : (clientDetails.client.creationReason || '')}
                        onChange={(e) => handleClientInputChange('creationReason', e.target.value)}
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
                  </Grid>
                </Paper>
                
                {/* Notes Section */}
                <Paper sx={{ p: 3, mt: 3 }}>
                  <Typography variant="h6" mb={3}>ملاحظات</Typography>
                  <TextField
                    value={editMode ? clientFormData.notes : (clientDetails.client.notes || '')}
                    onChange={(e) => handleClientInputChange('notes', e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    disabled={!editMode}
                    placeholder="لا توجد ملاحظات"
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
                </Paper>
              </Box>
            )}

            {/* المعلومات المالية */}
            {tab === 1 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" mb={3}>المعلومات المالية</Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, bgcolor: "#f8f9fa" }}>
                      <Typography variant="body1" color="text.secondary" mb={1}>
                        الراتب
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" color="primary">
                        {clientDetails.client.salary?.toLocaleString()} ريال
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, bgcolor: "#f8f9fa" }}>
                      <Typography variant="body1" color="text.secondary" mb={1}>
                        الالتزامات
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" color="error">
                        {clientDetails.client.obligations?.toLocaleString()} ريال
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, bgcolor: "#f8f9fa" }}>
                      <Typography variant="body1" color="text.secondary" mb={1}>
                        الحالة
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" color={getStatusColor(clientDetails.client.status)}>
                        {clientDetails.client.status}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            )}

            {/* الكفيل */}
            {tab === 2 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" mb={3}>معلومات الكفيل</Typography>
                {clientDetails.kafeel ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>اسم الكفيل</Typography>
                      <TextField 
                        value={editMode ? kafeelFormData.name : clientDetails.kafeel.name}
                        onChange={(e) => handleKafeelInputChange('name', e.target.value)}
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: editMode ? '#fff' : '#f9fafb',
                            borderRadius: '6px',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>رقم هوية الكفيل</Typography>
                      <TextField 
                        value={editMode ? kafeelFormData.nationalId : clientDetails.kafeel.nationalId} 
                        onChange={(e) => handleKafeelInputChange('nationalId', e.target.value)}
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: editMode ? '#fff' : '#f9fafb',
                            borderRadius: '6px',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>تاريخ الميلاد</Typography>
                      <TextField
                        value={editMode ? kafeelFormData.birthDate : (clientDetails.kafeel.birthDate ? new Date(clientDetails.kafeel.birthDate).toISOString().split('T')[0] : '')}
                        onChange={(e) => handleKafeelInputChange('birthDate', e.target.value)}
                        fullWidth
                        type="date"
                        disabled={!editMode}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: editMode ? '#fff' : '#f9fafb',
                            borderRadius: '6px',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>المدينة</Typography>
                      <TextField
                        value={editMode ? kafeelFormData.city : clientDetails.kafeel.city}
                        onChange={(e) => handleKafeelInputChange('city', e.target.value)}
                          fullWidth
                        disabled={!editMode}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: editMode ? '#fff' : '#f9fafb',
                            borderRadius: '6px',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>الحي</Typography>
                      <TextField
                        value={editMode ? kafeelFormData.district : clientDetails.kafeel.district}
                        onChange={(e) => handleKafeelInputChange('district', e.target.value)}
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: editMode ? '#fff' : '#f9fafb',
                            borderRadius: '6px',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>رقم الجوال</Typography>
                      <TextField
                        value={editMode ? kafeelFormData.phone : clientDetails.kafeel.phone}
                        onChange={(e) => handleKafeelInputChange('phone', e.target.value)}
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: editMode ? '#fff' : '#f9fafb',
                            borderRadius: '6px',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>البريد الإلكتروني</Typography>
                      <TextField
                        value={editMode ? kafeelFormData.email : clientDetails.kafeel.email}
                        onChange={(e) => handleKafeelInputChange('email', e.target.value)}
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: editMode ? '#fff' : '#f9fafb',
                            borderRadius: '6px',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>جهة العمل</Typography>
                      <TextField
                        value={editMode ? kafeelFormData.employer : clientDetails.kafeel.employer}
                        onChange={(e) => handleKafeelInputChange('employer', e.target.value)}
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: editMode ? '#fff' : '#f9fafb',
                            borderRadius: '6px',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>الراتب</Typography>
                        <TextField
                          value={editMode ? kafeelFormData.salary : clientDetails.kafeel.salary}
                          onChange={(e) => handleKafeelInputChange('salary', e.target.value)}
                          fullWidth
                          type="number"
                          disabled={!editMode}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: editMode ? '#fff' : '#f9fafb',
                            borderRadius: '6px',
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>الالتزامات</Typography>
                        <TextField
                          value={editMode ? kafeelFormData.obligations : clientDetails.kafeel.obligations}
                          onChange={(e) => handleKafeelInputChange('obligations', e.target.value)}
                          fullWidth
                          type="number"
                          disabled={!editMode}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: editMode ? '#fff' : '#f9fafb',
                            borderRadius: '6px',
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                ) : (
                  <Typography variant="body1" color="text.secondary" align="center">
                    لا يوجد كفيل لهذا العميل
                  </Typography>
                )}
              </Paper>
            )}

            {/* المرفقات */}
            {tab === 3 && (
              <Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6">المستندات المرفوعة</Typography>
                </Box>
                {clientDetails.documents && clientDetails.documents.length > 0 ? (
                  <Grid container spacing={2}>
                    {Object.entries(clientDetails.documents[0]).map(([key, value]) => {
                      // Define document types and their display names
                      const documentTypes = {
                        'clientIdImage': 'صورة هوية العميل',
                        'clientWorkCard': 'بطاقة عمل العميل',
                        'salaryReport': 'تقرير الراتب',
                        'simaReport': 'تقرير SIMA',
                        'kafeelIdImage': 'صورة هوية الكفيل',
                        'kafeelWorkCard': 'بطاقة عمل الكفيل'
                      };
                      
                      // Show document if it has a value and is in our document types list
                      if (value && documentTypes[key]) {
                        const fileName = value.split('/').pop();
                        
                        return (
                          <Grid item xs={12} key={key}>
                            <Paper sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <Box display="flex" alignItems="center" gap={1}>
                                <CheckCircle color="success" fontSize="small" />
                                <Box>
                                  <Typography fontWeight="500">{documentTypes[key]}</Typography>
                                  <Typography variant="body2" color="text.secondary">{fileName}</Typography>
                                </Box>
                              </Box>
                              <Box>
                                <IconButton onClick={() => handlePrintFile(value)}>
                                  <Print />
                                </IconButton>
                                <IconButton onClick={() => handleDownloadFile(value, fileName)}>
                                  <Download />
                                </IconButton>
                              </Box>
                            </Paper>
                          </Grid>
                        );
                      }
                      return null;
                    })}
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
            {selectedClient ? 'جاري تحميل البيانات...' : 'اختر عميلاً لعرض التفاصيل'}
          </Typography>
          {selectedClient && <CircularProgress size={40} />}
        </Box>
        )}
      </Box>

      {/* Modals */}
      <AddClient
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={() => handleDeleteClient(clientToDelete?.id)}
        title="حذف العميل"
        message={`هل أنت متأكد من حذف العميل ${clientToDelete?.name}؟`}
        ButtonText="حذف"
      />

      <EditDocuments
        open={isDocumentsModalOpen}
        onClose={() => setIsDocumentsModalOpen(false)}
        clientId={selectedClient?.id}
        documents={clientDetails?.documents?.[0]}
        hasKafeel={!!clientDetails?.kafeel}
      />

    </Box>
  );
}