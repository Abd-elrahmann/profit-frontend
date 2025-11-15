import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  Box,
  Chip
} from '@mui/material';
import { Description, CheckCircle, Preview } from '@mui/icons-material';

const TemplateGallery = ({ open, onClose, onSelectTemplate, currentTemplateType }) => {
  const templateExamples = {
    "debt-acknowledgment": [
      {
        id: 1,
        name: "إقرار دين أساسي",
        description: "نموذج مبسط لإقرار الدين",
        content: `
          <div style="text-align: right; direction: rtl; font-family: 'Cairo', sans-serif;">
            <h2>إقرار بالدين وتعهد بالسداد</h2>
            <p>أنا الموقع أدناه <strong>{{اسم_العميل}}</strong> بمبلغ وقدره <strong>{{المبلغ_رقما}}</strong> (<strong>{{المبلغ_كتابة}}</strong>)</p>
            <p>وذلك بتاريخ <strong>{{التاريخ_الهجري}}</strong> الموافق <strong>{{التاريخ_الميلادي}}</strong></p>
            <p>أتعهد بسداد المبلغ في الموعد المتفق عليه.</p>
            <br><br>
            <p>التوقيع: ________________</p>
            <p>الاسم: {{اسم_العميل}}</p>
            <p>الهوية: {{رقم_هوية_العميل}}</p>
          </div>
        `
      },
      {
        id: 2,
        name: "إقرار دين مفصل",
        description: "نموذج مفصل بشروط السداد",
        content: `
          <div style="text-align: right; direction: rtl; font-family: 'Cairo', sans-serif;">
            <h2 style="text-align: center;">إقرار بالدين وتعهد بالسداد</h2>
            <p>إنني الموقع أدناه:</p>
            <p>الاسم: <strong>{{اسم_العميل}}</strong></p>
            <p>رقم الهوية: <strong>{{رقم_هوية_العميل}}</strong></p>
            <p>العنوان: <strong>{{عنوان_العميل}}</strong></p>
            <br>
            <p>أقر بأنني مدين لـ <strong>{{اسم_الدائن}}</strong> بمبلغ وقدره:</p>
            <p style="text-align: center; font-size: 18px; font-weight: bold;">
              {{المبلغ_رقما}} ريال (<strong>{{المبلغ_كتابة}}</strong> فقط لا غير)
            </p>
            <br>
            <p>وذلك بتاريخ: <strong>{{التاريخ_الهجري}}</strong> الموافق <strong>{{التاريخ_الميلادي}}</strong></p>
            <br>
            <h3>شروط السداد:</h3>
            <ul>
              <li>يسدد المبلغ خلال مدة أقصاها 12 شهراً من تاريخ هذا الإقرار</li>
              <li>في حالة التأخير يتحمل المدين غرامة تأخير حسب النظام</li>
            </ul>
            <br><br>
            <div style="display: flex; justify-content: space-between; margin-top: 50px;">
              <div>
                <p>توقيع المدين: ________________</p>
                <p>الاسم: {{اسم_العميل}}</p>
                <p>التاريخ: {{التاريخ_الميلادي}}</p>
              </div>
              <div>
                <p>توقيع الدائن: ________________</p>
                <p>الاسم: {{اسم_الدائن}}</p>
                <p>التاريخ: {{التاريخ_الميلادي}}</p>
              </div>
            </div>
          </div>
        `
      }
    ],
    "promissory-note": [
      {
        id: 1,
        name: "سند لأمر أساسي",
        description: "نموذج أساسي لسند الأمر",
        content: `
          <div style="text-align: right; direction: rtl; font-family: 'Cairo', sans-serif;">
            <h2 style="text-align: center;">سند لأمر</h2>
            <p>رقم السند: <strong>{{رقم_السند}}</strong></p>
            <p>تاريخ الإنشاء: <strong>{{تاريخ_الانشاء}}</strong></p>
            <p>تاريخ الاستحقاق: <strong>{{تاريخ_الاستحقاق}}</strong></p>
            <br>
            <p>أنا <strong>{{اسم_المدين}}</strong> (المدين) أوافق بأن أدفع لـ <strong>{{اسم_الدائن}}</strong> (الدائن) مبلغ:</p>
            <p style="text-align: center; font-size: 20px; font-weight: bold;">
              {{قيمة_السند_رقما}} ريال (<strong>{{قيمة_السند_كتابة}}</strong>)
            </p>
            <p>في مدينة: <strong>{{مدينة_الوفاء}}</strong></p>
            <br><br>
            <div style="margin-top: 50px;">
              <p>توقيع المدين: ________________</p>
              <p>الاسم: {{اسم_المدين}}</p>
              <p>الهوية: {{هوية_المدين}}</p>
            </div>
          </div>
        `
      }
    ]
  };

  const currentTemplates = templateExamples[currentTemplateType] || [];

  const previewTemplate = (content) => {
    const demoValues = {
      "{{اسم_العميل}}": "أحمد محمد",
      "{{رقم_هوية_العميل}}": "1234567890",
      "{{المبلغ_رقما}}": "50,000",
      "{{المبلغ_كتابة}}": "خمسون ألف ريال",
      "{{التاريخ_الهجري}}": "15/03/1445",
      "{{التاريخ_الميلادي}}": "01/10/2023",
      "{{اسم_الدائن}}": "شركة التمويل المثالية",
      "{{رقم_السند}}": "SN-2023-001",
      "{{اسم_المدين}}": "محمد أحمد",
      "{{هوية_المدين}}": "0987654321",
      "{{قيمة_السند_رقما}}": "75,000",
      "{{قيمة_السند_كتابة}}": "خمسة وسبعون ألف ريال",
      "{{تاريخ_الانشاء}}": "01/10/2023",
      "{{تاريخ_الاستحقاق}}": "01/04/2024",
      "{{مدينة_الوفاء}}": "الرياض",
      "{{عنوان_العميل}}": "حي النخيل، الرياض"
    };

    let previewContent = content;
    Object.entries(demoValues).forEach(([key, value]) => {
      previewContent = previewContent.replace(new RegExp(key, 'g'), value);
    });

    return previewContent;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Description />
          <Typography variant="h6">القوالب الجاهزة - {currentTemplateType === 'debt-acknowledgment' ? 'إقرار الدين' : 'سند لأمر'}</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {currentTemplates.map(template => (
            <Grid item xs={12} md={6} key={template.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {template.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {template.description}
                  </Typography>
                  
                  <Box sx={{ 
                    maxHeight: 200, 
                    overflow: 'hidden', 
                    border: '1px solid #f0f0f0', 
                    p: 2, 
                    borderRadius: 1,
                    bgcolor: '#fafafa',
                    position: 'relative'
                  }}>
                    <Box
                      dangerouslySetInnerHTML={{ __html: previewTemplate(template.content) }}
                      sx={{
                        '& *': {
                          fontFamily: '"Cairo", sans-serif !important',
                          fontSize: '12px',
                          lineHeight: 1.4
                        }
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: '40px',
                        background: 'linear-gradient(transparent, #fafafa)',
                        pointerEvents: 'none'
                      }}
                    />
                  </Box>
                  
                  <Box sx={{ mt: 1 }}>
                    <Chip 
                      label="معاينة بالبيانات التجريبية" 
                      size="small" 
                      color="info" 
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    fullWidth 
                    variant="contained"
                    startIcon={<CheckCircle />}
                    onClick={() => onSelectTemplate(template.content)}
                  >
                    استخدام هذا القالب
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateGallery;