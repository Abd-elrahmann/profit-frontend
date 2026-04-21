import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableHead,
  TablePagination,
  TextField,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import {
  TrendingUp,
  Groups,
  PieChart,
} from "@mui/icons-material";
import { Helmet } from "react-helmet-async";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import {
  getPartnerLosses,
  getPartnersWithLosses,
  payPartnerLoss,
  reversePartnerLossPayment,
} from "./partnerLossApi";
import { getBanks } from "../Banks/bankApis";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import { StyledTableCell, StyledTableRow } from "../../components/layouts/tableLayout";

const LOSS_REASON_LABEL =
  "نصيب المساهم من خسائر التعثر على السلف المتعثرة (عند الانسحاب)";

const formatMoney = (n) =>
  (Number(n) || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const Delinquencies = () => {
  const queryClient = useQueryClient();
  const { permissions } = usePermissions();
  const canView = permissions.includes("loss_View");
  const canPost = permissions.includes("loss_Post");
  const isSmallScreen = useMediaQuery("(max-width: 900px)");

  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  /** مساهم من القائمة فقط (لديه تعثر) — null = كل السجلات */
  const [selectedPartner, setSelectedPartner] = useState(null);
  const filterName = selectedPartner?.name ?? "";

  const [payOpen, setPayOpen] = useState(false);
  const [reverseTarget, setReverseTarget] = useState(null);
  const [payRow, setPayRow] = useState(null);
  const [payAmount, setPayAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState(null);
  const [banksPage, setBanksPage] = useState(1);
  const [banksSearch, setBanksSearch] = useState("");

  const { data: partnersListData } = useQuery({
    queryKey: ["partner-loss-partners"],
    queryFn: getPartnersWithLosses,
    enabled: canView,
    retry: 1,
  });
  const partnerOptions = partnersListData?.partners ?? [];

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["partner-losses", page, rowsPerPage, filterName],
    queryFn: () => getPartnerLosses(page, rowsPerPage, filterName),
    enabled: canView,
    retry: 1,
  });

  const { data: banksData, isLoading: banksLoading } = useQuery({
    queryKey: ["banks", "delinquencies-pay", banksPage, banksSearch],
    queryFn: () => getBanks(banksPage, banksSearch),
    enabled: payOpen && canPost,
  });

  const payMutation = useMutation({
    mutationFn: ({ id, amount, BankId }) => payPartnerLoss(id, { amount, BankId }),
    onSuccess: (res) => {
      notifySuccess(res?.message || "تم سداد التعثر بنجاح");
      queryClient.invalidateQueries({ queryKey: ["partner-losses"] });
      queryClient.invalidateQueries({ queryKey: ["partner-loss-partners"] });
      setPayOpen(false);
      setPayRow(null);
      setSelectedBank(null);
      setPayAmount("");
    },
    onError: (e) =>
      notifyError(e?.response?.data?.message || "تعذر تنفيذ السداد"),
  });

  const reverseMutation = useMutation({
    mutationFn: (id) => reversePartnerLossPayment(id),
    onSuccess: (res) => {
      notifySuccess(res?.message || "تم إلغاء السداد");
      queryClient.invalidateQueries({ queryKey: ["partner-losses"] });
      queryClient.invalidateQueries({ queryKey: ["partner-loss-partners"] });
      setReverseTarget(null);
    },
    onError: (e) =>
      notifyError(e?.response?.data?.message || "تعذر إلغاء السداد"),
  });

  const stats = data?.stats;
  const losses = data?.losses ?? [];
  const totalCount = data?.count ?? 0;

  const openPay = (row) => {
    const remaining = Math.max(0, (row.amount || 0) - (row.paidAmount || 0));
    setPayRow(row);
    setPayAmount(remaining > 0 ? String(remaining.toFixed(2)) : "");
    setSelectedBank(null);
    setPayOpen(true);
    setBanksPage(1);
    setBanksSearch("");
  };

  const handlePaySubmit = () => {
    if (!payRow) return;
    const amt = parseFloat(payAmount);
    if (!amt || amt <= 0) {
      notifyError("أدخل مبلغاً صحيحاً");
      return;
    }
    if (!selectedBank?.id) {
      notifyError("اختر الحساب البنكي");
      return;
    }
    payMutation.mutate({
      id: payRow.id,
      amount: amt,
      BankId: selectedBank.id,
    });
  };

  if (!canView) {
    return (
      <Box p={3}>
        <Typography>لا تملك صلاحية عرض هذه الصفحة.</Typography>
      </Box>
    );
  }

  return (
    <>
      <Helmet>
        <title>التعثرات - النظام المالي</title>
      </Helmet>
      <Box
        className="w-full"
        sx={{
          p: isSmallScreen ? 2 : 3,
          direction: "rtl",
        }}
      >
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }} className="text-slate-900 dark:text-white">
          التعثرات
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          متابعة خسائر التعثر المسجلة على المستثمرين، السداد من الحساب البنكي، وإلغاء
          السداد عند الحاجة.
        </Typography>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-primary/5 shadow-sm w-full">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                إجمالي
              </span>
              <TrendingUp className="text-primary" sx={{ fontSize: 24 }} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              إجمالي مبالغ التعثرات (المُثبتة)
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                {stats ? formatMoney(stats.totalLossAmount) : "—"}
              </h3>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-primary/5 shadow-sm w-full">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 px-3 py-1 rounded-full text-xs font-bold">
                متعثرون
              </span>
              <Groups className="text-slate-400" sx={{ fontSize: 24 }} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
              عدد المستثمرين المتعثرين (لديهم متبقي)
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white">
                {stats != null ? stats.delinquentInvestorsCount : "—"}
              </h3>
            </div>
          </div>
          <div className="bg-primary p-6 rounded-2xl border border-primary shadow-xl shadow-primary/20 w-full">
            <div className="flex justify-between items-start mb-4">
              <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-bold">
                نسبة
              </span>
              <PieChart className="text-white/60" sx={{ fontSize: 24 }} />
            </div>
            <p className="text-white/80 text-sm font-medium">
              نسبة التعثر العام (المتبقي / الإجمالي)
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <h3 className="text-3xl font-black text-white">
                {stats != null
                  ? `${Number(stats.overallDelinquencyRatePercent).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}%`
                  : "—"}
              </h3>
            </div>
          </div>
        </div>

        <Box sx={{ mb: 2, width: 250 }}>
          <Autocomplete
            size="small"
            sx={{ width: 250 }}
            options={partnerOptions}
            getOptionLabel={(o) => o?.name ?? ""}
            value={selectedPartner}
            onChange={(_, v) => {
              setSelectedPartner(v);
              setPage(1);
            }}
            isOptionEqualToValue={(a, b) => a?.id === b?.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="المساهم"
                placeholder="اختر مساهماً لديه تعثر"
              />
            )}
            noOptionsText="لا يوجد مساهمون بتعثرات"
          />
        </Box>

        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {(isLoading || isFetching) && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                bgcolor: "rgba(255,255,255,0.5)",
                zIndex: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress size={32} />
            </Box>
          )}
          <Table size="small">
            <TableHead>
              <StyledTableRow>
                <StyledTableCell align="center">#</StyledTableCell>
                <StyledTableCell align="center">المستثمر</StyledTableCell>
                <StyledTableCell align="center">سبب التعثر</StyledTableCell>
                <StyledTableCell align="center">المبلغ</StyledTableCell>
                <StyledTableCell align="center">المدفوع</StyledTableCell>
                <StyledTableCell align="center">المتبقي</StyledTableCell>
                <StyledTableCell align="center">الحالة</StyledTableCell>
                <StyledTableCell align="center">إجراءات</StyledTableCell>
              </StyledTableRow>
            </TableHead>
            <TableBody>
              {losses.length === 0 && !isLoading ? (
                <StyledTableRow>
                  <StyledTableCell colSpan={8} align="center">
                    لا توجد سجلات تعثر
                  </StyledTableCell>
                </StyledTableRow>
              ) : (
                losses.map((row) => {
                  const remaining = Math.max(
                    0,
                    (row.amount || 0) - (row.paidAmount || 0)
                  );
                  const hasRemaining = remaining > 0.0001;
                  const hasPaid = (row.paidAmount || 0) > 0.0001;
                  return (
                    <StyledTableRow key={row.id} hover>
                      <StyledTableCell align="center">{row.id}</StyledTableCell>
                      <StyledTableCell align="center">
                        {row.partner?.name ?? "—"}
                      </StyledTableCell>
                      <StyledTableCell align="center" sx={{ maxWidth: 280 }}>
                        <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
                          {LOSS_REASON_LABEL}
                        </Typography>
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {formatMoney(row.amount)}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {formatMoney(row.paidAmount)}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {formatMoney(remaining)}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        {row.isPaid ? (
                          <Chip label="مسدد" color="success" size="small" />
                        ) : hasPaid ? (
                          <Chip label="سداد جزئي" color="warning" size="small" />
                        ) : (
                          <Chip label="غير مسدد" color="default" size="small" />
                        )}
                      </StyledTableCell>
                      <StyledTableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            justifyContent: "center",
                            flexWrap: "wrap",
                          }}
                        >
                          {canPost && hasRemaining && (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              onClick={() => openPay(row)}
                            >
                              دفع التعثر
                            </Button>
                          )}
                          {canPost && hasPaid && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => setReverseTarget(row)}
                            >
                              إلغاء الدفع
                            </Button>
                          )}
                        </Box>
                      </StyledTableCell>
                    </StyledTableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalCount}
            page={page - 1}
            onPageChange={(_, p) => setPage(p + 1)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(1);
            }}
            rowsPerPageOptions={[5, 10, 25, 50]}
            labelRowsPerPage="صفوف لكل صفحة:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} من ${count !== -1 ? count : `أكثر من ${to}`}`
            }
          />
        </Paper>
      </Box>

      <Dialog open={payOpen} onClose={() => !payMutation.isPending && setPayOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>سداد تعثر</DialogTitle>
        <DialogContent sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {payRow && (
            <Typography variant="body2" color="text.secondary">
              المستثمر: <strong>{payRow.partner?.name}</strong> — المتبقي:{" "}
              {formatMoney(
                Math.max(0, (payRow.amount || 0) - (payRow.paidAmount || 0))
              )}
            </Typography>
          )}
          <TextField
            label="المبلغ"
            type="number"
            fullWidth
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <Autocomplete
            options={banksData?.data || []}
            getOptionLabel={(o) => `${o.name} - ${o.accountNumber}`}
            value={selectedBank}
            onChange={(_, v) => setSelectedBank(v)}
            onInputChange={(_, v, reason) => {
              if (reason === "input") {
                setBanksSearch(v);
                setBanksPage(1);
              }
            }}
            loading={banksLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="الحساب البنكي"
                placeholder="ابحث..."
              />
            )}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPayOpen(false)} disabled={payMutation.isPending}>
            إلغاء
          </Button>
          <Button variant="contained" onClick={handlePaySubmit} disabled={payMutation.isPending}>
            {payMutation.isPending ? <CircularProgress size={22} /> : "تأكيد السداد"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!reverseTarget} onClose={() => !reverseMutation.isPending && setReverseTarget(null)}>
        <DialogTitle>إلغاء سداد التعثر</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من إلغاء السداد المسجل لهذا التعثر؟ سيتم حذف القيود المرتبطة
            وإعادة المبالغ كما كانت.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReverseTarget(null)} disabled={reverseMutation.isPending}>
            لا
          </Button>
          <Button
            color="error"
            variant="contained"
            disabled={reverseMutation.isPending}
            onClick={() => reverseTarget && reverseMutation.mutate(reverseTarget.id)}
          >
            {reverseMutation.isPending ? <CircularProgress size={22} /> : "نعم، إلغاء الدفع"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Delinquencies;
