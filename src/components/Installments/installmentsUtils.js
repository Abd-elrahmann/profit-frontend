import { notifyError, notifySuccess } from '../../utilities/toastify';

export const downloadFile = async (url, filename) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    try {
      link.download = decodeURIComponent(filename);
    } catch {
      link.download = filename;
    }
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Download error:', error);
    notifyError('حدث خطأ أثناء تحميل الملف');
  }
};

export const handleShareFile = async (fileUrl, filename) => {
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    const decodedFilename = decodeURIComponent(filename);
    const file = new File([blob], decodedFilename, { type: blob.type });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: decodedFilename,
        text: 'مشاركة إيصال الدفع',
        files: [file],
      });
    } else {
      await navigator.clipboard.writeText(fileUrl);
      notifySuccess('تم نسخ رابط الملف إلى الحافظة');
    }
  } catch (error) {
    console.error('Share error:', error);
    notifyError('حدث خطأ أثناء مشاركة الملف');
  }
};

export const extractFileName = (url) => {
  if (!url) return 'ملف غير معروف';
  if (Array.isArray(url)) {
    if (url.length === 0) return 'ملف غير معروف';
    url = url[0];
  }
  const parts = url.split('/');
  const encodedFileName = parts[parts.length - 1] || 'ملف غير معروف';
  try {
    return decodeURIComponent(encodedFileName);
  } catch {
    return encodedFileName;
  }
};

export const getStatusColor = (status, installment) => {
  if (checkIfOverdue(installment)) return 'error';

  const effectiveStatus =
    status === 'PENDING' &&
    installment.attachments &&
    installment.attachments.length > 0
      ? 'PENDING_REVIEW'
      : status;

  const colorMap = {
    PENDING: 'warning',
    PENDING_REVIEW: 'warning',
    COMPLETED: 'info',
    PAID: 'success',
    PARTIAL_PAID: 'info',
    OVERDUE: 'error',
    EARLY_PAID: 'success',
  };
  return colorMap[effectiveStatus] || 'default';
};

export const getStatusText = (status, installment) => {
  if (checkIfOverdue(installment)) return 'متأخر';

  const effectiveStatus =
    status === 'PENDING' &&
    installment.attachments &&
    installment.attachments.length > 0
      ? 'PENDING_REVIEW'
      : status;

  const textMap = {
    PENDING: 'قيد الانتظار',
    PENDING_REVIEW: 'قيد المراجعة',
    COMPLETED: 'مكتمل',
    PAID: 'مدفوع',
    PARTIAL_PAID: 'مدفوع جزئياً',
    OVERDUE: 'متأخر',
    EARLY_PAID: 'مدفوع مبكراً',
  };
  return textMap[effectiveStatus] || status;
};

export const checkIfOverdue = (installment) => {
  if (installment.status === 'PAID') return false;
  const dueDate = new Date(installment.dueDate);
  const today = new Date();
  return dueDate < today;
};

export const hasPendingDocuments = (installment) =>
  installment.attachments &&
  installment.attachments.length > 0 &&
  installment.status === 'PENDING';

export const hasFiles = (installment) =>
  (installment.attachments && installment.attachments.length > 0) ||
  installment.PaymentProof;

export const sortInstallments = (installments) =>
  [...(installments || [])].sort(
    (a, b) => a.id - b.id || new Date(a.dueDate) - new Date(b.dueDate)
  );

export const filterInstallmentsByStatus = (installments, statusFilter, checkIfOverdueFn) => {
  if (!statusFilter || statusFilter === 'ALL') return installments || [];
  const list = installments || [];

  if (statusFilter === 'OVERDUE') {
    return list.filter((inst) => checkIfOverdueFn(inst));
  }

  if (statusFilter === 'PENDING_REVIEW') {
    return list.filter(
      (inst) =>
        inst.status === 'PENDING' &&
        inst.attachments &&
        inst.attachments.length > 0 &&
        !checkIfOverdueFn(inst)
    );
  }

  if (statusFilter === 'PENDING') {
    return list.filter(
      (inst) =>
        inst.status === 'PENDING' &&
        (!inst.attachments || inst.attachments.length === 0) &&
        !checkIfOverdueFn(inst)
    );
  }

  return list.filter((inst) => inst.status === statusFilter);
};
