import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import { Add, Edit, Delete, ContentCopy, ExpandMore, Help } from '@mui/icons-material';
import Api from '../config/Api';

const TemplateVariablesManager = ({ 
  templateName, 
  open, 
  onClose, 
  onVariablesUpdate,
  onDeleteVariable 
}) => {
  const [variables, setVariables] = useState([]);
  const [editingVariable, setEditingVariable] = useState(null);
  const [newVariable, setNewVariable] = useState({ key: '', description: '', group: '' });
  const [loading, setLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const loadVariables = useCallback(async () => {
    if (!templateName) return;
    
    setLoading(true);
    try {
      const formattedTemplateName = templateName.toUpperCase();
      const response = await Api.get(`/api/templates/${formattedTemplateName}/with-variables`);
      
      const vars = Array.isArray(response.data?.variables) 
        ? response.data.variables 
        : response.data?.data?.variables || [];
      
      setVariables(vars);
    } catch (error) {
      console.error('Error loading variables:', error);
      setVariables([]);
    } finally {
      setLoading(false);
    }
  }, [templateName]);

  useEffect(() => {
    if (open && templateName) {
      loadVariables();
    } else if (!open) {
      setVariables([]);
      setEditingVariable(null);
      setNewVariable({ key: '', description: '', group: '' });
    }
  }, [open, templateName, loadVariables]);

  const handleAddVariable = async () => {
    if (!newVariable.key.trim()) return;

    try {
      await Api.post(`/api/templates/${templateName}/variables`, newVariable);
      setNewVariable({ key: '', description: '', group: '' });
      loadVariables();
      onVariablesUpdate?.();
    } catch (error) {
      console.error('Error adding variable:', error);
    }
  };

  const handleUpdateVariable = async () => {
    if (!editingVariable || !editingVariable.key.trim()) return;

    try {
      await Api.put(`/api/templates/variables/${editingVariable.id}`, {
        key: editingVariable.key,
        description: editingVariable.description || '',
        group: editingVariable.group || ''
      });
      setEditingVariable(null);
      loadVariables();
      onVariablesUpdate?.();
    } catch (error) {
      console.error('Error updating variable:', error);
    }
  };

  const handleDeleteVariable = async (variable) => {
    if (onDeleteVariable) {
      onDeleteVariable(variable);
    } else {
      try {
        await Api.delete(`/api/templates/variables/${variable.id}`);
        loadVariables();
        onVariablesUpdate?.();
      } catch (error) {
        console.error('Error deleting variable:', error);
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const VariableHelp = () => (
    <Alert severity="info" sx={{ mb: 2 }}>
      <Typography variant="h6" gutterBottom>
        💡 شرح المتغيرات
      </Typography>
      <Typography variant="body2" paragraph>
        <strong>المتغيرات</strong> هي أماكن في القالب يتم تعبئتها تلقائيًا بالبيانات.
      </Typography>
      <Typography variant="body2" paragraph>
        <strong>مثال:</strong> عند استخدام {`{{اسم_العميل}}`} في القالب، سيتم استبداله تلقائيًا باسم العميل الفعلي.
      </Typography>
      <Typography variant="body2">
        <strong>طريقة الاستخدام:</strong> انسخ المتغير والصقه في المكان المناسب في القالب.
      </Typography>
    </Alert>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">إدارة متغيرات القالب</Typography>
          <Tooltip title="شرح المتغيرات">
            <IconButton onClick={() => setShowHelp(!showHelp)} size="small">
              <Help />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent>
        {showHelp && <VariableHelp />}

        {/* إضافة متغير جديد */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>إضافة متغير جديد</Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="اسم المتغير (مثال: {{اسم_العميل}})"
              value={newVariable.key}
              onChange={(e) => setNewVariable({ ...newVariable, key: e.target.value })}
              fullWidth
              size="small"
              helperText="يجب أن يبدأ وينتهي ب {{ }}"
            />
            <TextField
              label="الوصف"
              value={newVariable.description}
              onChange={(e) => setNewVariable({ ...newVariable, description: e.target.value })}
              fullWidth
              size="small"
              helperText="شرح الغرض من هذا المتغير"
            />
            <TextField
              label="المجموعة (اختياري)"
              value={newVariable.group}
              onChange={(e) => setNewVariable({ ...newVariable, group: e.target.value })}
              fullWidth
              size="small"
              helperText="مثل: بيانات الأطراف، البيانات المالية، إلخ"
            />
            <Button 
              variant="contained" 
              onClick={handleAddVariable}
              startIcon={<Add />}
              disabled={!newVariable.key.trim()}
            >
              إضافة متغير
            </Button>
          </Box>
        </Paper>

        <Divider sx={{ my: 2 }} />

        {/* قائمة المتغيرات الحالية */}
        <Typography variant="h6" sx={{ mb: 2 }}>المتغيرات الحالية</Typography>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3, gap: 2 }}>
            <CircularProgress size={24} />
            <Typography>جاري التحميل...</Typography>
          </Box>
        ) : variables.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="textSecondary">
              لا توجد متغيرات حالياً. يمكنك إضافة متغيرات جديدة من الأعلى.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {variables.map((variable) => (
              <Grid item xs={12} key={variable.id}>
                {editingVariable?.id === variable.id ? (
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>تعديل المتغير</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        label="اسم المتغير"
                        value={editingVariable.key}
                        onChange={(e) => setEditingVariable({ ...editingVariable, key: e.target.value })}
                        fullWidth
                        size="small"
                      />
                      <TextField
                        label="الوصف"
                        value={editingVariable.description || ''}
                        onChange={(e) => setEditingVariable({ ...editingVariable, description: e.target.value })}
                        fullWidth
                        size="small"
                      />
                      <TextField
                        label="المجموعة"
                        value={editingVariable.group || ''}
                        onChange={(e) => setEditingVariable({ ...editingVariable, group: e.target.value })}
                        fullWidth
                        size="small"
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button 
                          variant="contained" 
                          onClick={handleUpdateVariable}
                          size="small"
                        >
                          حفظ
                        </Button>
                        <Button 
                          variant="outlined" 
                          onClick={() => setEditingVariable(null)}
                          size="small"
                        >
                          إلغاء
                        </Button>
                      </Box>
                    </Box>
                  </Paper>
                ) : (
                  <Paper sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Tooltip title="اضغط للنسخ" arrow>
                          <Chip 
                            label={variable.key} 
                            onClick={() => copyToClipboard(variable.key)}
                            icon={<ContentCopy />}
                            sx={{ mb: 1 }}
                            clickable
                          />
                        </Tooltip>
                        {variable.description && (
                          <Typography variant="body2" color="textSecondary" paragraph>
                            {variable.description}
                          </Typography>
                        )}
                        {variable.group && (
                          <Chip 
                            label={variable.group} 
                            size="small" 
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="تعديل">
                          <IconButton 
                            color="primary" 
                            onClick={() => setEditingVariable({ ...variable })}
                            size="small"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="حذف">
                          <IconButton 
                            color="error" 
                            onClick={() => handleDeleteVariable(variable)}
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Paper>
                )}
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>إغلاق</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TemplateVariablesManager;