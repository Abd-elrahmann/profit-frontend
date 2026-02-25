import React from "react";
import { Box, Typography } from "@mui/material";

/**
 * Formats a date string for display
 */
export const formatDate = (dateString) => {
  if (!dateString) return "لم تنتهي بعد";
  return new Date(dateString).toLocaleDateString("en-US");
};

/**
 * Formats date with Hijri for display (returns JSX)
 */
export const formatDateWithHijri = (dateString, hijriDate) => {
  if (!dateString) return "لم تنتهي بعد";

  const gregorianDate = new Date(dateString).toLocaleDateString("en-US");
  const hijriText = hijriDate || "لم تنتهي بعد";

  return (
    <Box>
      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
        {gregorianDate}
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", fontSize: "0.8rem", fontWeight: "bold" }}
      >
        {hijriText}
      </Typography>
    </Box>
  );
};

/**
 * Calculates totals from journals array
 */
export const calculateJournalTotals = (journals = []) => {
  const totalDebit = journals.reduce(
    (sum, journal) => sum + (journal.totalDebit || 0),
    0
  );
  const totalCredit = journals.reduce(
    (sum, journal) => sum + (journal.totalCredit || 0),
    0
  );
  const totalBalance = totalDebit - totalCredit;
  return { totalDebit, totalCredit, totalBalance };
};

/**
 * Maps journal type to Arabic text
 */
export const getJournalTypeText = (type) => {
  const typeMap = {
    GENERAL: "عام",
    OPENING: "افتتاحي",
    CLOSING: "ختامي",
    ADJUSTMENT: "تسوية",
  };
  return typeMap[type] || type;
};

/**
 * Maps journal status to Arabic text
 */
export const getJournalStatusText = (status) => {
  const statusMap = {
    DRAFT: "مسودة",
    POSTED: "معتمد",
    CANCELLED: "ملغي",
  };
  return statusMap[status] || status;
};

/**
 * Formats number for display
 */
export const formatNumber = (value) =>
  Math.round(value || 0).toLocaleString("en-US");
