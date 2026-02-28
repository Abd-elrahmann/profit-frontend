import React, { useState } from "react";
import {
  Box,
  Paper,
  TablePagination,
  useMediaQuery,
} from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getBanks, deleteBank } from "./bankApis";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import DeleteModal from "../../components/modals/DeleteModal";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import { useTheme } from "../../theme/ThemeContext";
import { exportBanksToPDF, exportBanksToExcel } from "../../utilities/banksExporter";
import {
  BanksToolbar,
  BanksTable,
  BanksCards,
  AddBank,
} from "../../components/Banks";
const Banks = () => {
  const { i18n } = useTranslation();
  const { isDarkMode } = useTheme();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [bankToDelete, setBankToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const isSmallScreen = isMobile || isTablet;
  const { permissions } = usePermissions();
  const queryClient = useQueryClient();
  const { data: banksData, isLoading } = useQuery({
    queryKey: ["banks", page, searchQuery],
    queryFn: () => getBanks(page, searchQuery),
    retry: 1,
  });
  const handleExportPDF = async () => {
    if (!banksData?.data || banksData.data.length === 0) {
      notifyError("لا توجد بيانات للتصدير");
      return;
    }
    try {
      await exportBanksToPDF(banksData.data, searchQuery);
      notifySuccess("تم تصدير الحسابات البنكية إلى PDF بنجاح");
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير PDF");
    }
  };
  const handleExportExcel = async () => {
    if (!banksData?.data || banksData.data.length === 0) {
      notifyError("لا توجد بيانات للتصدير");
      return;
    }
    try {
      await exportBanksToExcel(banksData.data, searchQuery);
      notifySuccess("تم تصدير الحسابات البنكية إلى Excel بنجاح");
    } catch (error) {
      notifyError("حدث خطأ أثناء تصدير Excel");
    }
  };
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };
  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };
  const handleDeleteBank = async (bankId) => {
    try {
      await deleteBank(bankId);
      notifySuccess("تم حذف الحساب البنكي بنجاح");
      queryClient.invalidateQueries(["banks"]);
      setIsDeleteModalOpen(false);
      setBankToDelete(null);
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء حذف الحساب البنكي");
    }
  };
  const handleEditBank = (bank) => {
    setSelectedBank(bank);
    setIsEditMode(true);
    setIsAddBankOpen(true);
  };
  const handleAddBank = () => {
    setSelectedBank(null);
    setIsEditMode(false);
    setIsAddBankOpen(true);
  };
  const handleCloseModal = () => {
    setIsAddBankOpen(false);
    setSelectedBank(null);
    setIsEditMode(false);
  };
  const handleSuccess = (updatedBankData = null, operationType = null) => {
    handleCloseModal();
    if (updatedBankData && operationType === "update") {
      queryClient.setQueryData(["banks", page, searchQuery], (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((bank) =>
            bank.id === updatedBankData.id ? { ...bank, ...updatedBankData } : bank
          ),
        };
      });
    } else {
      queryClient.invalidateQueries(["banks"]);
    }
  };
  const hasData = banksData?.data && banksData.data.length > 0;
  return (
    <Box sx={{ bgcolor: "background.paper", minHeight: "100vh", p: isSmallScreen ? 2 : 3 }}>
      <Helmet>
        <title>الحسابات البنكية</title>
        <meta name="description" content="الحسابات البنكية" />
      </Helmet>
      <BanksToolbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onExportPDF={handleExportPDF}
        onExportExcel={handleExportExcel}
        onAddBank={handleAddBank}
        hasExportPermission={permissions.includes("banks_Export")}
        hasAddPermission={permissions.includes("banks_Add")}
        hasData={hasData}
        isSmallScreen={isSmallScreen}
        isDarkMode={isDarkMode}
      />
      <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}>
        {isSmallScreen ? (
          <BanksCards
            banksData={banksData?.data}
            isLoading={isLoading}
            isSmallScreen={isSmallScreen}
            permissions={permissions}
            onEdit={handleEditBank}
            onDelete={(bank) => {
              setBankToDelete(bank);
              setIsDeleteModalOpen(true);
            }}
            i18nLanguage={i18n.language}
          />
        ) : (
          <BanksTable
            banksData={banksData?.data}
            isLoading={isLoading}
            isDarkMode={isDarkMode}
            permissions={permissions}
            onEdit={handleEditBank}
            onDelete={(bank) => {
              setBankToDelete(bank);
              setIsDeleteModalOpen(true);
            }}
            i18nLanguage={i18n.language}
          />
        )}
        {banksData && (
          <TablePagination
            component="div"
            count={banksData.total || 0}
            page={page - 1}
            onPageChange={handleChangePage}
            rowsPerPage={10}
            rowsPerPageOptions={[10]}
            labelDisplayedRows={({ from, to, count }) => `عرض ${from}-${to} من ${count}`}
            labelRowsPerPage="صفوف لكل صفحة:"
            sx={{
              "& .MuiTablePagination-toolbar": {
                flexDirection: isSmallScreen ? "column" : "row",
                gap: isSmallScreen ? 1 : 0,
                padding: isSmallScreen ? 1 : 2,
              },
              "& .MuiTablePagination-spacer": {
                display: isSmallScreen ? "none" : "block",
              },
            }}
          />
        )}
      </Paper>
      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setBankToDelete(null);
        }}
        onConfirm={() => handleDeleteBank(bankToDelete?.id)}
        title="حذف الحساب البنكي"
        message={`هل أنت متأكد من حذف الحساب البنكي ${bankToDelete?.name}؟`}
        ButtonText="حذف"
      />
      <AddBank
        open={isAddBankOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        bank={selectedBank}
        isEditMode={isEditMode}
        isSmallScreen={isSmallScreen}
      />
    </Box>
  );
};
export default Banks;