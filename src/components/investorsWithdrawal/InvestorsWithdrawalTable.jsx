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
  Card,
  CardContent,
  Stack,
  Divider,
  Button,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { StyledTableCell, StyledTableRow } from "../layouts/tableLayout";
import dayjs from "dayjs";
import { getWithdrawingStatusColor, getWithdrawingStatusText } from "./withdrawalUtils";
const InvestorsWithdrawalTable = ({
  data,
  isLoading,
  onViewDetails,
  currentPage,
  onPageChange,
  isMobile = false,
}) => {
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
  const renderCards = () => (
    <Box sx={{ width: "100%" }}>
      <Stack spacing={2}>
        {data.data.map((investor) => (
          <Card
            key={investor.id}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Stack spacing={1.5}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {investor.name}
                  </Typography>
                  <Chip
                    label={getWithdrawingStatusText(investor.withdrawingStatus)}
                    color={getWithdrawingStatusColor(investor.withdrawingStatus)}
                    size="small"
                  />
                </Box>
                <Divider />
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" color="text.secondary">رقم الهوية</Typography>
                    <Typography variant="body2">{investor.nationalId}</Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" color="text.secondary">إجمالي المنسحب</Typography>
                    <Typography variant="body2" fontWeight="600">
                      {investor.withdrawalRequest?.remainingCapital != null
                        ? Number(investor.withdrawalRequest.remainingCapital).toLocaleString()
                        : investor.totalAmount?.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" color="text.secondary">الدفعات المصروفة</Typography>
                    <Typography variant="body2">
                      {investor.totalPaidSoFar != null ? Number(investor.totalPaidSoFar).toLocaleString() : "0"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="caption" color="text.secondary">المتبقي</Typography>
                    <Typography variant="body2">
                      {investor.remainingToPay != null ? Number(investor.remainingToPay).toLocaleString() : "-"}
                    </Typography>
                  </Box>
                  </Box>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Visibility />}
                  onClick={() => onViewDetails(investor.id)}
                  sx={{ alignSelf: "flex-start" }}
                >
                  عرض التفاصيل
                </Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
      {data.totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
          <Pagination
            count={data.totalPages}
            page={currentPage}
            onChange={(_, p) => onPageChange(p)}
            color="primary"
            size="small"
          />
        </Box>
      )}
    </Box>
  );
  const renderTable = () => (
    <Box>
      <Paper sx={{ width: "100%", overflow: "hidden", bgcolor: "background.default" }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <StyledTableRow>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>الاسم</StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>رقم الهوية</StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>إجمالي المنسحب</StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>الدفعات المصروفة</StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>المتبقي</StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>الادخار</StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>حالة السحب</StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>تاريخ الطلب</StyledTableCell>
                <StyledTableCell align="center" sx={{ fontWeight: "bold" }}>الإجراءات</StyledTableCell>
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
                      label={getWithdrawingStatusText(investor.withdrawingStatus)}
                      color={getWithdrawingStatusColor(investor.withdrawingStatus)}
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
        {data.totalPages > 1 && (
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
              onChange={(_, newPage) => onPageChange(newPage)}
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
  return isMobile ? renderCards() : renderTable();
};
export default InvestorsWithdrawalTable;
