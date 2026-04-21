import React, { useState, useMemo, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, CircularProgress, Autocomplete, Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getBanks } from "../../pages/Banks/bankApis";
import BankAccountBalanceInline from "../loans/BankAccountBalanceInline";
import { debounce } from "../../utilities/debounce";
import { 
  Info, 
  AlertTriangle, 
  Bell,
  BarChart3,
  Banknote,
  CalendarDays,
  Calculator,
  Wallet,
  DollarSign,
  PiggyBank
} from "lucide-react";

const WithdrawModal = ({
  isOpen,
  onClose,
  isEditMode,
  withdrawAmount,
  setWithdrawAmount,
  firstPaymentDate,
  setFirstPaymentDate,
  withdrawalPreview,
  isLoadingPreview,
  investorDetails,
  permissions,
  isWithdrawing,
  onWithdraw
}) => {
  const [amountError, setAmountError] = useState("");
  const [touched, setTouched] = useState(false);
  const [banksPage, setBanksPage] = useState(1);
  const [banksSearch, setBanksSearch] = useState("");
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankError, setBankError] = useState("");
  const debouncedBanksSearch = useMemo(
    () => debounce((v) => { setBanksSearch(v); setBanksPage(1); }, 400),
    []
  );
  const { data: banksData, isLoading: isBanksLoading } = useQuery({
    queryKey: ["banks", "partner-withdraw-modal", banksPage, banksSearch],
    queryFn: () => getBanks(banksPage, banksSearch),
    enabled: isOpen,
    retry: 1,
  });
  useEffect(() => {
    if (!isOpen) {
      setSelectedBank(null);
      setBankError("");
      setBanksSearch("");
      setBanksPage(1);
    } else if (investorDetails?.bankAccount) {
      setSelectedBank(investorDetails.bankAccount);
    } else {
      setSelectedBank(null);
    }
  }, [isOpen, investorDetails?.bankAccount?.id]);

  const validateAmount = (value) => {
    if (!value || value.trim() === "") {
      return "مبلغ السحب مطلوب";
    }
    const amount = parseFloat(value);
    if (isNaN(amount)) {
      return "يرجى إدخال مبلغ صحيح";
    }
    if (amount <= 0) {
      return "مبلغ السحب يجب أن يكون أكبر من صفر";
    }
    if (amount > 1000000) {
      return "مبلغ السحب الشهري يجب أن يكون أقل من 1,000,000 ريال";
    }
    return "";
  };

  const handleAmountChange = (value) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setWithdrawAmount(value);
      if (amountError) {
        setAmountError("");
      }
    }
  };

  const handleAmountBlur = () => {
    setTouched(true);
    const error = validateAmount(withdrawAmount);
    setAmountError(error);
  };

  const handleClose = () => {
    onClose();
    setAmountError("");
    setTouched(false);
    setSelectedBank(null);
    setBankError("");
  };

  const originalCapital = investorDetails?.total || investorDetails?.totalAmount || 0;
  const totalProfit = investorDetails?.totalProfit || 0;
  const totalAmount = originalCapital + totalProfit;

  return (
    <Dialog open={isOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <span className="text-lg font-bold">
          {isEditMode ? 'تعديل مبلغ الانسحاب الشهري' : 'إنسحاب المستثمر من توزيعات الأرباح'}
        </span>
      </DialogTitle>
      
      <DialogContent>
        <div className="flex flex-col gap-4 mt-4">
          {isLoadingPreview ? (
            <div className="py-8 space-y-3">
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-full" />
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-4/5" />
            </div>
          ) : isEditMode ? (
            <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <Bell className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-primary">
                يمكنك تعديل المبلغ الشهري للانسحاب. سيتم إعادة حساب جدول السداد تلقائياً
              </p>
            </div>
          ) : (investorDetails?.WithdrawingStatus === 'WITHDRAWING' || investorDetails?.WithdrawingStatus === 'WITHDRAWN') && !isEditMode ? (
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                  هذا المستثمر في حالة انسحاب بالفعل (الحالة: {
                    investorDetails?.WithdrawingStatus === 'WITHDRAWING' ? 'جاري السحب' : 'تم الانسحاب'
                  })
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                  لا يمكن إنشاء طلب انسحاب جديد لمستثمر منسحب. يرجى مراجعة صفحة المستثمرين المنسحبين.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/30 rounded-lg">
              <Bell className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="text-sm text-primary">
                أدخل المبلغ الشهري وسيتم عرض محاكاة السداد والمعادلات الحسابية
              </p>
            </div>
          )}

          {/* بيانات المستثمر */}
          <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">رأس المال الأصلي</span>
                <span className="text-lg font-bold text-primary">
                  {originalCapital.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">نسبة أرباح المنشأة</span>
                <span className="text-lg font-bold text-gray-800 dark:text-gray-200">
                  {investorDetails?.orgProfitPercent}%
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">المدخرات</span>
                <span className="text-lg font-bold text-primary">
                  {investorDetails?.totalSaving?.toLocaleString() || 0}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-500 dark:text-gray-400 mb-1">إجمالي الأرباح</span>
                <span className="text-lg font-bold text-primary">
                  {totalProfit.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col col-span-2 md:col-span-1 p-3 bg-primary rounded-lg">
                <span className="text-xs text-white/80 mb-1">إجمالي المبلغ</span>
                <span className="text-xl font-bold text-white">
                  {totalAmount.toLocaleString()}
                </span>
                <span className="text-xs text-white/70">
                  رأس المال + الأرباح
                </span>
              </div>
            </div>
          </div>

          {/* المبلغ الشهري الحالي في وضع التعديل */}
          {isEditMode && investorDetails?.withdrawalInfo?.monthlyAmount && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <span className="text-xs text-gray-500 dark:text-gray-400">المبلغ الشهري الحالي</span>
              <p className="text-lg font-bold text-amber-600 dark:text-amber-400">
                {investorDetails?.withdrawalInfo?.monthlyAmount?.toLocaleString() || "غير محدد"}
              </p>
            </div>
          )}

          {/* حقول الإدخال */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label={isEditMode ? "المبلغ الشهري الجديد للسحب" : "المبلغ الشهري للسحب"}
              type="number"
              value={withdrawAmount}
              onChange={(e) => handleAmountChange(e.target.value)}
              onBlur={handleAmountBlur}
              fullWidth
              required
              disabled={
                !isEditMode && (
                  investorDetails?.WithdrawingStatus === 'WITHDRAWING' ||
                  investorDetails?.WithdrawingStatus === 'WITHDRAWN'
                )
              }
              error={touched && !!amountError}
              helperText={
                touched && amountError ? amountError :
                isEditMode
                  ? "أدخل المبلغ الشهري الجديد الذي يتم سحبه (بالريال السعودي)"
                  : (investorDetails?.WithdrawingStatus === 'WITHDRAWING' || investorDetails?.WithdrawingStatus === 'WITHDRAWN')
                    ? "المستثمر منسحب بالفعل"
                    : "أدخل المبلغ الشهري الذي يتم سحبه (بالريال السعودي)"
              }
              InputProps={{
                inputProps: { min: 0, step: 0.01, max: 1000000 }
              }}
            />
            <TextField
              label="تاريخ أول دفعة"
              type="date"
              value={firstPaymentDate}
              onChange={(e) => setFirstPaymentDate(e.target.value)}
              fullWidth
              required
              disabled={
                !isEditMode && (
                  investorDetails?.WithdrawingStatus === 'WITHDRAWING' ||
                  investorDetails?.WithdrawingStatus === 'WITHDRAWN'
                )
              }
              InputLabelProps={{ shrink: true }}
              helperText="حدد تاريخ بداية أول دفعة للسحب"
            />
            <Box sx={{ width: "100%", mt: 1 }}>
              <Autocomplete
                options={banksData?.data || []}
                getOptionLabel={(option) => `${option.name} - ${option.accountNumber}`}
                value={selectedBank}
                onChange={(_, v) => {
                  setSelectedBank(v);
                  setBankError("");
                }}
                onInputChange={(_, v, reason) => {
                  if (reason === "input") debouncedBanksSearch(v);
                }}
                loading={isBanksLoading}
                disabled={
                  !isEditMode && (
                    investorDetails?.WithdrawingStatus === 'WITHDRAWING' ||
                    investorDetails?.WithdrawingStatus === 'WITHDRAWN'
                  )
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="الحساب البنكي"
                    placeholder="ابحث باسم الحساب أو رقم الحساب"
                    required
                    error={!!bankError}
                    helperText={bankError}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {isBanksLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
              <BankAccountBalanceInline bankAccountId={selectedBank?.id} />
            </Box>
          </div>

          {/* تحذير عدم وجود تاريخ */}
          {withdrawAmount && !firstPaymentDate && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                يرجى إدخال تاريخ أول دفعة لعرض المعاينة
              </p>
            </div>
          )}

          {/* محاكاة العملية الحسابية */}
          {withdrawalPreview && firstPaymentDate && (isEditMode || (
            investorDetails?.WithdrawingStatus !== 'WITHDRAWING' &&
            investorDetails?.WithdrawingStatus !== 'WITHDRAWN')) && (
            <>
              <hr className="border-gray-200 dark:border-gray-700" />
              
              {/* بوكس المحاكاة */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  <span className="text-sm font-bold text-primary">
                    محاكاة العملية الحسابية
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {/* رأس المال الأصلي */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Banknote className="w-4 h-4 text-primary" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">رأس المال الأصلي</span>
                    </div>
                    <p className="text-base font-bold text-gray-800 dark:text-gray-200">
                      {withdrawalPreview.originalCapital.toLocaleString()}
                    </p>
                  </div>

                  {/* إجمالي الأرباح */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-primary" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">إجمالي الأرباح</span>
                    </div>
                    <p className="text-base font-bold text-primary">
                      + {withdrawalPreview.totalProfit.toLocaleString()}
                    </p>
                  </div>

                  {/* إجمالي المبلغ */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                      <Calculator className="w-4 h-4 text-primary" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">إجمالي المبلغ</span>
                    </div>
                    <p className="text-base font-bold text-primary">
                      {withdrawalPreview.totalAmount.toLocaleString()}
                    </p>
                    <span className="text-xs text-gray-400">
                      = {withdrawalPreview.originalCapital.toLocaleString()} + {withdrawalPreview.totalProfit.toLocaleString()}
                    </span>
                  </div>

                  {/* خصم التعثر */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">خصم التعثر</span>
                    </div>
                    <p className={`text-base font-bold ${withdrawalPreview.estimatedDefaultShare > 0 ? 'text-red-600 dark:text-red-400' : 'text-primary'}`}>
                      {withdrawalPreview.estimatedDefaultShare > 0 ? `- ${withdrawalPreview.estimatedDefaultShare.toLocaleString()}` : 'لا يوجد'}
                    </p>
                    <span className="text-xs text-gray-400">
                      نسبة تشغيلية = (100 - {investorDetails.orgProfitPercent}%) / 100
                    </span>
                  </div>

                  {/* رأس المال للجدول */}
                  <div className="p-3 bg-primary/10 rounded-lg border-2 border-primary">
                    <div className="flex items-center gap-2 mb-1">
                      <Wallet className="w-4 h-4 text-primary" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">رأس المال للجدول</span>
                    </div>
                    <p className="text-lg font-bold text-primary">
                      {withdrawalPreview.remainingCapital.toLocaleString()}
                    </p>
                    <span className="text-xs text-gray-400">
                      = {withdrawalPreview.totalAmount.toLocaleString()} - {withdrawalPreview.estimatedDefaultShare.toLocaleString()}
                    </span>
                  </div>

                  {/* الادخار */}
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-300 dark:border-amber-700">
                    <div className="flex items-center gap-2 mb-1">
                      <PiggyBank className="w-4 h-4 text-amber-600" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">الادخار (يُصرف منفصل)</span>
                    </div>
                    <p className="text-base font-bold text-amber-600 dark:text-amber-400">
                      {withdrawalPreview.savingsAmount.toLocaleString()}
                    </p>
                    <span className="text-xs text-gray-400">
                      لا يدخل في حساب الجدول
                    </span>
                  </div>

                  {/* عدد الدفعات */}
                  <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarDays className="w-4 h-4 text-primary" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">عدد الدفعات</span>
                    </div>
                    <p className="text-base font-bold text-primary">
                      {withdrawalPreview.totalMonths} دفعة
                    </p>
                    <span className="text-xs text-gray-400">
                      {(() => {
                        const years = Math.floor(withdrawalPreview.totalMonths / 12);
                        const months = withdrawalPreview.totalMonths % 12;
                        if (years > 0 && months > 0) {
                          return `${years} سنة و ${months} شهر`;
                        } else if (years > 0) {
                          return `${years} سنة`;
                        } else {
                          return `${months} شهر`;
                        }
                      })()}
                    </span>
                  </div>
                </div>
              </div>

              {/* جدول السداد */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div className="flex items-center gap-2 mb-4">
                  <CalendarDays className="w-5 h-5 text-primary" />
                  <span className="text-sm font-bold text-primary">
                    جدول السداد الكامل ({withdrawalPreview.totalMonths} دفعة)
                  </span>
                </div>
                
                <div className="overflow-auto max-h-80 rounded-lg border border-gray-200 dark:border-gray-700">
                  <table className="w-full text-sm">
                    <thead className="bg-primary/10 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-center font-bold text-gray-700 dark:text-gray-300">الدفعة</th>
                        <th className="px-4 py-2 text-center font-bold text-gray-700 dark:text-gray-300">التاريخ</th>
                        <th className="px-4 py-2 text-center font-bold text-gray-700 dark:text-gray-300">المبلغ</th>
                        <th className="px-4 py-2 text-center font-bold text-gray-700 dark:text-gray-300">المتبقي</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawalPreview.schedule.map((item, index) => (
                        <tr 
                          key={index} 
                          className={`${index % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-800/50'} hover:bg-primary/5 transition-colors`}
                        >
                          <td className="px-4 py-2 text-center text-gray-700 dark:text-gray-300">{item.month}</td>
                          <td className="px-4 py-2 text-center text-gray-700 dark:text-gray-300">{item.date}</td>
                          <td className="px-4 py-2 text-center font-bold text-primary">
                            {item.amount.toLocaleString('en-US')}
                          </td>
                          <td className="px-4 py-2 text-center font-bold text-primary/70">
                            {item.remaining.toLocaleString('en-US')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* منطق حساب الإنسحاب */}
              <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-primary mb-2">
                    منطق حساب الإنسحاب
                  </p>
                  <ul className="text-sm text-primary/80 space-y-1">
                    <li>• يتم حساب التعثر من السلف المتعثرة (حالة = متعثر) × النسبة التشغيلية</li>
                    <li>• رأس المال للجدول = (رأس المال + الأرباح) - خصم التعثر</li>
                    <li>• الادخار يُصرف منفصل ولا يدخل في جدول الدفعات</li>
                    <li>• عند التنفيذ الفعلي، سيتم حساب التعثر الحقيقي من السلف</li>
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>

      <DialogActions sx={{ p: 3, flexDirection: 'row-reverse' }}>
        <Button onClick={handleClose} color="inherit" disabled={isWithdrawing}>
          إلغاء
        </Button>
        {permissions.includes("partners_Add") && (
          <Button
            onClick={() => {
              const error = validateAmount(withdrawAmount);
              setAmountError(error);
              setTouched(true);
              if (!selectedBank?.id) {
                setBankError("يرجى اختيار الحساب البنكي");
                return;
              }
              setBankError("");
              if (!error && firstPaymentDate) {
                onWithdraw(firstPaymentDate, selectedBank.id);
              }
            }}
            variant="contained"
            disabled={
              isWithdrawing ||
              !firstPaymentDate ||
              (!isEditMode && (
                investorDetails?.WithdrawingStatus === 'WITHDRAWING' ||
                investorDetails?.WithdrawingStatus === 'WITHDRAWN'
              ))
            }
            sx={{
              bgcolor: isEditMode ? "#2e8a45" : "#d32f2f",
              "&:hover": { bgcolor: isEditMode ? "#256d38" : "#b71c1c" },
            }}
          >
            {isWithdrawing ? <CircularProgress size={20} sx={{ color: 'white' }} /> : (isEditMode ? 'تأكيد التعديل' : 'تأكيد الإنسحاب')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default WithdrawModal;
