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
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CodeMirrorWrapper from "../../components/CodeMirrorWrapper";
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
import LoanContractsPreview from "../../components/LoanContractsPreview";
import EditIcon from "@mui/icons-material/Edit";
import CloseIcon from "@mui/icons-material/Close";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CodeIcon from "@mui/icons-material/Code";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState("");
  const [editingContent, setEditingContent] = useState("");
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
      { name: "{{التاريخ_الميلادي}}", description: "التاريخ بالتقويم الميلادي" },
      { name: "{{اسم_المسلم}}", description: "اسم الشخص المسلم للمبلغ" },
      { name: "{{ملاحظات}}", description: "ملاحظات إضافية" },
    ],
    "payment-proof": [
      { name: "{{رقم_الايصال}}", description: "رقم الإيصال المرجعي" },
      { name: "{{اسم_العميل}}", description: "اسم العميل" },
      { name: "{{رقم_هوية_العميل}}", description: "رقم هوية العميل" },
      { name: "{{رقم_القرض}}", description: "رقم القرض" },
      { name: "{{رقم_الدفعة}}", description: "رقم الدفعة" },
      { name: "{{التاريخ_الهجري}}", description: "التاريخ بالتقويم الهجري" },
      { name: "{{التاريخ_الميلادي}}", description: "التاريخ بالتقويم الميلادي" },
      { name: "{{المبلغ_رقما}}", description: "المبلغ المدفوع بالأرقام" },
      { name: "{{المبلغ_كتابة}}", description: "المبلغ المدفوع مكتوباً بالحروف" },
      { name: "{{اسم_الموظف}}", description: "اسم الموظف المختص" }
    ],
    "settlement": [
      { name: "{{اسم_العميل}}", description: "اسم العميل" },
      { name: "{{رقم_هوية_العميل}}", description: "رقم هوية العميل" },
      { name: "{{رقم_الدفعة}}", description: "رقم الدفعة" },
      { name: "{{رقم_السند}}", description: "رقم السند" },
      { name: "{{المبلغ_رقما}}", description: "المبلغ رقماً" },
      { name: "{{المبلغ_كتابة}}", description: "المبلغ كتابة" },
      { name: "{{التاريخ_الهجري}}", description: "التاريخ بالتقويم الهجري" },
      { name: "{{التاريخ_الميلادي}}", description: "التاريخ بالتقويم الميلادي" },
      { name: "{{اسم_الموظف}}", description: "اسم الموظف المختص" }
    ]
  };

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
      const response = await Api.get(`/api/templates/${templateName}`);
      if (response.data.content && response.data.content.trim() !== "") {
        return response.data.content;
      } else {
        return getDefaultTemplate(templateName);
      }
    } catch {
      return getDefaultTemplate(templateName);
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
        const content = await fetchTemplateFromAPI(templateName);
        return { key, content };
      });
      const results = await Promise.all(templatePromises);
      const newTemplates = {};
      results.forEach(({ key, content }) => {
        const stateKey = key === "promissory-note" ? "promissoryNote" :
                        key === "debt-acknowledgment" ? "debtAcknowledgment" :
                        key === "receipt-voucher" ? "receiptVoucher" :
                        key === "payment-voucher" ? "paymentVoucher" :
                        key === "payment-proof" ? "paymentProof" :
                        key === "settlement" ? "settlement" :
                        key;
        newTemplates[stateKey] = content;
      });
      setTemplates(newTemplates);
    } catch (error) {
      notifyError("خطأ في تحميل القوالب");
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [templateNameMap, fetchTemplateFromAPI]);

  const VariablesList = ({ variables }) => (
    <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#2d3748' }}>
            المتغيرات المتاحة
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
          {permissions.includes("templates_Update") && (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<EditIcon sx={{marginLeft:'10px'}} />}
                sx={{ 
                  px: 3, 
                  py: 1.2, 
                  mt: 2, 
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
                تعديل القالب
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
                  mt: 2, 
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
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingTemplate("");
    setEditingContent("");
  };

  const handleSaveEdit = () => {
    const stateKey = editingTemplate === "promissory-note" ? "promissoryNote" :
                    editingTemplate === "debt-acknowledgment" ? "debtAcknowledgment" :
                    editingTemplate === "receipt-voucher" ? "receiptVoucher" :
                    editingTemplate === "payment-voucher" ? "paymentVoucher" :
                    editingTemplate === "payment-proof" ? "paymentProof" :
                    editingTemplate === "settlement" ? "settlement" :
                    editingTemplate;

    setTemplates(prev => ({
      ...prev,
      [stateKey]: editingContent
    }));

    notifySuccess("تم تحديث القالب بنجاح");
    handleCloseEditModal();
  };

  const isLoanContract = () => {
    return activeTab === "debt-acknowledgment" || activeTab === "promissory-note";
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
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                    <ToggleButtonGroup
                      value={viewMode}
                      exclusive
                      onChange={(e, newMode) => {
                        if (newMode !== null) {
                          setViewMode(newMode);
                        }
                      }}
                      aria-label="وضع العرض"
                      sx={{
                        '& .MuiToggleButton-root': {
                          px: 3,
                          py: 1,
                          fontWeight: 'bold'
                        }
                      }}
                    >
                    </ToggleButtonGroup>
                  </Box>

                  {activeTab === "mudarabah" && (
                    <>
                      <VariablesList variables={contractVariables.mudarabah} />
                      {viewMode === "preview" ? (
                        <Paper sx={{ p: 3, mb: 4, minHeight: "600px", bgcolor: 'white' }}>
                          <Box
                            dangerouslySetInnerHTML={{ __html: templates.mudarabah }}
                            sx={{
                              '& *': {
                                fontFamily: '"Noto Sans Arabic", "Cairo", "Segoe UI", sans-serif !important',
                              }
                            }}
                          />
                        </Paper>
                      ) : (
                        <CodeMirrorWrapper
                          value={templates.mudarabah}
                          onChange={(value) => handleTemplateChange("mudarabah", value)}
                          placeholder="أدخل نص قالب عقد المضاربة هنا..."
                          height="600px"
                        />
                      )}
                    </>
                  )}
                  {activeTab === "promissory-note" && (
                    <>
                      <VariablesList variables={contractVariables["promissory-note"]} />
                      {viewMode === "preview" ? (
                        <Paper sx={{ p: 3, mb: 4, minHeight: "600px", bgcolor: 'white' }}>
                          <Box
                            dangerouslySetInnerHTML={{ __html: templates.promissoryNote }}
                            sx={{
                              '& *': {
                                fontFamily: '"Noto Sans Arabic", "Cairo", "Segoe UI", sans-serif !important',
                              }
                            }}
                          />
                        </Paper>
                      ) : (
                        <CodeMirrorWrapper
                          value={templates.promissoryNote}
                          onChange={(value) => handleTemplateChange("promissoryNote", value)}
                          placeholder="أدخل نص قالب سند لأمر هنا..."
                          height="600px"
                        />
                      )}
                    </>
                  )}
                  {activeTab === "debt-acknowledgment" && (
                    <>
                      <VariablesList variables={contractVariables["debt-acknowledgment"]} />
                      {viewMode === "preview" ? (
                        <Paper sx={{ p: 3, mb: 4, minHeight: "600px", bgcolor: 'white' }}>
                          <Box
                            dangerouslySetInnerHTML={{ __html: templates.debtAcknowledgment }}
                            sx={{
                              '& *': {
                                fontFamily: '"Noto Sans Arabic", "Cairo", "Segoe UI", sans-serif !important',
                              }
                            }}
                          />
                        </Paper>
                      ) : (
                        <CodeMirrorWrapper
                          value={templates.debtAcknowledgment}
                          onChange={(value) => handleTemplateChange("debtAcknowledgment", value)}
                          placeholder="أدخل نص قالب إقرار الدين هنا..."
                          height="600px"
                        />
                      )}
                    </>
                  )}
                  {activeTab === "receipt-voucher" && (
                    <>
                      <VariablesList variables={contractVariables["receipt-voucher"]} />
                      {viewMode === "preview" ? (
                        <Paper sx={{ p: 3, mb: 4, minHeight: "600px", bgcolor: 'white' }}>
                          <Box
                            dangerouslySetInnerHTML={{ __html: templates.receiptVoucher }}
                            sx={{
                              '& *': {
                                fontFamily: '"Noto Sans Arabic", "Cairo", "Segoe UI", sans-serif !important',
                              }
                            }}
                          />
                        </Paper>
                      ) : (
                        <CodeMirrorWrapper
                          value={templates.receiptVoucher}
                          onChange={(value) => handleTemplateChange("receiptVoucher", value)}
                          placeholder="أدخل نص قالب سند القبض هنا..."
                          height="600px"
                        />
                      )}
                    </>
                  )}
                  {activeTab === "payment-voucher" && (
                    <>
                      <VariablesList variables={contractVariables["payment-voucher"]} />
                      {viewMode === "preview" ? (
                        <Paper sx={{ p: 3, mb: 4, minHeight: "600px", bgcolor: 'white' }}>
                          <Box
                            dangerouslySetInnerHTML={{ __html: templates.paymentVoucher }}
                            sx={{
                              '& *': {
                                fontFamily: '"Noto Sans Arabic", "Cairo", "Segoe UI", sans-serif !important',
                              }
                            }}
                          />
                        </Paper>
                      ) : (
                        <CodeMirrorWrapper
                          value={templates.paymentVoucher}
                          onChange={(value) => handleTemplateChange("paymentVoucher", value)}
                          placeholder="أدخل نص قالب سند الصرف هنا..."
                          height="600px"
                        />
                      )}
                    </>
                  )}
                  {activeTab === "payment-proof" && (
                    <>
                      <VariablesList variables={contractVariables["payment-proof"]} />
                      {viewMode === "preview" ? (
                        <Paper sx={{ p: 3, mb: 4, minHeight: "600px", bgcolor: 'white' }}>
                          <Box
                            dangerouslySetInnerHTML={{ __html: templates.paymentProof }}
                            sx={{
                              '& *': {
                                fontFamily: '"Noto Sans Arabic", "Cairo", "Segoe UI", sans-serif !important',
                              }
                            }}
                          />
                        </Paper>
                      ) : (
                        <CodeMirrorWrapper
                          value={templates.paymentProof}
                          onChange={(value) => handleTemplateChange("paymentProof", value)}
                          placeholder="أدخل نص قالب إيصال سداد دفعة هنا..."
                          height="600px"
                        />
                      )}
                    </>
                  )}
                  {activeTab === "settlement" && (
                    <>
                      <VariablesList variables={contractVariables["settlement"]} />
                      {viewMode === "preview" ? (
                        <Paper sx={{ p: 3, mb: 4, minHeight: "600px", bgcolor: 'white' }}>
                          <Box
                            dangerouslySetInnerHTML={{ __html: templates.settlement }}
                            sx={{
                              '& *': {
                                fontFamily: '"Noto Sans Arabic", "Cairo", "Segoe UI", sans-serif !important',
                              }
                            }}
                          />
                        </Paper>
                      ) : (
                        <CodeMirrorWrapper
                          value={templates.settlement}
                          onChange={(value) => handleTemplateChange("settlement", value)}
                          placeholder="أدخل نص قالب إيصال تسوية دفعة هنا..."
                          height="600px"
                        />
                      )}
                    </>
                  )}
                </>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
      {isLoanContract() && (
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
              {editingTemplate === "debt-acknowledgment" ? "تعديل إقرار الدين" : "تعديل سند الأمر"}
            </Typography>
            <IconButton onClick={handleCloseEditModal} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 0, display: 'flex' }}>
            {/* الجزء الأيسر: المحرر */}
            <Box sx={{ flex: 1, p: 2, borderRight: '1px solid #e0e0e0' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                محرر القالب (HTML/CSS)
              </Typography>
              <CodeMirrorWrapper
                value={editingContent}
                onChange={setEditingContent}
                placeholder="قم بتعديل محتوى القالب هنا..."
                height="500px"
              />
            </Box>

            {/* الجزء الأيمن: المعاينة */}
            <Box sx={{ flex: 1, p: 2 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                معاينة القالب
              </Typography>
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
                  dangerouslySetInnerHTML={{ __html: editingContent }}
                  sx={{
                    '& *': {
                      fontFamily: '"Noto Sans Arabic", "Cairo", "Segoe UI", sans-serif !important',
                      lineHeight: 1.8
                    },
                    '& h1, & h2, & h3': {
                      textAlign: 'center',
                      color: '#1976d2',
                      marginBottom: '20px'
                    },
                    '& p': {
                      marginBottom: '15px',
                      textAlign: 'justify'
                    },
                    '& strong': {
                      color: '#1976d2',
                      fontWeight: 'bold'
                    }
                  }}
                />
              </Paper>
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
      )}

      {/* مودال التعديل للعقود الأخرى */}
      {!isLoanContract() && editModalOpen && (
        <Dialog
          open={editModalOpen}
          onClose={handleCloseEditModal}
          maxWidth="lg"
          fullWidth
        >
          <DialogTitle sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <Typography variant="h6">
              تعديل القالب
            </Typography>
            <IconButton onClick={handleCloseEditModal}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', gap: 2, height: '500px' }}>
              {/* الجزء الأيسر: المحرر */}
              <Box sx={{ flex: 1, p: 2, borderRight: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  محرر القالب (HTML/CSS)
                </Typography>
                <CodeMirrorWrapper
                  value={editingContent}
                  onChange={setEditingContent}
                  placeholder="قم بتعديل محتوى القالب هنا..."
                  height="450px"
                />
              </Box>

              {/* الجزء الأيمن: المعاينة */}
              <Box sx={{ flex: 1, p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  معاينة القالب
                </Typography>
                <Paper 
                  sx={{ 
                    p: 3, 
                    height: "450px", 
                    overflow: 'auto',
                    bgcolor: 'white',
                    border: '1px solid #e0e0e0'
                  }}
                >
                  <Box
                    dangerouslySetInnerHTML={{ __html: editingContent }}
                    sx={{
                      '& *': {
                        fontFamily: '"Noto Sans Arabic", "Cairo", "Segoe UI", sans-serif !important',
                      }
                    }}
                  />
                </Paper>
              </Box>
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseEditModal} variant="outlined">
              إلغاء
            </Button>
            <Button onClick={handleSaveEdit} variant="contained" color="primary">
              حفظ
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
}