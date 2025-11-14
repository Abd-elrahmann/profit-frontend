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
  InputBase,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { getJournals } from "../../pages/Journals/journalsApi";
import { StyledTableCell, StyledTableRow } from "../layouts/tableLayout";
import dayjs from "dayjs";
import { usePermissions } from "../Contexts/PermissionsContext";

const JournalTable = ({ onViewDetails, isMobile = false }) => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const { permissions } = usePermissions(); 
  
  const { data: journalsData, isLoading } = useQuery({
    queryKey: ["journals", page, searchQuery],
    queryFn: () => getJournals(page, searchQuery),
  });

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
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
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              الإجراءات
            </StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <StyledTableRow>
              <StyledTableCell colSpan={7} align="center">
                <CircularProgress size={20} />
              </StyledTableCell>
            </StyledTableRow>
          ) : journalsData?.journals?.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell colSpan={7} align="center">
                <Typography>لا توجد قيود</Typography>
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            journalsData?.journals?.map((journal) => (
              <StyledTableRow 
                key={journal.id} 
                hover
                onClick={() => onViewDetails(journal.id)}
                sx={{ cursor: "pointer" }}
              >
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
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        {journal.reference}
                      </Typography>
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
      {/* Search Bar */}
      <Box
        sx={{
          p: isMobile ? 1 : 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <InputBase
          placeholder="ابحث برقم القيد أو الوصف..."
          value={searchQuery}
          onChange={handleSearchChange}
          sx={{
            width: isMobile ? "100%" : "280px",
            borderRadius: "6px",
            p: 1,
            border: "1px solid #e0e0e0",
            bgcolor: "background.paper"
          }}
        />
      </Box>

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