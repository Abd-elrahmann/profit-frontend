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
  IconButton,
  Chip,
} from "@mui/material";
import ProfitDistributionActions from "./ProfitDistributionActions";
import {
  Visibility as VisibilityIcon,
  AccountBalance as BalanceIcon,
  Savings as SavingsIcon,
  PictureAsPdf as PDFIcon,
  TableRows as ExcelIcon,
} from "@mui/icons-material";
import { StyledTableCell, StyledTableRow, ScrollableTableContainer } from "../layouts/tableLayout";
import {
  formatNumber,
  formatDate,
  formatArabicDate,
  getJournalStatusText,
  hasDistribution,
  calculateProfitAfterSaving,
} from "./profitDistributionUtils";

export default function ProfitDistributionDetails({
  periodData,
  theme,
  isSmallScreen,
  enableSaving,
  savingPercentage,
  permissions,
  isExporting,
  onExportPDF,
  onExportExcel,
  onViewJournal,
  onEnableSavingChange,
  onOpenSavingDialog,
  onOpenDistributionDialog,
  selectedPeriod,
}) {
  const profitAfterSaving = calculateProfitAfterSaving(
    periodData,
    enableSaving,
    savingPercentage
  );

  const partnerProfitDisplay =
    enableSaving && savingPercentage > 0
      ? formatNumber(profitAfterSaving.partnerProfit)
      : formatNumber(
          periodData?.totalAfterSaving ||
            periodData?.partners?.reduce(
              (sum, p) => sum + (p.totalAfterSaving || p.totalProfit || 0),
              0
            ) ||
            0
        );

  const savedAmountDisplay =
    enableSaving && savingPercentage > 0
      ? profitAfterSaving.savedAmount
      : periodData?.totalSaving ||
        periodData?.partners?.reduce((sum, p) => sum + (p.savingAmount || 0), 0) ||
        0;

  const showSavingCard =
    (enableSaving && savingPercentage > 0) ||
    (periodData?.totalSaving > 0) ||
    periodData?.partners?.some((p) => (p.savingAmount || 0) > 0);

  if (isSmallScreen) {
    return (
      <Box>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 2,
            mb: 3,
            justifyContent: "center",
          }}
        >
          <Card
            sx={{
              flex: 1,
              minWidth: 120,
              bgcolor: "rgba(25, 118, 210, 0.1)",
              textAlign: "center",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="primary.main">
                أرباح الشركة
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="primary.main"
                sx={{ wordBreak: "break-all" }}
              >
                {formatNumber(periodData?.companyProfit) || 0}
              </Typography>
            </CardContent>
          </Card>
          <Card
            sx={{
              flex: 1,
              minWidth: 120,
              bgcolor: "rgba(46, 125, 50, 0.1)",
              textAlign: "center",
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" color="success.main">
                أرباح الشركاء
              </Typography>
              <Typography
                variant="h6"
                fontWeight="bold"
                color="success.main"
                sx={{ wordBreak: "break-all" }}
              >
                {partnerProfitDisplay}
              </Typography>
            </CardContent>
          </Card>
          {showSavingCard && (
            <Card
              sx={{
                flex: 1,
                minWidth: 120,
                bgcolor: "rgba(237, 108, 2, 0.1)",
                textAlign: "center",
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography variant="body2" color="warning.main">
                  المبلغ المدخر
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  color="warning.main"
                  sx={{ wordBreak: "break-all" }}
                >
                  {formatNumber(savedAmountDisplay) || 0}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Box>

        <ProfitDistributionActions
          periodData={periodData}
          theme={theme}
          permissions={permissions}
          enableSaving={enableSaving}
          savingPercentage={savingPercentage}
          onEnableSavingChange={onEnableSavingChange}
          onOpenSavingDialog={onOpenSavingDialog}
          onOpenDistributionDialog={onOpenDistributionDialog}
          selectedPeriod={selectedPeriod}
        />

        <Paper sx={{ p: 3, borderRadius: 2, mb: 2 }}>
          <Typography variant="h6" fontWeight="bold" mb={3} textAlign="center">
            معلومات الفترة
          </Typography>

          <Stack spacing={2}>
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                اسم الفترة
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {periodData?.name || "-"}
              </Typography>
            </Box>

            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                تاريخ البداية
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 0.5,
                }}
              >
                <Typography variant="body1" fontWeight="bold">
                  {formatArabicDate(periodData?.startDate)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "bold",
                    color: "primary.main",
                    fontSize: "0.875rem",
                  }}
                >
                  {periodData?.startdateHijri}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                تاريخ النهاية
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: 0.5,
                }}
              >
                <Typography variant="body1" fontWeight="bold">
                  {formatArabicDate(periodData?.endDate)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "bold",
                    color: "primary.main",
                    fontSize: "0.875rem",
                  }}
                >
                  {periodData?.enddateHijri}
                </Typography>
              </Box>
            </Box>

            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                حالة التوزيع
              </Typography>
              <Chip
                label={hasDistribution(periodData) ? "موزعة" : "غير موزعة"}
                color={hasDistribution(periodData) ? "success" : "warning"}
                size="small"
              />
            </Box>

            {(enableSaving && savingPercentage > 0) ||
            (periodData?.totalSaving > 0) ? (
              <Box sx={{ pt: 2, borderTop: "1px solid #e0e0e0" }}>
                <Typography variant="body2" color="warning.main" gutterBottom>
                  معلومات الادخار:
                </Typography>
                {enableSaving && savingPercentage > 0 && (
                  <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                    نسبة الادخار: {savingPercentage.toFixed(2)}%
                  </Typography>
                )}
                <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                  المبلغ المدخر:{" "}
                  {formatNumber(savedAmountDisplay)}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                    fontSize: "0.8rem",
                    mt: 1,
                    fontWeight: "bold",
                  }}
                >
                  أرباح الشركة: {formatNumber(periodData?.companyProfit || 0)}{" "}
                  (لا تتأثر)
                </Typography>
              </Box>
            ) : null}
          </Stack>
        </Paper>

        {periodData?.partners && periodData.partners.length > 0 && (
          <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2} textAlign="center">
              أرباح الشركاء
            </Typography>

            <Stack spacing={2}>
              {periodData.partners.map((partner) => (
                <Card key={partner.partnerId} variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                    <Stack spacing={1}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {partner.partnerName}
                      </Typography>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 1,
                        }}
                      >
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            الرقم القومي:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {partner.nationalId || "-"}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            الهاتف:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {partner.phone || "-"}
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 1,
                        }}
                      >
                        <Box>
                          <Typography variant="body2" color="textSecondary">
                            المبلغ قبل الادخار:
                          </Typography>
                          <Typography variant="body2" fontWeight="medium">
                            {formatNumber(partner.finalProfit) || 0}
                          </Typography>
                        </Box>
                        {(periodData.partners.some((p) => p.savingAmount) ||
                          enableSaving) && (
                          <Box>
                            <Typography variant="body2" color="textSecondary">
                              المبلغ بعد الادخار:
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight="medium"
                              color="success.main"
                            >
                              {formatNumber(
                                enableSaving && savingPercentage > 0
                                  ? partner.finalProfit * (1 - savingPercentage / 100)
                                  : partner.totalAfterSaving ||
                                    partner.finalProfit ||
                                    0
                              )}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {((enableSaving && savingPercentage > 0) ||
                        (partner.savingAmount || 0) > 0) && (
                        <Box sx={{ pt: 1, borderTop: "1px solid #e0e0e0" }}>
                          <Typography variant="body2" color="warning.main">
                            المبلغ المدخر:{" "}
                            {formatNumber(
                              enableSaving && savingPercentage > 0
                                ? (partner.finalProfit || partner.totalProfit || 0) *
                                    (savingPercentage / 100)
                                : partner.savingAmount || 0
                            )}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Paper>
        )}

        {periodData?.distributionJournal && (
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2} textAlign="center">
              قيد توزيع الأرباح
            </Typography>

            <Card variant="outlined" sx={{ mb: 2 }}>
              <CardContent sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight="bold"
                      color="primary"
                    >
                      {periodData.distributionJournal.reference}
                    </Typography>
                    <Chip
                      label={getJournalStatusText(
                        periodData.distributionJournal.status
                      )}
                      color={
                        periodData.distributionJournal.status === "POSTED"
                          ? "success"
                          : "default"
                      }
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2">
                    {periodData.distributionJournal.description}
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="body2" color="textSecondary">
                      {formatArabicDate(periodData.distributionJournal.date)}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() =>
                        onViewJournal(periodData.distributionJournal.id)
                      }
                      title="عرض تفاصيل القيد"
                    >
                      <VisibilityIcon color="primary" />
                    </IconButton>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Paper>
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
        <Typography
          variant="h6"
          color="primary"
          fontWeight="bold"
          textAlign="center"
        >
          تفاصيل توزيع الأرباح
        </Typography>
        {permissions?.includes("distribution_Export") && (
          <Stack direction="row" spacing={1} sx={{ gap: "10px" }}>
            <Button
              variant="contained"
              startIcon={<PDFIcon sx={{ marginLeft: "10px" }} />}
              onClick={onExportPDF}
              disabled={isExporting}
              sx={{
                bgcolor: "#d32f2f",
                "&:hover": { bgcolor: "#b71c1c" },
              }}
            >
              تصدير PDF
              {isExporting && (
                <Typography component="span" sx={{ ml: 1 }}>
                  ...
                </Typography>
              )}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ExcelIcon sx={{ marginLeft: "10px" }} />}
              onClick={onExportExcel}
              disabled={isExporting}
              sx={{
                borderColor: "success.main",
                color: "success.main",
                "&:hover": { bgcolor: "success.50" },
              }}
            >
              تصدير Excel
            </Button>
          </Stack>
        )}
      </Box>

      <Grid
        container
        spacing={10}
        mb={4}
        justifyContent="center"
        alignItems="center"
      >
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            اسم الفترة:
          </Typography>
          <Typography variant="body1">{periodData?.name || "-"}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            حالة التوزيع:
          </Typography>
          <Chip
            label={hasDistribution(periodData) ? "موزعة" : "غير موزعة"}
            color={hasDistribution(periodData) ? "success" : "warning"}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            تاريخ البداية:
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="body1">
              {formatDate(periodData?.startDate)}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                color: "primary.main",
                fontSize: "0.875rem",
              }}
            >
              {periodData?.startdateHijri}
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            تاريخ النهاية:
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="body1">
              {formatDate(periodData?.endDate)}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                color: "primary.main",
                fontSize: "0.875rem",
              }}
            >
              {periodData?.enddateHijri}
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 2,
          mb: 4,
          justifyContent: "center",
          alignItems: "stretch",
        }}
      >
        <Card
          sx={{
            flex: 1,
            minWidth: 200,
            bgcolor: "primary.50",
            p: 3,
            textAlign: "center",
          }}
        >
          <BalanceIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
          <Typography
            variant="h5"
            fontWeight="bold"
            color="primary.main"
            sx={{ wordBreak: "break-all" }}
          >
            {formatNumber(periodData?.companyProfit) || 0}
          </Typography>
          <Typography variant="body1" color="primary.main">
            أرباح الشركة
          </Typography>
        </Card>
        <Card
          sx={{
            flex: 1,
            minWidth: 200,
            bgcolor: "success.50",
            p: 3,
            textAlign: "center",
          }}
        >
          <BalanceIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
          <Typography
            variant="h5"
            fontWeight="bold"
            color="success.main"
            sx={{ wordBreak: "break-all" }}
          >
            {partnerProfitDisplay}
          </Typography>
          <Typography variant="body1" color="success.main">
            إجمالي أرباح الشركاء
          </Typography>
          {enableSaving && (
            <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
              (بعد ادخار {savingPercentage.toFixed(2)}%)
            </Typography>
          )}
        </Card>
        {showSavingCard && (
          <Card
            sx={{
              flex: 1,
              minWidth: 200,
              bgcolor: "warning.50",
              p: 3,
              textAlign: "center",
            }}
          >
            <SavingsIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
            <Typography
              variant="h5"
              fontWeight="bold"
              color="warning.main"
              sx={{ wordBreak: "break-all" }}
            >
              {formatNumber(savedAmountDisplay) || 0}
            </Typography>
            <Typography variant="body1" color="warning.main">
              المبلغ المدخر
            </Typography>
          </Card>
        )}
      </Box>

      {(enableSaving && savingPercentage > 0) || (periodData?.totalSaving > 0) ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body1" fontWeight="bold">
            معلومات الادخار:
          </Typography>
          {enableSaving && savingPercentage > 0 && (
            <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
              - نسبة الادخار: {savingPercentage.toFixed(2)}%
            </Typography>
          )}
          <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
            - المبلغ المدخر: {formatNumber(savedAmountDisplay)}
          </Typography>
          {enableSaving && savingPercentage > 0 && (
            <>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                - أرباح الشركاء قبل الادخار:{" "}
                {formatNumber(profitAfterSaving.originalPartnerProfit)}
              </Typography>
              <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                - أرباح الشركاء بعد الادخار:{" "}
                {formatNumber(profitAfterSaving.partnerProfit)}
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", mt: 2, fontWeight: "bold" }}
              >
                - أرباح الشركة:{" "}
                {formatNumber(profitAfterSaving.originalCompanyProfit)} (لا
                تتأثر بالادخار)
              </Typography>
            </>
          )}
          {!enableSaving &&
            periodData?.totalAfterSaving !== undefined && (
              <Typography variant="body2">
                - إجمالي أرباح الشركاء بعد الادخار:{" "}
                {formatNumber(periodData.totalAfterSaving)}
              </Typography>
            )}
        </Alert>
      ) : null}

      {periodData?.partners && periodData.partners.length > 0 && (
        <>
          <Typography
            variant="h6"
            color="primary"
            fontWeight="bold"
            mb={3}
            textAlign="center"
          >
            توزيع الأرباح على الشركاء
          </Typography>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              width: "100%",
              mb: 4,
            }}
          >
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{
                maxWidth:
                  periodData.partners.some((p) => p.savingAmount) || enableSaving
                    ? "900px"
                    : "700px",
                width: "100%",
              }}
            >
              <ScrollableTableContainer maxHeight={400}>
                <Table sx={{ minWidth: 500 }}>
                  <TableHead>
                    <StyledTableRow>
                      <StyledTableCell align="center">
                        اسم الشريك
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        الرقم القومي
                      </StyledTableCell>
                      <StyledTableCell align="center">الهاتف</StyledTableCell>
                      <StyledTableCell align="center">
                        المبلغ قبل الادخار
                      </StyledTableCell>
                      {(periodData.partners.some((p) => p.savingAmount) ||
                        enableSaving) && (
                        <StyledTableCell align="center">
                          المبلغ بعد الادخار
                        </StyledTableCell>
                      )}
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    {periodData.partners.map((partner) => (
                      <StyledTableRow key={partner.partnerId}>
                        <StyledTableCell align="center">
                          {partner.partnerName}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {partner.nationalId || "-"}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {partner.phone || "-"}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {formatNumber(partner.finalProfit) || 0}
                        </StyledTableCell>
                        {(periodData.partners.some((p) => p.savingAmount) ||
                          enableSaving) && (
                          <StyledTableCell align="center">
                            {formatNumber(
                              enableSaving && savingPercentage > 0
                                ? partner.finalProfit * (1 - savingPercentage / 100)
                                : partner.totalAfterSaving ||
                                  partner.finalProfit ||
                                  0
                            )}
                          </StyledTableCell>
                        )}
                      </StyledTableRow>
                    ))}
                    <StyledTableRow sx={{ backgroundColor: "#f5f5f5" }}>
                      <StyledTableCell colSpan={3} align="center">
                        <Typography fontWeight="bold">الإجمالي</Typography>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Typography fontWeight="bold" color="primary.main">
                          {formatNumber(
                            periodData?.partners?.reduce(
                              (sum, p) => sum + (p.finalProfit || 0),
                              0
                            ) || 0
                          )}
                        </Typography>
                      </StyledTableCell>
                      {(periodData.partners.some((p) => p.savingAmount) ||
                        enableSaving) && (
                        <StyledTableCell align="center">
                          <Typography fontWeight="bold" color="success.main">
                            {enableSaving && savingPercentage > 0
                              ? formatNumber(profitAfterSaving.partnerProfit)
                              : formatNumber(
                                  periodData?.partners?.reduce(
                                    (sum, p) =>
                                      sum + (p.totalAfterSaving || 0),
                                    0
                                  ) || 0
                                )}
                          </Typography>
                        </StyledTableCell>
                      )}
                    </StyledTableRow>
                  </TableBody>
                </Table>
              </ScrollableTableContainer>
            </TableContainer>
          </Box>
        </>
      )}

      {periodData?.distributionJournal && (
        <>
          <Divider sx={{ my: 3 }} />
          <Typography
            variant="h6"
            color="primary"
            fontWeight="bold"
            mb={3}
            textAlign="center"
          >
            قيد توزيع الأرباح
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ maxWidth: "900px", width: "100%" }}
            >
              <Table>
                <TableHead>
                  <StyledTableRow>
                    <StyledTableCell align="center">
                      الرقم المرجعي
                    </StyledTableCell>
                    <StyledTableCell align="center">الوصف</StyledTableCell>
                    <StyledTableCell align="center">الحالة</StyledTableCell>
                    <StyledTableCell align="center">التاريخ</StyledTableCell>
                    <StyledTableCell align="center">الإجراءات</StyledTableCell>
                  </StyledTableRow>
                </TableHead>
                <TableBody>
                  <StyledTableRow>
                    <StyledTableCell align="center">
                      {periodData.distributionJournal.reference}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {periodData.distributionJournal.description}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <Chip
                        label={getJournalStatusText(
                          periodData.distributionJournal.status
                        )}
                        color={
                          periodData.distributionJournal.status === "POSTED"
                            ? "success"
                            : "default"
                        }
                        size="small"
                      />
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      {formatDate(periodData.distributionJournal.date)}
                    </StyledTableCell>
                    <StyledTableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() =>
                          onViewJournal(periodData.distributionJournal.id)
                        }
                        title="عرض تفاصيل القيد"
                      >
                        <VisibilityIcon color="primary" style={{ fontSize: 20 }} />
                      </IconButton>
                    </StyledTableCell>
                  </StyledTableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </>
      )}
    </Paper>
  );
}
