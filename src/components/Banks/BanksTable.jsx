import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Typography,
  IconButton,
  Stack,
  CircularProgress,
  Chip,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { StyledTableCell, StyledTableRow } from "../layouts/tableLayout";
import { getBankStatusText, getBankStatusColor, formatAccountBalance } from "./banksUtils";
const BanksTable = ({
  banksData,
  isLoading,
  isDarkMode,
  permissions,
  onEdit,
  onDelete,
  i18nLanguage = "ar",
}) => (
  <TableContainer sx={{ maxHeight: 600 }}>
    <Table stickyHeader>
      <TableHead>
        <StyledTableRow>
          <StyledTableCell align="center" sx={{ fontWeight: "bold", backgroundColor: isDarkMode ? "grey.800" : "grey.100" }}>#</StyledTableCell>
          <StyledTableCell align="center" sx={{ fontWeight: "bold", backgroundColor: isDarkMode ? "grey.800" : "grey.100" }}>اسم الحساب</StyledTableCell>
          <StyledTableCell align="center" sx={{ fontWeight: "bold", backgroundColor: isDarkMode ? "grey.800" : "grey.100" }}>اسم المالك</StyledTableCell>
          <StyledTableCell align="center" sx={{ fontWeight: "bold", backgroundColor: isDarkMode ? "grey.800" : "grey.100" }}>رقم الحساب</StyledTableCell>
          <StyledTableCell align="center" sx={{ fontWeight: "bold", backgroundColor: isDarkMode ? "grey.800" : "grey.100" }}>رقم الايبان</StyledTableCell>
          <StyledTableCell align="center" sx={{ fontWeight: "bold", backgroundColor: isDarkMode ? "grey.800" : "grey.100" }}>السلف المسموح بها</StyledTableCell>
          <StyledTableCell align="center" sx={{ fontWeight: "bold", backgroundColor: isDarkMode ? "grey.800" : "grey.100" }}>رصيد الحساب</StyledTableCell>
          <StyledTableCell align="center" sx={{ fontWeight: "bold", backgroundColor: isDarkMode ? "grey.800" : "grey.100" }}>الحالة</StyledTableCell>
          {(permissions.includes("banks_Update") || permissions.includes("banks_Delete") || permissions.includes("banks_Add")) && (
            <StyledTableCell align="center" sx={{ fontWeight: "bold", backgroundColor: isDarkMode ? "grey.800" : "grey.100" }}>الإجراءات</StyledTableCell>
          )}
        </StyledTableRow>
      </TableHead>
      <TableBody>
        {isLoading ? (
          <StyledTableRow>
            <StyledTableCell colSpan={9} align="center">
              <CircularProgress size={20} />
            </StyledTableCell>
          </StyledTableRow>
        ) : banksData?.length === 0 ? (
          <StyledTableRow>
            <StyledTableCell colSpan={9} align="center">
              <Typography>لا توجد حسابات بنكية</Typography>
            </StyledTableCell>
          </StyledTableRow>
        ) : (
          banksData?.map((bank) => (
            <StyledTableRow key={bank.id} hover>
              <StyledTableCell align="center">{bank.id}</StyledTableCell>
              <StyledTableCell align="center">{bank.name}</StyledTableCell>
              <StyledTableCell align="center">{bank.owner}</StyledTableCell>
              <StyledTableCell align="center">{bank.accountNumber}</StyledTableCell>
              <StyledTableCell align="center">{bank.IBAN}</StyledTableCell>
              <StyledTableCell align="center">{bank.limit}</StyledTableCell>
              <StyledTableCell align="center">
                {formatAccountBalance(bank.account?.balance)}
              </StyledTableCell>
              <StyledTableCell align="center">
                <Chip
                  label={getBankStatusText(bank.status, i18nLanguage)}
                  color={getBankStatusColor(bank.status)}
                  variant="outlined"
                  sx={{ fontWeight: "bold", fontSize: "12px", padding: "4px 8px", borderRadius: "16px" }}
                />
              </StyledTableCell>
              {(permissions.includes("banks_Update") || permissions.includes("banks_Delete") || permissions.includes("banks_Add")) && (
                <StyledTableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                    <IconButton size="small" color="primary" onClick={() => onEdit(bank)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => onDelete(bank)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Stack>
                </StyledTableCell>
              )}
            </StyledTableRow>
          ))
        )}
      </TableBody>
    </Table>
  </TableContainer>
);
export default BanksTable;
