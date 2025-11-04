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
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { getJournals } from "../../pages/Journals/journalsApi";
import { StyledTableCell, StyledTableRow } from "../layouts/tableLayout";
import dayjs from "dayjs";

const JournalTable = ({ onViewDetails }) => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

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
          p: 2,
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
            width: "280px",
            borderRadius: "6px",
            p: 1,
          }}
        />
      </Box>

      {/* Table */}
      <Paper sx={{ flex: 1, width: "100%", overflow: "hidden" }}>
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
                        <IconButton
                          title="عرض التفاصيل"
                          size="small"
                          color="primary"
                          onClick={() => onViewDetails(journal.id)}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Stack>
                    </StyledTableCell>
                  </StyledTableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

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
        />
      )}
    </Box>
  );
};

export default JournalTable;