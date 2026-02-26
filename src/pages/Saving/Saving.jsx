import React, { useState } from "react";
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  FormControl,
  Select,
  MenuItem,
  Grid,
  Stack,
  Divider,
  Alert,
  CircularProgress,
  useMediaQuery,
  Card,
  CardContent,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Button,
  useTheme,
} from "@mui/material";
import {
  AccountBalance as BalanceIcon,
  Savings as SavingsIcon,
  CalendarMonth as CalendarIcon,
  ArrowCircleDown as DepositIcon,
  ArrowCircleUp as WithdrawalIcon,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { getAllPartnerSavings, getSavingAccountReport } from "./savingApi";
import SavingTable from "../../components/modals/SavingTable";
import SavingWithdrawModal from "../../components/modals/SavingWithdrawModal";
import { exportSavingsToPDF, exportSavingsToExcel } from "../../utilities/savingExporter";
import {
  StyledTableCell,
  StyledTableRow,
} from "../../components/layouts/tableLayout";
import { Helmet } from "react-helmet-async";
import dayjs from "dayjs";
import "dayjs/locale/ar";
const Saving = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [page] = useState(1);
  const [limit] = useState(10);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);

  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;
  const theme = useTheme();
  const { data: savingData, isLoading: isSavingLoading, refetch: refetchSavingData } = useQuery({
    queryKey: ["partners-savings", page],
    retry: 1,
    queryFn: () => getAllPartnerSavings(page, limit),
  });

  const { data: accountReport, isLoading: isAccountLoading, refetch: refetchAccountReport } = useQuery({
    queryKey: ["saving-account"],
    retry: 1,
    queryFn: () => getSavingAccountReport(),
    enabled: activeTab === 1,
  });

  const handleWithdrawSuccess = () => {
    refetchSavingData();
    refetchAccountReport();
  };


  const formatCurrency = (amount) => {
    return amount?.toLocaleString() || "0";
  };

  const formatArabicDate = (date) => {
    return dayjs(date)
      .locale("ar")
      .format("D [من] MMMM [الساعة] h:mm")
      + " "
      + (dayjs(date).hour() < 12 ? "صباحًا" : "مساءً");
  };

  const renderAccountSummary = () => (
    <Box sx={{
      display: 'grid',
      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
      gap: 2,
      mb: 4,
      width: '100%',
    }}>
      <Card sx={{ bgcolor: "primary.50", textAlign: "center", p: 2, minWidth: 0 }}>
        <BalanceIcon color={theme.palette.primary.main} sx={{ fontSize: { xs: 32, sm: 40 }, mb: 1 }} />
        <Typography variant="h5" fontWeight="bold" color={theme.palette.primary.main} sx={{ wordBreak: 'break-word', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
          {formatCurrency(accountReport?.account?.balance)}
        </Typography>
        <Typography variant="body2" color={theme.palette.primary.main}>
          رصيد الصندوق
        </Typography>
      </Card>
      <Card sx={{ bgcolor: "success.50", textAlign: "center", p: 2, minWidth: 0 }}>
        <DepositIcon color="success" sx={{ fontSize: { xs: 32, sm: 40 }, mb: 1 }} />
        <Typography variant="h5" fontWeight="bold" color="success.main" sx={{ wordBreak: 'break-word', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
          {formatCurrency(accountReport?.account?.debit)}
        </Typography>
        <Typography variant="body2" color="success.main">
          إجمالي الإيداعات
        </Typography>
      </Card>
      <Card sx={{ bgcolor: "warning.50", textAlign: "center", p: 2, minWidth: 0 }}>
        <WithdrawalIcon color="warning" sx={{ fontSize: { xs: 32, sm: 40 }, mb: 1 }} />
        <Typography variant="h5" fontWeight="bold" color="warning.main" sx={{ wordBreak: 'break-word', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
          {formatCurrency(accountReport?.account?.credit)}
        </Typography>
        <Typography variant="body2" color="warning.main">
          إجمالي السحوبات
        </Typography>
      </Card>
      <Card sx={{ bgcolor: "info.50", textAlign: "center", p: 2, minWidth: 0 }}>
        <CalendarIcon color="info" sx={{ fontSize: { xs: 32, sm: 40 }, mb: 1 }} />
        <Typography variant="h5" fontWeight="bold" color="info.main" sx={{ wordBreak: 'break-word', fontSize: { xs: '1.1rem', sm: '1.5rem' } }}>
          {accountReport?.totalJournalEntries || 0}
        </Typography>
        <Typography variant="body2" color="info.main">
          عدد العمليات
        </Typography>
      </Card>
    </Box>
  );



  const renderAccountJournals = () => {
    if (!accountReport?.journalsByMonth || Object.keys(accountReport.journalsByMonth).length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          لا توجد عمليات مالية لحساب الادخار
        </Alert>
      );
    }

    return (
      <Card sx={{ p: { xs: 2, sm: 3 }, overflow: 'hidden' }}>
        <Typography variant="h6" fontWeight="bold" color="primary" sx={{ mb: 3, textAlign: "center", fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          العمليات المالية
        </Typography>
        
        {Object.entries(accountReport.journalsByMonth).map(([month, data]) => (
          <Box key={month} sx={{ mb: 4 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
              شهر {month}
            </Typography>
            {isMobile ? (
              <Stack spacing={2}>
                {data.entries.map((entry) => (
                  <Card key={entry.id} variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {formatArabicDate(entry.date)}
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" sx={{ mb: 1 }}>
                      {entry.description}
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ gap: 1 }}>
                      <Typography variant="body2">مدين: <strong>{formatCurrency(entry.debit)}</strong></Typography>
                      <Typography variant="body2">دائن: <strong>{formatCurrency(entry.credit)}</strong></Typography>
                      <Typography variant="body2">الرصيد: <strong>{formatCurrency(entry.balance)}</strong></Typography>
                    </Stack>
                  </Card>
                ))}
                <Card sx={{ bgcolor: 'grey.100', p: 2 }}>
                  <Typography variant="body2" fontWeight="bold">
                    الإجمالي - مدين: {formatCurrency(data.totalDebit)} | دائن: {formatCurrency(data.totalCredit)} | الرصيد: {formatCurrency(data.totalBalance)}
                  </Typography>
                </Card>
              </Stack>
            ) : (
              <TableContainer sx={{ overflowX: 'auto' }}>
                <Table sx={{ minWidth: 400 }}>
                  <TableHead>
                    <StyledTableRow>
                      <StyledTableCell align="center">التاريخ</StyledTableCell>
                      <StyledTableCell align="center">الوصف</StyledTableCell>
                      <StyledTableCell align="center">مدين</StyledTableCell>
                      <StyledTableCell align="center">دائن</StyledTableCell>
                      <StyledTableCell align="center">الرصيد</StyledTableCell>
                    </StyledTableRow>
                  </TableHead>
                  <TableBody>
                    {data.entries.map((entry) => (
                      <StyledTableRow key={entry.id}>
                        <StyledTableCell align="center">
                          {formatArabicDate(entry.date)}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {entry.description}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {formatCurrency(entry.debit)}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {formatCurrency(entry.credit)}
                        </StyledTableCell>
                        <StyledTableCell align="center">
                          {formatCurrency(entry.balance)}
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                    <StyledTableRow sx={{ bgcolor: 'grey.100', '& .MuiTableCell-root': { fontWeight: 'bold' } }}>
                      <StyledTableCell align="center" colSpan={2}>
                        الإجمالي
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {formatCurrency(data.totalDebit)}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {formatCurrency(data.totalCredit)}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {formatCurrency(data.totalBalance)}
                      </StyledTableCell>
                    </StyledTableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        ))}
      </Card>
    );
  };




  const renderSavingAccountTab = () => {
    if (isAccountLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress size={40} />
        </Box>
      );
    }

    return (
      <Box sx={{ textAlign: "center" }}>
        {renderAccountSummary()}

        {renderAccountJournals()}
      </Box>
    );
  };

  return (
    <Box
      dir="rtl"
      sx={{
        bgcolor: theme.palette.background.default,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflowX: 'hidden',
      }}
    >
      <Helmet>
        <title>إدارة المدخرات</title>
        <meta name="description" content="إدارة مدخرات الشركاء وصندوق الادخار" />
      </Helmet>

      <Box
        sx={{
          flex: 1,
          p: { xs: 2, sm: 3, md: 4 },
          bgcolor: theme.palette.background.paper,
          overflowX: 'hidden',
        }}
      >
        <Box sx={{ width: "100%" }}>
          {isMobile ? (
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth>
                <Select
                  value={activeTab}
                  onChange={(e) => setActiveTab(Number(e.target.value))}
                  sx={{
                    fontWeight: "bold",
                    "& .MuiSelect-select": { textAlign: "right", py: 1.5 },
                  }}
                >
                  <MenuItem value={0}>كشف المدخرات العام</MenuItem>
                  <MenuItem value={1}>صندوق الادخار</MenuItem>
                </Select>
              </FormControl>
            </Box>
          ) : (
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4, overflowX: 'auto' }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => setActiveTab(newValue)}
                sx={{ '& .MuiTab-root': { minWidth: 160 } }}
              >
                <Tab
                  label="كشف المدخرات العام"
                  sx={{
                    fontWeight: "bold",
                    borderBottom: activeTab === 0 ? `3px solid ${theme.palette.primary.main}` : "none",
                    color: activeTab === 0 ? theme.palette.primary.main : theme.palette.text.primary,
                  }}
                />
                <Tab
                  label="صندوق الادخار"
                  sx={{
                    fontWeight: "bold",
                    borderBottom: activeTab === 1 ? `3px solid ${theme.palette.primary.main}` : "none",
                    color: activeTab === 1 ? theme.palette.primary.main : theme.palette.text.primary,
                  }}
                />
              </Tabs>
            </Box>
          )}

          {activeTab === 0 ? (
            <Paper
              sx={{
                flex: 1,
                width: "100%",
                overflow: "hidden",
                borderRadius: 2,
              }}
            >
              <Box sx={{
                p: { xs: 1.5, sm: 2 },
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, auto)' },
                gap: 1.5,
                justifyContent: { sm: 'center' },
              }}>
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => setWithdrawModalOpen(true)}
                  disabled={isSavingLoading || !savingData?.data?.length}
                  sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  سحب مبلغ ادخار
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => exportSavingsToPDF(savingData)}
                  disabled={isSavingLoading || !savingData?.data?.length}
                  sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  تصدير PDF
                </Button>
                <Button
                  variant="outlined"
                  color="success"
                  onClick={() => exportSavingsToExcel(savingData)}
                  disabled={isSavingLoading || !savingData?.data?.length}
                  sx={{ fontWeight: 'bold', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                  تصدير Excel
                </Button>
              </Box>

              <SavingTable
                isLoading={isSavingLoading}
                savingData={savingData}
              />
            </Paper>
          ) : (
            renderSavingAccountTab()
          )}
        </Box>
      </Box>

      <SavingWithdrawModal
        open={withdrawModalOpen}
        onClose={() => setWithdrawModalOpen(false)}
        onSuccess={handleWithdrawSuccess}
      />
    </Box>
  );
};

export default Saving;