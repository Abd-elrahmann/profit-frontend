import React from "react";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Box,
  Typography,
  Stack,
  IconButton,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Visibility as VisibilityIcon } from "@mui/icons-material";
import { StyledTableCell, StyledTableRow } from "../layouts/tableLayout";
import {
  formatNumber,
  formatArabicDate,
  hasDistribution,
} from "./profitDistributionUtils";

export default function ProfitDistributionTable({
  closedPeriods,
  isLoading,
  permissions,
  onViewDetails,
  onOpenDistributionDialog,
}) {
  return (
    <TableContainer sx={{ height: "100%", width: "100%" }}>
      <Table stickyHeader sx={{ width: "100%" }}>
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              اسم الفترة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              تاريخ البداية
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              تاريخ النهاية
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              أرباح الشركة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              إجمالي أرباح الشركاء
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              المبلغ المدخر
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              حالة التوزيع
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
          ) : closedPeriods?.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell colSpan={8} align="center">
                <Typography>لا توجد فترات مقفلة</Typography>
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            closedPeriods?.map((period) => (
              <StyledTableRow key={period.periodId}>
                <StyledTableCell align="center">{period.name}</StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ lineHeight: 1 }}>
                      {formatArabicDate(period.startDate)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        lineHeight: 1.2,
                        fontWeight: "bold",
                        color: "primary.main",
                        fontSize: "0.875rem",
                      }}
                    >
                      {period.startdateHijri}
                    </Typography>
                  </Box>
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <Typography variant="body2" sx={{ lineHeight: 1.2 }}>
                      {formatArabicDate(period.endDate)}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        lineHeight: 1.2,
                        fontWeight: "bold",
                        color: "primary.main",
                        fontSize: "0.875rem",
                      }}
                    >
                      {period.enddateHijri}
                    </Typography>
                  </Box>
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Typography fontWeight="bold" color="black">
                    {formatNumber(period.companyProfit) || 0}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Typography fontWeight="bold" color="success.main">
                    {formatNumber(period.totalAfterSaving) || 0}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Typography fontWeight="bold" color="warning.main">
                    {formatNumber(period.totalSaving) || 0}
                  </Typography>
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Chip
                    label={hasDistribution(period) ? "موزعة" : "غير موزعة"}
                    color={hasDistribution(period) ? "success" : "warning"}
                    size="small"
                  />
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Stack direction="row" spacing={1} justifyContent="center">
                    {permissions?.includes("distribution_View") && (
                      <IconButton
                        title="عرض التفاصيل"
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetails(period.periodId);
                        }}
                      >
                        <VisibilityIcon fontSize="small" />
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
}
