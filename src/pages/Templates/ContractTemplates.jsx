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
  TextField,
  InputAdornment,
  Alert,
  Tooltip,

} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SearchIcon from "@mui/icons-material/Search";
import PreviewIcon from "@mui/icons-material/Preview";
import EditIcon from "@mui/icons-material/Edit";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import CloseIcon from "@mui/icons-material/Close";
import WarningIcon from "@mui/icons-material/Warning";


import RichTextEditor from "../../components/RichTextEditor";
import TemplateVariablesManager from "../../components/TemplateVariablesManager";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import MudarabahContract from "../../components/Contracts/MudarabahContract";
import PromissoryNote from "../../components/Contracts/PromissoryNote";
import DebtAcknowledgment from "../../components/Contracts/DebtAcknowledgment";
import PaymentVoucher from "../../components/Contracts/PaymentVoucher";
import InstallmentPaymentReceipt from "../../components/Contracts/InstallmentPaymentReceipt";
import InstallmentSettlementReceipt from "../../components/Contracts/InstallmentSettlementReceipt";
import Api, { handleApiError } from "../../config/Api";
import { Helmet } from "react-helmet-async";
import { usePermissions } from "../../components/Contexts/PermissionsContext";

export default function ContractTemplates() {
  const [activeTab, setActiveTab] = useState("debt-acknowledgment");
  const [templates, setTemplates] = useState({
    mudarabah: "",
    promissoryNote: "",
    debtAcknowledgment: "",
    paymentVoucher: "",
    paymentProof: "",
    settlement: "",
  });
  const [templateStyles, setTemplateStyles] = useState({
    mudarabah: "",
    promissoryNote: "",
    debtAcknowledgment: "",
    paymentVoucher: "",
    paymentProof: "",
    settlement: "",
  });
  const [dynamicVariables, setDynamicVariables] = useState({
    mudarabah: [],
    promissoryNote: [],
    debtAcknowledgment: [],
    paymentVoucher: [],
    paymentProof: [],
    settlement: [],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [manageVariablesOpen, setManageVariablesOpen] = useState(false);
  const [viewMode, setViewMode] = useState("preview");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const { permissions } = usePermissions();

  // Map tab values to API template names
  const templateNameMap = React.useMemo(() => ({
    "mudarabah": "MUDARABAH",
    "promissory-note": "PROMISSORY_NOTE",
    "debt-acknowledgment": "DEBT_ACKNOWLEDGMENT",
    "payment-voucher": "PAYMENT_VOUCHER",
    "payment-proof": "PAYMENT_PROOF",
    "settlement": "SETTLEMENT",
  }), []);

  const defaultContractVariables = React.useMemo(() => ({
    mudarabah: [
      { key: "{{تاريخ_العقد_هجري}}", description: "تاريخ العقد بالتقويم الهجري", group: "التواريخ" },
      { key: "{{تاريخ_العقد_ميلادي}}", description: "تاريخ العقد بالتقويم الميلادي", group: "التواريخ" },
      { key: "{{مدينة_العقد}}", description: "المدينة التي تم إبرام العقد فيها", group: "المكان" },
      { key: "{{اسم_رب_المال}}", description: "اسم رب المال (الطرف الأول)", group: "بيانات الأطراف" },
      { key: "{{هوية_رب_المال}}", description: "رقم هوية رب المال", group: "بيانات الأطراف" },
      { key: "{{عنوان_رب_المال}}", description: "عنوان رب المال", group: "بيانات الأطراف" },
      { key: "{{اسم_المضارب_1}}", description: "اسم المضارب الأول", group: "بيانات الأطراف" },
      { key: "{{هوية_المضارب_1}}", description: "رقم هوية المضارب الأول", group: "بيانات الأطراف" },
      { key: "{{عنوان_المضارب_1}}", description: "عنوان المضارب الأول", group: "بيانات الأطراف" },
      { key: "{{اسم_المضارب_2}}", description: "اسم المضارب الثاني", group: "بيانات الأطراف" },
      { key: "{{هوية_المضارب_2}}", description: "رقم هوية المضارب الثاني", group: "بيانات الأطراف" },
      { key: "{{عنوان_المضارب_2}}", description: "عنوان المضارب الثاني", group: "بيانات الأطراف" },
      { key: "{{رأس_المال}}", description: "مبلغ رأس المال بالأرقام", group: "البيانات المالية" },
      { key: "{{رأس_المال_كتابة}}", description: "مبلغ رأس المال مكتوباً بالحروف", group: "البيانات المالية" },
    ],
    "promissory-note": [
      { key: "{{رقم_السند}}", description: "رقم السند المرجعي", group: "بيانات السند" },
      { key: "{{تاريخ_الانشاء}}", description: "تاريخ إنشاء السند", group: "التواريخ" },
      { key: "{{تاريخ_الاستحقاق}}", description: "تاريخ استحقاق السند", group: "التواريخ" },
      { key: "{{مدينة_الاصدار}}", description: "مدينة إصدار السند", group: "المكان" },
      { key: "{{مدينة_الوفاء}}", description: "مدينة الوفاء بالسند", group: "المكان" },
      { key: "{{سبب_انشاء_السند}}", description: "سبب إنشاء السند", group: "بيانات السند" },
      { key: "{{قيمة_السند_رقما}}", description: "قيمة السند بالأرقام", group: "البيانات المالية" },
      { key: "{{قيمة_السند_كتابة}}", description: "قيمة السند مكتوبة بالحروف", group: "البيانات المالية" },
      { key: "{{اسم_الدائن}}", description: "اسم الدائن", group: "بيانات الأطراف" },
      { key: "{{هوية_الدائن}}", description: "رقم هوية الدائن", group: "بيانات الأطراف" },
      { key: "{{اسم_المدين}}", description: "اسم المدين", group: "بيانات الأطراف" },
      { key: "{{هوية_المدين}}", description: "رقم هوية المدين", group: "بيانات الأطراف" },
      { key: "{{اسم_الكفيل}}", description: "اسم الكفيل", group: "بيانات الأطراف" },
      { key: "{{هوية_الكفيل}}", description: "رقم هوية الكفيل", group: "بيانات الأطراف" },
    ],
    "debt-acknowledgment": [
      { key: "{{رقم_الإقرار}}", description: "رقم الإقرار المرجعي", group: "بيانات الإقرار" },
      { key: "{{اسم_العميل}}", description: "اسم العميل (المدين)", group: "بيانات الأطراف" },
      { key: "{{رقم_هوية_العميل}}", description: "رقم هوية العميل", group: "بيانات الأطراف" },
      { key: "{{عنوان_العميل}}", description: "عنوان العميل", group: "بيانات الأطراف" },
      { key: "{{اسم_الدائن}}", description: "اسم الدائن", group: "بيانات الأطراف" },
      { key: "{{المبلغ_رقما}}", description: "المبلغ بالأرقام", group: "البيانات المالية" },
      { key: "{{المبلغ_كتابة}}", description: "المبلغ مكتوباً بالحروف", group: "البيانات المالية" },
      { key: "{{التاريخ_الهجري}}", description: "التاريخ بالتقويم الهجري", group: "التواريخ" },
      { key: "{{التاريخ_الميلادي}}", description: "التاريخ بالتقويم الميلادي", group: "التواريخ" },
    ],
    "payment-voucher": [
      { key: "{{رقم_السند}}", description: "رقم السند المرجعي", group: "بيانات السند" },
      { key: "{{التاريخ_الهجري}}", description: "التاريخ بالتقويم الهجري", group: "التواريخ" },
      { key: "{{التاريخ_الميلادي}}", description: "التاريخ بالتقويم الميلادي", group: "التواريخ" },
      { key: "{{سبب_الصرف}}", description: "سبب صرف المبلغ", group: "بيانات السند" },
      { key: "{{المبلغ_رقما}}", description: "المبلغ المصروف بالأرقام", group: "البيانات المالية" },
      { key: "{{المبلغ_كتابة}}", description: "المبلغ المصروف مكتوباً بالحروف", group: "البيانات المالية" },
      { key: "{{اسم_المساهم}}", description: "اسم المساهم (المسلم للمبلغ)", group: "بيانات الأطراف" },
      { key: "{{رقم_هوية_المساهم}}", description: "رقم هوية المساهم", group: "بيانات الأطراف" },
      { key: "{{اسم_المستلم}}", description: "اسم المستلم للمبلغ", group: "بيانات الأطراف" },
      { key: "{{رقم_هوية_المستلم}}", description: "رقم هوية المستلم", group: "بيانات الأطراف" }
    ],
    "payment-proof": [
      { key: "{{رقم_الايصال}}", description: "رقم الإيصال المرجعي", group: "بيانات الإيصال" },
      { key: "{{اسم_العميل}}", description: "اسم العميل", group: "بيانات الأطراف" },
      { key: "{{رقم_هوية_العميل}}", description: "رقم هوية العميل", group: "بيانات الأطراف" },
      { key: "{{رقم_القرض}}", description: "رقم القرض", group: "بيانات الإيصال" },
      { key: "{{رقم_الدفعة}}", description: "رقم الدفعة", group: "بيانات الإيصال" },
      { key: "{{التاريخ_الهجري}}", description: "التاريخ بالتقويم الهجري", group: "التواريخ" },
      { key: "{{التاريخ_الميلادي}}", description: "التاريخ بالتقويم الميلادي", group: "التواريخ" },
      { key: "{{المبلغ_رقما}}", description: "المبلغ المدفوع بالأرقام", group: "البيانات المالية" },
      { key: "{{المبلغ_كتابة}}", description: "المبلغ المدفوع مكتوباً بالحروف", group: "البيانات المالية" },
      { key: "{{اسم_الموظف}}", description: "اسم الموظف المختص", group: "بيانات الأطراف" }
    ],
    "settlement": [
      { key: "{{اسم_العميل}}", description: "اسم العميل", group: "بيانات الأطراف" },
      { key: "{{رقم_هوية_العميل}}", description: "رقم هوية العميل", group: "بيانات الأطراف" },
      { key: "{{رقم_الدفعة}}", description: "رقم الدفعة", group: "بيانات الإيصال" },
      { key: "{{رقم_السند}}", description: "رقم السند", group: "بيانات الإيصال" },
      { key: "{{المبلغ_رقما}}", description: "المبلغ رقماً", group: "البيانات المالية" },
      { key: "{{المبلغ_كتابة}}", description: "المبلغ كتابة", group: "البيانات المالية" },
      { key: "{{التاريخ_الهجري}}", description: "التاريخ بالتقويم الهجري", group: "التواريخ" },
      { key: "{{التاريخ_الميلادي}}", description: "التاريخ بالتقويم الميلادي", group: "التواريخ" },
      { key: "{{اسم_الموظف}}", description: "اسم الموظف المختص", group: "بيانات الأطراف" }
    ]
  }), []);



  const SimpleVariablesList = ({ variables, onManageVariables, onCopyVariable }) => {
    const filteredVariables = variables.filter(variable =>
      variable.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variable.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
              المتغيرات المتاحة
            </Typography>
            {permissions.includes('templates_Update') && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<ManageSearchIcon sx={{marginLeft:'10px'}} />}
                onClick={onManageVariables}
              >
                إدارة المتغيرات
              </Button>
            )}
          </Box>

          <TextField
            fullWidth
            size="small"
            placeholder="ابحث في المتغيرات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {searchTerm && (
            <Typography variant="caption" sx={{ mb: 2, display: 'block', color: 'text.secondary' }}>
              {filteredVariables.length} متغير وجد
            </Typography>
          )}

          <Grid container spacing={1}>
            {filteredVariables.map((variable, index) => {
              const displayName = variable.key.replace(/\{\{|\}\}/g, '');
              return (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Tooltip title={variable.description} arrow>
                    <Chip
                      label={displayName}
                      onClick={() => onCopyVariable(variable.key)}
                      icon={<ContentCopyIcon sx={{ fontSize: '14px !important' }} />}
                      sx={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        height: 'auto',
                        minHeight: '36px',
                        backgroundColor: '#f8f9fc',
                        border: '1px solid #e5e7eb',
                        '&:hover': {
                          backgroundColor: '#e0e7ff',
                          borderColor: '#3b82f6',
                        },
                        '& .MuiChip-label': {
                          fontSize: '0.8rem',
                          fontWeight: '500',
                          whiteSpace: 'normal',
                          textAlign: 'right',
                          direction: 'rtl',
                        }
                      }}
                    />
                  </Tooltip>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>
    );
  };


  const getStateKey = (tab) => {
    return tab === "promissory-note" ? "promissoryNote" :
           tab === "debt-acknowledgment" ? "debtAcknowledgment" :
           tab === "payment-voucher" ? "paymentVoucher" :
           tab === "payment-proof" ? "paymentProof" :
           tab === "settlement" ? "settlement" : tab;
  };

  const ensureVariableBrackets = (content) => {
    if (!content) return content;
    
    const stateKey = getStateKey(activeTab);
    const allVariables = dynamicVariables[stateKey] || [];
    const variableNames = allVariables.map(v => { 
      const match = v.key.match(/\{\{([^}]+)\}\}/);
      return match ? match[1] : v.key.replace(/[{}]/g, '');
    });

    let processedContent = content;
    
    variableNames.forEach(varName => {
      const escapedVarName = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const regex = new RegExp(`(?!\\{\\{)${escapedVarName}(?!\\}\\})`, 'g');
      
      processedContent = processedContent.replace(regex, (match, offset) => {
        const before = processedContent.substring(Math.max(0, offset - 20), offset);
        const after = processedContent.substring(offset + match.length, offset + match.length + 20);
        
        if (before.includes('{{') || after.includes('}}')) {
          return match;
        }
        
      
        const beforeTag = processedContent.substring(Math.max(0, offset - 100), offset);
        const afterTag = processedContent.substring(offset + match.length, offset + match.length + 100);
        
      
        const lastOpenTag = beforeTag.lastIndexOf('<');
        const lastCloseTag = beforeTag.lastIndexOf('>');
        const nextCloseTag = afterTag.indexOf('>');
        const nextOpenTag = afterTag.indexOf('<');
        
        if (lastOpenTag > lastCloseTag && nextCloseTag !== -1 && (nextCloseTag < nextOpenTag || nextOpenTag === -1)) {
          return match;
        }
        
        return `{{${match}}}`;
      });
    });

    return processedContent;
  };

  const copyToClipboard = (text) => {
    const variableName = text.replace(/\{\{|\}\}/g, '');
    navigator.clipboard.writeText(variableName).then(() => {
      notifySuccess('تم نسخ المتغير:', variableName);
    });
  };

  const getDefaultTemplate = React.useCallback((templateName) => {
    switch (templateName) {
      case "MUDARABAH":
        return MudarabahContract();
      case "PROMISSORY_NOTE":
        return PromissoryNote();
      case "DEBT_ACKNOWLEDGMENT":
        return DebtAcknowledgment();
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
        const stateKey = getStateKey(key);
        
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

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentTemplateKey = activeTab;
      const templateName = templateNameMap[currentTemplateKey];
      const stateKey = getStateKey(currentTemplateKey);
      let templateContent = templates[stateKey];
      
      // Ensure all variables have {{ }} brackets before saving
      templateContent = ensureVariableBrackets(templateContent);
      
      await Api.post("/api/templates", {
        name: templateName,
        description: `Template for ${templateName} agreements`,
        content: templateContent,
      });

      if (templateStyles[stateKey] && templateStyles[stateKey].trim() !== "") {
        await Api.post(`/api/templates/${templateName}/styles`, {
          css: templateStyles[stateKey]
        });
      }

      // Update the template in state with brackets
      setTemplates(prev => ({
        ...prev,
        [stateKey]: templateContent
      }));

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


  const getCurrentVariables = () => {
    const stateKey = getStateKey(activeTab);
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
      <Paper sx={{
        p: 4,
        mb: 4,
        minHeight: "600px",
        bgcolor: 'white',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'linear-gradient(45deg, #fafafa 25%, transparent 25%), linear-gradient(-45deg, #fafafa 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #fafafa 75%), linear-gradient(-45deg, transparent 75%, #fafafa 75%)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
      }}>
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
    // Create variables without brackets for easier editing
    const variablesWithoutBrackets = getCurrentVariables().map(v => ({
      ...v,
      key: v.key.replace(/\{\{|\}\}/g, '') // Remove brackets for display/editing
    }));

    return (
      <RichTextEditor
        value={templates[templateKey]}
        onChange={(value) => handleTemplateChange(templateKey, value)}
        variables={variablesWithoutBrackets}
        height="600px"
      />
    );
  };


  // Delete Confirmation Dialog
  const DeleteConfirmation = () => (
    <Dialog open={!!showDeleteConfirm} onClose={() => setShowDeleteConfirm(null)}>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          تأكيد الحذف
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography>
          هل أنت متأكد من حذف المتغير <strong>{showDeleteConfirm?.name}</strong>؟
        </Typography>
        <Alert severity="warning" sx={{ mt: 2 }}>
          قد يسبب ذلك أخطاء في العقود الموجودة التي تستخدم هذا المتغير.
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setShowDeleteConfirm(null)}>إلغاء</Button>
        <Button 
          color="error" 
          variant="contained"
          onClick={showDeleteConfirm?.onConfirm}
        >
          نعم، احذف
        </Button>
      </DialogActions>
    </Dialog>
  );

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
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
              <Tab label="سند الصرف" value="payment-voucher" />
              <Tab label="سند قبض دفعة" value="payment-proof" />
              <Tab label="تسوية سلفة وخلو طرف" value="settlement" />
            </Tabs>

            <Box sx={{ mt: 3 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                  <CircularProgress size={40} />
                  <Typography sx={{ ml: 2 }}>جاري تحميل القوالب...</Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
                      {activeTab === "mudarabah" && "عقد المضاربة"}
                      {activeTab === "promissory-note" && "سند لأمر"}
                      {activeTab === "debt-acknowledgment" && "إقرار دين وتعهد بالسداد"}
                      {activeTab === "payment-voucher" && "سند الصرف"}
                      {activeTab === "payment-proof" && "سند قبض دفعة"}
                      {activeTab === "settlement" && "إيصال تسوية دفعة"}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      <Button
                        variant={viewMode === "preview" ? "contained" : "outlined"}
                        startIcon={<PreviewIcon sx={{marginLeft:'10px'}} />}
                        onClick={() => setViewMode("preview")}
                      >
                        معاينة
                      </Button>
                      {permissions.includes('templates_Update') && (
                        <Button
                          variant={viewMode === "edit" ? "contained" : "outlined"}
                          startIcon={<EditIcon sx={{marginLeft:'10px'}} />}
                          onClick={() => setViewMode("edit")}
                        >
                          تحرير
                        </Button>
                      )}
                      {permissions.includes('templates_Update') && (
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon sx={{marginLeft:'10px'}} />}
                          disabled={saving}
                          onClick={handleSave}
                        >
                          {saving ? 'جاري الحفظ...' : 'حفظ القالب'}
                        </Button>
                      )}
                    </Box>
                  </Box>

                  <SimpleVariablesList
                    variables={getCurrentVariables()}
                    onManageVariables={() => setManageVariablesOpen(true)}
                    onCopyVariable={copyToClipboard}
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



      {/* Template Variables Manager */}
      <TemplateVariablesManager
        templateName={templateNameMap[activeTab]}
        open={manageVariablesOpen}
        onClose={() => setManageVariablesOpen(false)}
        onVariablesUpdate={loadTemplates}
        onDeleteVariable={(variable) => setShowDeleteConfirm({
          name: variable.key,
          onConfirm: () => {
            // Add your delete logic here
            setShowDeleteConfirm(null);
          }
        })}
      />


      {/* Delete Confirmation */}
      <DeleteConfirmation />


    </Box>
  );
}