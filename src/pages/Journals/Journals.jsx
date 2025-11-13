import React, { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  TextField,
  Button,
  Stack,
  Divider,
  Alert,
  Table,
  TableBody,  
  TableContainer,
  TableHead,
  MenuItem,
  CircularProgress,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
  Cancel as CancelIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getJournalById,
  updateJournal,
  deleteJournal,
  postJournal,
  unpostJournal,
} from "./journalsApi";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import JournalTable from "../../components/modals/JournalTable";
import DeleteModal from "../../components/modals/DeleteModal";
import {
  StyledTableCell,
  StyledTableRow,
} from "../../components/layouts/tableLayout";
import { Helmet } from "react-helmet-async";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
const Journals = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [journalToDelete, setJournalToDelete] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    description: "",
    date: "",
    type: "",
  });
  const queryClient = useQueryClient();
  const { permissions } = usePermissions();
  const { data: journalData, isLoading: isJournalLoading } = useQuery({
    queryKey: ["journal", selectedJournal],
    queryFn: () => getJournalById(selectedJournal),
    enabled: !!selectedJournal && activeTab === 1,
    onSuccess: (data) => {
      if (data) {
        setEditForm({
          description: data.description || "",
          date: data.date ? data.date.split("T")[0] : "",
          type: data.type || "",
        });
      }
    },
  });

  const handleViewDetails = (journalId) => {
    setSelectedJournal(journalId);
    setActiveTab(1);
    setIsEditMode(false);
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Reset form to original data
    if (journalData) {
      setEditForm({
        description: journalData.description || "",
        date: journalData.date ? journalData.date.split("T")[0] : "",
        type: journalData.type || "",
      });
    }
  };

  const handleUpdateJournal = async () => {
    try {
      const updateData = {
        description: editForm.description,
        date: editForm.date,
        type: editForm.type,
      };

      await updateJournal(selectedJournal, updateData);
      notifySuccess("تم تعديل القيد بنجاح");
      setIsEditMode(false);
      queryClient.invalidateQueries(["journal", selectedJournal]);
      queryClient.invalidateQueries(["journals"]);
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء تعديل القيد");
    }
  };

  const handleInputChange = (field, value) => {
    setEditForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeleteJournal = async () => {
    try {
      await deleteJournal(journalToDelete);
      notifySuccess("تم حذف القيد بنجاح");
      setIsDeleteModalOpen(false);
      setJournalToDelete(null);
      setSelectedJournal(null);
      setActiveTab(0);
      queryClient.invalidateQueries(["journals"]);
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء حذف القيد");
    }
  };

  const handlePostJournal = async () => {
    try {
      await postJournal(selectedJournal);
      notifySuccess("تم اعتماد القيد بنجاح");
      queryClient.invalidateQueries(["journal", selectedJournal]);
      queryClient.invalidateQueries(["journals"]);
    } catch (error) {
      notifyError(
        error.response?.data?.message || "حدث خطأ أثناء اعتماد القيد"
      );
    }
  };

  const handleUnpostJournal = async () => {
    try {
      await unpostJournal(selectedJournal);
      notifySuccess("تم إلغاء اعتماد القيد بنجاح");
      queryClient.invalidateQueries(["journal", selectedJournal]);
      queryClient.invalidateQueries(["journals"]);
    } catch (error) {
      notifyError(
        error.response?.data?.message || "حدث خطأ أثناء إلغاء الاعتماد"
      );
    }
  };

  // Journal Source Type Arabic translations
  const getJournalSourceTypeText = (sourceType) => {
    switch (sourceType) {
      case "LOAN":
        return "سلفة";
      case "REPAYMENT":
        return "سداد";
      case "PARTNER":
        return "شريك";
      case "PERIOD_CLOSING":
        return "إقفال فترة";
      case "PARTNER_TRANSACTION_WITHDRAWAL":
        return "سحب مالي لشريك";
      case "PARTNER_TRANSACTION_DEPOSIT":
        return "إيداع مالي لشريك";
      case "OTHER":
        return "أخرى";
      default:
        return sourceType || "-";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "DRAFT":
        return "مسودة";
      case "POSTED":
        return "معتمد";
      case "CANCELLED":
        return "ملغي";
      default:
        return status;
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "#f6f6f8",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Helmet>
        <title>القيود المحاسبية</title>
        <meta name="description" content="القيود المحاسبية" />
      </Helmet>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row-reverse",
          flex: 1,
          height: "calc(100vh - 80px)",
          width: "100%",
        }}
      >
        {activeTab === 1 && journalData && (
          <Box
            sx={{
              width: "350px",
              borderRight: "1px solid #ddd",
              bgcolor: "#fafafa",
              height: "100%",
              overflowY: "auto",
              flexShrink: 0,
            }}
          >
            <Box
              sx={{ p: 3, borderBottom: "1px solid #ddd", bgcolor: "#fafafa" }}
            >
              <Typography variant="h6" color="primary" fontWeight="bold" mb={3}>
                معلومات القيد
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography color="error">إجمالي المدين:</Typography>
                  <Typography fontWeight="bold" color="error">
                    {journalData.totals.totalDebit.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography color="success">إجمالي الدائن:</Typography>
                  <Typography fontWeight="bold" color="success">
                    {journalData.totals.totalCredit.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography color="black">الاجمالي:</Typography>
                  <Typography fontWeight="bold" color="black">
                    {(journalData.totals.totalDebit - journalData.totals.totalCredit).toLocaleString()}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box sx={{ p: 3 }}>
              <Typography variant="h6" color="primary" fontWeight="bold" mb={3}>
                الإجراءات
              </Typography>
              <Stack spacing={2}>
                {journalData.status === "DRAFT" &&
                  !isEditMode &&
                  permissions.includes("journals_Update") && (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<EditIcon sx={{ marginLeft: "10px" }} />}
                        onClick={handleEditClick}
                        sx={{
                          bgcolor: "primary.main",
                          "&:hover": { bgcolor: "primary.dark" },
                        }}
                      >
                        تعديل القيد
                      </Button>
                      {permissions.includes("journals_Post") && (
                        <Button
                          variant="contained"
                          startIcon={<CheckIcon sx={{ marginLeft: "10px" }} />}
                          onClick={handlePostJournal}
                          sx={{
                            bgcolor: "success.main",
                            "&:hover": { bgcolor: "success.dark" },
                          }}
                        >
                          اعتماد القيد
                        </Button>
                      )}
                      {permissions.includes("journals_Delete") && (
                        <Button
                          variant="outlined"
                          startIcon={<DeleteIcon sx={{ marginLeft: "10px" }} />}
                          onClick={() => {
                            setJournalToDelete(selectedJournal);
                            setIsDeleteModalOpen(true);
                          }}
                          sx={{
                            borderColor: "error.main",
                            color: "error.main",
                            "&:hover": { bgcolor: "rgba(211, 47, 47, 0.1)" },
                          }}
                        >
                          حذف القيد
                        </Button>
                      )}
                    </>
                  )}

                {journalData.status === "DRAFT" &&
                  isEditMode &&
                  permissions.includes("journals_Update") && (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<SaveIcon sx={{ marginLeft: "10px" }} />}
                        onClick={handleUpdateJournal}
                        sx={{
                          bgcolor: "success.main",
                          "&:hover": { bgcolor: "success.dark" },
                        }}
                      >
                        حفظ التعديلات
                      </Button>
                      {permissions.includes("journals_Update") && (
                        <Button
                          variant="outlined"
                          onClick={handleCancelEdit}
                          sx={{
                            borderColor: "grey.500",
                            color: "grey.700",
                          }}
                        >
                          إلغاء التعديل
                        </Button>
                      )}
                    </>
                  )}

                {journalData.status === "POSTED" &&
                  permissions.includes("journals_Post") && (
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon sx={{ marginLeft: "10px" }} />}
                      onClick={handleUnpostJournal}
                      sx={{
                        borderColor: "error.main",
                        color: "error.main",
                        "&:hover": { bgcolor: "rgba(211, 47, 47, 0.1)" },
                      }}
                    >
                      إلغاء الاعتماد
                    </Button>
                  )}
              </Stack>
            </Box>
          </Box>
        )}

        <Box
          sx={{
            flex: 1,
            p: 4,
            bgcolor: "#fff",
            overflowY: "auto",
            width: "100%",
          }}
        >
          <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => {
                  setActiveTab(newValue);
                  if (newValue === 0) {
                    setSelectedJournal(null);
                    setIsEditMode(false);
                  }
                }}
              >
                <Tab
                  label="عرض جميع القيود"
                  sx={{
                    fontWeight: "bold",
                    borderBottom:
                      activeTab === 0 ? "3px solid #0d40a5" : "none",
                    color: activeTab === 0 ? "#0d40a5" : "text.secondary",
                  }}
                />
                <Tab
                  label={selectedJournal ? "تفاصيل القيد" : "قيد محدد"}
                  sx={{
                    fontWeight: "bold",
                    borderBottom:
                      activeTab === 1 ? "3px solid #0d40a5" : "none",
                    color: activeTab === 1 ? "#0d40a5" : "text.secondary",
                  }}
                />
              </Tabs>
            </Box>

            {activeTab === 0 ? (
              <JournalTable onViewDetails={handleViewDetails} />
            ) : (
              <Box>
                {!selectedJournal ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    يرجى اختيار قيد لعرض تفاصيله
                  </Alert>
                ) : isJournalLoading ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                    }}
                  >
                    <CircularProgress size={20} />
                  </Box>
                ) : journalData ? (
                  <Paper sx={{ p: 4, borderRadius: 2 }}>
                    <Typography
                      variant="h6"
                      color="primary"
                      fontWeight="bold"
                      mb={3}
                      textAlign={"center"}
                    >
                      تفاصيل القيد
                    </Typography>

                    <Grid
                      container
                      spacing={3}
                      mb={4}
                      justifyContent={"center"}
                    >
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="رقم القيد"
                          value={journalData.reference || ""}
                          disabled
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              width: "200px",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="التاريخ"
                          type="date"
                          value={
                            isEditMode
                              ? editForm.date
                              : journalData.date
                              ? journalData.date.split("T")[0]
                              : ""
                          }
                          onChange={(e) =>
                            handleInputChange("date", e.target.value)
                          }
                          disabled={!isEditMode}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              width: "200px",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="نوع القيد"
                          select
                          value={
                            isEditMode ? editForm.type : journalData.type || ""
                          }
                          onChange={(e) =>
                            handleInputChange("type", e.target.value)
                          }
                          disabled={!isEditMode}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              width: "200px",
                            },
                          }}
                        >
                          <MenuItem value="GENERAL">عام</MenuItem>
                          <MenuItem value="OPENING">افتتاحي</MenuItem>
                          <MenuItem value="CLOSING">ختامي</MenuItem>
                          <MenuItem value="ADJUSTMENT">تسوية</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="نوع المصدر"
                          value={
                            journalData.sourceType
                              ? getJournalSourceTypeText(journalData.sourceType)
                              : "لا يوجد"
                          }
                          disabled
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              width: "200px",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="الحالة"
                          value={getStatusText(journalData.status)}
                          disabled
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              width: "200px",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="المعتمد بواسطة"
                          value={
                            journalData.postedBy?.name || "لم يتم الاعتماد "
                          }
                          disabled
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              width: "200px",
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="الوصف"
                          value={
                            isEditMode
                              ? editForm.description
                              : journalData.description || ""
                          }
                          onChange={(e) =>
                            handleInputChange("description", e.target.value)
                          }
                          disabled={!isEditMode}
                          multiline
                          rows={2}
                          InputLabelProps={{ shrink: true }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              width: "650px",
                            },
                          }}
                        />
                      </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Typography
                      variant="h6"
                      color="primary"
                      fontWeight="bold"
                      mb={3}
                      textAlign={"center"}
                    >
                      بنود القيد
                    </Typography>

                    <TableContainer component={Paper} variant="outlined">
                      <Table>
                        <TableHead>
                          <StyledTableRow>
                            <StyledTableCell align="center">
                              الحساب
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              العميل
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              الطبيعة
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              مدين
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              دائن
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              الإجمالي
                            </StyledTableCell>
                          </StyledTableRow>
                        </TableHead>
                        <TableBody>
                          {journalData.lines?.map((line) => (
                            <StyledTableRow key={line.id}>
                              <StyledTableCell align="center">
                                {line.account?.code} - {line.account?.name}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {line.client?.name || "لا يوجد عميل"}
                              </StyledTableCell>
                              <StyledTableCell
                                align="center"
                                style={{
                                  color:
                                    line.account?.nature === "DEBIT"
                                      ? "#d32f2f"
                                      : line.account?.nature === "CREDIT"
                                      ? "#2e7d32"
                                      : "#000000",
                                  fontWeight: "bold",
                                }}
                              >
                                {line.account?.nature
                                  ? line.account.nature === "DEBIT"
                                    ? "مدين"
                                    : "دائن"
                                  : "-"}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {line.debit.toLocaleString() || 0}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {line.credit.toLocaleString() || 0}
                              </StyledTableCell>
                              <StyledTableCell align="center">
                                {line.balance.toLocaleString() || 0}
                              </StyledTableCell>
                            </StyledTableRow>
                          ))}
                          <StyledTableRow sx={{ backgroundColor: "#f5f5f5" }}>
                            <StyledTableCell colSpan={3} align="center">
                              <Typography fontWeight="bold">
                                الإجمالي
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              <Typography fontWeight="bold">
                                {journalData.totals.totalDebit.toLocaleString()}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              <Typography fontWeight="bold">
                                {journalData.totals.totalCredit.toLocaleString()}
                              </Typography>
                            </StyledTableCell>
                            <StyledTableCell align="center">
                              <Typography fontWeight="bold">
                                {Number(
                                  (journalData.totals.totalDebit - journalData.totals.totalCredit).toFixed(2)
                                ).toLocaleString()}
                              </Typography>
                            </StyledTableCell>
                          </StyledTableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Paper>
                ) : (
                  <Alert severity="error">حدث خطأ في تحميل بيانات القيد</Alert>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <DeleteModal
        open={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setJournalToDelete(null);
        }}
        onConfirm={handleDeleteJournal}
        title="حذف القيد"
        message="هل أنت متأكد من حذف هذا القيد؟"
        ButtonText="حذف"
      />
    </Box>
  );
};

export default Journals;
