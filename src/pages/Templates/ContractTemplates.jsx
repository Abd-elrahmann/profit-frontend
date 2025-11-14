import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  Paper,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs as MuiTabs,
  Tab as MuiTab,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CodeMirrorWrapper from "../../components/CodeMirrorWrapper";
import RichTextEditor from "../../components/RichTextEditor";
import TemplateVariablesManager from "../../components/TemplateVariablesManager";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import MudarabahContract from "../../components/Contracts/MudarabahContract";
import PromissoryNote from "../../components/Contracts/PromissoryNote";
import DebtAcknowledgment from "../../components/Contracts/DebtAcknowledgment";
import ReceiptVoucher from "../../components/Contracts/ReceiptVoucher";
import PaymentVoucher from "../../components/Contracts/PaymentVoucher";
import InstallmentPaymentReceipt from "../../components/Contracts/InstallmentPaymentReceipt";
import InstallmentSettlementReceipt from "../../components/Contracts/InstallmentSettlementReceipt";
import Api, { handleApiError } from "../../config/Api";
import { Helmet } from "react-helmet-async";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";

export default function ContractTemplates() {
  const [activeTab, setActiveTab] = useState("debt-acknowledgment");
  const [templates, setTemplates] = useState({
    mudarabah: "",
    promissoryNote: "",
    debtAcknowledgment: "",
    receiptVoucher: "",
    paymentVoucher: "",
    paymentProof: "",
    settlement: "",
  });
  const [templateStyles, setTemplateStyles] = useState({
    mudarabah: "",
    promissoryNote: "",
    debtAcknowledgment: "",
    receiptVoucher: "",
    paymentVoucher: "",
    paymentProof: "",
    settlement: "",
  });
  const [dynamicVariables, setDynamicVariables] = useState({
    mudarabah: [],
    promissoryNote: [],
    debtAcknowledgment: [],
    receiptVoucher: [],
    paymentVoucher: [],
    paymentProof: [],
    settlement: [],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [manageVariablesOpen, setManageVariablesOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState("");
  const [editingContent, setEditingContent] = useState("");
  const [editingStyles, setEditingStyles] = useState("");
  const [editMode, setEditMode] = useState("styles"); // "styles" or "preview"
  const [viewMode, setViewMode] = useState("preview"); // "preview" or "edit"
  const { permissions } = usePermissions();

  // Map tab values to API template names
  const templateNameMap = React.useMemo(() => ({
    "mudarabah": "MUDARABAH",
    "promissory-note": "PROMISSORY_NOTE", 
    "debt-acknowledgment": "DEBT_ACKNOWLEDGMENT",
    "receipt-voucher": "RECEIPT_VOUCHER",
    "payment-voucher": "PAYMENT_VOUCHER",
    "payment-proof": "PAYMENT_PROOF",
    "settlement": "SETTLEMENT",
  }), []);

  const defaultContractVariables = React.useMemo(() => ({
    mudarabah: [
      { key: "{{تاريخ_العقد_هجري}}", description: "تاريخ العقد بالتقويم الهجري" },
      { key: "{{تاريخ_العقد_ميلادي}}", description: "تاريخ العقد بالتقويم الميلادي" },
      { key: "{{مدينة_العقد}}", description: "المدينة التي تم إبرام العقد فيها" },
      { key: "{{اسم_رب_المال}}", description: "اسم رب المال (الطرف الأول)" },
      { key: "{{هوية_رب_المال}}", description: "رقم هوية رب المال" },
      { key: "{{عنوان_رب_المال}}", description: "عنوان رب المال" },
      { key: "{{اسم_المضارب_1}}", description: "اسم المضارب الأول" },
      { key: "{{هوية_المضارب_1}}", description: "رقم هوية المضارب الأول" },
      { key: "{{عنوان_المضارب_1}}", description: "عنوان المضارب الأول" },
      { key: "{{اسم_المضارب_2}}", description: "اسم المضارب الثاني" },
      { key: "{{هوية_المضارب_2}}", description: "رقم هوية المضارب الثاني" },
      { key: "{{عنوان_المضارب_2}}", description: "عنوان المضارب الثاني" },
      { key: "{{رأس_المال}}", description: "مبلغ رأس المال بالأرقام" },
      { key: "{{رأس_المال_كتابة}}", description: "مبلغ رأس المال مكتوباً بالحروف" },
    ],
    "promissory-note": [
      { key: "{{رقم_السند}}", description: "رقم السند المرجعي" },
      { key: "{{تاريخ_الانشاء}}", description: "تاريخ إنشاء السند" },
      { key: "{{تاريخ_الاستحقاق}}", description: "تاريخ استحقاق السند" },
      { key: "{{مدينة_الاصدار}}", description: "مدينة إصدار السند" },
      { key: "{{مدينة_الوفاء}}", description: "مدينة الوفاء بالسند" },
      { key: "{{سبب_انشاء_السند}}", description: "سبب إنشاء السند" },
      { key: "{{قيمة_السند_رقما}}", description: "قيمة السند بالأرقام" },
      { key: "{{قيمة_السند_كتابة}}", description: "قيمة السند مكتوبة بالحروف" },
      { key: "{{اسم_الدائن}}", description: "اسم الدائن" },
      { key: "{{هوية_الدائن}}", description: "رقم هوية الدائن" },
      { key: "{{اسم_المدين}}", description: "اسم المدين" },
      { key: "{{هوية_المدين}}", description: "رقم هوية المدين" },
      { key: "{{اسم_الكفيل}}", description: "اسم الكفيل" },
      { key: "{{هوية_الكفيل}}", description: "رقم هوية الكفيل" },
    ],
    "debt-acknowledgment": [
      { key: "{{رقم_الإقرار}}", description: "رقم الإقرار المرجعي" },
      { key: "{{اسم_العميل}}", description: "اسم العميل (المدين)" },
      { key: "{{رقم_هوية_العميل}}", description: "رقم هوية العميل" },
      { key: "{{عنوان_العميل}}", description: "عنوان العميل" },
      { key: "{{اسم_الدائن}}", description: "اسم الدائن" },
      { key: "{{المبلغ_رقما}}", description: "المبلغ بالأرقام" },
      { key: "{{المبلغ_كتابة}}", description: "المبلغ مكتوباً بالحروف" },
      { key: "{{التاريخ_الهجري}}", description: "التاريخ بالتقويم الهجري" },
      { key: "{{التاريخ_الميلادي}}", description: "التاريخ بالتقويم الميلادي" },
    ],
    "receipt-voucher": [
      { key: "{{رقم_السند}}", description: "رقم سند القبض" },
      { key: "{{اسم_المستلم}}", description: "اسم الشخص المستلم للمبلغ" },
      { key: "{{هوية_المستلم}}", description: "رقم هوية المستلم" },
      { key: "{{المبلغ_رقما}}", description: "المبلغ المستلم بالأرقام" },
      { key: "{{المبلغ_كتابة}}", description: "المبلغ المستلم مكتوباً بالحروف" },
      { key: "{{سبب_الاستلام}}", description: "سبب استلام المبلغ" },
      { key: "{{التاريخ_الهجري}}", description: "التاريخ بالتقويم الهجري" },
      { key: "{{التاريخ_الميلادي}}", description: "التاريخ بالتقويم الميلادي" },
      { key: "{{اسم_المسلم}}", description: "اسم الشخص المسلم للمبلغ" },
    ],
    "payment-voucher": [
      { key: "{{رقم_السند}}", description: "رقم سند الصرف" },
      { key: "{{اسم_المستلم}}", description: "اسم الشخص المستلم للمبلغ" },
      { key: "{{هوية_المستلم}}", description: "رقم هوية المستلم" },
      { key: "{{المبلغ_رقما}}", description: "المبلغ المصروف بالأرقام" },
      { key: "{{المبلغ_كتابة}}", description: "المبلغ المصروف مكتوباً بالحروف" },
      { key: "{{سبب_الصرف}}", description: "سبب صرف المبلغ" },
      { key: "{{طريقة_الصرف}}", description: "طريقة الصرف (نقداً، شيك، تحويل)" },
      { key: "{{التاريخ_الميلادي}}", description: "التاريخ بالتقويم الميلادي" },
      { key: "{{اسم_المسلم}}", description: "اسم الشخص المسلم للمبلغ" },
      { key: "{{ملاحظات}}", description: "ملاحظات إضافية" },
    ],
    "payment-proof": [
      { key: "{{رقم_الايصال}}", description: "رقم الإيصال المرجعي" },
      { key: "{{اسم_العميل}}", description: "اسم العميل" },
      { key: "{{رقم_هوية_العميل}}", description: "رقم هوية العميل" },
      { key: "{{رقم_القرض}}", description: "رقم القرض" },
      { key: "{{رقم_الدفعة}}", description: "رقم الدفعة" },
      { key: "{{التاريخ_الهجري}}", description: "التاريخ بالتقويم الهجري" },
      { key: "{{التاريخ_الميلادي}}", description: "التاريخ بالتقويم الميلادي" },
      { key: "{{المبلغ_رقما}}", description: "المبلغ المدفوع بالأرقام" },
      { key: "{{المبلغ_كتابة}}", description: "المبلغ المدفوع مكتوباً بالحروف" },
      { key: "{{اسم_الموظف}}", description: "اسم الموظف المختص" }
    ],
    "settlement": [
      { key: "{{اسم_العميل}}", description: "اسم العميل" },
      { key: "{{رقم_هوية_العميل}}", description: "رقم هوية العميل" },
      { key: "{{رقم_الدفعة}}", description: "رقم الدفعة" },
      { key: "{{رقم_السند}}", description: "رقم السند" },
      { key: "{{المبلغ_رقما}}", description: "المبلغ رقماً" },
      { key: "{{المبلغ_كتابة}}", description: "المبلغ كتابة" },
      { key: "{{التاريخ_الهجري}}", description: "التاريخ بالتقويم الهجري" },
      { key: "{{التاريخ_الميلادي}}", description: "التاريخ بالتقويم الميلادي" },
      { key: "{{اسم_الموظف}}", description: "اسم الموظف المختص" }
    ]
  }), []);

  const getDefaultTemplate = React.useCallback((templateName) => {
    switch (templateName) {
      case "MUDARABAH":
        return MudarabahContract();
      case "PROMISSORY_NOTE":
        return PromissoryNote();
      case "DEBT_ACKNOWLEDGMENT":
        return DebtAcknowledgment();
      case "RECEIPT_VOUCHER":
        return ReceiptVoucher();
      case "PAYMENT_VOUCHER":
        return PaymentVoucher();
      case "PAYMENT_PROOF":
        return InstallmentPaymentReceipt();
      case "SETTLEMENT":
        return InstallmentSettlementReceipt();
      default:
        return "";
    }
  }, []);

  const fetchTemplateFromAPI = React.useCallback(async (templateName) => {
    try {
      const response = await Api.get(`/api/templates/${templateName}/with-variables`);
      if (response.data.content && response.data.content.trim() !== "") {
        return {
          content: response.data.content,
          variables: response.data.variables || [],
          styles: response.data.styles?.[0]?.css || ""
        };
      } else {
        return {
          content: getDefaultTemplate(templateName),
          variables: [],
          styles: ""
        };
      }
    } catch {
      return {
        content: getDefaultTemplate(templateName),
        variables: [],
        styles: ""
      };
    }
  }, [getDefaultTemplate]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      notifySuccess('تم نسخ المتغير:', text);
    });
  };

  const loadTemplates = React.useCallback(async () => {
    setLoading(true);
    try {
      const templatePromises = Object.keys(templateNameMap).map(async (key) => {
        const templateName = templateNameMap[key];
        const templateData = await fetchTemplateFromAPI(templateName);
        return { key, ...templateData };
      });
      
      const results = await Promise.all(templatePromises);
      const newTemplates = {};
      const newStyles = {};
      const newVariables = {};

      results.forEach(({ key, content, variables, styles }) => {
        const stateKey = key === "promissory-note" ? "promissoryNote" :
                        key === "debt-acknowledgment" ? "debtAcknowledgment" :
                        key === "receipt-voucher" ? "receiptVoucher" :
                        key === "payment-voucher" ? "paymentVoucher" :
                        key === "payment-proof" ? "paymentProof" :
                        key === "settlement" ? "settlement" :
                        key;
        
        newTemplates[stateKey] = content;
        newStyles[stateKey] = styles;
        
        const defaultVars = defaultContractVariables[key] || [];
        const dynamicVars = variables || [];
        newVariables[stateKey] = [...defaultVars, ...dynamicVars];
      });

      setTemplates(newTemplates);
      setTemplateStyles(newStyles);
      setDynamicVariables(newVariables);
    } catch (error) {
      notifyError("خطأ في تحميل القوالب");
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [templateNameMap, fetchTemplateFromAPI, defaultContractVariables]);

  const VariablesList = ({ variables, onManageVariables }) => (
    <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
            المتغيرات المتاحة
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<ManageSearchIcon sx={{marginLeft:'10px'}} />}
              sx={{ 
                px: 2, 
                py: 1,
                fontWeight: "bold",
                borderRadius: '10px',
                borderColor: '#6b7280',
                color: '#6b7280',
                '&:hover': {
                  borderColor: '#4b5563',
                  backgroundColor: '#f3f4f6'
                }
              }}
              onClick={onManageVariables}
            >
              إدارة المتغيرات
            </Button>
            {permissions.includes("templates_Update") && (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<SettingsIcon sx={{marginLeft:'10px'}} />}
                sx={{ 
                  px: 2, 
                  py: 1,
                  fontWeight: "bold",
                  borderRadius: '10px',
                  borderColor: '#6b7280',
                  color: '#6b7280',
                  '&:hover': {
                    borderColor: '#4b5563',
                    backgroundColor: '#f3f4f6'
                  }
                }}
                onClick={handleEditTemplate}
              >
                تنسيق CSS
              </Button>
            )}
            {permissions.includes("templates_Add") && (
              <Button
                variant="contained"
                color="primary"
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon sx={{marginLeft:'10px'}} />}
                disabled={saving}
                sx={{ 
                  px: 4, 
                  py: 1.2, 
                  fontWeight: "bold",
                  borderRadius: '10px',
                  '&:hover': {
                    backgroundColor: '#1565c0'
                  }
                }}
                onClick={handleSave}
              >
                {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            )}
          </Box>
        </Box>
        <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
          انقر على أي متغير لنسخه واستخدامه في القالب
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={1}>
          {variables.map((variable, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Chip
                label={variable.key}
                onClick={() => copyToClipboard(variable.key)}
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
              {variable.description && (
                <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}>
                  {variable.description}
                </Typography>
              )}
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentTemplateKey = activeTab;
      const templateName = templateNameMap[currentTemplateKey];
      const stateKey = currentTemplateKey === "promissory-note" ? "promissoryNote" :
                      currentTemplateKey === "debt-acknowledgment" ? "debtAcknowledgment" :
                      currentTemplateKey === "receipt-voucher" ? "receiptVoucher" :
                      currentTemplateKey === "payment-voucher" ? "paymentVoucher" :
                      currentTemplateKey === "payment-proof" ? "paymentProof" :
                      currentTemplateKey === "settlement" ? "settlement" :
                      currentTemplateKey;
      const templateContent = templates[stateKey];
      
      await Api.post("/api/templates", {
        name: templateName,
        description: `Template for ${templateName} agreements`,
        content: templateContent,
      });

      // حفظ الـ CSS إذا كان هناك تنسيق
      if (templateStyles[stateKey] && templateStyles[stateKey].trim() !== "") {
        await Api.post(`/api/templates/${templateName}/styles`, {
          css: templateStyles[stateKey]
        });
      }

      notifySuccess("تم حفظ القالب بنجاح");
    } catch (error) {
      notifyError("خطأ في حفظ القالب");
      handleApiError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleTemplateChange = (templateKey, value) => {
    setTemplates(prev => ({
      ...prev,
      [templateKey]: value
    }));
  };


  const handleEditTemplate = () => {
    const currentTemplateKey = activeTab;
    const stateKey = currentTemplateKey === "promissory-note" ? "promissoryNote" :
                    currentTemplateKey === "debt-acknowledgment" ? "debtAcknowledgment" :
                    currentTemplateKey === "receipt-voucher" ? "receiptVoucher" :
                    currentTemplateKey === "payment-voucher" ? "paymentVoucher" :
                    currentTemplateKey === "payment-proof" ? "paymentProof" :
                    currentTemplateKey === "settlement" ? "settlement" :
                    currentTemplateKey;
    
    setEditingTemplate(currentTemplateKey);
    setEditingContent(templates[stateKey]);
    setEditingStyles(templateStyles[stateKey] || "");
    setEditMode("styles"); // Open directly to styles tab since content editing is done in main view
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingTemplate("");
    setEditingContent("");
    setEditingStyles("");
  };

  const handleSaveEdit = () => {
    const stateKey = editingTemplate === "promissory-note" ? "promissoryNote" :
                    editingTemplate === "debt-acknowledgment" ? "debtAcknowledgment" :
                    editingTemplate === "receipt-voucher" ? "receiptVoucher" :
                    editingTemplate === "payment-voucher" ? "paymentVoucher" :
                    editingTemplate === "payment-proof" ? "paymentProof" :
                    editingTemplate === "settlement" ? "settlement" :
                    editingTemplate;

    // Only update styles since content is edited directly in main view
    setTemplateStyles(prev => ({
      ...prev,
      [stateKey]: editingStyles
    }));

    notifySuccess("تم تحديث التنسيق بنجاح");
    handleCloseEditModal();
  };

  const getCurrentVariables = () => {
    const stateKey = activeTab === "promissory-note" ? "promissoryNote" :
                    activeTab === "debt-acknowledgment" ? "debtAcknowledgment" :
                    activeTab === "receipt-voucher" ? "receiptVoucher" :
                    activeTab === "payment-voucher" ? "paymentVoucher" :
                    activeTab === "payment-proof" ? "paymentProof" :
                    activeTab === "settlement" ? "settlement" :
                    activeTab;
    
    return dynamicVariables[stateKey] || [];
  };

  const getStyledContent = (content, styles) => {
    if (!styles || styles.trim() === "") {
      return content;
    }
    return `<style>${styles}</style>${content}`;
  };

  const renderTemplateContent = (templateKey, stylesKey) => {
    const content = templates[templateKey];
    const styles = templateStyles[stylesKey];
    
    return (
      <Paper sx={{ p: 3, mb: 4, minHeight: "600px", bgcolor: 'white' }}>
        <Box
          dangerouslySetInnerHTML={{ __html: getStyledContent(content, styles) }}
          sx={{
            '& *': {
              fontFamily: '"Noto Sans Arabic", "Cairo", "Segoe UI", sans-serif !important',
            }
          }}
        />
      </Paper>
    );
  };

  const renderTemplateEditor = (templateKey) => {
    return (
      <RichTextEditor
        value={templates[templateKey]}
        onChange={(value) => handleTemplateChange(templateKey, value)}
        variables={getCurrentVariables()}
        height="600px"
      />
    );
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Helmet>
        <title>القوالب المالية</title>
        <meta name="description" content="القوالب المالية" />
      </Helmet>
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ p: 4, overflowY: "auto", flex: 1 }}>
          <Paper sx={{ p: 3, borderRadius: 2 }}>
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
              <Tab label="إيصال سداد دفعة" value="payment-proof" />
              <Tab label="إيصال تسوية دفعة" value="settlement" />
            </Tabs>
            <Box sx={{ mt: 3 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                  <CircularProgress size={40} />
                  <Typography sx={{ ml: 2 }}>جاري تحميل القوالب...</Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      {activeTab === "mudarabah" && "عقد المضاربة"}
                      {activeTab === "promissory-note" && "سند لأمر"}
                      {activeTab === "debt-acknowledgment" && "إقرار دين وتعهد بالسداد"}
                      {activeTab === "receipt-voucher" && "سند القبض"}
                      {activeTab === "payment-voucher" && "سند الصرف"}
                      {activeTab === "payment-proof" && "إيصال سداد دفعة"}
                      {activeTab === "settlement" && "إيصال تسوية دفعة"}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant={viewMode === "preview" ? "contained" : "outlined"}
                        onClick={() => setViewMode("preview")}
                        size="small"
                      >
                        معاينة
                      </Button>
                      <Button
                        variant={viewMode === "edit" ? "contained" : "outlined"}
                        onClick={() => setViewMode("edit")}
                        size="small"
                      >
                        تحرير
                      </Button>
                    </Box>
                  </Box>

                  <VariablesList 
                    variables={getCurrentVariables()} 
                    onManageVariables={() => setManageVariablesOpen(true)}
                  />

                  {activeTab === "mudarabah" && (
                    viewMode === "preview" 
                      ? renderTemplateContent("mudarabah", "mudarabah")
                      : renderTemplateEditor("mudarabah")
                  )}
                  {activeTab === "promissory-note" && (
                    viewMode === "preview" 
                      ? renderTemplateContent("promissoryNote", "promissoryNote")
                      : renderTemplateEditor("promissoryNote")
                  )}
                  {activeTab === "debt-acknowledgment" && (
                    viewMode === "preview" 
                      ? renderTemplateContent("debtAcknowledgment", "debtAcknowledgment")
                      : renderTemplateEditor("debtAcknowledgment")
                  )}
                  {activeTab === "receipt-voucher" && (
                    viewMode === "preview" 
                      ? renderTemplateContent("receiptVoucher", "receiptVoucher")
                      : renderTemplateEditor("receiptVoucher")
                  )}
                  {activeTab === "payment-voucher" && (
                    viewMode === "preview" 
                      ? renderTemplateContent("paymentVoucher", "paymentVoucher")
                      : renderTemplateEditor("paymentVoucher")
                  )}
                  {activeTab === "payment-proof" && (
                    viewMode === "preview" 
                      ? renderTemplateContent("paymentProof", "paymentProof")
                      : renderTemplateEditor("paymentProof")
                  )}
                  {activeTab === "settlement" && (
                    viewMode === "preview" 
                      ? renderTemplateContent("settlement", "settlement")
                      : renderTemplateEditor("settlement")
                  )}
                </>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* مودال تعديل القالب */}
      <Dialog
        open={editModalOpen}
        onClose={handleCloseEditModal}
        maxWidth="xl"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            height: '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          bgcolor: 'primary.main',
          color: 'white'
        }}>
          <Typography variant="h6">
            تنسيق CSS - {editingTemplate === "debt-acknowledgment" ? "إقرار الدين" : 
                          editingTemplate === "promissory-note" ? "سند الأمر" :
                          editingTemplate === "mudarabah" ? "عقد المضاربة" :
                          editingTemplate === "receipt-voucher" ? "سند القبض" :
                          editingTemplate === "payment-voucher" ? "سند الصرف" :
                          editingTemplate === "payment-proof" ? "إيصال سداد دفعة" :
                          editingTemplate === "settlement" ? "إيصال تسوية دفعة" : "قالب"}
          </Typography>
          <IconButton onClick={handleCloseEditModal} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
          <MuiTabs 
            value={editMode} 
            onChange={(e, val) => setEditMode(val)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <MuiTab label="التنسيق (CSS)" value="styles" />
            <MuiTab label="معاينة" value="preview" />
          </MuiTabs>

          <Box sx={{ flex: 1, display: 'flex' }}>
            {editMode === "styles" && (
              <Box sx={{ flex: 1, p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>تنسيق CSS</Typography>
                <CodeMirrorWrapper
                  value={editingStyles}
                  onChange={setEditingStyles}
                  placeholder="أدخل تنسيق CSS هنا..."
                  height="500px"
                />
              </Box>
            )}

            {editMode === "preview" && (
              <Box sx={{ flex: 1, p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>معاينة القالب</Typography>
                <Paper 
                  sx={{ 
                    p: 3, 
                    height: "500px", 
                    overflow: 'auto',
                    bgcolor: 'white',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <Box
                    dangerouslySetInnerHTML={{ __html: getStyledContent(editingContent, editingStyles) }}
                    sx={{
                      '& *': {
                        fontFamily: '"Noto Sans Arabic", "Cairo", "Segoe UI", sans-serif !important',
                        lineHeight: 1.8
                      }
                    }}
                  />
                </Paper>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <Button onClick={handleCloseEditModal} variant="outlined">
            إلغاء
          </Button>
          <Button 
            onClick={handleSaveEdit} 
            variant="contained" 
            color="primary"
          >
            حفظ التغييرات
          </Button>
        </DialogActions>
      </Dialog>

      {/* مودال إدارة المتغيرات */}
      <TemplateVariablesManager
        templateName={templateNameMap[activeTab]}
        open={manageVariablesOpen}
        onClose={() => setManageVariablesOpen(false)}
        onVariablesUpdate={loadTemplates}
      />
    </Box>
  );
}