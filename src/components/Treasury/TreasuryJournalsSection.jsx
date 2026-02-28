import React from "react";
import { Box, Typography, Paper, Pagination } from "@mui/material";
import { AccountBalance } from "@mui/icons-material";
import TreasuryJournalTable from "./TreasuryJournalTable";
import TreasuryJournalCards from "./TreasuryJournalCards";
import { getMonthName } from "./treasuryUtils";
const TreasuryJournalsSection = ({
  currentJournals,
  monthParam,
  selectedMonth,
  pagination,
  isSmallScreen,
  isDarkMode,
  onPageChange,
}) => {
  const hasJournals = currentJournals.length > 0;
  return (
    <Paper
      sx={{
        borderRadius: 2,
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
        overflow: "hidden",
        bgcolor: isDarkMode ? "background.paper" : "background.paper",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: isSmallScreen ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isSmallScreen ? "flex-start" : "center",
          p: isSmallScreen ? 2 : 3,
          gap: isSmallScreen ? 2 : 0,
          borderBottom: isDarkMode ? "1px solid #424242" : "1px solid #e0e0e0",
          bgcolor: isDarkMode ? "#2a2a2a" : "#fafafa",
        }}
      >
        <Box>
          <Typography variant={isSmallScreen ? "subtitle1" : "h6"} fontWeight="bold" color="primary">
            سجل القيود المحاسبية
          </Typography>
          {monthParam && (
            <Typography variant="body2" color="text.secondary">
              عرض بيانات شهر {getMonthName(monthParam)}
            </Typography>
          )}
        </Box>
      </Box>
      {!hasJournals ? (
        <Box sx={{ textAlign: "center", py: 6 }}>
          <AccountBalance sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {selectedMonth ? `لا توجد قيود مسجلة لشهر ${getMonthName(selectedMonth)}` : "لا توجد قيود مسجلة"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            لم يتم تسجيل أي قيود محاسبية حتى الآن
          </Typography>
        </Box>
      ) : (
        <>
          {isSmallScreen ? (
            <TreasuryJournalCards journals={currentJournals} isDarkMode={isDarkMode} />
          ) : (
            <TreasuryJournalTable journals={currentJournals} isDarkMode={isDarkMode} />
          )}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 3, mb: 2 }}>
              <Pagination
                count={pagination.totalPages}
                page={pagination.page}
                onChange={onPageChange}
                color="primary"
                size={isSmallScreen ? "small" : "medium"}
                showFirstButton
                showLastButton
                sx={{
                  "& .MuiPaginationItem-root": {
                    fontSize: isSmallScreen ? "0.875rem" : "1rem",
                    color: isDarkMode ? "text.primary" : "inherit",
                  },
                }}
              />
            </Box>
          )}
        </>
      )}
    </Paper>
  );
};
export default TreasuryJournalsSection;