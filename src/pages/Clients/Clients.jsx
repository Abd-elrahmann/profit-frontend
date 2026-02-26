import React, { useState, useEffect, useCallback, useRef } from "react";
import { Box, Typography, CircularProgress, useMediaQuery } from "@mui/material";
import { InsertDriveFile } from "@mui/icons-material";
import Api, { handleApiError } from "../../config/Api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { debounce } from "../../utilities/debounce";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import { notifyError, notifySuccess } from "../../utilities/toastify";
import { Helmet } from "react-helmet-async";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import { useTheme } from "../../theme/ThemeContext";
import {
  exportStatementToPDF,
  exportStatementToExcel,
} from "../../utilities/statementExporter";

import DeleteModal from "../../components/modals/DeleteModal";

import {
  ClientsSidebar,
  ClientsHeader,
  ClientsProfileTab,
  ClientsFinancialTab,
  ClientsKafeelTab,
  ClientsDocumentsTab,
  ClientsStatementTab,
  ClientsLoansTab,
  getClients,
  getClientDetails,
  getClientStatement,
  getClientLoans,
  isImageFile,
} from "../../components/clients";

export default function Clients() {
  const [tab, setTab] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("الكل");
  const [selectedClient, setSelectedClient] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [isDeleteKafeelModalOpen, setIsDeleteKafeelModalOpen] = useState(false);
  const [kafeelToDelete, setKafeelToDelete] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [statementPage, setStatementPage] = useState(1);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [clientFormData, setClientFormData] = useState({});
  const [kafeelFormData, setKafeelFormData] = useState({});
  const [selectedKafeelId, setSelectedKafeelId] = useState(null);
  const [documentsTab, setDocumentsTab] = useState(0);
  const [loansPage, setLoansPage] = useState(1);
  const contentScrollRef = useRef(null);
  const listScrollRef = useRef(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { permissions } = usePermissions();
  const { isDarkMode } = useTheme();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const isSmallScreen = isMobile || isTablet;

  const { data: clientsData, isLoading: isClientsLoading, refetch } = useQuery({
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

  const { data: clientLoans } = useQuery({
    queryKey: ["client-loans", selectedClient?.id, loansPage],
    queryFn: () =>
      selectedClient ? getClientLoans(selectedClient.id, loansPage) : null,
    enabled: !!selectedClient && tab === 5,
    retry: 1,
  });

  const debouncedSearch = debounce((value) => {
    setSearch(value);
    setCurrentPage(1);
  }, 500);

  const handleSearchChange = (e) => debouncedSearch(e.target.value);

  const handleStatusChange = (status) => {
    if (status === "الكل") {
      setSelectedStatus("الكل");
    } else {
      setSelectedStatus((prev) => (prev === status ? "الكل" : status));
    }
    setCurrentPage(1);
  };

  const handlePageChange = (e, newPage) => setCurrentPage(newPage);

  const handleDateFilterChange = (field, value) => {
    if (field === "from") setFromDate(value);
    else if (field === "to") setToDate(value);
    setStatementPage(1);
  };

  const handleTabChange = (e, newValue) => setTab(newValue);

  const handleClientSelect = (client) => {
    setSelectedClient(client);
    setEditMode(false);
    setSelectedKafeelId(null);
    setStatementPage(1);
    setFromDate("");
    setToDate("");
  };

  useEffect(() => {
    if (selectedClient) {
      listScrollRef.current?.scrollTo?.(0, 0);
      document.querySelector('main')?.scrollTo?.(0, 0);
      window.scrollTo(0, 0);
    }
    if (selectedClient && clientDetails) {
      contentScrollRef.current?.scrollTo?.(0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- scroll on selection change only, not on object ref changes
  }, [selectedClient?.id, clientDetails?.client?.id]);

  const handleClientInputChange = (field, value) => {
    setClientFormData((prev) => ({ ...prev, [field]: value }));
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
          await Api.patch(
            `/api/clients/kafeel/${Number(kafeelIdToUse)}`,
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

      if (selectedClient?.id) await refetchClientDetails();
    } catch (error) {
      notifyError(
        error.response?.data?.message || "حدث خطأ أثناء تحديث البيانات"
      );
      handleApiError(error);
    }
  };

  const handleAddClient = () => navigate("/clients/add");

  const handleDeleteClient = async (clientId) => {
    try {
      await Api.delete(`/api/clients/${clientId}`);
      notifySuccess("تم حذف العميل بنجاح");
      refetch();
      if (selectedClient?.id === clientId) setSelectedClient(null);
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

      if (selectedClient?.id) await refetchClientDetails();

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
      const extension = fileName.split(".").pop() || "pdf";
      const newFileName = `${documentType}_${clientName}.${extension}`;
      saveAs(blob, newFileName);
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء تحميل الملف");
      handleApiError(error);
    }
  };

  const handleShareFile = async (fileUrl, fileName, clientName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const file = new File([blob], fileName + ".pdf", { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: fileName + ".pdf",
          text: `مشاركة مستند: ${clientName}`,
          files: [file],
        });
      } else {
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(fileUrl);
          notifySuccess("تم نسخ رابط الملف لأن المشاركة غير مدعومة");
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = fileUrl;
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand("copy");
            notifySuccess("تم نسخ رابط الملف لأن المشاركة غير مدعومة");
          } catch {
            notifyError("تعذرت نسخ رابط الملف تلقائياً — يرجى نسخه يدوياً");
          } finally {
            document.body.removeChild(textArea);
          }
        }
      }
    } catch {
      notifyError("حدث خطأ أثناء مشاركة الملف");
    }
  };

  const handleExportPDF = async () => {
    if (!clientStatement) return;
    try {
      await exportStatementToPDF(clientStatement, clientDetails.client.name);
      notifySuccess("تم تصدير كشف الحساب بصيغة PDF بنجاح");
    } catch {
      notifyError("حدث خطأ أثناء تصدير PDF");
    }
  };

  const handleExportExcel = async () => {
    if (!clientStatement) return;
    try {
      await exportStatementToExcel(clientStatement, clientDetails.client.name);
      notifySuccess("تم تصدير كشف الحساب بصيغة Excel بنجاح");
    } catch {
      notifyError("حدث خطأ أثناء تصدير Excel");
    }
  };

  const handleViewLoanDetails = (loanId) => {
    window.location.href = `/installments/${loanId}`;
  };

  const handleEditKafeel = (kafeel) => {
    const kafeelIdToEdit = Number(kafeel.id);
    if (!kafeelIdToEdit || isNaN(kafeelIdToEdit)) return;
    setSelectedKafeelId(kafeelIdToEdit);
    setEditMode(true);
    setKafeelFormData({
      name: kafeel.name || "",
      nationalId: kafeel.nationalId || "",
      birthDate: kafeel.birthDate
        ? new Date(kafeel.birthDate).toISOString().split("T")[0]
        : "",
      city: kafeel.city || "",
      district: kafeel.district || "",
      employer: kafeel.employer || "",
      salary: kafeel.salary || "",
      obligations: kafeel.obligations || "",
      phone: kafeel.phone || "",
      email: kafeel.email || "",
    });
  };

  const handleCancelKafeelEdit = () => {
    setEditMode(false);
    setSelectedKafeelId(null);
    setKafeelFormData({});
  };

  const renderFileThumbnail = useCallback(
    (fileUrl, label) => {
      if (!fileUrl) return null;

      if (isImageFile(fileUrl)) {
        return (
          <Box
            component="img"
            src={fileUrl}
            alt={label}
            sx={{
              width: "100%",
              height: 180,
              objectFit: "cover",
              borderRadius: 1,
              cursor: "pointer",
              transition: "transform 0.2s",
              "&:hover": { transform: "scale(1.02)" },
            }}
            onClick={() => window.open(fileUrl, "_blank")}
          />
        );
      }

      return (
        <Box
          sx={{
            width: "100%",
            height: 180,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: isDarkMode ? "background.default" : "#f5f5f5",
            borderRadius: 1,
            cursor: "pointer",
            transition: "background-color 0.2s",
            "&:hover": {
              backgroundColor: isDarkMode ? "action.hover" : "#e0e0e0",
            },
          }}
          onClick={() => window.open(fileUrl, "_blank")}
        >
          <InsertDriveFile sx={{ fontSize: 60, color: "#757575" }} />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
            اضغط للعرض
          </Typography>
        </Box>
      );
    },
    [isDarkMode]
  );

  useEffect(() => {
    if (clientsData?.clients?.length === 0 && selectedClient) {
      setSelectedClient(null);
    } else if (
      clientsData?.clients?.length > 0 &&
      !selectedClient &&
      !isMobile
    ) {
      setSelectedClient(clientsData.clients[0].client);
    }
  }, [clientsData, selectedClient, isMobile]);

  useEffect(() => {
    if (clientDetails?.client) {
      const c = clientDetails.client;
      setClientFormData({
        name: c.name || "",
        email: c.email || "",
        phone: c.phone || "",
        city: c.city || "",
        district: c.district || "",
        address: c.address || "",
        employer: c.employer || "",
        creationReason: c.creationReason || "",
        notes: c.notes || "",
        birthDate: c.birthDate
          ? new Date(c.birthDate).toISOString().split("T")[0]
          : "",
        salary: c.salary ?? "",
        obligations: c.obligations ?? "",
      });
    }
    if (clientDetails?.kafeel) {
      const k = clientDetails.kafeel;
      setKafeelFormData({
        name: k.name || "",
        nationalId: k.nationalId || "",
        birthDate: k.birthDate
          ? new Date(k.birthDate).toISOString().split("T")[0]
          : "",
        city: k.city || "",
        district: k.district || "",
        employer: k.employer || "",
        salary: k.salary ?? "",
        obligations: k.obligations ?? "",
        phone: k.phone || "",
        email: k.email || "",
      });
    } else {
      setKafeelFormData({});
    }
  }, [clientDetails]);

  const renderTabContent = () => {
    switch (tab) {
      case 0:
        return (
          <ClientsProfileTab
            clientDetails={clientDetails}
            clientFormData={clientFormData}
            editMode={editMode}
            isDarkMode={isDarkMode}
            isMobile={isMobile}
            onClientInputChange={handleClientInputChange}
          />
        );
      case 1:
        return <ClientsFinancialTab clientDetails={clientDetails} isMobile={isMobile} />;
      case 2:
        return (
          <ClientsKafeelTab
            clientDetails={clientDetails}
            selectedClient={selectedClient}
            editMode={editMode}
            selectedKafeelId={selectedKafeelId}
            kafeelFormData={kafeelFormData}
            permissions={permissions}
            isDarkMode={isDarkMode}
            isMobile={isMobile}
            onAddKafeel={() => navigate(`/clients/${selectedClient?.id}/add-kafeel`)}
            onEditKafeel={handleEditKafeel}
            onCancelEdit={handleCancelKafeelEdit}
            onSaveKafeel={handleSaveChanges}
            onDeleteKafeel={openDeleteKafeelModal}
            onKafeelInputChange={handleKafeelInputChange}
          />
        );
      case 3:
        return (
          <ClientsDocumentsTab
            clientDetails={clientDetails}
            documentsTab={documentsTab}
            permissions={permissions}
            isDarkMode={isDarkMode}
            isMobile={isMobile}
            onDocumentsTabChange={setDocumentsTab}
            onEditDocuments={() => navigate(`/clients/${selectedClient?.id}/edit-documents`)}
            onEditKafeelDocuments={(kafeel) =>
              navigate(`/clients/${selectedClient?.id}/kafeels/${kafeel?.id}/edit-documents`)
            }
            onDownloadFile={handleDownloadFile}
            onShareFile={handleShareFile}
            renderFileThumbnail={renderFileThumbnail}
          />
        );
      case 4:
        return (
          <ClientsStatementTab
            clientStatement={clientStatement}
            fromDate={fromDate}
            toDate={toDate}
            permissions={permissions}
            isDarkMode={isDarkMode}
            isMobile={isSmallScreen}
            onDateFilterChange={handleDateFilterChange}
            onExportPDF={handleExportPDF}
            onExportExcel={handleExportExcel}
          />
        );
      case 5:
        return (
          <ClientsLoansTab
            clientLoans={clientLoans}
            loansPage={loansPage}
            permissions={permissions}
            isDarkMode={isDarkMode}
            isMobile={isSmallScreen}
            onLoansPageChange={(e, p) => setLoansPage(p)}
            onViewLoanDetails={handleViewLoanDetails}
          />
        );
      default:
        return null;
    }
  };

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
        <title>العملاء</title>
        <meta name="description" content="العملاء" />
      </Helmet>

      <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
        {/* على الموبايل: عرض القائمة افتراضياً، وعرض التفاصيل عند اختيار عميل */}
        {(!isMobile || !selectedClient) && (
          <ClientsSidebar
            permissions={permissions}
            isDarkMode={isDarkMode}
            clientsData={clientsData}
            isClientsLoading={isClientsLoading}
            search={search}
            selectedStatus={selectedStatus}
            currentPage={currentPage}
            selectedClient={selectedClient}
            onAddClient={handleAddClient}
            onSearchChange={handleSearchChange}
            onStatusChange={handleStatusChange}
            onPageChange={handlePageChange}
            onClientSelect={handleClientSelect}
            onDeleteClient={openDeleteModal}
            listScrollRef={listScrollRef}
            isMobile={isMobile}
          />
        )}

        {(!isMobile || selectedClient) && (
          selectedClient && clientDetails ? (
            <Box
              ref={contentScrollRef}
              sx={{
                flex: 1,
                p: { xs: 2, sm: 3, md: 4 },
                bgcolor: "background.paper",
                overflowY: "auto",
                minWidth: 0,
              }}
            >
              <ClientsHeader
                clientDetails={clientDetails}
                tab={tab}
                editMode={editMode}
                permissions={permissions}
                isMobile={isMobile}
                isSmallScreen={isSmallScreen}
                onTabChange={handleTabChange}
                onEditModeToggle={() => setEditMode(!editMode)}
                onSaveChanges={() => handleSaveChanges()}
                onBackToList={() => setSelectedClient(null)}
              />
              {renderTabContent()}
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
          )
        )}
      </Box>

      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setClientToDelete(null);
        }}
        onConfirm={() => handleDeleteClient(clientToDelete?.id)}
        title="حذف العميل"
        message={`هل أنت متأكد من حذف العميل ${clientToDelete?.name}؟`}
        ButtonText="حذف"
      />

      <DeleteModal
        open={isDeleteKafeelModalOpen}
        onClose={() => {
          setIsDeleteKafeelModalOpen(false);
          setKafeelToDelete(null);
        }}
        onConfirm={() => handleDeleteKafeel(kafeelToDelete?.id)}
        title="حذف الكفيل"
        message={`هل أنت متأكد من حذف الكفيل ${kafeelToDelete?.name}؟`}
        ButtonText="حذف"
      />
    </Box>
  );
}
