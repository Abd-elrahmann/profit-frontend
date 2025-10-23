import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  Paper,
  AppBar,
  Toolbar,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ReactQuillWrapper from "../../components/ReactQuillWrapper";

// Import the contract components
import MudarabahContract from "../../components/Contracts/MudarabahContract";
import PromissoryNote from "../../components/Contracts/PromissoryNote";
import DebtAcknowledgment from "../../components/Contracts/DebtAcknowledgment";
import ReceiptVoucher from "../../components/Contracts/ReceiptVoucher";
import PaymentVoucher from "../../components/Contracts/PaymentVoucher";

export default function ContractTemplates() {
  const [activeTab, setActiveTab] = useState("debt-acknowledgment");
  const [templates, setTemplates] = useState({
    mudarabah: "",
    promissoryNote: "",
    debtAcknowledgment: "",
    receiptVoucher: "",
    paymentVoucher: "",
  });

  // Variables for each contract type
  const contractVariables = {
    mudarabah: [
      { name: "{{تاريخ_العقد_هجري}}", description: "تاريخ العقد بالتقويم الهجري" },
      { name: "{{تاريخ_العقد_ميلادي}}", description: "تاريخ العقد بالتقويم الميلادي" },
      { name: "{{مدينة_العقد}}", description: "المدينة التي تم إبرام العقد فيها" },
      { name: "{{اسم_رب_المال}}", description: "اسم رب المال (الطرف الأول)" },
      { name: "{{هوية_رب_المال}}", description: "رقم هوية رب المال" },
      { name: "{{عنوان_رب_المال}}", description: "عنوان رب المال" },
      { name: "{{اسم_المضارب_1}}", description: "اسم المضارب الأول" },
      { name: "{{هوية_المضارب_1}}", description: "رقم هوية المضارب الأول" },
      { name: "{{عنوان_المضارب_1}}", description: "عنوان المضارب الأول" },
      { name: "{{اسم_المضارب_2}}", description: "اسم المضارب الثاني" },
      { name: "{{هوية_المضارب_2}}", description: "رقم هوية المضارب الثاني" },
      { name: "{{عنوان_المضارب_2}}", description: "عنوان المضارب الثاني" },
      { name: "{{رأس_المال}}", description: "مبلغ رأس المال بالأرقام" },
      { name: "{{رأس_المال_كتابة}}", description: "مبلغ رأس المال مكتوباً بالحروف" },
    ],
    "promissory-note": [
      { name: "{{رقم_السند}}", description: "رقم السند المرجعي" },
      { name: "{{تاريخ_الانشاء}}", description: "تاريخ إنشاء السند" },
      { name: "{{تاريخ_الاستحقاق}}", description: "تاريخ استحقاق السند" },
      { name: "{{مدينة_الاصدار}}", description: "مدينة إصدار السند" },
      { name: "{{مدينة_الوفاء}}", description: "مدينة الوفاء بالسند" },
      { name: "{{سبب_انشاء_السند}}", description: "سبب إنشاء السند" },
      { name: "{{قيمة_السند_رقما}}", description: "قيمة السند بالأرقام" },
      { name: "{{قيمة_السند_كتابة}}", description: "قيمة السند مكتوبة بالحروف" },
      { name: "{{اسم_الدائن}}", description: "اسم الدائن" },
      { name: "{{هوية_الدائن}}", description: "رقم هوية الدائن" },
      { name: "{{اسم_المدين}}", description: "اسم المدين" },
      { name: "{{هوية_المدين}}", description: "رقم هوية المدين" },
      { name: "{{اسم_الكفيل}}", description: "اسم الكفيل" },
      { name: "{{هوية_الكفيل}}", description: "رقم هوية الكفيل" },
    ],
    "debt-acknowledgment": [
      { name: "{{رقم_الإقرار}}", description: "رقم الإقرار المرجعي" },
      { name: "{{اسم_العميل}}", description: "اسم العميل (المدين)" },
      { name: "{{رقم_هوية_العميل}}", description: "رقم هوية العميل" },
      { name: "{{عنوان_العميل}}", description: "عنوان العميل" },
      { name: "{{اسم_الدائن}}", description: "اسم الدائن" },
      { name: "{{المبلغ_رقما}}", description: "المبلغ بالأرقام" },
      { name: "{{المبلغ_كتابة}}", description: "المبلغ مكتوباً بالحروف" },
      { name: "{{التاريخ_الهجري}}", description: "التاريخ بالتقويم الهجري" },
      { name: "{{التاريخ_الميلادي}}", description: "التاريخ بالتقويم الميلادي" },
    ],
    "receipt-voucher": [
      { name: "{{رقم_السند}}", description: "رقم سند القبض" },
      { name: "{{اسم_المستلم}}", description: "اسم الشخص المستلم للمبلغ" },
      { name: "{{هوية_المستلم}}", description: "رقم هوية المستلم" },
      { name: "{{المبلغ_رقما}}", description: "المبلغ المستلم بالأرقام" },
      { name: "{{المبلغ_كتابة}}", description: "المبلغ المستلم مكتوباً بالحروف" },
      { name: "{{سبب_الاستلام}}", description: "سبب استلام المبلغ" },
      { name: "{{التاريخ_الهجري}}", description: "التاريخ بالتقويم الهجري" },
      { name: "{{التاريخ_الميلادي}}", description: "التاريخ بالتقويم الميلادي" },
      { name: "{{اسم_المسلم}}", description: "اسم الشخص المسلم للمبلغ" },
    ],
    "payment-voucher": [
      { name: "{{رقم_السند}}", description: "رقم سند الصرف" },
      { name: "{{اسم_المستلم}}", description: "اسم الشخص المستلم للمبلغ" },
      { name: "{{هوية_المستلم}}", description: "رقم هوية المستلم" },
      { name: "{{المبلغ_رقما}}", description: "المبلغ المصروف بالأرقام" },
      { name: "{{المبلغ_كتابة}}", description: "المبلغ المصروف مكتوباً بالحروف" },
      { name: "{{سبب_الصرف}}", description: "سبب صرف المبلغ" },
      { name: "{{طريقة_الصرف}}", description: "طريقة الصرف (نقداً، شيك، تحويل)" },
      { name: "{{التاريخ_الهجري}}", description: "التاريخ بالتقويم الهجري" },
      { name: "{{التاريخ_الميلادي}}", description: "التاريخ بالتقويم الميلادي" },
      { name: "{{اسم_المسلم}}", description: "اسم الشخص المسلم للمبلغ" },
      { name: "{{ملاحظات}}", description: "ملاحظات إضافية" },
    ],
  };

  // Copy variable to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      // You can add a toast notification here
      console.log('تم نسخ المتغير:', text);
    });
  };

  // Render variables list component
  const VariablesList = ({ variables }) => (
    <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#2d3748' }}>
          المتغيرات المتاحة
        </Typography>
        <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
          انقر على أي متغير لنسخه واستخدامه في القالب
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={1}>
          {variables.map((variable, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Chip
                label={variable.name}
                onClick={() => copyToClipboard(variable.name)}
                icon={<ContentCopyIcon sx={{ fontSize: '16px !important' }} />}
                sx={{
                  width: '100%',
                  justifyContent: 'flex-start',
                  mb: 1,
                  px: 1,
                  py: 2,
                  height: 'auto',
                  minHeight: '40px',
                  backgroundColor: '#f8f9fc',
                  border: '1px solid #e5e7eb',
                  '&:hover': {
                    backgroundColor: '#e0e7ff',
                    borderColor: '#3b82f6',
                  },
                  '& .MuiChip-label': {
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    whiteSpace: 'normal',
                    textAlign: 'right',
                    direction: 'rtl',
                  }
                }}
                title={variable.description}
              />
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  // Initialize templates with component content
  useEffect(() => {
    setTemplates({
      mudarabah: MudarabahContract(),
      promissoryNote: PromissoryNote(),
      debtAcknowledgment: DebtAcknowledgment(),
      receiptVoucher: ReceiptVoucher(),
      paymentVoucher: PaymentVoucher(),
    });
  }, []);

  const handleSave = () => {
    console.log("Saved templates:", templates);
    // TODO: send POST request to backend API to save templates
    alert("تم حفظ القوالب بنجاح");
  };

  const handleTemplateChange = (templateKey, value) => {
    setTemplates(prev => ({
      ...prev,
      [templateKey]: value
    }));
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Main Content */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Main Body */}
        <Box sx={{ p: 4, overflowY: "auto", flex: 1 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
            {/* Tabs */}
            <Tabs
              value={activeTab}
              onChange={(e, val) => setActiveTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              textColor="primary"
              indicatorColor="primary"
              sx={{
                borderBottom: "1px solid #e5e7eb",
                mb: 3,
                "& .MuiTab-root": { 
                  fontWeight: "bold", 
                  fontSize: "0.9rem",
                  minWidth: "auto",
                  px: 2
                },
              }}
            >
              <Tab label="عقد المضاربة" value="mudarabah" />
              <Tab label="سند لأمر" value="promissory-note" />
              <Tab label="إقرار دين وتعهد بالسداد" value="debt-acknowledgment" />
              <Tab label="سند القبض" value="receipt-voucher" />
              <Tab label="سند الصرف" value="payment-voucher" />
            </Tabs>

            {/* Content */}
            <Box sx={{ mt: 3 }}>
              {activeTab === "mudarabah" && (
                <>
                  <VariablesList variables={contractVariables.mudarabah} />
                  <ReactQuillWrapper
                    theme="snow"
                    value={templates.mudarabah}
                    onChange={(value) => handleTemplateChange("mudarabah", value)}
                    placeholder="أدخل نص قالب عقد المضاربة هنا..."
                    style={{ height: "600px", marginBottom: "40px" }}
                  />
                </>
              )}
              {activeTab === "promissory-note" && (
                <>
                  <VariablesList variables={contractVariables["promissory-note"]} />
                  <ReactQuillWrapper
                    theme="snow"
                    value={templates.promissoryNote}
                    onChange={(value) => handleTemplateChange("promissoryNote", value)}
                    placeholder="أدخل نص قالب سند لأمر هنا..."
                    style={{ height: "600px", marginBottom: "40px" }}
                  />
                </>
              )}
              {activeTab === "debt-acknowledgment" && (
                <>
                  <VariablesList variables={contractVariables["debt-acknowledgment"]} />
                  <ReactQuillWrapper
                    theme="snow"
                    value={templates.debtAcknowledgment}
                    onChange={(value) => handleTemplateChange("debtAcknowledgment", value)}
                    style={{ height: "600px", marginBottom: "40px" }}
                  />
                </>
              )}
              {activeTab === "receipt-voucher" && (
                <>
                  <VariablesList variables={contractVariables["receipt-voucher"]} />
                  <ReactQuillWrapper
                    theme="snow"
                    value={templates.receiptVoucher}
                    onChange={(value) => handleTemplateChange("receiptVoucher", value)}
                    placeholder="أدخل نص قالب سند القبض هنا..."
                    style={{ height: "600px", marginBottom: "40px" }}
                  />
                </>
              )}
              {activeTab === "payment-voucher" && (
                <>
                  <VariablesList variables={contractVariables["payment-voucher"]} />
                  <ReactQuillWrapper
                    theme="snow"
                    value={templates.paymentVoucher}
                    onChange={(value) => handleTemplateChange("paymentVoucher", value)}
                    placeholder="أدخل نص قالب سند الصرف هنا..."
                    style={{ height: "600px", marginBottom: "40px" }}
                  />
                </>
              )}
            </Box>

            {/* Save Button */}
            <Box sx={{ display: "flex", justifyContent: "end", mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SaveIcon sx={{marginLeft:'10px'}} />}
                sx={{ 
                  px: 4, 
                  py: 1.2, 
                  mt: 2, 
                  fontWeight: "bold",
                  borderRadius: '10px',
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  }
                }}
                onClick={handleSave}
              >
                حفظ التغييرات
              </Button>
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}