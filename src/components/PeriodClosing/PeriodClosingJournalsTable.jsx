import React from "react";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Paper,
  IconButton,
  Chip as MuiChip,
} from "@mui/material";
import { Visibility as VisibilityIcon } from "@mui/icons-material";
import { StyledTableCell, StyledTableRow } from "../layouts/tableLayout";
import {
  getJournalTypeText,
  getJournalStatusText,
  formatNumber,
  calculateJournalTotals,
} from "./periodClosingUtils.jsx";

export default function PeriodClosingJournalsTable({
  journals,
  theme,
  onViewJournal,
}) {
  const { totalDebit, totalCredit, totalBalance } =
    calculateJournalTotals(journals);

  const formatDate = (dateString) => {
    if (!dateString) return "لم تنتهي بعد";
    return new Date(dateString).toLocaleDateString("en-US");
  };

  const getBalanceColor = (balance) => {
    if (balance > 0) return "#2e7d32";
    if (balance < 0) return "#d32f2f";
    return "inherit";
  };

  return (
    <TableContainer component={Paper} variant="outlined">
      <Table>
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center">الوصف</StyledTableCell>
            <StyledTableCell align="center">النوع</StyledTableCell>
            <StyledTableCell align="center">الحالة</StyledTableCell>
            <StyledTableCell align="center">التاريخ</StyledTableCell>
            <StyledTableCell align="center">مدين</StyledTableCell>
            <StyledTableCell align="center">دائن</StyledTableCell>
            <StyledTableCell align="center">الرصيد</StyledTableCell>
            <StyledTableCell align="center">الإجراءات</StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {journals.map((journal) => {
            const balance =
              (journal.totalDebit || 0) - (journal.totalCredit || 0);
            return (
              <StyledTableRow key={journal.id}>
                <StyledTableCell align="center">
                  {journal.description}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {getJournalTypeText(journal.type)}
                </StyledTableCell>
                <StyledTableCell align="center">
                  <MuiChip
                    label={getJournalStatusText(journal.status)}
                    color={journal.status === "POSTED" ? "success" : "default"}
                    size="small"
                  />
                </StyledTableCell>
                <StyledTableCell align="center">
                  {formatDate(journal.date)}
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  style={{ color: "#d32f2f", fontWeight: "bold" }}
                >
                  {formatNumber(journal.totalDebit)}
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  style={{ color: "#2e7d32", fontWeight: "bold" }}
                >
                  {formatNumber(journal.totalCredit)}
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  style={{
                    fontWeight: "bold",
                    color: getBalanceColor(balance),
                  }}
                >
                  {formatNumber(balance)}
                </StyledTableCell>
                <StyledTableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => onViewJournal(journal.id)}
                    title="عرض تفاصيل القيد"
                  >
                    <VisibilityIcon color="primary" style={{ fontSize: 20 }} />
                  </IconButton>
                </StyledTableCell>
              </StyledTableRow>
            );
          })}
          <StyledTableRow
            style={{
              backgroundColor: theme.palette.background.default,
            }}
          >
            <StyledTableCell align="center" colSpan={4} style={{ fontWeight: "bold" }}>
              الإجمالي
            </StyledTableCell>
            <StyledTableCell align="center" style={{ fontWeight: "bold" }}>
              {formatNumber(totalDebit)}
            </StyledTableCell>
            <StyledTableCell align="center" style={{ fontWeight: "bold" }}>
              {formatNumber(totalCredit)}
            </StyledTableCell>
            <StyledTableCell
              align="center"
              style={{
                fontWeight: "bold",
                color: getBalanceColor(totalBalance),
              }}
            >
              {formatNumber(totalBalance)}
            </StyledTableCell>
          </StyledTableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
