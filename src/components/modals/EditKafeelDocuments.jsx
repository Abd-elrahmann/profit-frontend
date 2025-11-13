import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
  Paper,
  Grid,
  CircularProgress,
} from '@mui/material';
import { Close as CloseIcon, CloudUpload, Delete, Print, Download } from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import Api from '../../config/Api';
import { saveAs } from 'file-saver';
import { useQueryClient } from '@tanstack/react-query';
import { notifySuccess, notifyError } from '../../utilities/toastify';

const EditKafeelDocuments = ({ open, onClose, kafeelId, kafeel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});
  const [deleteFields, setDeleteFields] = useState([]);
  const queryClient = useQueryClient();

  const handleDrop = (acceptedFiles, fieldName) => {
    if (acceptedFiles.length > 0) {
      setUploadedFiles(prev => ({
        ...prev,
        [fieldName]: acceptedFiles[0]
      }));
    }
  };

  const removeFile = (fieldName) => {
    setUploadedFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[fieldName];
      return newFiles;
    });
  };

  const handleDeleteExisting = (fieldName) => {
    setDeleteFields(prev => [...prev, fieldName]);
  };

  const handleUndoDelete = (fieldName) => {
    setDeleteFields(prev => prev.filter(field => field !== fieldName));
  };

  const getFilePreview = (file) => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  const handleDownloadFile = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Error downloading file:', error);
      notifyError('حدث خطأ أثناء تحميل الملف');
    }
  };

  const handlePrintFile = async (fileUrl) => {
    try {
      const printWindow = window.open(fileUrl, '_blank');
      printWindow?.print();
    } catch (error) {
      console.error('Error printing file:', error);
      notifyError('حدث خطأ أثناء محاولة الطباعة');
    }
  };

  const DocumentDropzone = ({ fieldName, label, acceptedTypes, existingFile }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      accept: acceptedTypes,
      onDrop: (files) => handleDrop(files, fieldName),
      multiple: false,
    });

    const file = uploadedFiles[fieldName];
    const isDeleted = deleteFields.includes(fieldName);

    if (existingFile && !isDeleted && !file) {
      const fileName = existingFile.split('/').pop();
      return (
        <Paper sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography>{label}</Typography>
            <Box>
              <IconButton onClick={() => handlePrintFile(existingFile)}>
                <Print />
              </IconButton>
              <IconButton onClick={() => handleDownloadFile(existingFile, fileName)}>
                <Download />
              </IconButton>
              <IconButton onClick={() => handleDeleteExisting(fieldName)} color="error">
                <Delete />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      );
    }

    if (isDeleted && !file) {
      return (
        <Paper sx={{ p: 2, bgcolor: '#fff5f5' }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography color="error">{label} (سيتم الحذف)</Typography>
            <Button onClick={() => handleUndoDelete(fieldName)}>تراجع</Button>
          </Box>
        </Paper>
      );
    }

    return (
      <Paper
        {...getRootProps()}
        sx={{
          p: 3,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : '#ccc',
          textAlign: 'center',
          bgcolor: isDragActive ? 'action.hover' : '#fafafa',
          cursor: 'pointer',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        {file ? (
          <Box>
            {file.type.startsWith('image/') ? (
              <Box>
                <img 
                  src={getFilePreview(file)} 
                  alt={file.name}
                  style={{ maxWidth: '200px', maxHeight: 120, marginBottom: 8 }}
                />
                <Typography variant="body2">{file.name}</Typography>
              </Box>
            ) : (
              <Box>
                <CloudUpload sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="body2">{file.name}</Typography>
              </Box>
            )}
            <Button
              startIcon={<Delete />}
              color="error"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                removeFile(fieldName);
              }}
              sx={{ mt: 1 }}
            >
              إزالة
            </Button>
          </Box>
        ) : (
          <Box>
            <CloudUpload sx={{ fontSize: 40, color: '#9e9e9e', mb: 1 }} />
            <Typography variant="body2">{label}</Typography>
            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
              اسحب وأفلت الملف هنا أو انقر للاختيار
            </Typography>
          </Box>
        )}
      </Paper>
    );
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();

      // Add files
      Object.keys(uploadedFiles).forEach(key => {
        formData.append(key, uploadedFiles[key]);
      });

      // Add delete fields - set to null to delete
      deleteFields.forEach(fieldName => {
        formData.append(fieldName, '');
      });

      await Api.patch(`/api/clients/kafeel/${kafeelId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      notifySuccess('تم تحديث مستندات الكفيل بنجاح');
      onClose();
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      await queryClient.invalidateQueries({ queryKey: ['client-details'] });
      
      setUploadedFiles({});
      setDeleteFields([]);
    } catch (error) {
      console.error('Error updating kafeel documents:', error);
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء تحديث مستندات الكفيل');
    } finally {
      setIsSubmitting(false);
    }
  };

  const kafeelDocuments = {
    kafeelIdImage: kafeel?.kafeelIdImage,
    kafeelWorkCard: kafeel?.kafeelWorkCard,
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          direction: 'rtl'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Typography variant="h6" fontWeight="bold">
          تعديل مرفقات الكفيل - {kafeel?.name}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pb: 1 }}>
        <Box mb={4}>
          <Typography variant="h6" color="primary" mb={2} mt={2}>
            مرفقات الكفيل
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <DocumentDropzone
                fieldName="kafeelIdImage"
                label="صورة هوية الكفيل"
                acceptedTypes={{ 'image/*': ['.png', '.jpg', '.jpeg'] }}
                existingFile={kafeelDocuments.kafeelIdImage}
              />
            </Grid>
            <Grid item xs={12}>
              <DocumentDropzone
                fieldName="kafeelWorkCard"
                label="بطاقة عمل الكفيل"
                acceptedTypes={{ 
                  'application/pdf': ['.pdf'],
                  'image/*': ['.png', '.jpg', '.jpeg'] 
                }}
                existingFile={kafeelDocuments.kafeelWorkCard}
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, gap: 2 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" disabled={isSubmitting}>
          إلغاء
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitting || (Object.keys(uploadedFiles).length === 0 && deleteFields.length === 0)}
          sx={{
            bgcolor: "#0d40a5",
            "&:hover": { bgcolor: "#0b3589" },
            minWidth: 120
          }}
        >
          {isSubmitting ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'حفظ التغييرات'
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditKafeelDocuments;

