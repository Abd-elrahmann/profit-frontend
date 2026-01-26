import React from "react";
import {
  Box,
  Grid,
  Typography,
  Paper,
  Divider,
  Alert,
  Button,
  IconButton,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";
import VisibilityIcon from "@mui/icons-material/Visibility";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import DescriptionIcon from "@mui/icons-material/Description";
import WarningIcon from "@mui/icons-material/Warning";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { isImageFile } from "./investorsUtils";

/**
 * Render file thumbnail (image or icon)
 */
const renderFileThumbnail = (fileUrl, label, isDarkMode) => {
  if (!fileUrl) return null;

  if (isImageFile(fileUrl)) {
    return (
      <Box
        component="img"
        src={fileUrl}
        alt={label}
        loading="lazy"
        width="100%"
        height={180}
        sx={{
          width: '100%',
          height: 180,
          objectFit: 'cover',
          borderRadius: 1,
          cursor: 'pointer',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'scale(1.02)',
          },
        }}
        onClick={() => window.open(fileUrl, '_blank')}
      />
    );
  } else {
    return (
      <Box
        sx={{
          width: '100%',
          height: 180,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: isDarkMode ? 'background.default' : '#f5f5f5',
          borderRadius: 1,
          cursor: 'pointer',
          transition: 'background-color 0.2s',
          '&:hover': {
            backgroundColor: isDarkMode ? 'action.hover' : '#e0e0e0',
          },
        }}
        onClick={() => window.open(fileUrl, '_blank')}
      >
        <InsertDriveFileIcon sx={{ fontSize: 60, color: '#757575' }} />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
          اضغط للعرض
        </Typography>
      </Box>
    );
  }
};

/**
 * DocumentsTab Component - Tab displaying investor documents
 * Shows Mudarabah contract and withdrawal receipt with preview and actions
 */
const DocumentsTab = ({
  // Investor data
  investorDetails,
  
  // Actions
  onDownloadFile,
  onShareFile,
  onOpenContractPreview,
  
  // Permissions & Theme
  permissions,
  isDarkMode,
}) => {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 2 }}>
          المستندات والعقود
        </Typography>
        <Divider sx={{ mb: 3 }} />

        {/* Alert for missing Mudarabah Contract */}
        {!investorDetails.mudarabahFileUrl && (
          <Alert severity="warning" sx={{ mb: 3, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
              <WarningIcon fontSize="small" />
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" fontWeight="bold">
                  هذا المستثمر لم يتم حفظ عقد المضاربة الخاص به
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  يرجى فتح معاينة العقد وحفظه لضمان اكتمال المستندات
                </Typography>
              </Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<DescriptionIcon />}
                onClick={onOpenContractPreview}
                sx={{
                  borderColor: 'warning.main',
                  color: 'warning.main',
                  '&:hover': {
                    borderColor: 'warning.dark',
                    bgcolor: 'warning.50'
                  }
                }}
              >
                فتح معاينة العقد
              </Button>
            </Box>
          </Alert>
        )}

        {/* Documents Grid */}
        <Grid container spacing={2}>
          {/* Mudarabah Contract */}
          {investorDetails.mudarabahFileUrl && (
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Paper
                sx={{
                  p: 2,
                  height: '100%',
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
                elevation={2}
              >
                {/* File Preview */}
                {renderFileThumbnail(investorDetails.mudarabahFileUrl, "عقد المضاربة", isDarkMode)}

                {/* Document Name and Action Buttons */}
                <Box sx={{ mt: 2 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    mb={1}
                  >
                    <CheckCircleIcon
                      color="success"
                      fontSize="small"
                    />
                    <Typography fontWeight="500" variant="body2">
                      عقد المضاربة
                    </Typography>
                  </Box>

                  {/* Action Buttons */}
                  {permissions.includes("partners_Export") && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => onDownloadFile(investorDetails.mudarabahFileUrl)}
                        title="تحميل"
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onShareFile(investorDetails.mudarabahFileUrl)}
                        title="مشاركة"
                      >
                        <ShareIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => window.open(investorDetails.mudarabahFileUrl, '_blank')}
                        title="عرض"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          )}

          {/* Withdrawal Receipt */}
          {investorDetails.withdrawalReceipt && (
            <Grid item xs={12} sm={6} md={4} lg={3}>
              <Paper
                sx={{
                  p: 2,
                  height: '100%',
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 2,
                  overflow: 'hidden',
                }}
                elevation={2}
              >
                {/* File Preview */}
                {renderFileThumbnail(investorDetails.withdrawalReceipt, "مخالصة مالية نهائية", isDarkMode)}

                {/* Document Name and Action Buttons */}
                <Box sx={{ mt: 2 }}>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    mb={1}
                  >
                    <PictureAsPdfIcon
                      color="error"
                      fontSize="small"
                    />
                    <Typography fontWeight="500" variant="body2">
                      مخالصة مالية نهائية
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                    عقد انسحاب المساهم
                  </Typography>

                  {/* Action Buttons */}
                  {permissions.includes("partners_Export") && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => onDownloadFile(investorDetails.withdrawalReceipt)}
                        title="تحميل"
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => onShareFile(investorDetails.withdrawalReceipt)}
                        title="مشاركة"
                      >
                        <ShareIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => window.open(investorDetails.withdrawalReceipt, '_blank')}
                        title="عرض"
                      >
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>
          )}

          {/* No documents message */}
          {!investorDetails.mudarabahFileUrl && !investorDetails.withdrawalReceipt && (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center', mb: 3 }}>
                <Typography color="text.secondary">لا توجد مستندات مرفوعة</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      </Box>
    </Box>
  );
};

export default DocumentsTab;
