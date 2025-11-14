// components/TemplateVariablesManager.jsx
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
} from '@mui/material';
import { Add, Edit, Delete, ContentCopy } from '@mui/icons-material';
import Api from '../config/Api';

const TemplateVariablesManager = ({ templateName, open, onClose, onVariablesUpdate }) => {
  const [variables, setVariables] = useState([]);
  const [editingVariable, setEditingVariable] = useState(null);
  const [newVariable, setNewVariable] = useState({ key: '', description: '' });
  const [loading, setLoading] = useState(false);

  const loadVariables = useCallback(async () => {
    if (!templateName) {
      console.warn('TemplateVariablesManager: templateName is missing');
      return;
    }
    
    setLoading(true);
    try {
      const formattedTemplateName = templateName.toUpperCase();
      console.log('Loading variables for template:', formattedTemplateName);
      
      const response = await Api.get(`/api/templates/${formattedTemplateName}/with-variables`);
      console.log('Template variables response:', response.data);
      
      const vars = Array.isArray(response.data?.variables) 
        ? response.data.variables 
        : response.data?.data?.variables || [];
      
      console.log('Variables array:', vars, 'Length:', vars.length);
      setVariables(vars);
    } catch (error) {
      console.error('Error loading variables:', error);
      console.error('Error details:', error.response?.data || error.message);
      setVariables([]);
    } finally {
      setLoading(false);
    }
  }, [templateName]);

  useEffect(() => {
    if (open && templateName) {
      loadVariables();
    } else if (!open) {
      // Reset state when modal closes
      setVariables([]);
      setEditingVariable(null);
      setNewVariable({ key: '', description: '' });
    }
  }, [open, templateName, loadVariables]);

  const handleAddVariable = async () => {
    if (!newVariable.key.trim()) return;

    try {
      await Api.post(`/api/templates/${templateName}/variables`, newVariable);
      setNewVariable({ key: '', description: '' });
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
        description: editingVariable.description || undefined
      });
      setEditingVariable(null);
      loadVariables();
      onVariablesUpdate?.();
    } catch (error) {
      console.error('Error updating variable:', error);
    }
  };

  const handleDeleteVariable = async (id) => {
    try {
      await Api.delete(`/api/templates/variables/${id}`);
      loadVariables();
      onVariablesUpdate?.();
    } catch (error) {
      console.error('Error deleting variable:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // يمكنك إضافة notificaiton هنا
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        إدارة متغيرات القالب
      </DialogTitle>
      <DialogContent>
        {/* إضافة متغير جديد */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>إضافة متغير جديد</Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <TextField
              label="اسم المتغير (مثال: {{اسم_العميل}})"
              value={newVariable.key}
              onChange={(e) => setNewVariable({ ...newVariable, key: e.target.value })}
              fullWidth
              size="small"
            />
            <TextField
              label="الوصف"
              value={newVariable.description}
              onChange={(e) => setNewVariable({ ...newVariable, description: e.target.value })}
              fullWidth
              size="small"
            />
            <Button 
              variant="contained" 
              onClick={handleAddVariable}
              startIcon={<Add />}
              sx={{ minWidth: '100px' }}
            >
              إضافة
            </Button>
          </Box>
        </Paper>

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
          <Grid container spacing={1}>
            {variables.map((variable) => (
            <Grid item xs={12} sm={6} key={variable.id}>
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
                <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ flex: 1 }}>
                    <Chip 
                      label={variable.key} 
                      onClick={() => copyToClipboard(variable.key)}
                      icon={<ContentCopy />}
                      sx={{ mb: 1 }}
                    />
                    <Typography variant="body2" color="textSecondary">
                      {variable.description}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton 
                      color="primary" 
                      onClick={() => setEditingVariable({ ...variable })}
                      size="small"
                    >
                      <Edit />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleDeleteVariable(variable.id)}
                      size="small"
                    >
                      <Delete />
                    </IconButton>
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