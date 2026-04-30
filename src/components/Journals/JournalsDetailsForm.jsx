import React from "react";
import { JOURNAL_TYPES } from "./constants";
import {
  getJournalSourceTypeText,
  getStatusText,
  JOURNAL_SOURCE_TYPE_OPTIONS,
} from "./journalsUtils";
import StyledDropdown from "./StyledDropdown";

export default function JournalsDetailsForm({
  journalData,
  editForm,
  newJournalForm,
  isAddMode,
  isEditMode,
  onInputChange,
}) {
  const isEditable = isEditMode || isAddMode;

  const dateValue = isAddMode
    ? newJournalForm.date
    : isEditMode
    ? editForm.date
    : journalData?.date
    ? journalData.date.split("T")[0]
    : "";
  const typeValue = isAddMode
    ? newJournalForm.type
    : isEditMode
    ? editForm.type
    : journalData?.type || "";
  const descriptionValue = isAddMode
    ? newJournalForm.description
    : isEditMode
    ? editForm.description
    : journalData?.description || "";
  const sourceTypeValueForm = isAddMode
    ? newJournalForm.sourceType
    : isEditMode
    ? editForm.sourceType
    : "";

  const readOnlySource = journalData?.sourceType
    ? getJournalSourceTypeText(journalData.sourceType)
    : "لا يوجد";

  return (
    <section className="rounded-xl p-5 border border-[#c4c6d5] shadow-[0px_2px_4px_rgba(0,0,0,0.05)] bg-[#f0f7ff]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold leading-4 tracking-[0.05em] text-[#434653]">التاريخ</label>
          <input
            className="w-full h-11 border border-[#c4c6d5] rounded-lg bg-[#f7f9fb] px-4 focus:ring-2 focus:ring-[#002b7a] focus:border-[#002b7a] text-sm leading-5 outline-none"
            type="date"
            value={dateValue}
            onChange={(e) => onInputChange("date", e.target.value)}
            disabled={!isEditable}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold leading-4 tracking-[0.05em] text-[#434653]">نوع القيد</label>
          <StyledDropdown
            value={typeValue}
            disabled={!isEditable}
            onChange={(nextValue) => onInputChange("type", nextValue)}
            options={JOURNAL_TYPES.map(({ value, label }) => ({ value, label }))}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold leading-4 tracking-[0.05em] text-[#434653]">المصدر</label>
          {isEditable ? (
            <StyledDropdown
              value={sourceTypeValueForm || "OTHER"}
              onChange={(nextValue) => onInputChange("sourceType", nextValue)}
              options={JOURNAL_SOURCE_TYPE_OPTIONS}
            />
          ) : (
            <input
              className="w-full h-11 border border-[#c4c6d5] rounded-lg bg-[#f7f9fb] px-4 text-sm leading-5 outline-none"
              value={readOnlySource}
              disabled
            />
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold leading-4 tracking-[0.05em] text-[#434653]">الوصف</label>
          <input
            className="w-full h-11 border border-[#c4c6d5] rounded-lg bg-[#f7f9fb] px-4 focus:ring-2 focus:ring-[#002b7a] focus:border-[#002b7a] text-sm leading-5 outline-none"
            type="text"
            placeholder="وصف موجز للعملية..."
            value={descriptionValue}
            onChange={(e) => onInputChange("description", e.target.value)}
            disabled={!isEditable}
          />
        </div>
      </div>

      {!isAddMode && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold leading-4 tracking-[0.05em] text-[#434653]">الحالة</label>
            <input
              className="w-full h-11 border border-[#c4c6d5] rounded-lg bg-[#f7f9fb] px-4 text-sm leading-5 outline-none"
              value={getStatusText(journalData?.status)}
              disabled
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold leading-4 tracking-[0.05em] text-[#434653]">المعتمد بواسطة</label>
            <input
              className="w-full h-11 border border-[#c4c6d5] rounded-lg bg-[#f7f9fb] px-4 text-sm leading-5 outline-none"
              value={journalData?.postedBy?.name || "لم يتم الاعتماد"}
              disabled
            />
          </div>
        </div>
      )}
    </section>
  );
}
