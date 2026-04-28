import React from "react";
export default function JournalsActions({
  totals,
  isAddMode,
  journalData,
  isEditMode,
  permissions,
  isJournalBalanced,
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
  const showExportButtons =
    !isAddMode && journalData && permissions.includes("journals_Export");
  const isDraft = journalData?.status === "DRAFT";
  const isPosted = journalData?.status === "POSTED";
  const canEdit = isDraft && !isEditMode && permissions.includes("journals_Update");
  const canSaveEdit =
    isDraft && isEditMode && permissions.includes("journals_Update");
  const balanced = totals
    ? isJournalBalanced(totals.totalDebit, totals.totalCredit)
    : false;

  return (
    <header className=" shadow-sm sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-container-margin py-a flex items-center justify-between  h-10">
        <div className="flex items-center gap-gutter">
          <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container-high transition-colors">
            ←
          </button>
          <div className="flex flex-col">
            <h1 className="font-display-md text-display-md text-on-surface">
              {isAddMode ? "إضافة قيد جديد" : "تفاصيل القيد"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-gutter">
        {showExportButtons && (
          <>
            <button
              className="text-error font-label-md text-label-md px-4 py-2 hover:bg-error-container/20 rounded-lg transition-all"
              onClick={onExportPDF}
            >
              تصدير PDF
            </button>
            <button
              className="text-primary font-label-md text-label-md border border-primary px-4 py-2 rounded-lg hover:bg-primary/5 transition-all"
              onClick={onExportExcel}
            >
              تصدير Excel
            </button>
          </>
        )}
        {isAddMode ? (
          <>
            <button
              className="text-error font-label-md text-label-md px-4 py-2 hover:bg-error-container/20 rounded-lg transition-all"
              onClick={onCancelAdd}
            >
              إلغاء
            </button>
            <button
              className="bg-primary-container text-white font-label-md text-label-md px-6 py-2 rounded-lg shadow-sm hover:shadow-md active:scale-95 transition-all disabled:opacity-50"
              onClick={onCreateJournal}
              disabled={!balanced}
            >
              إنشاء القيد
            </button>
          </>
        ) : canEdit ? (
          <>
            <button
              className="bg-primary-container text-on-primary-container font-label-md text-label-md px-6 py-2 rounded-lg shadow-sm hover:shadow-md active:scale-95 transition-all"
              onClick={onEditClick}
            >
              تعديل القيد
            </button>
            {permissions.includes("journals_Post") && (
              <button
                className="bg-tertiary-fixed text-on-tertiary-fixed font-label-md text-label-md px-6 py-2 rounded-lg shadow-sm hover:shadow-md active:scale-95 transition-all"
                onClick={onPostJournal}
              >
                اعتماد القيد
              </button>
            )}
            {permissions.includes("journals_Delete") && (
              <button
                className="text-error font-label-md text-label-md border border-error px-4 py-2 rounded-lg hover:bg-error-container/20 transition-all"
                onClick={onDeleteClick}
              >
                حذف القيد
              </button>
            )}
          </>
        ) : canSaveEdit ? (
          <>
            <button
              className="bg-primary-container text-on-primary-container font-label-md text-label-md px-6 py-2 rounded-lg shadow-sm hover:shadow-md active:scale-95 transition-all disabled:opacity-50"
              onClick={onUpdateJournal}
              disabled={!balanced}
            >
              حفظ التعديلات
            </button>
            <button
              className="text-error font-label-md text-label-md px-4 py-2 hover:bg-error-container/20 rounded-lg transition-all"
              onClick={onCancelEdit}
            >
              إلغاء التعديل
            </button>
          </>
        ) : isPosted && permissions.includes("journals_Post") ? (
          <button
            className="text-error font-label-md text-label-md border border-error px-4 py-2 rounded-lg hover:bg-error-container/20 transition-all"
            onClick={onUnpostJournal}
          >
            إلغاء الاعتماد
          </button>
        ) : null}
        </div>
      </div>
    </header>
  );
}
