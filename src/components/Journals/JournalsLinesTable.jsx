import React from "react";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Typography,
  IconButton,
  Chip,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { StyledTableCell, StyledTableRow } from "../layouts/tableLayout";

export default function JournalsLinesTable({
  journalLines,
  totalsForTable,
  isEditMode,
  isAddMode,
  isDarkMode,
  onEditLine,
  onDeleteLine,
}) {
  const formatNumber = (value) =>
    value ? Math.round(value).toLocaleString() : "0";

  const getBalanceColor = (balance) => {
    if ((balance || 0) === 0) return "text.primary";
    return (balance || 0) > 0 ? "error" : "success.main";
  };

  const canEdit = isEditMode || isAddMode;

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center">الحساب</StyledTableCell>
            <StyledTableCell align="center">الوصف</StyledTableCell>
            <StyledTableCell align="center">نوع الحساب</StyledTableCell>
            <StyledTableCell align="center">مدين</StyledTableCell>
            <StyledTableCell align="center">دائن</StyledTableCell>
            <StyledTableCell align="center">الإجمالي</StyledTableCell>
            {canEdit && (
              <StyledTableCell align="center" className="hide-on-print">
                الإجراءات
              </StyledTableCell>
            )}
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {journalLines.map((line, index) => (
            <StyledTableRow key={line.id || index}>
              <StyledTableCell align="center">
                {line.account?.code} - {line.account?.name}
              </StyledTableCell>
              <StyledTableCell align="center">
                {line.description || "-"}
              </StyledTableCell>
              <StyledTableCell align="center">
                <Chip
                  label={(line.debit || 0) > 0 ? "مدين" : "دائن"}
                  color={(line.debit || 0) > 0 ? "error" : "success"}
                  size="small"
                  variant="outlined"
                />
              </StyledTableCell>
              <StyledTableCell align="center">
                {formatNumber(line.debit)}
              </StyledTableCell>
              <StyledTableCell align="center">
                {formatNumber(line.credit)}
              </StyledTableCell>
              <StyledTableCell align="center">
                <Typography
                  fontWeight="medium"
                  color={getBalanceColor(line.balance)}
                >
                  {formatNumber(line.balance)}
                </Typography>
              </StyledTableCell>
              {canEdit && (
                <StyledTableCell align="center" className="hide-on-print">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onEditLine(index)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => onDeleteLine(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </StyledTableCell>
              )}
            </StyledTableRow>
          ))}
          <StyledTableRow
            sx={{
              backgroundColor: isDarkMode ? "background.default" : "#f5f5f5",
            }}
          >
            <StyledTableCell colSpan={3} align="center">
              <Typography fontWeight="bold">الإجمالي</Typography>
            </StyledTableCell>
            <StyledTableCell align="center">
              <Typography fontWeight="bold" color="error">
                {formatNumber(totalsForTable.totalDebit)}
              </Typography>
            </StyledTableCell>
            <StyledTableCell align="center">
              <Typography fontWeight="bold" color="success.main">
                {formatNumber(totalsForTable.totalCredit)}
              </Typography>
            </StyledTableCell>
            <StyledTableCell align="center">
              <Typography fontWeight="bold">
                {formatNumber(totalsForTable.totalBalance)}
              </Typography>
            </StyledTableCell>
            {canEdit && <StyledTableCell align="center" />}
          </StyledTableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
}
