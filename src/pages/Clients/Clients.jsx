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
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
} from "@mui/material";
import {
  Add,
  Edit,
  Save,
  Search,
  Download,
  CheckCircle,
  Delete,
  ChevronLeft,
  ChevronRight,
  Share,
  PictureAsPdf,
  TableChart,
  Visibility,
  InsertDriveFile,
  Close,
} from "@mui/icons-material";
import Api, { handleApiError } from "../../config/Api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce } from "../../utilities/debounce";
import AddClient from "../../components/modals/AddClient";
import AddAdditionalKafeel from "../../components/modals/AddAdditionalKafeel";
import DeleteModal from "../../components/modals/DeleteModal";
import EditDocuments from "../../components/modals/EditDocuments";
import dayjs from "dayjs";
import EditKafeelDocuments from "../../components/modals/EditKafeelDocuments";
import { saveAs } from "file-saver";
import { notifyError, notifySuccess } from "../../utilities/toastify";
import { Helmet } from "react-helmet-async";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import { useTheme } from '../../theme/ThemeContext';
import {
  StyledTableCell,
  StyledTableRow,
  ScrollableTableContainer,
} from "../../components/layouts/tableLayout";
import {
  exportStatementToPDF,
  exportStatementToExcel,
} from "../../utilities/statementExporter";

const getClients = async (page = 1, searchQuery = "", status = "") => {
  let queryParams = new URLSearchParams();

  if (searchQuery.trim()) {
    if (/^\d+$/.test(searchQuery.trim())) {
      queryParams.append("nationalId", searchQuery.trim());
    } else {
      queryParams.append("name", searchQuery.trim());
    }
  }

  if (status.trim() && status !== "الكل") {
    queryParams.append("status", status.trim());
  }

  queryParams.append("limit", "10");

  const queryString = queryParams.toString();
  const url = `/api/clients/all/${page}${queryString ? `?${queryString}` : ""}`;

  const response = await Api.get(url);
  return response.data;
};

const getClientDetails = async (clientId) => {
  const response = await Api.get(`/api/clients/${clientId}`);
  return response.data;
};

const getClientStatement = async (
  clientId,
  page = 1,
  fromDate = "",
  toDate = ""
) => {
  let queryParams = new URLSearchParams();

  if (fromDate.trim()) {
    queryParams.append("from", fromDate.trim());
  }

  if (toDate.trim()) {
    queryParams.append("to", toDate.trim());
  }

  queryParams.append("limit", "20");

  const queryString = queryParams.toString();
  const url = `/api/clients/${clientId}/statement/${page}${
    queryString ? `?${queryString}` : ""
  }`;

  const response = await Api.get(url);
  return response.data;
};

