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
  hasEditChanges = false,
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
    <header className="sticky top-0 z-50">
      <div className="max-w-[1440px] mx-auto px-6 py-a flex items-center justify-between  h-10">
        <div className="flex items-center gap-4">
          <button className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[#e6e8ea] transition-colors">
            ←
          </button>
          <div className="flex flex-col">
            <h1 className="text-2xl leading-8 font-semibold tracking-[-0.01em] text-[#191c1e]">
              {isAddMode ? "إضافة قيد جديد" : "تفاصيل القيد"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
        {showExportButtons && (
          <>
            <button
              className="text-[#ba1a1a] text-xs font-semibold leading-4 tracking-[0.05em] px-4 py-2 hover:bg-[#ffdad6]/20 rounded-lg transition-all"
              onClick={onExportPDF}
            >
              تصدير PDF
            </button>
            <button
              className="text-[#002b7a] text-xs font-semibold leading-4 tracking-[0.05em] border border-[#002b7a] px-4 py-2 rounded-lg hover:bg-[#002b7a]/5 transition-all"
              onClick={onExportExcel}
            >
              تصدير Excel
            </button>
          </>
        )}
        {isAddMode ? (
          <>
            <button
              className="text-[#ba1a1a] text-xs font-semibold leading-4 tracking-[0.05em] px-4 py-2 hover:bg-[#ffdad6]/20 rounded-lg transition-all"
              onClick={onCancelAdd}
            >
              إلغاء
            </button>
            <button
              className="bg-[#0d40a5] text-white text-xs font-semibold leading-4 tracking-[0.05em] px-6 py-2 rounded-lg shadow-sm hover:shadow-md active:scale-95 transition-all disabled:opacity-50"
              onClick={onCreateJournal}
              disabled={!balanced}
            >
              إنشاء القيد
            </button>
          </>
        ) : canEdit ? (
          <>
            <button
              className="bg-[#0d40a5] text-white text-xs font-semibold leading-4 tracking-[0.05em] px-6 py-2 rounded-lg shadow-sm hover:shadow-md active:scale-95 transition-all"
              onClick={onEditClick}
            >
              تعديل القيد
            </button>
            {permissions.includes("journals_Post") && (
              <button
                className="bg-[#78fac3] text-[#002114] text-xs font-semibold leading-4 tracking-[0.05em] px-6 py-2 rounded-lg shadow-sm hover:shadow-md active:scale-95 transition-all"
                onClick={onPostJournal}
              >
                اعتماد القيد
              </button>
            )}
            {permissions.includes("journals_Delete") && (
              <button
                className="text-[#ba1a1a] text-xs font-semibold leading-4 tracking-[0.05em] border border-[#ba1a1a] px-4 py-2 rounded-lg hover:bg-[#ffdad6]/20 transition-all"
                onClick={onDeleteClick}
              >
                حذف القيد
              </button>
            )}
          </>
        ) : canSaveEdit ? (
          <>
            <button
              className="bg-[#0d40a5] text-white text-xs font-semibold leading-4 tracking-[0.05em] px-6 py-2 rounded-lg shadow-sm hover:shadow-md active:scale-95 transition-all disabled:opacity-50"
              onClick={onUpdateJournal}
              disabled={!balanced || !hasEditChanges}
            >
              حفظ التعديلات
            </button>
            <button
              className="text-[#ba1a1a] text-xs font-semibold leading-4 tracking-[0.05em] px-4 py-2 hover:bg-[#ffdad6]/20 rounded-lg transition-all"
              onClick={onCancelEdit}
            >
              إلغاء التعديل
            </button>
          </>
        ) : isPosted && permissions.includes("journals_Post") ? (
          <button
            className="text-[#ba1a1a] text-xs font-semibold leading-4 tracking-[0.05em] border border-[#ba1a1a] px-4 py-2 rounded-lg hover:bg-[#ffdad6]/20 transition-all"
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
