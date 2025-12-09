import React, { useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TablePagination,
  IconButton,
  Chip,
  Stack,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Checkbox,
  Button,
  Alert,
} from "@mui/material";
import { Visibility, CheckCircle, Cancel } from "@mui/icons-material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getJournals, postMultipleJournals, unpostMultipleJournals } from "../../pages/Journals/journalsApi";
import { StyledTableCell, StyledTableRow } from "../layouts/tableLayout";
import dayjs from "dayjs";
import { usePermissions } from "../Contexts/PermissionsContext";
import { notifySuccess, notifyError } from "../../utilities/toastify";

const JournalTable = ({ onViewDetails, isMobile = false, searchFilters = {} }) => {
  const [page, setPage] = useState(1);
  const [selectedJournals, setSelectedJournals] = useState([]);
  const [isBulkOperationLoading, setIsBulkOperationLoading] = useState(false);
  const { permissions } = usePermissions();
  const queryClient = useQueryClient();

  const { data: journalsData, isLoading } = useQuery({
    queryKey: ["journals", page, searchFilters],
    queryFn: () => getJournals(page, searchFilters),
  });


  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
    setSelectedJournals([]); // Clear selection when changing page
  };

  // Handle individual journal selection
  const handleJournalSelect = (journalId) => {
    setSelectedJournals(prev =>
      prev.includes(journalId)
        ? prev.filter(id => id !== journalId)
        : [...prev, journalId]
    );
  };

  // Handle select all journals
  const handleSelectAll = () => {
    if (selectedJournals.length === journalsData?.journals?.length) {
      setSelectedJournals([]);
    } else {
      setSelectedJournals(journalsData?.journals?.map(journal => journal.id) || []);
    }
  };

  // Bulk post journals
  const handleBulkPost = async () => {
    if (selectedJournals.length === 0) {
      notifyError("يرجى اختيار القيود المراد اعتمادها");
      return;
    }

    // Check if any selected journals are already posted
    const journalsToPost = journalsData?.journals?.filter(journal =>
      selectedJournals.includes(journal.id)
    );
    const alreadyPosted = journalsToPost.filter(journal => journal.status === 'POSTED');

    if (alreadyPosted.length > 0) {
      notifyError(`لا يمكن اعتماد القيود التالية لأنها معتمدة بالفعل: ${alreadyPosted.map(j => j.reference).join(', ')}`);
      return;
    }

    try {
      setIsBulkOperationLoading(true);
      await postMultipleJournals(selectedJournals);
      notifySuccess(`تم اعتماد ${selectedJournals.length} قيد بنجاح`);
      setSelectedJournals([]);
      queryClient.invalidateQueries(["journals"]);
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء اعتماد القيود");
    } finally {
      setIsBulkOperationLoading(false);
    }
  };

  // Bulk unpost journals
  const handleBulkUnpost = async () => {
    if (selectedJournals.length === 0) {
      notifyError("يرجى اختيار القيود المراد إلغاء اعتمادها");
      return;
    }

    // Check if any selected journals are not posted
    const journalsToUnpost = journalsData?.journals?.filter(journal =>
      selectedJournals.includes(journal.id)
    );
    const notPosted = journalsToUnpost.filter(journal => journal.status !== 'POSTED');

    if (notPosted.length > 0) {
      notifyError(`لا يمكن إلغاء اعتماد القيود التالية لأنها غير معتمدة: ${notPosted.map(j => j.reference).join(', ')}`);
      return;
    }

    try {
      setIsBulkOperationLoading(true);
      await unpostMultipleJournals(selectedJournals);
      notifySuccess(`تم إلغاء اعتماد ${selectedJournals.length} قيد بنجاح`);
      setSelectedJournals([]);
      queryClient.invalidateQueries(["journals"]);
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء إلغاء اعتماد القيود");
    } finally {
      setIsBulkOperationLoading(false);
    }
  };

  // Journal Type Arabic translations
  const getJournalTypeText = (type) => {
    switch (type) {
      case "GENERAL":
        return "عام";
      case "OPENING":
        return "افتتاحي";
      case "CLOSING":
        return "ختامي";
      case "ADJUSTMENT":
        return "تسوية";
      default:
        return type;
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
      case "EXPENSES":
        return "مصروف";
      case "OTHER":
        return "أخرى";
      default:
        return sourceType || "-";
    }
  };

  // Journal Status Arabic translations
  const getStatusColor = (status) => {
    switch (status) {
      case "DRAFT":
        return "warning";
      case "POSTED":
        return "success";
      case "CANCELLED":
        return "error";
      default:
        return "default";
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

  // Render table for large screens
  const renderTable = () => (
    <TableContainer sx={{ height: "100%", width: "100%" }}>
      <Table stickyHeader sx={{ width: "100%" }}>
        <TableHead>
          <StyledTableRow>
            {(permissions.includes("journals_Post") || permissions.includes("journals_Update")) && (
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap", width: "50px" }}>
                <Checkbox
                  checked={selectedJournals.length === journalsData?.journals?.length && journalsData?.journals?.length > 0}
                  indeterminate={selectedJournals.length > 0 && selectedJournals.length < (journalsData?.journals?.length || 0)}
                  onChange={handleSelectAll}
                  size="small"
                  sx={{ color: 'white', '&.Mui-checked': { color: 'white' } }}
                />
              </StyledTableCell>
            )}
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              رقم القيد
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              النوع
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              الحالة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              المصدر
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              المعتمد بواسطة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              تاريخ الإنشاء
            </StyledTableCell>
            {(permissions.includes("journals_Update") || permissions.includes("journals_Delete") || permissions.includes("journals_Add")) && (
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              الإجراءات
            </StyledTableCell>
            )}
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <StyledTableRow>
              <StyledTableCell colSpan={8} align="center">
                <CircularProgress size={20} />
              </StyledTableCell>
            </StyledTableRow>
          ) : journalsData?.journals?.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell colSpan={8} align="center">
                <Typography>لا توجد قيود</Typography>
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            journalsData?.journals?.map((journal) => (
              <StyledTableRow
                key={journal.id}
              >
                {(permissions.includes("journals_Post") || permissions.includes("journals_Update")) && (
                  <StyledTableCell align="center">
                    <Checkbox
                      checked={selectedJournals.includes(journal.id)}
                      onChange={() => handleJournalSelect(journal.id)}
                      size="small"
                      sx={{ 
                        color: 'primary.main',
                        '&.Mui-checked': { 
                          color: 'primary.main' 
                        }
                      }}
                    />
                  </StyledTableCell>
                )}
                <StyledTableCell align="center">
                  {journal.reference}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {getJournalTypeText(journal.type)}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Chip
                    label={getStatusText(journal.status)}
                    color={getStatusColor(journal.status)}
                    size="small"
                  />
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {getJournalSourceTypeText(journal.sourceType)}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {journal.postedBy?.name || "لم يتم الاعتماد "}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {dayjs(journal.createdAt).format("DD/MM/YYYY")}
                </StyledTableCell>
                {(permissions.includes("journals_Update") || permissions.includes("journals_Delete") || permissions.includes("journals_Add")) && (
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Stack direction="row" spacing={1} justifyContent="center">
                    {permissions.includes("journals_Update") && (
                    <IconButton
                      title="عرض التفاصيل"
                      size="small"
                      color="primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(journal.id);
                      }}
                    >
                      <Visibility fontSize="small" />
                    </IconButton>
                    )}
                  </Stack>
                </StyledTableCell>
                )}
              </StyledTableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Render cards for small screens
  const renderCards = () => (
    <Box sx={{ p: 1 }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={30} />
        </Box>
      ) : journalsData?.journals?.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            لا توجد قيود
          </Typography>
        </Box>
      ) : (
        <>
          {/* Select All for Mobile */}
          {(permissions.includes("journals_Post") || permissions.includes("journals_Update")) && journalsData?.journals?.length > 0 && (
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Checkbox
                checked={selectedJournals.length === journalsData?.journals?.length && journalsData?.journals?.length > 0}
                indeterminate={selectedJournals.length > 0 && selectedJournals.length < (journalsData?.journals?.length || 0)}
                onChange={handleSelectAll}
                size="small"
                sx={{ 
                  color: 'primary.main',
                  '&.Mui-checked': { 
                    color: 'primary.main' 
                  },
                  '&.MuiCheckbox-indeterminate': {
                    color: 'primary.main'
                  }
                }}
              />
              <Typography variant="body2" color="text.secondary">
                اختيار الكل
              </Typography>
            </Box>
          )}
          <Grid container spacing={2}>
          {journalsData?.journals?.map((journal) => (
            <Grid item xs={12} key={journal.id}>
              <Card
                sx={{
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  },
                  cursor: 'pointer'
                }}
                onClick={() => onViewDetails(journal.id)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    {/* Header with Checkbox */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {(permissions.includes("journals_Post") || permissions.includes("journals_Update")) && (
                          <Checkbox
                            checked={selectedJournals.includes(journal.id)}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleJournalSelect(journal.id);
                            }}
                            size="small"
                            sx={{ 
                              color: 'primary.main',
                              '&.Mui-checked': { 
                                color: 'primary.main' 
                              }
                            }}
                          />
                        )}
                        <Typography variant="h6" fontWeight="bold" color="primary.main">
                          {journal.reference}
                        </Typography>
                      </Box>
                      <Chip
                        label={getStatusText(journal.status)}
                        color={getStatusColor(journal.status)}
                        size="small"
                      />
                    </Box>

                    {/* Journal Details */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          النوع:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {getJournalTypeText(journal.type)}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          المصدر:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {getJournalSourceTypeText(journal.sourceType)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Additional Info */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          المعتمد بواسطة:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {journal.postedBy?.name || "لم يتم الاعتماد"}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          التاريخ:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {dayjs(journal.createdAt).format("DD/MM/YYYY")}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Action Button */}
                    {permissions.includes("journals_Update") && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
                        <IconButton
                          title="عرض التفاصيل"
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(journal.id);
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
          </Grid>
        </>
      )}
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      {/* Bulk Actions */}
      {selectedJournals.length > 0 && (permissions.includes("journals_Post") || permissions.includes("journals_Update")) && (
        <Paper sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: "#f5f5f5" }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{gap: 2}}>
            <Typography variant="body2" color="text.secondary">
              تم اختيار {selectedJournals.length} قيد
            </Typography>
            <Stack direction="row" sx={{ gap: 2 }}>
              {permissions.includes("journals_Post") && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CheckCircle sx={{marginLeft: "10px"}} />}
                  onClick={handleBulkPost}
                  disabled={isBulkOperationLoading}
                  sx={{
                    bgcolor: "success.main",
                    "&:hover": { bgcolor: "success.dark" },
                  }}
                >
                  اعتماد المحدد
                </Button>
              )}
              {permissions.includes("journals_Post") && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Cancel sx={{marginLeft: "10px"}} />}
                  onClick={handleBulkUnpost}
                  disabled={isBulkOperationLoading}
                  sx={{
                    borderColor: "error.main",
                    color: "error.main",
                    "&:hover": { bgcolor: "rgba(211, 47, 47, 0.1)" },
                  }}
                >
                  إلغاء اعتماد المحدد
                </Button>
              )}
              <Button
                variant="outlined"
                size="small"
                onClick={() => setSelectedJournals([])}
                disabled={isBulkOperationLoading}
              >
                إلغاء الاختيار
              </Button>
            </Stack>
          </Stack>
          {isBulkOperationLoading && (
            <Alert severity="info" sx={{ mt: 1 }}>
              جاري معالجة العملية...
            </Alert>
          )}
        </Paper>
      )}

      {/* Table for large screens, Cards for small screens */}
      <Paper sx={{ flex: 1, width: "100%", overflow: "hidden", borderRadius: 2 }}>
        {isMobile ? renderCards() : renderTable()}

        {/* Pagination */}
        {journalsData && (
          <TablePagination
            component="div"
            count={journalsData.total || 0}
            page={page - 1}
            onPageChange={handleChangePage}
            rowsPerPage={10}
            rowsPerPageOptions={[10]}
            labelDisplayedRows={({ from, to, count }) =>
              `عرض ${from}-${to} من ${count}`
            }
            labelRowsPerPage="صفوف لكل صفحة:"
            sx={{
              '& .MuiTablePagination-toolbar': {
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 1 : 0,
                padding: isMobile ? 1 : 2
              },
            }}
          />
        )}
      </Paper>
    </Box>
  );
};

export default JournalTable;