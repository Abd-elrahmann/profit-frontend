import React from "react";
import { Paper, Alert } from "@mui/material";
import JournalsLinesTable from "./JournalsLinesTable";
import JournalsLinesCards from "./JournalsLinesCards";
import { isJournalBalanced } from "./journalsUtils";
export default function JournalsLinesList({
  journalLines,
  totalsForTable,
  isEditMode,
  isAddMode,
  isSmallScreen,
  isDarkMode,
  onEditLine,
  onDeleteLine,
}) {
  const unbalanced = !isJournalBalanced(
    totalsForTable.totalDebit,
    totalsForTable.totalCredit
  );
  return (
    <Paper
      sx={{
        p: isSmallScreen ? 2 : 3,
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      {journalLines.length === 0 ? (
        <Alert severity="info">لا توجد بنود مضافة</Alert>
      ) : (
        <>
          {isSmallScreen ? (
            <JournalsLinesCards
              journalLines={journalLines}
              totalsForTable={totalsForTable}
              isEditMode={isEditMode}
              isAddMode={isAddMode}
              isDarkMode={isDarkMode}
              onEditLine={onEditLine}
              onDeleteLine={onDeleteLine}
            />
          ) : (
            <>
              <JournalsLinesTable
                journalLines={journalLines}
                totalsForTable={totalsForTable}
                isEditMode={isEditMode}
                isAddMode={isAddMode}
                isDarkMode={isDarkMode}
                onEditLine={onEditLine}
                onDeleteLine={onDeleteLine}
              />
              {unbalanced && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  القيد غير متوازن! إجمالي المدين:{" "}
                  {Math.round(totalsForTable.totalDebit).toLocaleString()} ≠
                  إجمالي الدائن:{" "}
                  {Math.round(totalsForTable.totalCredit).toLocaleString()} (الفرق:{" "}
                  {Math.round(Math.abs(totalsForTable.totalBalance)).toLocaleString()}
                </Alert>
              )}
            </>
          )}
        </>
      )}
    </Paper>
  );
}
