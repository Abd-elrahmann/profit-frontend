import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Paper,
  LinearProgress,
  IconButton,
  Chip,
  Alert,
} from '@mui/material';
import {
  CloudUpload,
  Delete,
  InsertDriveFile,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import Api, { handleApiError } from '../config/Api';
import { notifySuccess, notifyError } from '../utilities/toastify';

const FileUploadDropzone = ({
  investorId,
  onUploadSuccess,
  onUploadError,
  acceptedFileTypes = {
    'application/pdf': ['.pdf'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
  },
  maxFileSize = 10 * 1024 * 1024, // 10MB
  multiple = false,
  uploadEndpoint = `/api/partners/upload/${investorId}`,
  title = "رفع المستندات",
  description = "اسحب وأفلت الملفات هنا أو انقر للاختيار"
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadError, setUploadError] = useState('');

  const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
    setUploadError('');
    
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(file => {
        const errorMessages = file.errors.map(error => {
          switch (error.code) {
            case 'file-too-large':
              return `الملف ${file.file.name} كبير جداً (الحد الأقصى ${maxFileSize / 1024 / 1024}MB)`;
            case 'file-invalid-type':
              return `نوع الملف ${file.file.name} غير مدعوم`;
            default:
              return `خطأ في الملف ${file.file.name}: ${error.message}`;
          }
        });
        return errorMessages.join(', ');
      });
      setUploadError(errors.join('\n'));
      return;
    }

    if (acceptedFiles.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadPromises = acceptedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('investorId', investorId);
        formData.append('fileType', file.type);
        formData.append('fileName', file.name);

        const response = await Api.post(uploadEndpoint, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(progress);
          },
        });

        return {
          file,
          response: response.data,
          status: 'success'
        };
      });

      const results = await Promise.all(uploadPromises);
      
      // Update uploaded files list
      const successfulUploads = results.filter(result => result.status === 'success');
      setUploadedFiles(prev => [...prev, ...successfulUploads]);
      
      notifySuccess(`تم رفع ${successfulUploads.length} ملف بنجاح`);
      
      if (onUploadSuccess) {
        onUploadSuccess(successfulUploads);
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.message || 'حدث خطأ أثناء رفع الملف';
      setUploadError(errorMessage);
      notifyError(errorMessage);
      handleApiError(error);
      
      if (onUploadError) {
        onUploadError(error);
      }
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, [investorId, uploadEndpoint, maxFileSize, onUploadSuccess, onUploadError]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize: maxFileSize,
    multiple,
    disabled: uploading,
  });

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
        {title}
      </Typography>

      {/* Dropzone Area */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          bgcolor: isDragActive ? 'primary.50' : uploading ? 'grey.50' : 'background.paper',
          cursor: uploading ? 'not-allowed' : 'pointer',
          textAlign: 'center',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: uploading ? 'grey.300' : 'primary.main',
            bgcolor: uploading ? 'grey.50' : 'primary.50',
          },
        }}
      >
        <input {...getInputProps()} />
        
        <CloudUpload
          sx={{
            fontSize: 48,
            color: isDragActive ? 'primary.main' : 'grey.400',
            mb: 2,
          }}
        />
        
        <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
          {isDragActive ? 'أفلت الملفات هنا...' : description}
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {multiple ? 'يمكنك رفع عدة ملفات' : 'يمكنك رفع ملف واحد فقط'}
          <br />
          الأنواع المدعومة: PDF, JPG, PNG
          <br />
          الحد الأقصى: {formatFileSize(maxFileSize)}
        </Typography>

        {uploading && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress 
              variant="determinate" 
              value={uploadProgress} 
              sx={{ height: 8, borderRadius: 4 }}
            />
            <Typography variant="body2" sx={{ mt: 1 }}>
              جاري الرفع... {uploadProgress}%
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Error Display */}
      {uploadError && (
        <Alert 
          severity="error" 
          sx={{ mt: 2 }}
          onClose={() => setUploadError('')}
        >
          {uploadError}
        </Alert>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            الملفات المرفوعة ({uploadedFiles.length})
          </Typography>
          
          {uploadedFiles.map((uploadedFile, index) => (
            <Paper
              key={index}
              sx={{
                p: 2,
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: 'success.50',
                border: '1px solid',
                borderColor: 'success.200',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <InsertDriveFile color="primary" />
                <Box>
                  <Typography variant="body1" fontWeight="500">
                    {uploadedFile.file.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Chip
                      size="small"
                      label={formatFileSize(uploadedFile.file.size)}
                      variant="outlined"
                    />
                    <Chip
                      size="small"
                      icon={<CheckCircle />}
                      label="تم الرفع"
                      color="success"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </Box>
              
              <IconButton
                onClick={() => removeFile(index)}
                color="error"
                size="small"
              >
                <Delete />
              </IconButton>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default FileUploadDropzone;
