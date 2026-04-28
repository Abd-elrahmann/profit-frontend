import React from "react";
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

  return (
    <div dir="rtl" className="bg-background text-on-background min-h-screen">
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

      <main className="max-w-[1440px] mx-auto px-container-margin py-section-gap space-y-section-gap">
      {isEditingOrAdding && (
      <JournalsDetailsForm
        journalData={journalData}
        editForm={editForm}
        newJournalForm={newJournalForm}
        isAddMode={isAddMode}
        isEditMode={isEditMode}
        onInputChange={onInputChange}
      />
      )}

      <JournalsLinesForm
        currentLine={currentLine}
        chartAccounts={chartAccounts}
        editingLineIndex={editingLineIndex}
        journalLines={journalLines}
        isReadOnly={!isEditingOrAdding}
        onLineInputChange={onLineInputChange}
        onAddLine={onAddLine}
        onEditLine={onEditLine}
        onDeleteLine={onDeleteLine}
        onCancelLineEdit={onCancelLineEdit}
      />

      <JournalsSummaryCards
        totals={totalsForTable}
        isDarkMode={isDarkMode}
        isSmallScreen={isSmallScreen}
      />
      </main>
    </div>
  );
}