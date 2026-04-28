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
    <section className="rounded-xl p-card-padding border border-outline-variant shadow-[0px_2px_4px_rgba(0,0,0,0.05)] bg-[#f0f7ff]">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-gutter">
        <div className="flex flex-col gap-unit">
          <label className="font-label-md text-label-md text-on-surface-variant">التاريخ</label>
          <input
            className="w-full h-11 border border-outline-variant rounded-lg bg-surface px-4 focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md outline-none"
            type="date"
            value={dateValue}
            onChange={(e) => onInputChange("date", e.target.value)}
            disabled={!isEditable}
          />
        </div>

        <div className="flex flex-col gap-unit">
          <label className="font-label-md text-label-md text-on-surface-variant">نوع القيد</label>
          <StyledDropdown
            value={typeValue}
            disabled={!isEditable}
            onChange={(nextValue) => onInputChange("type", nextValue)}
            options={JOURNAL_TYPES.map(({ value, label }) => ({ value, label }))}
          />
        </div>

        <div className="flex flex-col gap-unit">
          <label className="font-label-md text-label-md text-on-surface-variant">المصدر</label>
          {isEditable ? (
            <StyledDropdown
              value={sourceTypeValueForm || "OTHER"}
              onChange={(nextValue) => onInputChange("sourceType", nextValue)}
              options={JOURNAL_SOURCE_TYPE_OPTIONS}
            />
          ) : (
            <input
              className="w-full h-11 border border-outline-variant rounded-lg bg-surface px-4 font-body-md text-body-md outline-none"
              value={readOnlySource}
              disabled
            />
          )}
        </div>

        <div className="flex flex-col gap-unit">
          <label className="font-label-md text-label-md text-on-surface-variant">الوصف</label>
          <input
            className="w-full h-11 border border-outline-variant rounded-lg bg-surface px-4 focus:ring-2 focus:ring-primary focus:border-primary font-body-md text-body-md outline-none"
            type="text"
            placeholder="وصف موجز للعملية..."
            value={descriptionValue}
            onChange={(e) => onInputChange("description", e.target.value)}
            disabled={!isEditable}
          />
        </div>
      </div>

      {!isAddMode && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter mt-gutter">
          <div className="flex flex-col gap-unit">
            <label className="font-label-md text-label-md text-on-surface-variant">الحالة</label>
            <input
              className="w-full h-11 border border-outline-variant rounded-lg bg-surface px-4 font-body-md text-body-md outline-none"
              value={getStatusText(journalData?.status)}
              disabled
            />
          </div>
          <div className="flex flex-col gap-unit">
            <label className="font-label-md text-label-md text-on-surface-variant">المعتمد بواسطة</label>
            <input
              className="w-full h-11 border border-outline-variant rounded-lg bg-surface px-4 font-body-md text-body-md outline-none"
              value={journalData?.postedBy?.name || "لم يتم الاعتماد"}
              disabled
            />
          </div>
        </div>
      )}
    </section>
  );
}
