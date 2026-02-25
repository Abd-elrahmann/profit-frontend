import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Api from '../../config/Api';
import {
  PictureAsPdf,
  Description,
  Print,
  Download,
  Delete,
  CloudUpload,
  ContactPage,
  Autorenew,
  CheckCircle,
} from '@mui/icons-material';
import { saveAs } from 'file-saver';
import { useQueryClient } from '@tanstack/react-query';
import { notifySuccess, notifyError } from '../../utilities/toastify';

const DocumentDropzone = ({
  fieldName,
  label,
  acceptedTypes,
  existingFile,
  uploadedFiles,
  deleteFields,
  onDrop,
  onRemoveFile,
  onDeleteExisting,
  onUndoDelete,
}) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: acceptedTypes,
    onDrop: (files) => onDrop(files, fieldName),
    multiple: false,
  });

  const file = uploadedFiles[fieldName];
  const isDeleted = deleteFields.includes(fieldName);
  const [imgLoadFailed, setImgLoadFailed] = useState(false);

  const handleDownloadFile = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      saveAs(blob, fileName);
    } catch {
      notifyError('حدث خطأ أثناء تحميل الملف');
    }
  };

  const handlePrintFile = (fileUrl) => {
    window.open(fileUrl, '_blank')?.print();
  };

  const getFilePreview = (f) => {
    if (f?.type?.startsWith('image/')) return URL.createObjectURL(f);
    return null;
  };

  if (existingFile && !isDeleted && !file) {
    const fileName = decodeURIComponent(existingFile.split('/').pop());
    const acceptsImage = acceptedTypes && Object.keys(acceptedTypes).some((k) => k.startsWith('image'));
    const acceptsPdf = acceptedTypes && Object.keys(acceptedTypes).includes('application/pdf');
    return (
      <div className="border-2 border-primary/20 rounded-xl p-6 bg-primary/5 dark:bg-primary/10 flex flex-col gap-3">
        <p className="text-sm font-bold text-slate-800 dark:text-white">{label}</p>
        <div className="flex flex-col items-center justify-center gap-2 w-full min-h-[100px]">
          {acceptsImage ? (
            imgLoadFailed && acceptsPdf ? (
              <div className="flex items-center justify-center gap-2 text-primary">
                <PictureAsPdf sx={{ fontSize: 48 }} color="primary" />
                <span className="text-sm">ملف PDF</span>
              </div>
            ) : (
              <img
                src={existingFile}
                alt={label}
                className="max-w-full max-h-[140px] rounded-lg object-contain bg-slate-100 dark:bg-slate-800"
                onError={() => setImgLoadFailed(true)}
              />
            )
          ) : (
            <div className="flex items-center justify-center gap-2 text-primary">
              <Description sx={{ fontSize: 48 }} color="primary" />
              <span className="text-sm">{fileName || 'ملف مرفق'}</span>
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handlePrintFile(existingFile)}
            className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Print sx={{ fontSize: 20 }} />
            طباعة
          </button>
          <button
            type="button"
            onClick={() => handleDownloadFile(existingFile, fileName)}
            className="px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Download sx={{ fontSize: 20 }} />
            تحميل
          </button>
          <button
            type="button"
            onClick={() => onDeleteExisting(fieldName)}
            className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Delete sx={{ fontSize: 20 }} />
            حذف
          </button>
        </div>
      </div>
    );
  }

  if (isDeleted && !file) {
    return (
      <div className="border-2 border-red-200 dark:border-red-800 rounded-xl p-6 bg-red-50 dark:bg-red-900/20 flex flex-col gap-3">
        <p className="text-sm font-bold text-red-600 dark:text-red-400">{label} (سيتم الحذف)</p>
        <button
          type="button"
          onClick={() => onUndoDelete(fieldName)}
          className="px-3 py-1.5 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors w-fit"
        >
          تراجع
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all group min-h-[140px] ${
        isDragActive ? 'border-primary bg-primary/5' : 'border-primary/20 bg-primary/5 dark:bg-primary/10 hover:border-primary'
      }`}
    >
      <input {...getInputProps()} />
      {file ? (
        <div className="flex flex-col items-center">
          {file.type?.startsWith('image/') ? (
            <>
              <img src={getFilePreview(file)} alt={file.name} className="max-w-[200px] max-h-[120px] mb-2 rounded-lg object-cover" />
              <p className="text-sm text-slate-700 dark:text-slate-300">{file.name}</p>
            </>
          ) : (
            <>
              <CloudUpload sx={{ fontSize: 40, color: 'primary.main', mb: 0.5 }} />
              <p className="text-sm text-slate-700 dark:text-slate-300">{file.name}</p>
            </>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFile(fieldName);
            }}
            className="mt-2 px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            إزالة
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <CloudUpload sx={{ fontSize: 40, color: 'primary.main', mb: 0.5 }} className="group-hover:scale-110 transition-transform" />
          <p className="text-sm font-bold text-slate-800 dark:text-white">{label}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">اسحب وأفلت الملف هنا أو انقر للاختيار</p>
        </div>
      )}
    </div>
  );
};

export default function EditKafeelDocumentsForm({ kafeelId, kafeel, onSuccess, onCancel }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [deleteFields, setDeleteFields] = useState([]);
  const queryClient = useQueryClient();

  const handleDrop = (acceptedFiles, fieldName) => {
    if (acceptedFiles.length > 0) {
      setUploadedFiles((prev) => ({ ...prev, [fieldName]: acceptedFiles[0] }));
    }
  };

  const removeFile = (fieldName) => {
    setUploadedFiles((prev) => {
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  };

  const handleDeleteExisting = (fieldName) => setDeleteFields((prev) => [...prev, fieldName]);
  const handleUndoDelete = (fieldName) => setDeleteFields((prev) => prev.filter((f) => f !== fieldName));

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(uploadedFiles).forEach((key) => formData.append(key, uploadedFiles[key]));
      deleteFields.forEach((fieldName) => formData.append(fieldName, ''));

      await Api.patch(`/api/clients/kafeel/${kafeelId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      notifySuccess('تم تحديث مستندات الكفيل بنجاح');
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client-details'] });
      onSuccess?.();
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء تحديث مستندات الكفيل');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dropzoneProps = {
    uploadedFiles,
    deleteFields,
    onDrop: handleDrop,
    onRemoveFile: removeFile,
    onDeleteExisting: handleDeleteExisting,
    onUndoDelete: handleUndoDelete,
  };

  return (
    <div dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">تعديل مرفقات الكفيل - {kafeel?.name}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">تحديث مستندات الكفيل</p>
      </div>

      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 mb-4">
            <ContactPage sx={{ color: 'primary.main' }} />
            مرفقات الكفيل
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <DocumentDropzone
              fieldName="kafeelIdImage"
              label="صورة هوية الكفيل"
              acceptedTypes={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
              existingFile={kafeel?.kafeelIdImage}
              {...dropzoneProps}
            />
            <DocumentDropzone
              fieldName="kafeelWorkCard"
              label="بطاقة عمل الكفيل"
              acceptedTypes={{ 'application/pdf': ['.pdf'], 'image/*': ['.png', '.jpg', '.jpeg'] }}
              existingFile={kafeel?.kafeelWorkCard}
              {...dropzoneProps}
            />
          </div>
        </div>
      </div>

      <div className="px-0 py-6 mt-8 border-t border-primary/10 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-lg text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          إلغاء
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting || (Object.keys(uploadedFiles).length === 0 && deleteFields.length === 0)}
          className="px-8 py-2.5 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
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
      </div>
    </div>
  );
}
