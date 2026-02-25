import React from "react";
import { isImageFile } from "./investorsUtils";
import {
  Description,
  ContactPage,
  Warning,
  CheckCircle,
  Download,
  Share,
  Visibility,
  PictureAsPdf,
} from "@mui/icons-material";

const renderFileThumbnail = (fileUrl, label, isDarkMode) => {
  if (!fileUrl) return null;

  if (isImageFile(fileUrl)) {
    return (
      <img
        src={fileUrl}
        alt={label}
        loading="lazy"
        className="w-full h-[180px] object-cover rounded-lg cursor-pointer transition-transform hover:scale-[1.02]"
        onClick={() => window.open(fileUrl, "_blank")}
      />
    );
  }
  return (
    <div
      className={`w-full h-[180px] flex flex-col items-center justify-center rounded-lg cursor-pointer transition-colors ${
        isDarkMode ? "bg-slate-800 hover:bg-slate-700" : "bg-slate-100 hover:bg-slate-200"
      }`}
      onClick={() => window.open(fileUrl, "_blank")}
    >
      <Description sx={{ fontSize: 60, color: '#64748b' }} />
      <span className="text-sm text-slate-500 mt-2">اضغط للعرض</span>
    </div>
  );
};

const DocumentsTab = ({
  investorDetails,
  onDownloadFile,
  onShareFile,
  onOpenContractPreview,
  permissions,
  isDarkMode,
}) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
        <ContactPage sx={{ color: 'primary.main' }} />
        المستندات والعقود
      </h2>

      {!investorDetails.mudarabahFileUrl && (
        <div className="border-2 border-amber-200 dark:border-amber-800 rounded-xl p-4 bg-amber-50 dark:bg-amber-900/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Warning sx={{ color: 'warning.main' }} />
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-200">هذا المستثمر لم يتم حفظ عقد المضاربة الخاص به</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">يرجى فتح معاينة العقد وحفظه لضمان اكتمال المستندات</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenContractPreview}
            className="px-4 py-2 rounded-lg border-2 border-amber-500 text-amber-600 dark:text-amber-400 font-bold hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-colors flex items-center gap-2"
          >
            <Description sx={{ fontSize: 20 }} />
            فتح معاينة العقد
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {investorDetails.mudarabahFileUrl && (
          <div className="border-2 border-primary/20 rounded-xl p-6 bg-primary/5 dark:bg-primary/10 flex flex-col gap-3">
            {renderFileThumbnail(investorDetails.mudarabahFileUrl, "عقد المضاربة", isDarkMode)}
            <div className="flex items-center gap-2">
              <CheckCircle sx={{ fontSize: 20, color: '#16a34a' }} />
              <p className="text-sm font-bold text-slate-800 dark:text-white">عقد المضاربة</p>
            </div>
            {permissions.includes("partners_Export") && (
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => onDownloadFile(investorDetails.mudarabahFileUrl)}
                  className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Download sx={{ fontSize: 20 }} />
                  تحميل
                </button>
                <button
                  type="button"
                  onClick={() => onShareFile(investorDetails.mudarabahFileUrl)}
                  className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Share sx={{ fontSize: 20 }} />
                  مشاركة
                </button>
                <button
                  type="button"
                  onClick={() => window.open(investorDetails.mudarabahFileUrl, "_blank")}
                  className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Visibility sx={{ fontSize: 20 }} />
                  عرض
                </button>
              </div>
            )}
          </div>
        )}

        {investorDetails.withdrawalReceipt && (
          <div className="border-2 border-primary/20 rounded-xl p-6 bg-primary/5 dark:bg-primary/10 flex flex-col gap-3">
            {renderFileThumbnail(investorDetails.withdrawalReceipt, "مخالصة مالية نهائية", isDarkMode)}
            <div className="flex items-center gap-2">
              <PictureAsPdf sx={{ fontSize: 20, color: '#ef4444' }} />
              <p className="text-sm font-bold text-slate-800 dark:text-white">مخالصة مالية نهائية</p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">عقد انسحاب المساهم</p>
            {permissions.includes("partners_Export") && (
              <div className="flex gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => onDownloadFile(investorDetails.withdrawalReceipt)}
                  className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Download sx={{ fontSize: 20 }} />
                  تحميل
                </button>
                <button
                  type="button"
                  onClick={() => onShareFile(investorDetails.withdrawalReceipt)}
                  className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Share sx={{ fontSize: 20 }} />
                  مشاركة
                </button>
                <button
                  type="button"
                  onClick={() => window.open(investorDetails.withdrawalReceipt, "_blank")}
                  className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-1.5"
                >
                  <Visibility sx={{ fontSize: 20 }} />
                  عرض
                </button>
              </div>
            )}
          </div>
        )}

        {!investorDetails.mudarabahFileUrl && !investorDetails.withdrawalReceipt && (
          <div className="col-span-full border-2 border-primary/20 rounded-xl p-8 bg-primary/5 dark:bg-primary/10 text-center">
            <p className="text-slate-600 dark:text-slate-400">لا توجد مستندات مرفوعة</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentsTab;
