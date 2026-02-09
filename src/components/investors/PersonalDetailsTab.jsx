import React from "react";
import {
  Box,
  Grid,
  Typography,
  Button,
  TextField,
  Paper,
  Divider,
  MenuItem,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import dayjs from "dayjs";
import { getStatusText } from "./investorsUtils";

const PersonalDetailsTab = ({
  investorDetails,
  
  editMode,
  editFormData,
  onEditModeToggle,
  onInputChange,
  onSaveChanges,
  
  permissions,
  isDarkMode,
}) => {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3, bgcolor: "background.paper" }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            ملخص المستثمر
          </Typography>
          {investorDetails?.WithdrawingStatus !== 'WITHDRAWING' && investorDetails?.WithdrawingStatus !== 'WITHDRAWN' && (
            <Box sx={{ display: "flex", gap: 2 }}>
              {permissions.includes("partners_Update") && (
                <Button
                  variant="outlined"
                  startIcon={<EditIcon sx={{marginLeft: '10px'}} />}
                  onClick={onEditModeToggle}
                  size="small"
                >
                  {editMode ? 'إلغاء التعديل' : 'تعديل'}
                </Button>
              )}
              {permissions.includes("partners_Add") && (
                <Button
                  variant="contained"
                  startIcon={<SaveIcon sx={{marginLeft: '10px'}} />}
                  sx={{ bgcolor: "primary.main", "&:hover": { bgcolor: "primary.dark" } }}
                  disabled={!editMode}
                  onClick={onSaveChanges}
                  size="small"
                >
                  حفظ التغييرات
                </Button>
              )}
            </Box>
          )}
        </Box>
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 2 }}>
            البيانات الأساسية
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" mb={1} fontWeight={500}>الاسم الكامل</Typography>
              <TextField 
                value={editMode ? editFormData.name : investorDetails.name} 
                onChange={(e) => onInputChange('name', e.target.value)}
                fullWidth
                disabled={!editMode}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: editMode ? (isDarkMode ? 'background.paper' : '#fff') : (isDarkMode ? 'background.default' : '#f9fafb'),
                    borderRadius: '6px',
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 2 }}>
            معلومات الاتصال
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" mb={1} fontWeight={500}>البريد الإلكتروني</Typography>
              <TextField 
                value={editMode ? editFormData.email : investorDetails.email || 'لا يوجد بريد إلكتروني'} 
                onChange={(e) => onInputChange('email', e.target.value)}
                fullWidth
                disabled={!editMode}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: editMode ? (isDarkMode ? 'background.paper' : '#fff') : (isDarkMode ? 'background.default' : '#f9fafb'),
                    borderRadius: '6px',
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" mb={1} fontWeight={500}>رقم الجوال</Typography>
              <TextField
                value={editMode ? editFormData.phone : investorDetails.phone}
                onChange={(e) => onInputChange('phone', e.target.value)}
                fullWidth
                disabled={!editMode}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: editMode ? (isDarkMode ? 'background.paper' : '#fff') : (isDarkMode ? 'background.default' : '#f9fafb'),
                    borderRadius: '6px',
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" mb={1} fontWeight={500}>العنوان</Typography>
              <TextField
                value={editMode ? editFormData.address : investorDetails.address}
                onChange={(e) => onInputChange('address', e.target.value)}
                fullWidth
                disabled={!editMode}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: editMode ? (isDarkMode ? 'background.paper' : '#fff') : (isDarkMode ? 'background.default' : '#f9fafb'),
                    borderRadius: '6px',
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" mb={1} fontWeight={500}>المدينة</Typography>
              <TextField
                value={editMode ? editFormData.city : investorDetails.city || ''}
                onChange={(e) => onInputChange('city', e.target.value)}
                fullWidth
                disabled={!editMode}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: editMode ? (isDarkMode ? 'background.paper' : '#fff') : (isDarkMode ? 'background.default' : '#f9fafb'),
                    borderRadius: '6px',
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 3 }} />
                
        <Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', mb: 2 }}>
            معلومات إضافية
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" mb={1} fontWeight={500}>رقم الهوية الوطنية</Typography>
              <TextField 
                value={investorDetails.nationalId} 
                fullWidth
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isDarkMode ? 'background.default' : '#f9fafb',
                    borderRadius: '6px',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" mb={1} fontWeight={500}>تاريخ الانضمام الميلادي</Typography>
              <TextField
                type="date"
                value={editMode ? editFormData.createdAt : (investorDetails.createdAt ? dayjs(investorDetails.createdAt).format('YYYY-MM-DD') : '')}
                onChange={(e) => onInputChange('createdAt', e.target.value)}
                fullWidth
                disabled={!editMode}
                InputLabelProps={{ shrink: true }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: editMode ? (isDarkMode ? 'background.paper' : '#fff') : (isDarkMode ? 'background.default' : '#f9fafb'),
                    borderRadius: '6px',
                    '&:hover fieldset': {
                      borderColor: editMode ? 'primary.main' : undefined,
                    },
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" mb={1} fontWeight={500}>تاريخ الانضمام الهجري</Typography>
              <TextField
                value={investorDetails.HIjriCreatedAt || ''}
                fullWidth
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isDarkMode ? 'background.default' : '#f9fafb',
                    borderRadius: '6px',
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" mb={1} fontWeight={500}>الحالة</Typography>
              {editMode ? (
                <Box>
                  <TextField
                    select
                    value={editFormData.isActive !== undefined ? editFormData.isActive : investorDetails.isActive}
                    onChange={(e) => onInputChange('isActive', e.target.value)}
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        backgroundColor: isDarkMode ? 'background.paper' : '#ffffff',
                        borderRadius: '6px',
                      },
                    }}
                  >
                    <MenuItem value={true}>نشط</MenuItem>
                    <MenuItem value={false}>غير نشط</MenuItem>
                  </TextField>
                  {editFormData.isActive !== investorDetails.isActive && (
                    <Alert severity="info" sx={{ mt: 1, fontSize: '0.85rem' }}>
                      {editFormData.isActive === true ?
                        'سيتم تفعيل المستثمر' :
                        'سيتم إلغاء تفعيل المستثمر'}
                    </Alert>
                  )}
                </Box>
              ) : (
                <TextField
                  value={investorDetails.isActive ? 'نشط' : 'غير نشط'}
                  fullWidth
                  disabled
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: isDarkMode ? 'background.default' : '#f9fafb',
                      borderRadius: '6px',
                    },
                  }}
                />
              )}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" mb={1} fontWeight={500}>تصنيف المستثمر</Typography>
              <TextField
                value={getStatusText(investorDetails)}
                fullWidth
                disabled
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: isDarkMode ? 'background.default' : '#f9fafb',
                    borderRadius: '6px',
                  },
                }}
              />
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default PersonalDetailsTab;
