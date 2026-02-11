import React from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Pagination,
  CircularProgress,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { StyledTableCell, StyledTableRow } from "../layouts/tableLayout";
import dayjs from "dayjs";

const InvestorsWithdrawalTable = ({
  data,
  isLoading,
  onViewDetails,
  currentPage,
  onPageChange,
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "WITHDRAWING":
        return "warning";
      case "WITHDRAWN":
        return "success";
      default:
        return "default";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "WITHDRAWING":
        return "قيد السحب";
      case "WITHDRAWN":
        return "تم السحب";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data || !data.data || data.data.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: "center", bgcolor: "background.default" }}>
        <Typography variant="h6" color="text.secondary">
          لا يوجد مستثمرين منسحبين
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Paper sx={{ width: "100%", overflow: "hidden", bgcolor: "background.default" }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <StyledTableRow>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                  الاسم
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                  رقم الهوية
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                  إجمالي المنسحب
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                  الدفعات المصروفة
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                  المتبقي
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                  الادخار
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                  حالة السحب
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                  الحالة
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                  تاريخ الطلب
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>
                  الإجراءات
                </StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {data.data.map((investor) => (
                <StyledTableRow key={investor.id} hover>
                  <StyledTableCell align="center">{investor.name}</StyledTableCell>
                  <StyledTableCell align="center">{investor.nationalId}</StyledTableCell>
                  <StyledTableCell align="center">
                    {investor.withdrawalRequest?.remainingCapital != null
                      ? Number(investor.withdrawalRequest.remainingCapital).toLocaleString()
                      : investor.totalAmount?.toLocaleString()}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {investor.totalPaidSoFar != null ? Number(investor.totalPaidSoFar).toLocaleString() : "0"}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {investor.remainingToPay != null ? Number(investor.remainingToPay).toLocaleString() : "-"}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {investor.withdrawalRequest?.savingAmount?.toLocaleString() || 0}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Chip
                      label={getStatusText(investor.withdrawingStatus)}
                      color={getStatusColor(investor.withdrawingStatus)}
                      size="small"
                    />
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Chip
                      label={investor.isFrozen ? "مجمّد" : "نشط"}
                      color={investor.isFrozen ? "error" : "success"}
                      size="small"
                    />
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    {investor.withdrawalRequest?.createdAt
                      ? dayjs(investor.withdrawalRequest.createdAt).format("DD/MM/YYYY")
                      : "-"}
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <IconButton
                      color="primary"
                      onClick={() => onViewDetails(investor.id)}
                      size="small"
                    >
                      <Visibility />
                    </IconButton>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 2,
              borderTop: "1px solid #eee",
              bgcolor: "background.default",
            }}
          >
            <Pagination
              count={data.totalPages}
              page={currentPage}
              onChange={(event, newPage) => onPageChange(newPage)}
              color="primary"
              size="small"
              siblingCount={1}
              boundaryCount={1}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default InvestorsWithdrawalTable;
