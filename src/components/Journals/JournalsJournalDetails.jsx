import React from "react";
import { Paper, Divider, Box } from "@mui/material";
import JournalsDetailsForm from "./JournalsDetailsForm";
import JournalsLinesForm from "./JournalsLinesForm";
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
  onCancelLineEdit,
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
  const isEditingOrAdding = isEditMode || isAddMode;

  const actionsBlock = (
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
  );

  const linesBlock = (
    <JournalsLinesForm
      currentLine={currentLine}
      chartAccounts={chartAccounts}
      editingLineIndex={editingLineIndex}
      journalLines={journalLines}
      isDarkMode={isDarkMode}
      isSmallScreen={isSmallScreen}
      isReadOnly={!isEditingOrAdding}
      onLineInputChange={onLineInputChange}
      onAddLine={onAddLine}
      onEditLine={onEditLine}
      onDeleteLine={onDeleteLine}
      onCancelLineEdit={onCancelLineEdit}
    />
  );

  if (isSmallScreen) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          mx: "auto",
        }}
      >
        <Box sx={{ width: "100%", mt: 2 }}>
          {actionsBlock}
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
        <Box sx={{ width: "100%", mt: 2 }}>
          {linesBlock}
        </Box>
        <Box sx={{ width: "100%" }}>
          <JournalsSummaryCards totals={totals} isDarkMode={isDarkMode} isSmallScreen />
        </Box>
      </Box>
    );
  }

  return (
    <Paper sx={{ p: 4, borderRadius: 2, bgcolor: "background.paper" }}>
      {actionsBlock}
      <Divider sx={{ my: 3 }} />
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
      <Divider sx={{ my: 3 }} />
      {linesBlock}
      <JournalsSummaryCards totals={totals} isDarkMode={isDarkMode} />
    </Paper>
  );
}