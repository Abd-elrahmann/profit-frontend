import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { getBankAccountBalance } from "../../pages/Banks/bankApis";

export const BANK_ACCOUNT_BALANCE_QUERY_KEY = "bank-account-balance";

export function formatBankBalanceAmount(value) {
  if (value == null || value === "" || Number.isNaN(Number(value))) return "—";
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * يعرض الرصيد الحالي تحت حقل اختيار البنك (يستخدم نفس مفتاح React Query في كل التطبيق).
 * @param {number | null | undefined} bankAccountId معرّف سجل الحساب البنكي (BANK_accounts.id)
 * @param {boolean} [disabled] إيقاف الجلب (مثلاً معطّل في وضع معيّن)
 */
const BankAccountBalanceInline = ({
  bankAccountId,
  disabled = false,
  sx,
}) => {
  const enabled = !!bankAccountId && !disabled;

  const { data, isLoading, isError } = useQuery({
    queryKey: [BANK_ACCOUNT_BALANCE_QUERY_KEY, bankAccountId],
    queryFn: () => getBankAccountBalance(bankAccountId),
    enabled,
    staleTime: 30_000,
  });

  if (!bankAccountId) return null;

  return (
    <Box sx={{ mt: 0.75, mr: 0.5, ...sx }} dir="rtl">
      {isLoading ? (
        <CircularProgress size={14} sx={{ verticalAlign: "middle" }} />
      ) : isError ? (
        <Typography variant="caption" color="error" component="span" fontWeight={700}>
          تعذر تحميل الرصيد
        </Typography>
      ) : (
        <Typography variant="caption" component="div">
          <Box
            component="span"
            sx={{ fontWeight: 700, color: "text.primary" }}
          >
            الرصيد الحالي في الحساب:{" "}
          </Box>
          <Box
            component="span"
            dir="ltr"
            sx={{
              unicodeBidi: "embed",
              fontWeight: 700,
              color: "primary.main",
            }}
          >
            {formatBankBalanceAmount(data)}
          </Box>
        </Typography>
      )}
    </Box>
  );
};

export default BankAccountBalanceInline;
