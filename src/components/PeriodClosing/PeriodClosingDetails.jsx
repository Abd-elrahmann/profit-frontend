import React from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Divider,
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import {
  StyledTableCell,
  StyledTableRow,
} from "../layouts/tableLayout";
import PeriodClosingExportButtons from "./PeriodClosingExportButtons";
import PeriodClosingDetailsForm from "./PeriodClosingDetailsForm";
import { formatDateWithHijri } from "./periodClosingUtils.jsx";
import PeriodClosingSummaryCards from "./PeriodClosingSummaryCards";
import PeriodClosingActions from "./PeriodClosingActions";
import PeriodClosingJournalsTable from "./PeriodClosingJournalsTable";
import PeriodClosingJournalsCards from "./PeriodClosingJournalsCards";

export default function PeriodClosingDetails({
  periodData,
  theme,
  isSmallScreen,
  showDraftAlert,
  draftCount,
  permissions,
  isExporting,
  onExportPDF,
  onExportExcel,
  onClosePeriod,
  onUnpostClosing,
  onNavigateToJournalEntries,
  onNavigateToProfitDistribution,
  onViewJournal,
}) {
  const journals = periodData?.journals || [];

  if (isSmallScreen) {
    return (
      <Box>
        <Box sx={{ display: "flex", gap: 1, mb: 2, justifyContent: "center" }}>
          <PeriodClosingExportButtons
          onExportPDF={onExportPDF}
          onExportExcel={onExportExcel}
          isExporting={isExporting}
          permissions={permissions}
          size="small"
        />
        </Box>
        {showDraftAlert && !periodData?.isClosed && (
          <Alert
            severity="warning"
            sx={{ mb: 3 }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={onNavigateToJournalEntries}
                sx={{ fontWeight: "bold" }}
              >
                انتقل للقيود
              </Button>
            }
          >
            لا يمكنك إغلاق هذه الفترة لأن هناك {draftCount} قيد غير معتمد.
            برجاء اعتمادها أولاً.
          </Alert>
        )}

        <PeriodClosingSummaryCards periodData={periodData} />
        <PeriodClosingActions
          periodData={periodData}
          permissions={permissions}
          onClosePeriod={onClosePeriod}
          onUnpostClosing={onUnpostClosing}
        />
        <PeriodClosingDetailsForm periodData={periodData} />

        {periodData?.isClosed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Alert
              severity={
                periodData?.totalPartnerProfit || periodData?.companyProfit
                  ? "success"
                  : "info"
              }
              sx={{ flex: 1 }}
            >
              {periodData?.totalPartnerProfit || periodData?.companyProfit
                ? "تم إغلاق الفترة وتوزيعها"
                : " تم اغلاق الفترة ولكن تحتاج الي توزيع ارباحها"}
            </Alert>
            <Button
              variant="outlined"
              color={
                periodData?.totalPartnerProfit || periodData?.companyProfit
                  ? "success"
                  : "warning"
              }
              onClick={onNavigateToProfitDistribution}
              sx={{
                fontWeight: "bold",
                fontSize: "0.9rem",
                borderRadius: 1,
                minHeight: "auto",
                py: 0.75,
                px: 2,
              }}
            >
              الذهاب للتوزيع
            </Button>
          </Box>
        )}

        {periodData?.partnerProfits && periodData.partnerProfits.length > 0 && (
          <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
            <Typography
              variant="h6"
              fontWeight="bold"
              mb={2}
              textAlign="center"
            >
              تفصيل أرباح الشركاء
            </Typography>
            <Stack spacing={2}>
              {periodData.partnerProfits.map((partner) => (
                <Card key={partner.partnerId} variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                    <Stack spacing={1}>
                      <Typography
                        variant="subtitle2"
                        fontWeight="bold"
                        textAlign="center"
                        mb={1}
                      >
                        {partner.partnerName}
                      </Typography>
                      <Box
                        sx={{ display: "flex", justifyContent: "space-between" }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          الربح الإجمالي:
                        </Typography>
                        <Typography variant="body2" color="success.main">
                          {(partner.grossProfit || 0).toLocaleString()}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", justifyContent: "space-between" }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          حصة المصروفات:
                        </Typography>
                        <Typography variant="body2" color="error.main">
                          -{(partner.expenseShare || 0).toLocaleString()}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 0.5 }} />
                      <Box
                        sx={{ display: "flex", justifyContent: "space-between" }}
                      >
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color="text.secondary"
                        >
                          صافي الربح:
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          color="success.main"
                        >
                          {(partner.netProfit || 0).toLocaleString()}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>
        )}

        <PeriodClosingJournalsCards
          journals={journals}
          onViewJournal={onViewJournal}
        />

        {journals.length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            لا توجد قيود في هذه الفترة
          </Alert>
        )}
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 4, borderRadius: 2 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ flex: 1 }} />
        <Typography
          variant="h6"
          color="primary"
          fontWeight="bold"
          textAlign="center"
          sx={{ flex: 1 }}
        >
          تفاصيل الفترة
        </Typography>
        <Box
          sx={{ display: "flex", gap: 1, flex: 1, justifyContent: "flex-end" }}
        >
          <PeriodClosingExportButtons
            onExportPDF={onExportPDF}
            onExportExcel={onExportExcel}
            isExporting={isExporting}
            permissions={permissions}
          />
        </Box>
      </Box>

      {showDraftAlert && !periodData?.isClosed && (
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={onNavigateToJournalEntries}
              sx={{ fontWeight: "bold" }}
            >
              انتقل للقيود
            </Button>
          }
        >
          لا يمكنك إغلاق هذه الفترة لأن هناك {draftCount} قيد غير معتمد.
          برجاء اعتمادها أولاً.
        </Alert>
      )}

      <Grid container spacing={10} mb={4} justifyContent="center" alignItems="center">
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            اسم الفترة:
          </Typography>
          <Typography variant="body1">{periodData?.name || "-"}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            الحالة:
          </Typography>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: 16,
              fontSize: 14,
              backgroundColor: periodData?.isClosed
                ? "rgba(46, 125, 50, 0.1)"
                : "rgba(237, 108, 2, 0.1)",
              color: periodData?.isClosed ? "#2e7d32" : "#ed6c02",
            }}
          >
            {periodData?.isClosed ? "مقفلة" : "مفتوحة"}
          </span>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            تاريخ البداية:
          </Typography>
          {formatDateWithHijri(
            periodData?.startDate,
            periodData?.startDateHijri
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            تاريخ النهاية:
          </Typography>
          {formatDateWithHijri(periodData?.endDate, periodData?.endDateHijri)}
        </Grid>
      </Grid>

      {periodData?.isClosed && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, my: 3 }}>
          <Alert
            severity={
              periodData?.totalPartnerProfit || periodData?.companyProfit
                ? "success"
                : "info"
            }
            sx={{ flex: 1 }}
          >
            {periodData?.totalPartnerProfit || periodData?.companyProfit
              ? "تم إغلاق الفترة وتوزيعها"
              : " تم اغلاق الفترة ولكن تحتاج الي توزيع ارباحها"}
          </Alert>
          <Button
            variant="outlined"
            color={
              periodData?.totalPartnerProfit || periodData?.companyProfit
                ? "success"
                : "warning"
            }
            onClick={onNavigateToProfitDistribution}
            sx={{
              fontWeight: "bold",
              fontSize: "0.9rem",
              borderRadius: 1,
              minHeight: "auto",
              py: 0.75,
              px: 2,
            }}
          >
            الذهاب للتوزيع
          </Button>
        </Box>
      )}

      {periodData?.partnerProfits && periodData.partnerProfits.length > 0 && (
        <>
          <Typography
            variant="h6"
            color="primary"
            fontWeight="bold"
            mb={3}
            textAlign="center"
          >
            جدول أرباح الشركاء
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <StyledTableRow>
                  <StyledTableCell align="center">اسم الشريك</StyledTableCell>
                  <StyledTableCell align="center">الربح الإجمالي</StyledTableCell>
                  <StyledTableCell align="center">حصة المصروفات</StyledTableCell>
                  <StyledTableCell align="center">صافي الربح</StyledTableCell>
                </StyledTableRow>
              </TableHead>
              <TableBody>
                {periodData.partnerProfits.map((partner) => (
                  <StyledTableRow key={partner.partnerId}>
                    <StyledTableCell
                      align="center"
                      style={{ fontWeight: "bold" }}
                    >
                      {partner.partnerName}
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      style={{ color: "#2e7d32" }}
                    >
                      {(partner.grossProfit || 0).toLocaleString()}
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      style={{ color: "#d32f2f" }}
                    >
                      -{(partner.expenseShare || 0).toLocaleString()}
                    </StyledTableCell>
                    <StyledTableCell
                      align="center"
                      style={{ fontWeight: "bold", color: "#2e7d32" }}
                    >
                      {(partner.netProfit || 0).toLocaleString()}
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
                <StyledTableRow
                  style={{
                    backgroundColor: theme.palette.grey[100],
                    borderTop: `2px solid ${theme.palette.primary.main}`,
                  }}
                >
                  <StyledTableCell
                    align="center"
                    style={{ fontWeight: "bold", fontSize: "1.1em" }}
                  >
                    إجمالي أرباح الشركاء
                  </StyledTableCell>
                  <StyledTableCell
                    align="center"
                    style={{
                      fontWeight: "bold",
                      color: "#2e7d32",
                      fontSize: "1.1em",
                    }}
                  >
                    {(periodData?.grossProfit?.partnerTotal || 0).toLocaleString()}
                  </StyledTableCell>
                  <StyledTableCell
                    align="center"
                    style={{
                      fontWeight: "bold",
                      color: "#d32f2f",
                      fontSize: "1.1em",
                    }}
                  >
                    -
                    {(periodData?.expenseDistribution?.partnersShare || 0).toLocaleString()}
                  </StyledTableCell>
                  <StyledTableCell
                    align="center"
                    style={{
                      fontWeight: "bold",
                      color: "#2e7d32",
                      fontSize: "1.1em",
                    }}
                  >
                    {(periodData.totalPartnerProfit || 0).toLocaleString()}
                  </StyledTableCell>
                </StyledTableRow>
              </TableBody>
            </Table>
          </TableContainer>
          <Divider sx={{ my: 3 }} />
        </>
      )}

      <Typography
        variant="h6"
        color="primary"
        fontWeight="bold"
        mb={3}
        textAlign="center"
      >
        جدول أرباح الشركة
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell align="center">النوع</StyledTableCell>
              <StyledTableCell align="center">الربح الإجمالي</StyledTableCell>
              <StyledTableCell align="center">حصة المصروفات</StyledTableCell>
              <StyledTableCell align="center">باقي أرباح الشركاء</StyledTableCell>
              <StyledTableCell align="center">صافي الربح</StyledTableCell>
              <StyledTableCell align="center">الإجمالي</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            <StyledTableRow>
              <StyledTableCell align="center" style={{ fontWeight: "bold" }}>
                أرباح الشركة
              </StyledTableCell>
              <StyledTableCell align="center" style={{ color: "#2e7d32" }}>
                {(periodData?.grossProfit?.companyTotal || 0).toLocaleString()}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ color: "#d32f2f" }}>
                -
                {(periodData?.expenseDistribution?.companyShare || 0).toLocaleString()}
              </StyledTableCell>
              <StyledTableCell align="center" style={{ color: "#ed6c02" }}>
                +{(periodData?.centCollected || 0).toLocaleString()}
              </StyledTableCell>
              <StyledTableCell
                align="center"
                style={{ fontWeight: "bold", color: "#1976d2" }}
              >
                {(periodData?.companyProfit || 0).toLocaleString()}
              </StyledTableCell>
              <StyledTableCell
                align="center"
                style={{
                  fontWeight: "bold",
                  color: "#d32f2f",
                  fontSize: "1.1em",
                }}
              >
                {((periodData?.companyProfit || 0) +
                  (periodData?.centCollected || 0)).toLocaleString()}
              </StyledTableCell>
            </StyledTableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 3 }} />

      <Typography
        variant="h6"
        color="primary"
        fontWeight="bold"
        mb={3}
        textAlign="center"
      >
        الإجمالي العام
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <StyledTableRow>
              <StyledTableCell align="center">النوع</StyledTableCell>
              <StyledTableCell align="center">الأرباح الإجمالية</StyledTableCell>
              <StyledTableCell align="center">المصروفات المخصومة</StyledTableCell>
              <StyledTableCell align="center">صافي الأرباح</StyledTableCell>
            </StyledTableRow>
          </TableHead>
          <TableBody>
            <StyledTableRow
              style={{
                backgroundColor: theme.palette.grey[100],
                borderTop: `2px solid ${theme.palette.primary.main}`,
              }}
            >
              <StyledTableCell
                align="center"
                style={{ fontWeight: "bold", fontSize: "1.1em" }}
              >
                الإجمالي العام
              </StyledTableCell>
              <StyledTableCell
                align="center"
                style={{
                  fontWeight: "bold",
                  color: "#d32f2f",
                  fontSize: "1.1em",
                }}
              >
                {(periodData?.grossProfit?.total || 0).toLocaleString()}
              </StyledTableCell>
              <StyledTableCell
                align="center"
                style={{
                  fontWeight: "bold",
                  color: "#d32f2f",
                  fontSize: "1.1em",
                }}
              >
                -
                {(periodData?.expenseDistribution?.totalExpenses || 0).toLocaleString()}
              </StyledTableCell>
              <StyledTableCell
                align="center"
                style={{
                  fontWeight: "bold",
                  color: "#d32f2f",
                  fontSize: "1.1em",
                }}
              >
                {(periodData?.totalProfit || 0).toLocaleString()}
              </StyledTableCell>
            </StyledTableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Divider sx={{ my: 3 }} />

      <Typography
        variant="h6"
        color="primary"
        fontWeight="bold"
        mb={3}
        textAlign="center"
      >
        قيود الفترة ({journals.length})
      </Typography>

      {journals.length > 0 ? (
        <PeriodClosingJournalsTable
          journals={journals}
          theme={theme}
          onViewJournal={onViewJournal}
        />
      ) : (
        <Alert severity="info">لا توجد قيود في هذه الفترة</Alert>
      )}
    </Paper>
  );
}
