import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton, Box } from '@mui/material';
import { Close as CloseIcon, Visibility, Share, Download } from '@mui/icons-material';
import { notifySuccess, notifyError } from '../../utilities/toastify';
import { secureOpenFile, secureFetchFile } from '../../utilities/fileUtils';

const getVoucherLabel = (group) => {
  if (!group.types?.length) return 'سند صرف';
  if (group.types.length === 1) return group.types[0];
  return `صرف مصروفات متعددة: ${group.types.join('، ')}`;
};

const getVoucherUrl = (group) => {
  if (!group.voucherUrl) return null;
  return group.voucherUrl.startsWith('http') ? group.voucherUrl : `${window.location.origin}/${group.voucherUrl}`;
};

const ExpenseVouchersModal = ({ open, onClose, groupedExpenses }) => {
  const [copyingId, setCopyingId] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const handleView = async (group) => {
    const url = getVoucherUrl(group);
    if (!url) {
      notifyError('لا يوجد سند مرفق لهذا المصروف');
      return;
    }
    try {
      await secureOpenFile(url);
    } catch {
      notifyError('لا يوجد صلاحية لعرض الملف');
    }
  };

  const handleShare = async (group) => {
    const url = getVoucherUrl(group);
    if (!url) {
      notifyError('لا يوجد سند مرفق لهذا المصروف');
      return;
    }
    setCopyingId(group.journalId);
    try {
      if (navigator.share) {
        await navigator.share({
          title: getVoucherLabel(group),
          url,
          text: `سند صرف - ${getVoucherLabel(group)}`,
        });
        notifySuccess('تم المشاركة بنجاح');
      } else {
        await navigator.clipboard.writeText(url);
        notifySuccess('تم نسخ الرابط');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        try {
          await navigator.clipboard.writeText(url);
          notifySuccess('تم نسخ الرابط');
        } catch {
          notifyError('فشل في نسخ الرابط');
        }
      }
    } finally {
      setCopyingId(null);
    }
  };

  const handleDownload = async (group) => {
    const url = getVoucherUrl(group);
    if (!url) {
      notifyError('لا يوجد سند مرفق لهذا المصروف');
      return;
    }
    setDownloadingId(group.journalId);
    try {
      const blob = await secureFetchFile(url);
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `سند_صرف_${group.journalReference || group.journalId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      notifySuccess('تم تحميل السند بنجاح');
    } catch {
      const link = document.createElement('a');
      link.href = url;
      link.download = `سند_صرف_${group.journalReference || group.journalId}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      notifySuccess('جاري تحميل السند');
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      dir="rtl"
      PaperProps={{
        className: 'rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-700/50',
        sx: { bgcolor: 'background.paper' },
      }}
    >
      <DialogTitle className="flex justify-between items-center px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
        <span className="text-lg font-bold text-primary">
          عرض سندات المصروفات
        </span>
        <IconButton onClick={onClose} size="small" className="hover:bg-slate-200/50 dark:hover:bg-slate-600/30 rounded-full">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent className="p-6">
        {groupedExpenses?.length === 0 ? (
          <Box className="py-12 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              لا توجد سندات مصروفات
            </p>
          </Box>
        ) : (
          <div className="space-y-3">
            {groupedExpenses?.map((group) => (
              <Box
                key={group.journalId}
                className="flex flex-row justify-between items-center gap-4 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                    {getVoucherLabel(group)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    رقم السند: {group.journalReference || group.journalId} | المبلغ: {group.totalAmount?.toLocaleString('en-US')} ر.س
                  </p>
                </div>
                <div className="flex flex-row justify-end items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleView(group)}
                    disabled={!group.voucherUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-primary hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Visibility fontSize="small" />
                    عرض
                  </button>
                  <button
                    type="button"
                    onClick={() => handleShare(group)}
                    disabled={!group.voucherUrl || copyingId === group.journalId}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-primary border border-primary/30 hover:bg-primary/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Share fontSize="small" />
                    مشاركة
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(group)}
                    disabled={!group.voucherUrl || downloadingId === group.journalId}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {downloadingId === group.journalId ? (
                      <span className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    ) : (
                      <Download fontSize="small" />
                    )}
                    حفظ
                  </button>
                </div>
              </Box>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExpenseVouchersModal;