export default function Clients() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("الكل");
  const [selectedClient, setSelectedClient] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [isDeleteKafeelModalOpen, setIsDeleteKafeelModalOpen] = useState(false);
  const [kafeelToDelete, setKafeelToDelete] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statementPage, setStatementPage] = useState(1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [clientFormData, setClientFormData] = useState({});
  const [kafeelFormData, setKafeelFormData] = useState({});
  const [selectedKafeelId, setSelectedKafeelId] = useState(null);
  const [isAddKafeelModalOpen, setIsAddKafeelModalOpen] = useState(false);
  const [documentsTab, setDocumentsTab] = useState(0);
  const [isEditKafeelDocumentsModalOpen, setIsEditKafeelDocumentsModalOpen] =
    useState(false);
  const [selectedKafeelForDocuments, setSelectedKafeelForDocuments] =
    useState(null);
  const queryClient = useQueryClient();
  const { permissions } = usePermissions();
  const { isDarkMode } = useTheme();
  const {
    data: clientsData,
    isLoading: isClientsLoading,
    refetch,
  } = useQuery({
    queryKey: ["clients", currentPage, search, selectedStatus],
    queryFn: () => getClients(currentPage, search, selectedStatus),
    retry: 1,
  });

  const { data: clientDetails, refetch: refetchClientDetails } = useQuery({
    queryKey: ["client-details", selectedClient?.id],
    queryFn: () =>
      selectedClient ? getClientDetails(selectedClient.id) : null,
    enabled: !!selectedClient,
    retry: 1,
  });

  const { data: clientStatement } = useQuery({
    queryKey: [
      "client-statement",
      selectedClient?.id,
      statementPage,
      fromDate,
      toDate,
    ],
    queryFn: () =>
      selectedClient
        ? getClientStatement(selectedClient.id, statementPage, fromDate, toDate)
        : null,
    enabled: !!selectedClient && tab === 4,
    retry: 1,
  });

  const getClientLoans = async (clientId, page = 1) => {
    const response = await Api.get(
      `/api/loans/all/${page}?clientId=${clientId}`
    );
    return response.data;
  };

  const [loansPage, setLoansPage] = useState(1);

  const { data: clientLoans } = useQuery({
    queryKey: ["client-loans", selectedClient?.id, loansPage],
    queryFn: () =>
      selectedClient ? getClientLoans(selectedClient.id, loansPage) : null,
    enabled: !!selectedClient && tab === 5,
    retry: 1,
  });

  const handleLoansPageChange = (event, newPage) => {
    setLoansPage(newPage);
  };

  const getStatusColor = (status) => {
    if (!status) return "default";

    const normalized = status.toString().trim();
    switch (normalized.toUpperCase()) {
      case "PENDING":
        return "warning";
      case "ACTIVE":
        return "success";
      case "COMPLETED":
        return "info";
      case "DEFAULTED":
        return "error";
      default:
        switch (normalized) {
          case "نشط":
            return "success";
          case "منتهي":
            return "warning";
          case "متعثر":
            return "error";
          case "قيد المراجعة":
            return "warning";
          default:
            return "default";
        }
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "PENDING":
        return "قيد المراجعة";
      case "ACTIVE":
        return "نشط";
      case "COMPLETED":
        return "مكتمل";
      case "DEFAULTED":
        return "متأخر";
      default:
        return status;
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case "DAILY":
        return "يومي";
      case "WEEKLY":
        return "أسبوعي";
      case "MONTHLY":
        return "شهري";
      default:
        return type;
    }
  };

  const getSourceText = (source) => {
    switch (source) {
      case "GENERAL":
        return "عام";
      case "NEW_CAPITAL":
        return "رأس مال جديد";
      case "MIX":
        return "عام و رأس مال جديد";
      default:
        return source || "غير محدد";
    }
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


  const handleDateFilterChange = (field, value) => {
    if (field === "from") {
      setFromDate(value);
    } else if (field === "to") {
      setToDate(value);
    }
    setStatementPage(1);
  };

  const handleTabChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setEditMode(false);
    setSelectedKafeelId(null);
    setStatementPage(1);
    setFromDate("");
    setToDate("");
  };

  const handleClientInputChange = (field, value) => {
    setClientFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleKafeelInputChange = (field, value) => {
    setKafeelFormData((prev) => ({
      ...prev,
      [field]:
        field === "salary" || field === "obligations"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleSaveChanges = async (kafeelIdOverride = null) => {
    try {
      if (tab === 0) {
        await Api.patch(
          `/api/clients/${selectedClient.id}/client-data`,
          clientFormData
        );
        notifySuccess("تم تحديث بيانات العميل بنجاح");
      } else if (tab === 2) {
        const kafeelIdToUse =
          kafeelIdOverride !== null ? kafeelIdOverride : selectedKafeelId;
        if (kafeelIdToUse) {
          const kafeelIdToUpdate = Number(kafeelIdToUse);

          await Api.patch(
            `/api/clients/kafeel/${kafeelIdToUpdate}`,
            kafeelFormData
          );
          notifySuccess("تم تحديث بيانات الكفيل بنجاح");
        } else if (clientDetails.kafeel) {
          await Api.patch(
            `/api/clients/${selectedClient.id}/kafeel-data`,
            kafeelFormData
          );
          notifySuccess("تم تحديث بيانات الكفيل بنجاح");
        }
      }

      setKafeelFormData({});
      setEditMode(false);
      setSelectedKafeelId(null);

      queryClient.invalidateQueries({
        queryKey: ["client-details", selectedClient.id],
      });
      queryClient.invalidateQueries({ queryKey: ["clients"] });

      if (selectedClient?.id) {
        await refetchClientDetails();
      }
    } catch (error) {
      notifyError(
        error.response?.data?.message || "حدث خطأ أثناء تحديث البيانات"
      );
      handleApiError(error);
    }
  };

  const handleAddClient = () => {
    setIsAddModalOpen(true);
  };

  const handleDeleteClient = async (clientId) => {
    try {
      await Api.delete(`/api/clients/${clientId}`);
      notifySuccess("تم حذف العميل بنجاح");
      refetch();
      if (selectedClient?.id === clientId) {
        setSelectedClient(null);
      }
      setIsDeleteModalOpen(false);
      setClientToDelete(null);
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء حذف العميل");
      handleApiError(error);
    }
  };

  const openDeleteModal = (client) => {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  const openDeleteKafeelModal = (kafeel) => {
    setKafeelToDelete(kafeel);
    setIsDeleteKafeelModalOpen(true);
  };

  const handleDeleteKafeel = async (kafeelId) => {
    try {
      await Api.delete(`/api/clients/kafeel/${kafeelId}`);
      notifySuccess("تم حذف الكفيل بنجاح");
      setIsDeleteKafeelModalOpen(false);
      setKafeelToDelete(null);

      queryClient.invalidateQueries({
        queryKey: ["client-details", selectedClient.id],
      });
      queryClient.invalidateQueries({ queryKey: ["clients"] });

      if (selectedClient?.id) {
        await refetchClientDetails();
      }

      if (selectedKafeelId === kafeelId) {
        setEditMode(false);
        setSelectedKafeelId(null);
        setKafeelFormData({});
      }
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء حذف الكفيل");
      handleApiError(error);
    }
  };

  const handleDownloadFile = async (
    fileUrl,
    fileName,
    documentType,
    clientName
  ) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      const extension = fileName.split(".").pop();
      const newFileName = `${documentType}_${clientName}.${extension}`;

      saveAs(blob, newFileName);
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء تحميل الملف");
      handleApiError(error);
    }
  };

  const isImageFile = (url) => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
    const lowerUrl = url.toLowerCase();
    return imageExtensions.some(ext => lowerUrl.includes(ext));
  };

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

  const handleShareFile = async (fileUrl, fileName, clientName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();

      const filename = fileName + ".pdf";
      const file = new File([blob], filename, { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: filename,
          text: `مشاركة مستند: ${clientName}`,
          files: [file],
        });
      } else {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(fileUrl);
          notifySuccess("تم نسخ رابط الملف لأن المشاركة غير مدعومة");
        } else {
          const textArea = document.createElement('textarea');
          textArea.value = fileUrl;
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
            notifySuccess("تم نسخ رابط الملف لأن المشاركة غير مدعومة");
          } catch (err) {
            console.warn('Fallback copy method also failed:', err);
            notifyError("تعذرت نسخ رابط الملف تلقائياً — يرجى نسخه يدوياً");
          } finally {
            document.body.removeChild(textArea);
          }
        }
      }
    } catch (err) {
      console.error(err);
      notifyError("حدث خطأ أثناء مشاركة الملف");
    }
  };

  const handleExportPDF = async () => {
    if (!clientStatement) return;

    try {
      await exportStatementToPDF(clientStatement, clientDetails.client.name);
      notifySuccess("تم تصدير كشف الحساب بصيغة PDF بنجاح");
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير PDF");
      console.error("PDF Export Error:", error);
    }
  };

  const handleExportExcel = async () => {
    if (!clientStatement) return;

    try {
      await exportStatementToExcel(clientStatement, clientDetails.client.name);
      notifySuccess("تم تصدير كشف الحساب بصيغة Excel بنجاح");
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير Excel");
      console.error("Excel Export Error:", error);
    }
  };

  const handleViewLoanDetails = (loanId) => {
    window.location.href = `/installments/${loanId}`;
  };

  useEffect(() => {
    if (clientsData?.clients?.length > 0 && !selectedClient) {
      setSelectedClient(clientsData.clients[0].client);
    } else if (clientsData?.clients?.length === 0 && selectedClient) {
      setSelectedClient(null);
    }
  }, [clientsData, selectedClient]);

  useEffect(() => {
    if (clientDetails?.client) {
      setClientFormData({
        name: clientDetails.client.name || "",
        phone: clientDetails.client.phone || "",
        city: clientDetails.client.city || "",
        district: clientDetails.client.district || "",
        address: clientDetails.client.address || "",
        employer: clientDetails.client.employer || "",
        creationReason: clientDetails.client.creationReason || "",
        notes: clientDetails.client.notes || "",
        birthDate: clientDetails.client.birthDate
          ? new Date(clientDetails.client.birthDate).toISOString().split("T")[0]
          : "",
      });
    }
    if (clientDetails?.kafeel) {
      setKafeelFormData({
        name: clientDetails.kafeel.name || "",
        nationalId: clientDetails.kafeel.nationalId || "",
        birthDate: clientDetails.kafeel.birthDate
          ? new Date(clientDetails.kafeel.birthDate).toISOString().split("T")[0]
          : "",
        city: clientDetails.kafeel.city || "",
        district: clientDetails.kafeel.district || "",
        employer: clientDetails.kafeel.employer || "",
        salary: clientDetails.kafeel.salary || "",
        obligations: clientDetails.kafeel.obligations || "",
        phone: clientDetails.kafeel.phone || "",
        email: clientDetails.kafeel.email || "",
      });
    }
  }, [clientDetails]);

  const getClientStatusColor = (status) => {
    switch (status) {
      case "الكل":
        return "primary";
      case "نشط":
        return "success";
      case "منتهي":
        return "warning";
      case "متعثر":
        return "error";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };


  return (
    <Box
      sx={{
        bgcolor: 'background.default',
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Helmet>
        <title>العملاء</title>
        <meta name="description" content="العملاء" />
      </Helmet>

      <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
        <Box
          sx={{
            width: "350px",
            borderRight: "1px solid #ddd",
            bgcolor: isDarkMode ? 'background.paper' : '#fafafa',
            height: "100%",
            overflowY: "auto",
            flexShrink: 0,
          }}
        >
          <Box
            sx={{ p: 3, borderBottom: "1px solid #ddd", bgcolor: isDarkMode ? 'background.paper' : '#fafafa' }}
          >
            {permissions.includes("clients_Add") && (
              <Box sx={{ mb: 2 }}>
                <Button
                  fullWidth
                  size="small"
                  variant="contained"
                  startIcon={<Add sx={{ marginLeft: "10px" }} />}
                  onClick={handleAddClient}
                  sx={{
                    bgcolor: "primary.main",
                    "&:hover": { bgcolor: "primary.dark" },
                    fontWeight: "bold",
                    borderRadius: 2,
                    py: 1,
                  }}
                >
                  إضافة عميل جديد
                </Button>
              </Box>
            )}
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
                color={getClientStatusColor("الكل")}
                variant={selectedStatus === "الكل" ? "filled" : "outlined"}
                onClick={() => {
                  setSelectedStatus("الكل");
                  setCurrentPage(1);
                }}
              />
              <Chip
                label="نشط"
                color={getClientStatusColor("نشط")}
                variant={selectedStatus === "نشط" ? "filled" : "outlined"}
                onClick={() => {
                  setSelectedStatus((prev) => (prev === "نشط" ? "الكل" : "نشط"));
                  setCurrentPage(1);
                }}
              />
              <Chip
                label="منتهي"
                color={getClientStatusColor("منتهي")}
                variant={selectedStatus === "منتهي" ? "filled" : "outlined"}
                onClick={() => {
                  setSelectedStatus((prev) =>
                    prev === "منتهي" ? "الكل" : "منتهي"
                  );
                  setCurrentPage(1);
                }}
              />
              <Chip
                label="متعثر"
                color={getClientStatusColor("متعثر")}
                variant={selectedStatus === "متعثر" ? "filled" : "outlined"}
                onClick={() => {
                  setSelectedStatus((prev) =>
                    prev === "متعثر" ? "الكل" : "متعثر"
                  );
                  setCurrentPage(1);
                }}
              />
            </Box>
          </Box>

          {clientsData && !isClientsLoading && (
            <Box
              sx={{ p: 2, borderBottom: "1px solid #eee", bgcolor: isDarkMode ? 'background.paper' : '#f9f9f9' }}
            >
              <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
                صفحة {clientsData.currentPage} من {clientsData.totalPages} -
                إجمالي {clientsData.totalClients} عميل
              </Typography>
              {clientsData.totalPages > 1 && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Pagination
                    count={clientsData.totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    size="small"
                    siblingCount={1}
                    boundaryCount={1}
                    sx={{
                      "& .MuiPaginationItem-root": {
                        fontSize: "0.875rem",
                      },
                    }}
                  />
                </Box>
              )}
            </Box>
          )}

          {isClientsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
              <CircularProgress />
            </Box>
          ) : clientsData?.clients?.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                p: 4,
                flexDirection: "column",
              }}
            >
              <Typography variant="h6" color="text.secondary" mb={1}>
                لا توجد عملاء
              </Typography>
              <Typography variant="body2" color="text.primary">
                {search || selectedStatus
                  ? "لم يتم العثور على عملاء مطابقين للبحث"
                  : "لا توجد عملاء مسجلين"}
              </Typography>
            </Box>
          ) : (
            clientsData?.clients?.map((item) => {
              const client = item.client;
              const isSelected = selectedClient?.id === client.id;
              return (
                <Box
                  key={client.id}
                  sx={{
                    p: 2,
                    mb: 1,
                    mx: 2,
                    mt: 2,
                    cursor: "pointer",
                    border: isSelected ? "2px solid" : "1px solid #E5E7EB",
                    borderColor: isSelected ? "primary.main" : "#E5E7EB",
                    borderRadius: "12px",
                    bgcolor: isSelected ? "primary.50" : "background.paper",
                    boxShadow: isSelected
                      ? "0 6px 16px rgba(46, 139, 69, 0.15)"
                      : "0 3px 12px rgba(15, 23, 42, 0.06)",
                    transition: "0.2s",
                    "&:hover": { bgcolor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : "#F3F4F6" },
                  }}
                  onClick={() => handleClientSelect(client)}
                >
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography
                        fontWeight="bold"
                        color={isSelected ? "primary.main" : "text.primary"}
                      >
                        {client.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        رقم الهوية: {client.nationalId}
                      </Typography>
                    </Box>
                  </Box>
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    mt={1}
                  >
                    <Chip
                      label={client.status}
                      size="small"
                      color={getStatusColor(client.status)}
                      variant="outlined"
                    />
                    {permissions.includes("clients_Delete") && (
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
                    )}
                  </Box>
                </Box>
              );
            })
          )}
        </Box>

        {selectedClient && clientDetails ? (
          <Box sx={{ flex: 1, p: 4, bgcolor: "background.paper", overflowY: "auto" }}>
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
                <Typography color="text.secondary">
                  رقم الهوية: {clientDetails.client.nationalId}
                </Typography>
              </Box>
              {tab !== 1 &&
                tab !== 2 &&
                tab !== 3 &&
                tab !== 4 &&
                tab !== 5 && (
                  <Box sx={{ display: "flex", gap: 2 }}>
                    {permissions.includes("clients_Update") && (
                      <Button
                        variant="outlined"
                        startIcon={<Edit sx={{ marginLeft: "10px" }} />}
                        onClick={() => setEditMode(!editMode)}
                      >
                        {editMode ? "إلغاء التعديل" : "تعديل"}
                      </Button>
                    )}
                    {permissions.includes("clients_Update") && (
                      <Button
                        variant="contained"
                        startIcon={<Save sx={{ marginLeft: "10px" }} />}
                        sx={{
                          bgcolor: "primary.main",
                          "&:hover": { bgcolor: "primary.dark" },
                        }}
                        disabled={!editMode}
                        onClick={handleSaveChanges}
                      >
                        حفظ التغييرات
                      </Button>
                    )}
                  </Box>
                )}
            </Box>
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
              <Tab label="الملف الشخصي" />
              <Tab label="المعلومات المالية" />
              <Tab label="الكفيل" />
              <Tab label="المرفقات" />
              <Tab label="كشف حساب" />
              <Tab label="السلفات" />
            </Tabs>
            {tab === 0 && (
              <Box>
                <Paper sx={{ p: 3, mb: 3 }}>
                  <Typography variant="h6" mb={3}>
                    المعلومات الشخصية
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>
                        الاسم الكامل
                      </Typography>
                      <TextField
                        value={
                          editMode
                            ? clientFormData.name
                            : clientDetails.client.name
                        }
                        onChange={(e) =>
                          handleClientInputChange("name", e.target.value)
                        }
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: editMode ? (isDarkMode ? "background.paper" : "#fff") : (isDarkMode ? "background.default" : "#f9fafb"),
                            borderRadius: "6px",
                            width: "280px",
                            "&:hover fieldset": {
                              borderColor: "primary.main",
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>
                        البريد الإلكتروني
                      </Typography>
                      <TextField
                        value={
                          editMode
                            ? clientFormData.email
                            : clientDetails.client.email ||
                              "لا يوجد بريد إلكتروني"
                        }
                        onChange={(e) =>
                          handleClientInputChange("email", e.target.value)
                        }
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: isDarkMode ? "background.default" : "#f9fafb",
                            borderRadius: "6px",
                            width: "280px",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>
                        رقم الهوية الوطنية
                      </Typography>
                      <TextField
                        value={clientDetails.client.nationalId}
                        fullWidth
                        disabled
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: isDarkMode ? "background.default" : "#f9fafb",
                            borderRadius: "6px",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>
                        رقم الجوال
                      </Typography>
                      <TextField
                        value={
                          editMode
                            ? clientFormData.phone
                            : clientDetails.client.phone
                        }
                        onChange={(e) =>
                          handleClientInputChange("phone", e.target.value)
                        }
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: editMode ? (isDarkMode ? "background.paper" : "#fff") : (isDarkMode ? "background.default" : "#f9fafb"),
                            borderRadius: "6px",
                            "&:hover fieldset": {
                              borderColor: "primary.main",
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>
                        تاريخ الميلاد
                      </Typography>
                      <TextField
                        value={
                          editMode
                            ? clientFormData.birthDate
                            : clientDetails.client.birthDate
                            ? new Date(clientDetails.client.birthDate)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          handleClientInputChange("birthDate", e.target.value)
                        }
                        fullWidth
                        type="date"
                        disabled={!editMode}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: editMode ? (isDarkMode ? "background.paper" : "#fff") : (isDarkMode ? "background.default" : "#f9fafb"),
                            borderRadius: "6px",
                            "&:hover fieldset": {
                              borderColor: "primary.main",
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>
                        المدينة
                      </Typography>
                      <TextField
                        value={
                          editMode
                            ? clientFormData.city
                            : clientDetails.client.city
                        }
                        onChange={(e) =>
                          handleClientInputChange("city", e.target.value)
                        }
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: editMode ? (isDarkMode ? "background.paper" : "#fff") : (isDarkMode ? "background.default" : "#f9fafb"),
                            borderRadius: "6px",
                            "&:hover fieldset": {
                              borderColor: "primary.main",
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>
                        الحي
                      </Typography>
                      <TextField
                        value={
                          editMode
                            ? clientFormData.district
                            : clientDetails.client.district
                        }
                        onChange={(e) =>
                          handleClientInputChange("district", e.target.value)
                        }
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: editMode ? (isDarkMode ? "background.paper" : "#fff") : (isDarkMode ? "background.default" : "#f9fafb"),
                            borderRadius: "6px",
                            width: "280px",
                            "&:hover fieldset": {
                              borderColor: "primary.main",
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" mb={1} fontWeight={500}>
                        العنوان التفصيلي
                      </Typography>
                      <TextField
                        value={
                          editMode
                            ? clientFormData.address
                            : clientDetails.client.address || ""
                        }
                        onChange={(e) =>
                          handleClientInputChange("address", e.target.value)
                        }
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: editMode ? (isDarkMode ? "background.paper" : "#fff") : (isDarkMode ? "background.default" : "#f9fafb"),
                            borderRadius: "6px",
                            width: "350px",
                            "&:hover fieldset": {
                              borderColor: "primary.main",
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>
                        جهة العمل
                      </Typography>
                      <TextField
                        value={
                          editMode
                            ? clientFormData.employer
                            : clientDetails.client.employer
                        }
                        onChange={(e) =>
                          handleClientInputChange("employer", e.target.value)
                        }
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: editMode ? (isDarkMode ? "background.paper" : "#fff") : (isDarkMode ? "background.default" : "#f9fafb"),
                            borderRadius: "6px",
                            "&:hover fieldset": {
                              borderColor: "primary.main",
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>
                        سبب الإنشاء
                      </Typography>
                      <TextField
                        value={
                          editMode
                            ? clientFormData.creationReason
                            : clientDetails.client.creationReason || ""
                        }
                        onChange={(e) =>
                          handleClientInputChange(
                            "creationReason",
                            e.target.value
                          )
                        }
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: editMode ? (isDarkMode ? "background.paper" : "#fff") : (isDarkMode ? "background.default" : "#f9fafb"),
                            borderRadius: "6px",
                            "&:hover fieldset": {
                              borderColor: "primary.main",
                            },
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                <Paper sx={{ p: 3, mt: 3 }}>
                  <Typography variant="h6" mb={3}>
                    ملاحظات
                  </Typography>
                  <TextField
                    value={
                      editMode
                        ? clientFormData.notes
                        : clientDetails.client.notes || ""
                    }
                    onChange={(e) =>
                      handleClientInputChange("notes", e.target.value)
                    }
                    fullWidth
                    multiline
                    rows={3}
                    disabled={!editMode}
                    placeholder="لا توجد ملاحظات"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: editMode ? (isDarkMode ? "background.paper" : "#fff") : (isDarkMode ? "background.default" : "#f9fafb"),
                        borderRadius: "6px",
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                </Paper>
              </Box>
            )}
            {tab === 1 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" mb={3}>
                  المعلومات المالية
                </Typography>
                <Grid container spacing={3} justifyContent="center" alignItems="center">
                  <Grid item xs={12} md={4} sx={{ width: "280px" }}>
                    <Paper sx={{ p: 3, bgcolor: "background.paper" }}>
                      <Typography variant="body1" color="text.secondary" mb={1}>
                        الراتب
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color="primary"
                      >
                        {clientDetails.client.salary?.toLocaleString()}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ width: "280px" }}>
                    <Paper sx={{ p: 3, bgcolor: "background.paper" }}>
                      <Typography variant="body1" color="text.secondary" mb={1}>
                        الالتزامات
                      </Typography>
                      <Typography variant="h5" fontWeight="bold" color="error">
                        {clientDetails.client.obligations?.toLocaleString()}{" "}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ width: "280px" }}>
                    <Paper sx={{ p: 3, bgcolor: "background.paper" }}>
                      <Typography variant="body1" color="text.secondary" mb={1}>
                        الحالة
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color={getStatusColor(clientDetails.client.status)}
                      >
                        {clientDetails.client.status}
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            )}
            {tab === 2 && (
              <Paper sx={{ p: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Typography variant="h6">معلومات الكفيل</Typography>
                  {selectedClient && permissions.includes("clients_Add") && (
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => setIsAddKafeelModalOpen(true)}
                      sx={{
                        bgcolor: "primary.main",
                        fontWeight: "bold",
                        "&:hover": { bgcolor: "primary.dark" },
                      }}
                    >
                      إضافة كفيل آخر
                    </Button>
                  )}
                </Box>
                {clientDetails.kafeels && clientDetails.kafeels.length > 0 ? (
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    {clientDetails.kafeels.map((kafeel, index) => {
                      const isEditingThisKafeel =
                        editMode &&
                        selectedKafeelId !== null &&
                        Number(selectedKafeelId) === Number(kafeel.id);
                      const currentKafeelData = isEditingThisKafeel
                        ? kafeelFormData
                        : kafeel;

                      return (
                        <Box key={kafeel.id || index}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              mb: 2,
                            }}
                          >
                            <Typography variant="h6" color="primary">
                              الكفيل {index + 1} -{" "}
                              {isEditingThisKafeel
                                ? currentKafeelData.name || kafeel.name
                                : kafeel.name}
                            </Typography>
                            <Box sx={{ display: "flex", gap: 1 }}>
                              {permissions.includes("clients_Update") && (
                                <>
                                  {!isEditingThisKafeel ? (
                                    <Button
                                      variant="outlined"
                                      startIcon={
                                        <Edit sx={{ marginLeft: "10px" }} />
                                      }
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        const kafeelIdToEdit = Number(
                                          kafeel.id
                                        );
                                        if (
                                          !kafeelIdToEdit ||
                                          isNaN(kafeelIdToEdit)
                                        ) {
                                          console.error(
                                            "Kafeel ID is missing or invalid!",
                                            kafeel
                                          );
                                          return;
                                        }
                                        setSelectedKafeelId(kafeelIdToEdit);
                                        setEditMode(true);
                                        setKafeelFormData({
                                          name: kafeel.name || "",
                                          nationalId: kafeel.nationalId || "",
                                          birthDate: kafeel.birthDate
                                            ? new Date(kafeel.birthDate)
                                                .toISOString()
                                                .split("T")[0]
                                            : "",
                                          city: kafeel.city || "",
                                          district: kafeel.district || "",
                                          employer: kafeel.employer || "",
                                          salary: kafeel.salary || "",
                                          obligations: kafeel.obligations || "",
                                          phone: kafeel.phone || "",
                                          email: kafeel.email || "",
                                        });
                                      }}
                                    >
                                      تعديل
                                    </Button>
                                  ) : (
                                    <>
                                      <Button
                                        variant="outlined"
                                        onClick={() => {
                                          setEditMode(false);
                                          setSelectedKafeelId(null);
                                          setKafeelFormData({});
                                        }}
                                      >
                                        إلغاء
                                      </Button>
                                      <Button
                                        variant="contained"
                                        startIcon={
                                          <Save sx={{ marginLeft: "10px" }} />
                                        }
                                        onClick={() => {
                                          handleSaveChanges(kafeel.id);
                                        }}
                                        sx={{
                        bgcolor: "primary.main",
                        "&:hover": { bgcolor: "primary.dark" },
                                        }}
                                      >
                                        حفظ
                                      </Button>
                                    </>
                                  )}
                                </>
                              )}
                              {permissions.includes("clients_Delete") &&
                                !isEditingThisKafeel && (
                                  <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={
                                      <Delete sx={{ marginLeft: "10px" }} />
                                    }
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      e.preventDefault();
                                      openDeleteKafeelModal(kafeel);
                                    }}
                                  >
                                    حذف
                                  </Button>
                                )}
                            </Box>
                          </Box>
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Typography
                                variant="body2"
                                mb={1}
                                fontWeight={500}
                              >
                                اسم الكفيل
                              </Typography>
                              <TextField
                                value={
                                  isEditingThisKafeel
                                    ? currentKafeelData.name
                                    : kafeel.name || ""
                                }
                                onChange={(e) =>
                                  handleKafeelInputChange(
                                    "name",
                                    e.target.value
                                  )
                                }
                                fullWidth
                                disabled={!isEditingThisKafeel}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    backgroundColor: isEditingThisKafeel
                                      ? (isDarkMode ? "background.paper" : "#fff")
                                      : (isDarkMode ? "background.default" : "#f9fafb"),
                                    borderRadius: "6px",
                                    width: "280px",
                                  },
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography
                                variant="body2"
                                mb={1}
                                fontWeight={500}
                              >
                                رقم هوية الكفيل
                              </Typography>
                              <TextField
                                value={
                                  isEditingThisKafeel
                                    ? currentKafeelData.nationalId
                                    : kafeel.nationalId || ""
                                }
                                onChange={(e) =>
                                  handleKafeelInputChange(
                                    "nationalId",
                                    e.target.value
                                  )
                                }
                                fullWidth
                                disabled={!isEditingThisKafeel}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    backgroundColor: isEditingThisKafeel
                                      ? (isDarkMode ? "background.paper" : "#fff")
                                      : (isDarkMode ? "background.default" : "#f9fafb"),
                                    borderRadius: "6px",
                                    width: "280px",
                                  },
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography
                                variant="body2"
                                mb={1}
                                fontWeight={500}
                              >
                                تاريخ الميلاد
                              </Typography>
                              <TextField
                                value={
                                  isEditingThisKafeel
                                    ? currentKafeelData.birthDate || ""
                                    : kafeel.birthDate
                                    ? new Date(kafeel.birthDate)
                                        .toISOString()
                                        .split("T")[0]
                                    : ""
                                }
                                onChange={(e) =>
                                  handleKafeelInputChange(
                                    "birthDate",
                                    e.target.value
                                  )
                                }
                                fullWidth
                                type="date"
                                disabled={!isEditingThisKafeel}
                                InputLabelProps={{ shrink: true }}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    backgroundColor: isEditingThisKafeel
                                      ? (isDarkMode ? "background.paper" : "#fff")
                                      : (isDarkMode ? "background.default" : "#f9fafb"),
                                    borderRadius: "6px",
                                  },
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography
                                variant="body2"
                                mb={1}
                                fontWeight={500}
                              >
                                المدينة
                              </Typography>
                              <TextField
                                value={
                                  isEditingThisKafeel
                                    ? currentKafeelData.city
                                    : kafeel.city || ""
                                }
                                onChange={(e) =>
                                  handleKafeelInputChange(
                                    "city",
                                    e.target.value
                                  )
                                }
                                fullWidth
                                disabled={!isEditingThisKafeel}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    backgroundColor: isEditingThisKafeel
                                      ? (isDarkMode ? "background.paper" : "#fff")
                                      : (isDarkMode ? "background.default" : "#f9fafb"),
                                    borderRadius: "6px",
                                    width: "280px",
                                  },
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography
                                variant="body2"
                                mb={1}
                                fontWeight={500}
                              >
                                الحي
                              </Typography>
                              <TextField
                                value={
                                  isEditingThisKafeel
                                    ? currentKafeelData.district
                                    : kafeel.district || ""
                                }
                                onChange={(e) =>
                                  handleKafeelInputChange(
                                    "district",
                                    e.target.value
                                  )
                                }
                                fullWidth
                                disabled={!isEditingThisKafeel}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    backgroundColor: isEditingThisKafeel
                                      ? (isDarkMode ? "background.paper" : "#fff")
                                      : (isDarkMode ? "background.default" : "#f9fafb"),
                                    borderRadius: "6px",
                                  },
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography
                                variant="body2"
                                mb={1}
                                fontWeight={500}
                              >
                                رقم الجوال
                              </Typography>
                              <TextField
                                value={
                                  isEditingThisKafeel
                                    ? currentKafeelData.phone
                                    : kafeel.phone || ""
                                }
                                onChange={(e) =>
                                  handleKafeelInputChange(
                                    "phone",
                                    e.target.value
                                  )
                                }
                                fullWidth
                                disabled={!isEditingThisKafeel}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    backgroundColor: isEditingThisKafeel
                                      ? (isDarkMode ? "background.paper" : "#fff")
                                      : (isDarkMode ? "background.default" : "#f9fafb"),
                                    borderRadius: "6px",
                                  },
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography
                                variant="body2"
                                mb={1}
                                fontWeight={500}
                              >
                                البريد الإلكتروني
                              </Typography>
                              <TextField
                                value={
                                  isEditingThisKafeel
                                    ? currentKafeelData.email
                                    : kafeel.email || ""
                                }
                                onChange={(e) =>
                                  handleKafeelInputChange(
                                    "email",
                                    e.target.value
                                  )
                                }
                                fullWidth
                                disabled={!isEditingThisKafeel}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    backgroundColor: isEditingThisKafeel
                                      ? (isDarkMode ? "background.paper" : "#fff")
                                      : (isDarkMode ? "background.default" : "#f9fafb"),
                                    borderRadius: "6px",
                                    width: "280px",
                                  },
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography
                                variant="body2"
                                mb={1}
                                fontWeight={500}
                              >
                                جهة العمل
                              </Typography>
                              <TextField
                                value={
                                  isEditingThisKafeel
                                    ? currentKafeelData.employer
                                    : kafeel.employer || ""
                                }
                                onChange={(e) =>
                                  handleKafeelInputChange(
                                    "employer",
                                    e.target.value
                                  )
                                }
                                fullWidth
                                disabled={!isEditingThisKafeel}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    backgroundColor: isEditingThisKafeel
                                      ? (isDarkMode ? "background.paper" : "#fff")
                                      : (isDarkMode ? "background.default" : "#f9fafb"),
                                    borderRadius: "6px",
                                  },
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography
                                variant="body2"
                                mb={1}
                                fontWeight={500}
                              >
                                الراتب
                              </Typography>
                              <TextField
                                value={
                                  isEditingThisKafeel
                                    ? currentKafeelData.salary
                                    : kafeel.salary || ""
                                }
                                onChange={(e) =>
                                  handleKafeelInputChange(
                                    "salary",
                                    e.target.value
                                  )
                                }
                                fullWidth
                                type="number"
                                disabled={!isEditingThisKafeel}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    backgroundColor: isEditingThisKafeel
                                      ? (isDarkMode ? "background.paper" : "#fff")
                                      : (isDarkMode ? "background.default" : "#f9fafb"),
                                    borderRadius: "6px",
                                  },
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <Typography
                                variant="body2"
                                mb={1}
                                fontWeight={500}
                              >
                                الالتزامات
                              </Typography>
                              <TextField
                                value={
                                  isEditingThisKafeel
                                    ? currentKafeelData.obligations
                                    : kafeel.obligations || ""
                                }
                                onChange={(e) =>
                                  handleKafeelInputChange(
                                    "obligations",
                                    e.target.value
                                  )
                                }
                                fullWidth
                                type="number"
                                disabled={!isEditingThisKafeel}
                                sx={{
                                  "& .MuiOutlinedInput-root": {
                                    backgroundColor: isEditingThisKafeel
                                      ? (isDarkMode ? "background.paper" : "#fff")
                                      : (isDarkMode ? "background.default" : "#f9fafb"),
                                    borderRadius: "6px",
                                  },
                                }}
                              />
                            </Grid>
                          </Grid>
                          {index < clientDetails.kafeels.length - 1 && (
                            <Box
                              sx={{ borderBottom: "1px solid #e0e0e0", my: 3 }}
                            />
                          )}
                        </Box>
                      );
                    })}
                  </Box>
                ) : clientDetails.kafeel ? (
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>
                        اسم الكفيل
                      </Typography>
                      <TextField
                        value={
                          editMode
                            ? kafeelFormData.name
                            : clientDetails.kafeel.name
                        }
                        onChange={(e) =>
                          handleKafeelInputChange("name", e.target.value)
                        }
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: editMode ? (isDarkMode ? "background.paper" : "#fff") : (isDarkMode ? "background.default" : "#f9fafb"),
                            borderRadius: "6px",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>
                        رقم هوية الكفيل
                      </Typography>
                      <TextField
                        value={
                          editMode
                            ? kafeelFormData.nationalId
                            : clientDetails.kafeel.nationalId
                        }
                        onChange={(e) =>
                          handleKafeelInputChange("nationalId", e.target.value)
                        }
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: editMode ? (isDarkMode ? "background.paper" : "#fff") : (isDarkMode ? "background.default" : "#f9fafb"),
                            borderRadius: "6px",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>
                        تاريخ الميلاد
                      </Typography>
                      <TextField
                        value={
                          editMode
                            ? kafeelFormData.birthDate
                            : clientDetails.kafeel.birthDate
                            ? new Date(clientDetails.kafeel.birthDate)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          handleKafeelInputChange("birthDate", e.target.value)
                        }
                        fullWidth
                        type="date"
                        disabled={!editMode}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: editMode ? (isDarkMode ? "background.paper" : "#fff") : (isDarkMode ? "background.default" : "#f9fafb"),
                            borderRadius: "6px",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>
                        المدينة
                      </Typography>
                      <TextField
                        value={
                          editMode
                            ? kafeelFormData.city
                            : clientDetails.kafeel.city
                        }
                        onChange={(e) =>
                          handleKafeelInputChange("city", e.target.value)
                        }
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: editMode ? (isDarkMode ? "background.paper" : "#fff") : (isDarkMode ? "background.default" : "#f9fafb"),
                            borderRadius: "6px",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>
                        الحي
                      </Typography>
                      <TextField
                        value={
                          editMode
                            ? kafeelFormData.district
                            : clientDetails.kafeel.district
                        }
                        onChange={(e) =>
                          handleKafeelInputChange("district", e.target.value)
                        }
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: editMode ? (isDarkMode ? "background.paper" : "#fff") : (isDarkMode ? "background.default" : "#f9fafb"),
                            borderRadius: "6px",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>
                        رقم الجوال
                      </Typography>
                      <TextField
                        value={
                          editMode
                            ? kafeelFormData.phone
                            : clientDetails.kafeel.phone
                        }
                        onChange={(e) =>
                          handleKafeelInputChange("phone", e.target.value)
                        }
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: editMode ? (isDarkMode ? "background.paper" : "#fff") : (isDarkMode ? "background.default" : "#f9fafb"),
                            borderRadius: "6px",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>
                        البريد الإلكتروني
                      </Typography>
                      <TextField
                        value={
                          editMode
                            ? kafeelFormData.email
                            : clientDetails.kafeel.email
                        }
                        onChange={(e) =>
                          handleKafeelInputChange("email", e.target.value)
                        }
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: editMode ? (isDarkMode ? "background.paper" : "#fff") : (isDarkMode ? "background.default" : "#f9fafb"),
                            borderRadius: "6px",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>
                        جهة العمل
                      </Typography>
                      <TextField
                        value={
                          editMode
                            ? kafeelFormData.employer
                            : clientDetails.kafeel.employer
                        }
                        onChange={(e) =>
                          handleKafeelInputChange("employer", e.target.value)
                        }
                        fullWidth
                        disabled={!editMode}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: editMode ? (isDarkMode ? "background.paper" : "#fff") : (isDarkMode ? "background.default" : "#f9fafb"),
                            borderRadius: "6px",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>
                        الراتب
                      </Typography>
                      <TextField
                        value={
                          editMode
                            ? kafeelFormData.salary
                            : clientDetails.kafeel.salary
                        }
                        onChange={(e) =>
                          handleKafeelInputChange("salary", e.target.value)
                        }
                        fullWidth
                        type="number"
                        disabled={!editMode}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: editMode ? (isDarkMode ? "background.paper" : "#fff") : (isDarkMode ? "background.default" : "#f9fafb"),
                            borderRadius: "6px",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" mb={1} fontWeight={500}>
                        الالتزامات
                      </Typography>
                      <TextField
                        value={
                          editMode
                            ? kafeelFormData.obligations
                            : clientDetails.kafeel.obligations
                        }
                        onChange={(e) =>
                          handleKafeelInputChange("obligations", e.target.value)
                        }
                        fullWidth
                        type="number"
                        disabled={!editMode}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: editMode ? (isDarkMode ? "background.paper" : "#fff") : (isDarkMode ? "background.default" : "#f9fafb"),
                            borderRadius: "6px",
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                ) : (
                  <Typography
                    variant="body1"
                    color="text.secondary"
                    align="center"
                  >
                    لا يوجد كفيل لهذا العميل
                  </Typography>
                )}
              </Paper>
            )}
            {tab === 3 && (
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Tabs
                    value={documentsTab}
                    onChange={(e, newValue) => setDocumentsTab(newValue)}
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{
                      '& .MuiTab-root': {
                        color: 'text.primary',
                        '&.Mui-selected': {
                          color: 'primary.main',
                        },
                      },
                    }}
                  >
                    <Tab label="مرفقات العميل" />
                    {(clientDetails.kafeels &&
                      clientDetails.kafeels.length > 0) ||
                    clientDetails.kafeel ? (
                      <Tab label="مرفقات الكفيل" />
                    ) : null}
                  </Tabs>
                  {documentsTab === 0 &&
                    permissions.includes("clients_Update") && (
                      <Button
                        variant="outlined"
                        startIcon={<Edit sx={{ marginLeft: "10px" }} />}
                        onClick={() => setIsDocumentsModalOpen(true)}
                      >
                        تعديل
                      </Button>
                    )}
                </Box>

                {/* Client Documents Tab */}
                {documentsTab === 0 && (
                  <Box>
                    {clientDetails.documents &&
                    clientDetails.documents.length > 0 ? (
                      (() => {
                        const clientGeneralDocs = [];
                        const loanDocsById = {};

                        clientDetails.documents.forEach((doc, docIndex) => {
                          Object.entries(doc).forEach(([key, value]) => {
                            if (value) {
                              if (key === 'loanId') return;

                              if (['clientIdImage', 'clientWorkCard', 'salaryReport', 'simaReport'].includes(key)) {
                                clientGeneralDocs.push({
                                  key,
                                  value,
                                  type: key,
                                  index: docIndex
                                });
                              }
                              else if (['DEBT_ACKNOWLEDGMENT', 'PROMISSORY_NOTE', 'SETTLEMENT'].includes(key)) {
                                const loanId = doc.loanId || 'unknown';
                                if (!loanDocsById[loanId]) {
                                  loanDocsById[loanId] = [];
                                }
                                loanDocsById[loanId].push({
                                  key,
                                  value,
                                  type: key,
                                  index: docIndex
                                });
                              }
                            }
                          });
                        });

                        const clientDocumentTypes = {
                          clientIdImage: "صورة هوية العميل",
                          clientWorkCard: "بطاقة عمل العميل",
                          salaryReport: "تقرير الراتب",
                          simaReport: "تقرير SIMA",
                          DEBT_ACKNOWLEDGMENT: "إقرار الدين",
                          PROMISSORY_NOTE: "سند الأمر",
                          SETTLEMENT: " تسوية سلفة ",
                        };

                        const renderDocumentCard = (doc, docType) => (
                          <Grid item xs={12} sm={6} md={4} lg={3} key={`${doc.key}-${doc.index}`}>
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
                              {renderFileThumbnail(doc.value, clientDocumentTypes[docType])}

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
                                    {clientDocumentTypes[docType]}
                                  </Typography>
                                </Box>

                                {permissions.includes("clients_Export") && (
                                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleDownloadFile(
                                          doc.value,
                                          "",
                                          clientDocumentTypes[docType],
                                          clientDetails.client.name
                                        )
                                      }
                                      title="تحميل"
                                    >
                                      <Download fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleShareFile(
                                          doc.value,
                                          clientDocumentTypes[docType],
                                          clientDetails.client.name
                                        );
                                      }}
                                      title="مشاركة"
                                    >
                                      <Share fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      onClick={() => window.open(doc.value, '_blank')}
                                      title="عرض"
                                    >
                                      <Visibility fontSize="small" />
                                    </IconButton>
                                  </Box>
                                )}
                              </Box>
                            </Paper>
                          </Grid>
                        );

                        return (
                          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {clientGeneralDocs.length > 0 && (
                              <Box>
                                <Typography variant="h6" color="primary" mb={3} textAlign="center" fontWeight="bold">
                                  مرفقات العميل العامة
                                </Typography>
                                <Grid container spacing={2}>
                                  {clientGeneralDocs.map((doc) => renderDocumentCard(doc, doc.key))}
                                </Grid>
                              </Box>
                            )}

                            {Object.keys(loanDocsById).length > 0 && (
                              <Box>
                                <Typography variant="h6" color="primary" mb={3} textAlign="center" fontWeight="bold">
                                  مرفقات السلفات
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                                  {Object.entries(loanDocsById).map(([loanId, docs], index) => {
                                    const getOrdinalText = (num) => {
                                      const ordinals = [
                                        "الأولى", "الثانية", "الثالثة", "الرابعة", "الخامسة",
                                        "السادسة", "السابعة", "الثامنة", "التاسعة", "العاشرة",
                                        "الحادية عشرة", "الثانية عشرة", "الثالثة عشرة", "الرابعة عشرة", "الخامسة عشرة",
                                        "السادسة عشرة", "السابعة عشرة", "الثامنة عشرة", "التاسعة عشرة", "العشرون"
                                      ];
                                      return ordinals[num] || `ال${num + 1}`;
                                    };

                                    return (
                                      <Box key={loanId}>
                                        <Typography variant="h6" color="black" mb={2}>
                                          مرفقات السلفة {getOrdinalText(index)}
                                        </Typography>
                                        <Grid container spacing={2}>
                                          {docs.map((doc) => renderDocumentCard(doc, doc.key))}
                                        </Grid>
                                      </Box>
                                    );
                                  })}
                                </Box>
                              </Box>
                            )}
                          </Box>
                        );
                      })()
                    ) : (
                      <Paper sx={{ p: 3, textAlign: "center" }}>
                        <Typography color="text.secondary">
                          لا توجد مستندات للعميل
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                )}

                {documentsTab === 1 && (
                  <Box>
                    {clientDetails.kafeels &&
                    clientDetails.kafeels.length > 0 ? (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 3,
                        }}
                      >
                        {clientDetails.kafeels.map((kafeel, kafeelIndex) => {
                          const kafeelDocuments = [
                            {
                              key: "kafeelIdImage",
                              value: kafeel.kafeelIdImage,
                              label: "صورة هوية الكفيل",
                            },
                            {
                              key: "kafeelWorkCard",
                              value: kafeel.kafeelWorkCard,
                              label: "بطاقة عمل الكفيل",
                            },
                          ].filter((doc) => doc.value);

                          return (
                            <Box key={kafeel.id || kafeelIndex}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  mb: 2,
                                }}
                              >
                                <Typography variant="h6" color="primary">
                                  الكفيل {kafeelIndex + 1} - {kafeel.name}
                                </Typography>
                                {permissions.includes("clients_Update") && (
                                  <Button
                                    variant="outlined"
                                    startIcon={
                                      <Edit sx={{ marginLeft: "10px" }} />
                                    }
                                    onClick={() => {
                                      setSelectedKafeelForDocuments(kafeel);
                                      setIsEditKafeelDocumentsModalOpen(true);
                                    }}
                                  >
                                    تعديل
                                  </Button>
                                )}
                              </Box>
                              {kafeelDocuments.length > 0 ? (
                                <Grid container spacing={2}>
                                  {kafeelDocuments.map((doc) => (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={doc.key}>
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
                                        {renderFileThumbnail(doc.value, doc.label)}
                                        
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
                                              {doc.label}
                                            </Typography>
                                          </Box>

                                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                            <IconButton
                                              size="small"
                                              onClick={() =>
                                                handleDownloadFile(
                                                  doc.value,
                                                  "",
                                                  doc.label,
                                                  clientDetails.client.name
                                                )
                                              }
                                              title="تحميل"
                                            >
                                              <Download fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                              size="small"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleShareFile(
                                                  doc.value,
                                                  doc.label,
                                                  clientDetails.client.name
                                                );
                                              }}
                                              title="مشاركة"
                                            >
                                              <Share fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                              size="small"
                                              onClick={() => window.open(doc.value, '_blank')}
                                              title="عرض"
                                            >
                                              <Visibility fontSize="small" />
                                            </IconButton>
                                          </Box>
                                        </Box>
                                      </Paper>
                                    </Grid>
                                  ))}
                                </Grid>
                              ) : (
                                <Paper sx={{ p: 3, textAlign: "center" }}>
                                  <Typography color="text.secondary">
                                    لا توجد مستندات للكفيل {kafeelIndex + 1}
                                  </Typography>
                                </Paper>
                              )}
                              {kafeelIndex <
                                clientDetails.kafeels.length - 1 && (
                                <Box
                                  sx={{
                                    borderBottom: "1px solid #e0e0e0",
                                    my: 3,
                                  }}
                                />
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    ) : clientDetails.kafeel ? (
                      <Box>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 2,
                          }}
                        >
                          <Typography variant="h6" color="primary">
                            الكفيل
                          </Typography>
                          {permissions.includes("clients_Update") && (
                            <Button
                              variant="outlined"
                              startIcon={<Edit sx={{ marginLeft: "10px" }} />}
                              onClick={() => {
                                setSelectedKafeelForDocuments(
                                  clientDetails.kafeel
                                );
                                setIsEditKafeelDocumentsModalOpen(true);
                              }}
                            >
                              تعديل
                            </Button>
                          )}
                        </Box>
                        {clientDetails.documents &&
                        clientDetails.documents.length > 0 ? (
                          <Grid container spacing={2}>
                            {Object.entries(clientDetails.documents[0]).map(
                              ([key, value]) => {
                                const kafeelDocumentTypes = {
                                  kafeelIdImage: "صورة هوية الكفيل",
                                  kafeelWorkCard: "بطاقة عمل الكفيل",
                                };

                                if (value && kafeelDocumentTypes[key]) {
                                  return (
                                    <Grid item xs={12} sm={6} md={4} lg={3} key={key}>
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
                                        {renderFileThumbnail(value, kafeelDocumentTypes[key])}
                                        
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
                                              {kafeelDocumentTypes[key]}
                                            </Typography>
                                          </Box>

                                          {/* أزرار العمليات */}
                                          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                            <IconButton
                                              size="small"
                                              onClick={() =>
                                                handleDownloadFile(
                                                  value,
                                                  "",
                                                  kafeelDocumentTypes[key],
                                                  clientDetails.client.name
                                                )
                                              }
                                              title="تحميل"
                                            >
                                              <Download fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                              size="small"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleShareFile(
                                                  value,
                                                  kafeelDocumentTypes[key],
                                                  clientDetails.client.name
                                                );
                                              }}
                                              title="مشاركة"
                                            >
                                              <Share fontSize="small" />
                                            </IconButton>
                                            <IconButton
                                              size="small"
                                              onClick={() => window.open(value, '_blank')}
                                              title="عرض"
                                            >
                                              <Visibility fontSize="small" />
                                            </IconButton>
                                          </Box>
                                        </Box>
                                      </Paper>
                                    </Grid>
                                  );
                                }
                                return null;
                              }
                            )}
                          </Grid>
                        ) : (
                          <Paper sx={{ p: 3, textAlign: "center" }}>
                            <Typography color="text.secondary">
                              لا توجد مستندات للكفيل
                            </Typography>
                          </Paper>
                        )}
                      </Box>
                    ) : (
                      <Paper sx={{ p: 3, textAlign: "center" }}>
                        <Typography color="text.secondary">
                          لا يوجد كفيل لهذا العميل
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                )}
              </Box>
            )}
            {tab === 4 && (
              <Box>
                {/* Date Filters and Export Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <TextField
                      label="من تاريخ"
                      type="date"
                      value={fromDate}
                      onChange={(e) =>
                        handleDateFilterChange("from", e.target.value)
                      }
                      InputLabelProps={{
                        shrink: true,
                      }}
                      size="small"
                      sx={{ width: 150 }}
                    />
                    <TextField
                      label="إلى تاريخ"
                      type="date"
                      value={toDate}
                      onChange={(e) =>
                        handleDateFilterChange("to", e.target.value)
                      }
                      InputLabelProps={{
                        shrink: true,
                      }}
                      size="small"
                      sx={{ width: 150 }}
                    />
                  </Box>
                  {permissions.includes("clients_Export") && (
                    <Box sx={{ display: "flex", gap: 2 }}>
                      <Button
                        variant="outlined"
                        startIcon={<PictureAsPdf sx={{ marginLeft: "10px" }} />}
                        onClick={handleExportPDF}
                        disabled={!clientStatement}
                        sx={{
                          borderColor: "#d32f2f",
                          color: "#d32f2f",
                          "&:hover": {
                            borderColor: "#b71c1c",
                            backgroundColor: "rgba(211, 47, 47, 0.04)",
                          },
                        }}
                      >
                        تصدير PDF
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<TableChart sx={{ marginLeft: "10px" }} />}
                        onClick={handleExportExcel}
                        disabled={!clientStatement}
                        sx={{
                          borderColor: "#2e7d32",
                          color: "#2e7d32",
                          "&:hover": {
                            borderColor: "#1b5e20",
                            backgroundColor: "rgba(46, 125, 50, 0.04)",
                          },
                        }}
                      >
                        تصدير Excel
                      </Button>
                    </Box>
                  )}
                </Box>

                {/* Statement Summary */}
                {clientStatement && (
                  <Paper sx={{ p: 3, mb: 3, bgcolor: isDarkMode ? 'background.paper' : "#f8f9fa" }}>
                    <Grid
                      container
                      spacing={6}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Grid item xs={12} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          إجمالي المدين
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color="error"
                        >
                          {clientStatement.client?.debit?.toLocaleString() || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          إجمالي الدائن
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color="success.main"
                        >
                          {clientStatement.client?.credit?.toLocaleString() || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={3} alignItems="center">
                        <Typography variant="body2" color="text.secondary">
                          الرصيد الحالي
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color="primary"
                        >
                          {clientStatement.client?.balance?.toLocaleString() || 0}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          عدد المعاملات
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color="info.main"
                        >
                          {clientStatement.totalTransactions || 0}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                {/* Transactions Table */}
                <Paper sx={{ width: "100%", overflow: "hidden" }}>
                  <TableContainer sx={{ maxHeight: 600 }}>
                    <Table stickyHeader aria-label="كشف حساب العميل">
                      <TableHead>
                        <TableRow>
                          <StyledTableCell
                            align="center"
                            sx={{ fontWeight: "bold", minWidth: 120 }}
                          >
                            التاريخ
                          </StyledTableCell>
                          <StyledTableCell
                            align="center"
                            sx={{ fontWeight: "bold", minWidth: 100 }}
                          >
                            المرجع
                          </StyledTableCell>
                          <StyledTableCell
                            align="center"
                            sx={{ fontWeight: "bold", minWidth: 200 }}
                          >
                            الوصف
                          </StyledTableCell>
                          <StyledTableCell
                            align="center"
                            sx={{ fontWeight: "bold", minWidth: 120 }}
                          >
                            مدين
                          </StyledTableCell>
                          <StyledTableCell
                            align="center"
                            sx={{ fontWeight: "bold", minWidth: 120 }}
                          >
                            دائن
                          </StyledTableCell>
                          <StyledTableCell
                            align="center"
                            sx={{ fontWeight: "bold", minWidth: 120 }}
                          >
                            الرصيد
                          </StyledTableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {clientStatement &&
                        clientStatement.transactions &&
                        clientStatement.transactions.length > 0 ? (
                          clientStatement.transactions.map(
                            (transaction) => (
                              <StyledTableRow key={transaction.id} hover>
                                <StyledTableCell align="center">
                                  {formatDate(transaction.date)}
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                  <Typography variant="body2" fontWeight="500">
                                    {transaction.reference}
                                  </Typography>
                                </StyledTableCell>
                                <StyledTableCell align="center">
                                  {transaction.description}
                                </StyledTableCell>
                                <StyledTableCell
                                  align="center"
                                  sx={{
                                    color:
                                      transaction.debit > 0
                                        ? "error.main"
                                        : "text.primary",
                                  }}
                                >
                                  {transaction.debit > 0
                                    ? transaction.debit.toLocaleString()
                                    : 0}
                                </StyledTableCell>
                                <StyledTableCell
                                  align="center"
                                  sx={{
                                    color:
                                      transaction.credit > 0
                                        ? "success.main"
                                        : "text.primary",
                                  }}
                                >
                                  {transaction.credit > 0
                                    ? transaction.credit.toLocaleString()
                                    : 0}
                                </StyledTableCell>
                                <StyledTableCell
                                  align="center"
                                  sx={{ fontWeight: "bold" }}
                                >
                                  {transaction.balance.toLocaleString()}
                                </StyledTableCell>
                              </StyledTableRow>
                            )
                          )
                        ) : (
                          <StyledTableRow>
                            <StyledTableCell
                              colSpan={14}
                              align="center"
                              sx={{ py: 3 }}
                            >
                              <Typography
                                variant="body1"
                                color="text.secondary"
                              >
                                لا توجد سلفات
                              </Typography>
                            </StyledTableCell>
                          </StyledTableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Table Footer with Pagination */}
                  {clientStatement && clientStatement.transactions && clientStatement.transactions.length > 0 && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        p: 2,
                        borderTop: "1px solid #e0e0e0",
                        bgcolor: isDarkMode ? 'background.paper' : '#fafafa',
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        إجمالي المعاملات: {clientStatement.totalTransactions || clientStatement.transactions.length}
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>
            )}
            {tab === 5 && (
              <Box>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" mb={3}>
                    سلفات العميل
                  </Typography>

                  {clientLoans &&
                  clientLoans.data &&
                  clientLoans.data.length > 0 ? (
                    <Box>
                      <ScrollableTableContainer>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <StyledTableCell
                                align="center"
                                sx={{ fontWeight: "bold", minWidth: 120 }}
                              >
                                كود السلفة
                              </StyledTableCell>
                              <StyledTableCell
                                align="center"
                                sx={{ fontWeight: "bold", minWidth: 120 }}
                              >
                                الشريك
                              </StyledTableCell>
                              <StyledTableCell
                                align="center"
                                sx={{ fontWeight: "bold", minWidth: 120 }}
                              >
                                الكفيل
                              </StyledTableCell>
                              <StyledTableCell
                                align="center"
                                sx={{ fontWeight: "bold", minWidth: 120 }}
                              >
                                الحساب البنكي
                              </StyledTableCell>
                              <StyledTableCell
                                align="center"
                                sx={{ fontWeight: "bold", minWidth: 120 }}
                              >
                                مصدر السلفة
                              </StyledTableCell>
                              <StyledTableCell
                                align="center"
                                sx={{ fontWeight: "bold", minWidth: 120 }}
                              >
                                مبلغ السلفة
                              </StyledTableCell>
                              <StyledTableCell
                                align="center"
                                sx={{ fontWeight: "bold", minWidth: 120 }}
                              >
                                مبلغ الدفعة
                              </StyledTableCell>
                              <StyledTableCell
                                align="center"
                                sx={{ fontWeight: "bold", minWidth: 120 }}
                              >
                                الفائدة
                              </StyledTableCell>
                              <StyledTableCell
                                align="center"
                                sx={{ fontWeight: "bold", minWidth: 120 }}
                              >
                                النوع / يوم الاستحقاق
                              </StyledTableCell>
                              <StyledTableCell
                                align="center"
                                sx={{ fontWeight: "bold", minWidth: 120 }}
                              >
                                الحالة
                              </StyledTableCell>
                              <StyledTableCell
                                align="center"
                                sx={{ fontWeight: "bold", minWidth: 120 }}
                              >
                                تاريخ الإنشاء
                              </StyledTableCell>
                              <StyledTableCell
                                align="center"
                                sx={{ fontWeight: "bold", minWidth: 120 }}
                              >
                                تاريخ الانتهاء
                              </StyledTableCell>
                              <StyledTableCell
                                align="center"
                                sx={{ fontWeight: "bold", minWidth: 80 }}
                              >
                                عرض التفاصيل
                              </StyledTableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {clientLoans.data.map((loan) => {
                              return (
                                <StyledTableRow key={loan.id} hover>
                                  <StyledTableCell align="center">
                                    <Typography
                                      variant="body2"
                                      fontWeight="500"
                                    >
                                      {loan.code}
                                    </Typography>
                                  </StyledTableCell>
                                  <StyledTableCell align="center">
                                    {loan.partner?.name || "-"}
                                  </StyledTableCell>
                                  <StyledTableCell align="center">
                                    {loan.kafeel?.name || "-"}
                                  </StyledTableCell>
                                  <StyledTableCell align="center">
                                    {loan.bankAccount?.name || "-"}
                                  </StyledTableCell>
                                  <StyledTableCell align="center">
                                    {getSourceText(loan.source)}
                                  </StyledTableCell>
                                  <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                                    {loan.amount?.toLocaleString()}
                                  </StyledTableCell>
                                  <StyledTableCell align="center">
                                    {loan.paymentAmount?.toLocaleString()}
                                  </StyledTableCell>
                                  <StyledTableCell align="center">
                                    {loan.interestAmount?.toLocaleString()} ({loan.interestRate}%)
                                  </StyledTableCell>
                                  <StyledTableCell align="center">
                                    <Stack spacing={0.25} sx={{ whiteSpace: "nowrap" }}>
                                      <Typography variant="body2">
                                        {getTypeText(loan.type)}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '14px' }}>
                                        يوم الاستحقاق: {loan.repaymentDay}
                                      </Typography>
                                    </Stack>
                                  </StyledTableCell>
                                  <StyledTableCell align="center">
                                    <Chip
                                      label={getStatusText(loan.status)}
                                      color={getStatusColor(loan.status)}
                                      size="small"
                                      variant="outlined"
                                    />
                                  </StyledTableCell>
                                  <StyledTableCell align="center">
                                    <Box>
                                      <Typography variant="body2" fontWeight="bold">
                                        {dayjs(loan.createdAt).format("DD/MM/YYYY")}
                                      </Typography>
                                      {loan.createdAtHijri && (
                                        <Typography variant="caption" color="text.secondary">
                                          {loan.createdAtHijri}
                                        </Typography>
                                      )}
                                    </Box>
                                  </StyledTableCell>
                                  <StyledTableCell align="center">
                                    <Box>
                                      {loan.status === "COMPLETED" && loan.endDate ? (
                                        <>
                                          <Typography variant="body2" fontWeight="bold">
                                            {dayjs(loan.endDate).format("DD/MM/YYYY")}
                                          </Typography>
                                          {loan.endDateHijri && (
                                            <Typography variant="caption" color="text.secondary">
                                              {loan.endDateHijri}
                                            </Typography>
                                          )}
                                        </>
                                      ) : (
                                        <Typography variant="body2" color="text.secondary">
                                          لم تنتهي بعد
                                        </Typography>
                                      )}
                                    </Box>
                                  </StyledTableCell>
                                  {/* Add View Details Icon Button */}
                                  <StyledTableCell align="center">
                                    {permissions.includes("loans_View") && (
                                      <IconButton
                                        size="small"
                                        onClick={() => handleViewLoanDetails(loan.id)}
                                        sx={{
                                          color: 'primary.main',
                                          '&:hover': {
                                            backgroundColor: 'rgba(13, 64, 165, 0.1)',
                                          }
                                        }}
                                        title="عرض التفاصيل"
                                      >
                                        <Visibility fontSize="small" />
                                      </IconButton>
                                    )}
                                  </StyledTableCell>
                                </StyledTableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </ScrollableTableContainer>

                      {/* Pagination for Loans */}
                      {clientLoans && clientLoans.totalPages > 1 && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            p: 2,
                            borderTop: "1px solid #e0e0e0",
                            bgcolor: isDarkMode ? 'background.paper' : '#fafafa',
                            mt: 2,
                          }}
                        >
                          <Typography variant="body2" color="text.secondary">
                            عرض {(loansPage - 1) * 10 + 1} -{" "}
                            {Math.min(loansPage * 10, clientLoans.total)} من{" "}
                            {clientLoans.total} سلفة
                          </Typography>

                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<ChevronRight />}
                              disabled={loansPage === 1}
                              onClick={() =>
                                handleLoansPageChange(null, loansPage - 1)
                              }
                              sx={{
                                minWidth: "70px",
                                fontSize: "0.75rem",
                                "&:disabled": {
                                  opacity: 0.5,
                                },
                              }}
                            >
                              السابق
                            </Button>

                            <Pagination
                              count={clientLoans.totalPages}
                              page={loansPage}
                              onChange={handleLoansPageChange}
                              color="primary"
                              size="small"
                              siblingCount={0}
                              boundaryCount={1}
                              sx={{
                                "& .MuiPaginationItem-root": {
                                  fontSize: "0.75rem",
                                  minWidth: "28px",
                                  height: "28px",
                                },
                              }}
                            />

                            <Button
                              variant="outlined"
                              size="small"
                              endIcon={<ChevronLeft />}
                              disabled={loansPage === clientLoans.totalPages}
                              onClick={() =>
                                handleLoansPageChange(null, loansPage + 1)
                              }
                              sx={{
                                minWidth: "70px",
                                fontSize: "0.75rem",
                                "&:disabled": {
                                  opacity: 0.5,
                                },
                              }}
                            >
                              التالي
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Paper sx={{ p: 3, textAlign: "center" }}>
                      <Typography color="text.secondary">
                        لا توجد سلفات لهذا العميل
                      </Typography>
                    </Paper>
                  )}
                </Paper>
              </Box>
            )}
          </Box>
        ) : (
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              {selectedClient
                ? "جاري تحميل البيانات..."
                : "اختر عميلاً لعرض التفاصيل"}
            </Typography>
            {selectedClient && <CircularProgress size={40} />}
          </Box>
        )}
      </Box>

      <AddClient
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      <AddAdditionalKafeel
        open={isAddKafeelModalOpen}
        onClose={() => setIsAddKafeelModalOpen(false)}
        clientId={selectedClient?.id}
      />

      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => handleDeleteClient(clientToDelete?.id)}
        title="حذف العميل"
        message={`هل أنت متأكد من حذف العميل ${clientToDelete?.name}؟`}
        ButtonText="حذف"
      />

      <DeleteModal
        open={isDeleteKafeelModalOpen}
        onClose={() => setIsDeleteKafeelModalOpen(false)}
        onConfirm={() => handleDeleteKafeel(kafeelToDelete?.id)}
        title="حذف الكفيل"
        message={`هل أنت متأكد من حذف الكفيل ${kafeelToDelete?.name}؟`}
        ButtonText="حذف"
      />

      <EditDocuments
        open={isDocumentsModalOpen}
        onClose={() => setIsDocumentsModalOpen(false)}
        clientId={selectedClient?.id}
        documents={clientDetails?.documents?.[0]}
        hasKafeel={!!clientDetails?.kafeel}
      />

      <EditKafeelDocuments
        open={isEditKafeelDocumentsModalOpen}
        onClose={() => {
          setIsEditKafeelDocumentsModalOpen(false);
          setSelectedKafeelForDocuments(null);
        }}
        kafeelId={selectedKafeelForDocuments?.id}
        kafeel={selectedKafeelForDocuments}
      />

    </Box>
  );
}
