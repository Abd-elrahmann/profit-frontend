import React from "react";
import { getStatusText } from "./investorsUtils";
import {
  AccountCircle,
  Edit,
  Autorenew,
  CheckCircle,
  Person,
  ContactPhone,
  Info,
} from "@mui/icons-material";
import dayjs from "dayjs";
const inputBase =
  "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all px-3 py-2 text-slate-900 dark:text-slate-100 disabled:opacity-70 disabled:cursor-not-allowed";
const inputDisabled =
  "w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/80 px-3 py-2 text-slate-600 dark:text-slate-400 cursor-not-allowed";
const labelBase = "text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1.5";
const PersonalDetailsTab = ({
  investorDetails,
  editMode,
  editFormData,
  onEditModeToggle,
  onInputChange,
  onSaveChanges,
  isSaving = false,
  permissions,
  isMobile = false,
}) => {
  return (
    <div className={`space-y-8 ${isMobile ? "flex flex-col items-center max-w-[520px] w-full mx-auto" : ""}`}>
      <div className={`border-2 border-primary/10 rounded-xl bg-primary/5 dark:bg-primary/10 ${isMobile ? "p-4 w-full max-w-[520px]" : "p-6"}`}>
        <div className={`flex items-center justify-between mb-6 ${isMobile ? "flex-col gap-3 items-stretch" : ""}`}>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <AccountCircle sx={{ color: 'primary.main' }} />
            ملخص المستثمر
          </h2>
          {investorDetails?.WithdrawingStatus !== "WITHDRAWING" &&
            investorDetails?.WithdrawingStatus !== "WITHDRAWN" && (
              <div className={`flex gap-2 ${isMobile ? "flex-wrap" : ""}`}>
                {permissions.includes("partners_Update") && (
                  <button
                    type="button"
                    onClick={onEditModeToggle}
                    className={`px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 ${isMobile ? "text-sm py-1.5" : ""}`}
                  >
                    <Edit sx={{ fontSize: 20 }} />
                    {editMode ? "إلغاء التعديل" : "تعديل"}
                  </button>
                )}
                {permissions.includes("partners_Add") && (
                  <button
                    type="button"
                    onClick={onSaveChanges}
                    disabled={!editMode || isSaving}
                    className={`px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-70 ${isMobile ? "text-sm py-1.5" : ""}`}
                  >
                    {isSaving ? (
                      <>
                        <span className="animate-spin inline-block"><Autorenew sx={{ fontSize: 20 }} /></span>
                        جاري الحفظ...
                      </>
                    ) : (
                      <>
                        <CheckCircle sx={{ fontSize: 20 }} />
                        حفظ التغييرات
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Person sx={{ fontSize: 20 }} />
              البيانات الأساسية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelBase}>الاسم الكامل</label>
                <input
                  value={editMode ? editFormData.name : investorDetails.name}
                  onChange={(e) => onInputChange("name", e.target.value)}
                  disabled={!editMode}
                  className={editMode ? inputBase : inputDisabled}
                />
              </div>
            </div>
          </div>
          <div className="border-t border-primary/10 pt-6">
            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-2">
              <ContactPhone sx={{ fontSize: 20 }} />
              معلومات الاتصال
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelBase}>البريد الإلكتروني</label>
                <input
                  type="email"
                  value={editMode ? editFormData.email : investorDetails.email || "لا يوجد بريد إلكتروني"}
                  onChange={(e) => onInputChange("email", e.target.value)}
                  disabled={!editMode}
                  className={editMode ? inputBase : inputDisabled}
                />
              </div>
              <div>
                <label className={labelBase}>رقم الجوال</label>
                <input
                  value={editMode ? editFormData.phone : investorDetails.phone}
                  onChange={(e) => onInputChange("phone", e.target.value)}
                  disabled={!editMode}
                  className={`${editMode ? inputBase : inputDisabled} text-left`}
                  dir="ltr"
                />
              </div>
              <div className="md:col-span-2">
                <label className={labelBase}>العنوان</label>
                <textarea
                  value={editMode ? editFormData.address : investorDetails.address}
                  onChange={(e) => onInputChange("address", e.target.value)}
                  disabled={!editMode}
                  rows={2}
                  className={editMode ? inputBase : inputDisabled}
                />
              </div>
              <div>
                <label className={labelBase}>المدينة</label>
                <input
                  value={editMode ? editFormData.city : investorDetails.city || ""}
                  onChange={(e) => onInputChange("city", e.target.value)}
                  disabled={!editMode}
                  className={editMode ? inputBase : inputDisabled}
                />
              </div>
            </div>
          </div>
          <div className="border-t border-primary/10 pt-6">
            <h3 className="text-sm font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Info sx={{ fontSize: 20 }} />
              معلومات إضافية
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelBase}>رقم الهوية الوطنية</label>
                <input
                  value={investorDetails.nationalId}
                  disabled
                  className={inputDisabled}
                />
              </div>
              <div>
                <label className={labelBase}>تاريخ الانضمام الميلادي</label>
                <input
                  type="date"
                  value={
                    editMode
                      ? editFormData.createdAt
                      : investorDetails.createdAt
                        ? dayjs(investorDetails.createdAt).format("YYYY-MM-DD")
                        : ""
                  }
                  onChange={(e) => onInputChange("createdAt", e.target.value)}
                  disabled={!editMode}
                  className={editMode ? inputBase : inputDisabled}
                />
              </div>
              <div>
                <label className={labelBase}>تاريخ الانضمام الهجري</label>
                <input
                  value={investorDetails.HIjriCreatedAt || ""}
                  disabled
                  className={inputDisabled}
                />
              </div>
              <div>
                <label className={labelBase}>الحالة</label>
                {editMode ? (
                  <div>
                    <select
                      value={String(editFormData.isActive !== undefined ? editFormData.isActive : investorDetails.isActive)}
                      onChange={(e) => onInputChange("isActive", e.target.value === "true")}
                      className={inputBase}
                    >
                      <option value={true}>نشط</option>
                      <option value={false}>غير نشط</option>
                    </select>
                    {editFormData.isActive !== investorDetails.isActive && (
                      <p className="text-sm text-primary mt-2">
                        {editFormData.isActive === true
                          ? "سيتم تفعيل المستثمر"
                          : "سيتم إلغاء تفعيل المستثمر"}
                      </p>
                    )}
                  </div>
                ) : (
                  <input
                    value={investorDetails.isActive ? "نشط" : "غير نشط"}
                    disabled
                    className={inputDisabled}
                  />
                )}
              </div>
              <div>
                <label className={labelBase}>تصنيف المستثمر</label>
                <input
                  value={getStatusText(investorDetails)}
                  disabled
                  className={inputDisabled}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PersonalDetailsTab;