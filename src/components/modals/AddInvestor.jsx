import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  CircularProgress,
  Divider,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import Api, { handleApiError } from "../../config/Api";
import { notifyError, notifySuccess } from "../../utilities/toastify";
import ContractGenerator from "../ContractGenerator";

const AddInvestor = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: "",
    nationalId: "",
    address: "",
    phone: "",
    email: "",
    orgProfitPercent: "",
    capitalAmount: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [generateContract, setGenerateContract] = useState(true);
  const [savedInvestorData, setSavedInvestorData] = useState(null);
  const [mudarabahTemplate, setMudarabahTemplate] = useState('');
  const contractGeneratorRef = useRef(null);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'الاسم مطلوب';
    if (!formData.nationalId.trim()) newErrors.nationalId = 'رقم الهوية مطلوب';
    if (!formData.address.trim()) newErrors.address = 'العنوان مطلوب';
    if (!formData.phone.trim()) newErrors.phone = 'رقم الجوال مطلوب';
    if (!formData.orgProfitPercent) newErrors.orgProfitPercent = 'نسبة أرباح المنشأة مطلوبة';
    if (!formData.capitalAmount) newErrors.capitalAmount = 'رأس المال مطلوب';
    
    if (formData.nationalId && !/^\d{14}$/.test(formData.nationalId)) {
      newErrors.nationalId = 'رقم الهوية يجب أن يكون 14 رقمًا';
    }
    if (formData.phone && !/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = 'رقم الجوال يجب أن يحتوي على 10 أرقام';
    }
    
    if (formData.orgProfitPercent && (formData.orgProfitPercent < 0 || formData.orgProfitPercent > 100)) {
      newErrors.orgProfitPercent = 'النسبة يجب أن تكون بين 0 و 100';
    }
    
    if (formData.capitalAmount && formData.capitalAmount <= 0) {
      newErrors.capitalAmount = 'رأس المال يجب أن يكون أكبر من صفر';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fetch Mudarabah template when modal opens
  React.useEffect(() => {
    if (open && generateContract) {
      fetchMudarabahTemplate();
    }
  }, [open, generateContract]);

  const fetchMudarabahTemplate = async () => {
    try {
      const response = await Api.get('/api/templates/mudarabah');
      setMudarabahTemplate(response.data.content || '');
    } catch (error) {
      console.warn('Could not fetch Mudarabah template:', error);
      // Use default template if API fails
      setMudarabahTemplate(`
        <div dir="rtl" style="font-family: 'Noto Sans Arabic', sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; line-height: 1.8;">
          <h1 style="text-align: center; color: #1976d2; margin-bottom: 40px; font-size: 28px; border-bottom: 2px solid #1976d2; padding-bottom: 10px;">
            عقد المضاربة الشرعية
          </h1>
          
          <div style="margin-bottom: 30px; background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h3 style="color: #1976d2; margin-bottom: 15px;">بيانات المستثمر (المضارب):</h3>
            <p><strong>الاسم:</strong> {{اسم_العميل}}</p>
            <p><strong>رقم الهوية:</strong> {{رقم_هوية_العميل}}</p>
            <p><strong>العنوان:</strong> {{عنوان_العميل}}</p>
            <p><strong>الهاتف:</strong> {{هاتف_العميل}}</p>
          </div>

          <div style="margin-bottom: 30px;">
            <p style="font-size: 16px; text-align: justify;">
              أقر أنا <strong style="color: #1976d2;">{{اسم_العميل}}</strong>، حامل الهوية الوطنية رقم 
              <strong style="color: #1976d2;">{{رقم_هوية_العميل}}</strong>، بأنني قد استلمت من شركة الاستثمار الإسلامية 
              مبلغاً وقدره <strong style="color: #d32f2f;">{{رأس_المال}} ريال سعودي</strong> 
              (<strong>{{رأس_المال_كتابة}} ريال سعودي فقط لا غير</strong>) كرأس مال للمضاربة الشرعية.
            </p>
          </div>

          <div style="margin-bottom: 30px; background-color: #e3f2fd; padding: 20px; border-radius: 8px;">
            <h3 style="color: #1976d2; margin-bottom: 15px;">شروط المضاربة:</h3>
            <ul style="list-style-type: arabic-indic;">
              <li>نسبة أرباح المنشأة: <strong style="color: #d32f2f;">{{نسبة_أرباح_المنشأة}}%</strong></li>
              <li>نسبة أرباح المستثمر: <strong style="color: #d32f2f;">{{نسبة_أرباح_المستثمر}}%</strong></li>
              <li>يتم توزيع الأرباح حسب النسب المتفق عليها</li>
              <li>الخسائر على رأس المال فقط</li>
            </ul>
          </div>

          <p style="font-size: 16px; text-align: justify; margin-bottom: 20px;">
            وأتعهد بالعمل على استثمار هذا المبلغ وفقاً لأحكام الشريعة الإسلامية، والالتزام بالضوابط الشرعية 
            في جميع المعاملات، وعدم الدخول في أي استثمارات محرمة شرعاً.
          </p>

          <p style="font-size: 14px; color: #666; text-align: center; margin: 40px 0;">
            حُرر هذا العقد في تاريخ <strong>{{التاريخ_الميلادي}}</strong> الموافق <strong>{{التاريخ_الهجري}}</strong>
          </p>

          <div style="display: flex; justify-content: space-between; margin-top: 60px;">
            <div style="text-align: center; border: 1px solid #ddd; padding: 20px; border-radius: 8px; width: 45%;">
              <p style="margin-bottom: 40px; font-weight: bold;">توقيع المستثمر (المضارب)</p>
              <p style="border-top: 1px solid #333; padding-top: 10px; font-weight: bold;">{{اسم_العميل}}</p>
            </div>
            <div style="text-align: center; border: 1px solid #ddd; padding: 20px; border-radius: 8px; width: 45%;">
              <p style="margin-bottom: 40px; font-weight: bold;">توقيع رب المال</p>
              <p style="border-top: 1px solid #333; padding-top: 10px; font-weight: bold;">شركة الاستثمار الإسلامية</p>
            </div>
          </div>
        </div>
      `);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await Api.post("/api/partners", {
        ...formData,
        orgProfitPercent: parseInt(formData.orgProfitPercent),
        capitalAmount: parseInt(formData.capitalAmount),
      });
      
      const newInvestorData = {
        ...response.data.partner,
        partnerProfitPercent: response.data.partnerProfitPercent || (100 - parseInt(formData.orgProfitPercent))
      };
      
      notifySuccess('تم إضافة المستثمر بنجاح');
      
      // If contract generation is enabled, show contract preview
      if (generateContract && mudarabahTemplate) {
        console.log('Setting investor data for contract generation:', newInvestorData);
        console.log('Template content length:', mudarabahTemplate.length);
        
        setSavedInvestorData(newInvestorData);
        // Trigger contract generation after a short delay to ensure component is mounted
        setTimeout(() => {
          if (contractGeneratorRef.current) {
            console.log('Triggering contract generation...');
            contractGeneratorRef.current.generateContract();
          } else {
            console.error('Contract generator ref not available');
          }
        }, 500);
      } else {
        // Close modal and refresh data
        onSuccess();
        handleClose();
      }
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء إضافة المستثمر');
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleContractGenerated = () => {
    // Contract has been generated and saved
    onSuccess();
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      name: "",
      nationalId: "",
      address: "",
      phone: "",
      email: "",
      orgProfitPercent: "",
      capitalAmount: "",
    });
    setErrors({});
    setSavedInvestorData(null);
    setMudarabahTemplate('');
    onClose();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      dir="rtl"
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight="bold">
          إضافة مستثمر جديد
        </Typography>
      </DialogTitle>

      <Divider />
      
      <DialogContent sx={{ py: 3 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold" mb={3}>
            المعلومات الشخصية
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                label="الاسم الكامل"
                value={formData.name}
                onChange={handleChange('name')}
                fullWidth
                error={!!errors.name}
                helperText={errors.name}
                required
                size="medium"
                sx={{width: '250px'}}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="رقم الهوية الوطنية"
                value={formData.nationalId}
                onChange={handleChange('nationalId')}
                fullWidth
                error={!!errors.nationalId}
                helperText={errors.nationalId}
                required
                inputProps={{ maxLength: 14 }}
                size="medium"
                sx={{width: '250px'}}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="رقم الجوال"
                value={formData.phone}
                onChange={handleChange('phone')}
                fullWidth
                error={!!errors.phone}
                helperText={errors.phone}
                required
                placeholder="05XXXXXXXX"
                inputProps={{ maxLength: 10 }}
                size="medium"
                sx={{width: '250px'}}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="البريد الإلكتروني (اختياري)"
                type="email"
                value={formData.email}
                onChange={handleChange('email')}
                fullWidth
                size="medium"
                sx={{width: '250px'}}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="العنوان"
                value={formData.address}
                onChange={handleChange('address')}
                fullWidth
                error={!!errors.address}
                helperText={errors.address}
                required
                multiline
                rows={1}
                size="medium"
                sx={{width: '520px'}}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" fontWeight="bold" mt={4} mb={3}>
            المعلومات المالية
          </Typography>

          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                label="رأس المال (ريال)"
                type="number"
                value={formData.capitalAmount}
                onChange={handleChange('capitalAmount')}
                fullWidth
                error={!!errors.capitalAmount}
                helperText={errors.capitalAmount}
                required
                InputProps={{ inputProps: { min: 0 } }}
                size="medium"
                sx={{width: '250px'}}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="نسبة أرباح المنشأة (%)"
                type="number"
                value={formData.orgProfitPercent}
                onChange={handleChange('orgProfitPercent')}
                fullWidth
                error={!!errors.orgProfitPercent}
                helperText={errors.orgProfitPercent}
                required
                InputProps={{ inputProps: { min: 0, max: 100 } }}
                size="medium"
                sx={{width: '250px'}}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle1" fontWeight="bold" mt={4} mb={2}>
            خيارات إضافية
          </Typography>
          
          <FormControlLabel
            control={
              <Checkbox
                checked={generateContract}
                onChange={(e) => setGenerateContract(e.target.checked)}
                color="primary"
              />
            }
            label="توليد عقد المضاربة تلقائياً بعد الحفظ"
            sx={{ mb: 2 }}
          />
        </Box>
      </DialogContent>

      <Divider />
      
      <DialogActions sx={{ p: 2.5, gap: 1,flexDirection: 'row-reverse' }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
          variant="outlined"
          sx={{ 
            minWidth: '100px',
            borderColor: 'grey.300',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'grey.400',
              bgcolor: 'grey.50'
            }
          }}
        >
          إلغاء
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            bgcolor: "#0d40a5",
            "&:hover": { bgcolor: "#0b3589" },
            minWidth: '100px'
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'إضافة'}
        </Button>
      </DialogActions>

      {/* Contract Generator Component */}
      {savedInvestorData && mudarabahTemplate && (
        <ContractGenerator
          ref={contractGeneratorRef}
          investorData={savedInvestorData}
          templateContent={mudarabahTemplate}
          onContractGenerated={handleContractGenerated}
          contractType="MUDARABAH"
        />
      )}
    </Dialog>
  );
};

export default AddInvestor;