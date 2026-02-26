import React from "react";
import { Paper, Divider, Box } from "@mui/material";
import JournalsDetailsForm from "./JournalsDetailsForm";
import JournalsLinesForm from "./JournalsLinesForm";
import JournalsLinesList from "./JournalsLinesList";
import JournalsSummaryCards from "./JournalsSummaryCards";
import JournalsActions from "./JournalsActions";

export default function JournalsJournalDetails({
  journalData,
  editForm,
  newJournalForm,
  isAddMode,
  isEditMode,
  journalLines,
  totals,
  totalsForTable,
  currentLine,
  chartAccounts,
  editingLineIndex,
  isSmallScreen,
  isDarkMode,
  permissions,
  isJournalBalanced,
  onInputChange,
  onLineInputChange,
  onAddLine,
  onEditLine,
  onDeleteLine,
  onExportPDF,
  onExportExcel,
  onCreateJournal,
  onCancelAdd,
  onEditClick,
  onPostJournal,
  onDeleteClick,
  onUpdateJournal,
  onCancelEdit,
  onUnpostJournal,
}) {
  if (isSmallScreen) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 420, mx: "auto" }}>
        <Box sx={{ width: "100%" }}>
          <JournalsSummaryCards totals={totals} isDarkMode={isDarkMode} isSmallScreen />
        </Box>
        <Box sx={{ width: "100%", mt: 2 }}>
        <JournalsActions
          totals={totals}
          isAddMode={isAddMode}
          journalData={journalData}
          isEditMode={isEditMode}
          permissions={permissions}
          isJournalBalanced={isJournalBalanced}
          onExportPDF={onExportPDF}
          onExportExcel={onExportExcel}
          onCreateJournal={onCreateJournal}
          onCancelAdd={onCancelAdd}
          onEditClick={onEditClick}
          onPostJournal={onPostJournal}
          onDeleteClick={onDeleteClick}
          onUpdateJournal={onUpdateJournal}
          onCancelEdit={onCancelEdit}
          onUnpostJournal={onUnpostJournal}
        />
        </Box>
        <Box sx={{ width: "100%", mt: 2 }}>
        <JournalsDetailsForm
          journalData={journalData}
          editForm={editForm}
          newJournalForm={newJournalForm}
          isAddMode={isAddMode}
          isEditMode={isEditMode}
          onInputChange={onInputChange}
          variant="mobile"
        />
        </Box>
        {(isEditMode || isAddMode) && (
          <Box sx={{ width: "100%", mt: 2 }}>
          <JournalsLinesForm
            currentLine={currentLine}
            chartAccounts={chartAccounts}
            editingLineIndex={editingLineIndex}
            onLineInputChange={onLineInputChange}
            onAddLine={onAddLine}
          />
          </Box>
        )}
        <Box sx={{ width: "100%", mt: 2 }}>
        <JournalsLinesList
          journalLines={journalLines}
          totalsForTable={totalsForTable}
          isEditMode={isEditMode}
          isAddMode={isAddMode}
          isSmallScreen={isSmallScreen}
          isDarkMode={isDarkMode}
          onEditLine={onEditLine}
          onDeleteLine={onDeleteLine}
        />
        </Box>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 4, borderRadius: 2, bgcolor: "background.paper" }}>
      <JournalsDetailsForm
        journalData={journalData}
        editForm={editForm}
        newJournalForm={newJournalForm}
        isAddMode={isAddMode}
        isEditMode={isEditMode}
        onInputChange={onInputChange}
        variant="desktop"
        embed
      />
      {(isEditMode || isAddMode) && (
        <>
          <Divider sx={{ my: 3 }} />
          <JournalsLinesForm
            currentLine={currentLine}
            chartAccounts={chartAccounts}
            editingLineIndex={editingLineIndex}
            onLineInputChange={onLineInputChange}
            onAddLine={onAddLine}
          />
        </>
      )}
      <Divider sx={{ my: 3 }} />
      <JournalsLinesList
        journalLines={journalLines}
        totalsForTable={totalsForTable}
        isEditMode={isEditMode}
        isAddMode={isAddMode}
        isSmallScreen={isSmallScreen}
        isDarkMode={isDarkMode}
        onEditLine={onEditLine}
        onDeleteLine={onDeleteLine}
      />
    </Paper>
  );
}
