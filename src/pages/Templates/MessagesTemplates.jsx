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
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RestoreIcon from "@mui/icons-material/Restore";
import ReactQuillWrapper from "../../components/ReactQuillWrapper";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import Api, { handleApiError } from "../../config/Api";
import { Helmet } from "react-helmet-async";
import { usePermissions } from "../../components/Contexts/PermissionsContext";

const DefaultRepaymentDue = () => `  <p>عزيزي/عزيزتي {{اسم_العميل}}،</p>  <p>نود تذكيركم بأن دفعتكم البالغ {{مبلغ_الدفعة}} ريال سيكون مستحق الدفع في {{تاريخ_الاستحقاق}}.</p>  <p>يرجى اتخاذ الإجراءات اللازمة لضمان السداد في الوقت المحدد.</p>  <p>شكراً لتعاونكم،</p>  <p>{{اسم_الشركة}}</p>`;

const DefaultRepaymentLate = () => `  <p>عزيزي/عزيزتي {{اسم_العميل}}،</p>  <p>نود إعلامكم بأن دفعتكم البالغ {{مبلغ_الدفعة}} ريال والمستحق في {{تاريخ_الاستحقاق}} أصبح متأخراً.</p>  <p>الرجاء السداد في أقرب وقت ممكن لتجنب أي رسوم إضافية.</p>  <p>للاستفسار، يرجى التواصل معنا على {{رقم_الاتصال}}.</p>  <p>شكراً،</p>  <p>{{اسم_الشركة}}</p>`;

const DefaultPaymentApproved = () => `  <p>عزيزي/عزيزتي {{اسم_العميل}}،</p>  <p>نود إعلامكم بأن دفعتكم البالغة {{مبلغ_الدفعة}} ريال قد تمت الموافقة عليها بنجاح.</p>  <p>رقم المرجع: {{رقم_المرجع}}</p>  <p>تاريخ المعاملة: {{تاريخ_المعاملة}}</p>  <p>شكراً لتعاونكم،</p>  <p>{{اسم_الشركة}}</p>`;

const DefaultPaymentRejected = () => `  <p>عزيزي/عزيزتي {{اسم_العميل}}،</p>  <p>نأسف لإعلامكم بأن دفعتكم البالغة {{مبلغ_الدفعة}} ريال قد تم رفضها.</p>  <p>السبب: {{سبب_الرفض}}</p>  <p>يرجى التواصل معنا على {{رقم_الاتصال}} لمزيد من المعلومات.</p>  <p>شكراً،</p>  <p>{{اسم_الشركة}}</p>`;

export default function MessagesTemplates() {
  const [activeTab, setActiveTab] = useState("repayment-due");
  const [templates, setTemplates] = useState({
    repaymentDue: "",
    repaymentLate: "",
    paymentApproved: "",
    paymentRejected: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [variables, setVariables] = useState({
    "repayment-due": [],
    "repayment-late": [],
    "payment-approved": [],
    "payment-rejected": [],
  });
  const { permissions } = usePermissions();

  const templateNameMap = React.useMemo(() => ({
    "repayment-due": "REPAYMENT_DUE",
    "repayment-late": "REPAYMENT_LATE", 
    "payment-approved": "PAYMENT_APPROVED",
    "payment-rejected": "PAYMENT_REJECTED",
  }), []);

  const getDefaultTemplate = React.useCallback((templateName) => {
    switch (templateName) {
      case "REPAYMENT_DUE":
        return DefaultRepaymentDue();
      case "REPAYMENT_LATE":
        return DefaultRepaymentLate();
      case "PAYMENT_APPROVED":
        return DefaultPaymentApproved();
      case "PAYMENT_REJECTED":
        return DefaultPaymentRejected();
      default:
        return "";
    }
  }, []);

  const extractVariablesFromContent = (content) => {
    const variableRegex = /{{(.*?)}}/g;
    const matches = content.match(variableRegex) || [];
    const uniqueVariables = [...new Set(matches)];
        
    return uniqueVariables.map(variable => ({
      name: variable,
      description: getVariableDescription(variable)
    }));
  };

  const getVariableDescription = (variable) => {
    const variableDescriptions = {
      "{{اسم_العميل}}": "اسم العميل",
      "{{اسم_الشركة}}": "اسم الشركة أو المؤسسة",
      "{{رقم_الاتصال}}": "رقم الاتصال أو خدمة العملاء",
      "{{البريد_الإلكتروني}}": "البريد الإلكتروني للشركة",
      "{{الموقع_الإلكتروني}}": "الموقع الإلكتروني للشركة",
      "{{مبلغ_الدفعة}}": "مبلغ الدفعة المستحق",
      "{{تاريخ_الاستحقاق}}": "تاريخ استحقاق الدفعة",
      "{{رقم_المرجع}}": "رقم المرجع أو المعاملة",
      "{{تاريخ_المعاملة}}": "تاريخ إتمام المعاملة",
      "{{سبب_الرفض}}": "سبب رفض الدفعة",
      "{{رقم_العقد}}": "رقم العقد",
      "{{رقم_الدفعة}}": "رقم الدفعة",
      "{{المبلغ_المتبقي}}": "المبلغ المتبقي للدفع",
      "{{عدد_أيام_التأخير}}": "عدد أيام التأخير",
      "{{الغرامات_المستحقة}}": "قيمة الغرامات المستحقة",
      "{{آخر_موعد_للدفع}}": "آخر موعد للدفع بدون غرامات",
    };
    return variableDescriptions[variable] || `متغير: ${variable.replace(/[{}]/g, '')}`;
  };

  const fetchTemplateFromAPI = React.useCallback(async (templateName) => {
    try {
      const response = await Api.get(`/api/templates/${templateName}`);
      if (response.data.content && response.data.content.trim() !== "") {
        return response.data.content;
      } else {
        console.log(`Template ${templateName} found in API but empty, using frontend default`);
        return getDefaultTemplate(templateName);
      }
    } catch {
      console.log(`Template ${templateName} not found in API, using frontend default`);
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
      const newVariables = { ...variables };
      results.forEach(({ key, content }) => {
        const stateKey = key === "repayment-due" ? "repaymentDue" :
                        key === "repayment-late" ? "repaymentLate" :
                        key === "payment-approved" ? "paymentApproved" :
                        key === "payment-rejected" ? "paymentRejected" :
                        key;
        newTemplates[stateKey] = content;
        newVariables[key] = extractVariablesFromContent(content);
      });
      setTemplates(newTemplates);
      setVariables(newVariables);
    } catch (error) {
      notifyError("خطأ في تحميل القوالب");
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
                startIcon={<RestoreIcon sx={{marginLeft:'10px'}} />}
                sx={{ 
                  px: 3, 
                  py: 1.2, 
                  mt: 2, 
                  fontWeight: "bold",
                  borderRadius: '10px',
                  '&:hover': {
                    backgroundColor: '#f5f5f5'
                  }
                }}
                onClick={handleResetToDefault}
              >
                إعادة تعيين افتراضي
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
      const stateKey = currentTemplateKey === "repayment-due" ? "repaymentDue" :
                      currentTemplateKey === "repayment-late" ? "repaymentLate" :
                      currentTemplateKey === "payment-approved" ? "paymentApproved" :
                      currentTemplateKey === "payment-rejected" ? "paymentRejected" :
                      currentTemplateKey;
      const templateContent = templates[stateKey];
      await Api.post("/api/templates", {
        name: templateName,
        description: `Template for ${templateName} messages`,
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
    const tabKey = templateKey === "repaymentDue" ? "repayment-due" :
                   templateKey === "repaymentLate" ? "repayment-late" :
                   templateKey === "paymentApproved" ? "payment-approved" :
                   templateKey === "paymentRejected" ? "payment-rejected" :
                   templateKey;
    setVariables(prev => ({
      ...prev,
      [tabKey]: extractVariablesFromContent(value)
    }));
  };

  const handleResetToDefault = () => {
    const currentTemplateKey = activeTab;
    const templateName = templateNameMap[currentTemplateKey];
    const defaultContent = getDefaultTemplate(templateName);
    const stateKey = currentTemplateKey === "repayment-due" ? "repaymentDue" :
                    currentTemplateKey === "repayment-late" ? "repaymentLate" :
                    currentTemplateKey === "payment-approved" ? "paymentApproved" :
                    currentTemplateKey === "payment-rejected" ? "paymentRejected" :
                    currentTemplateKey;
    setTemplates(prev => ({
      ...prev,
      [stateKey]: defaultContent
    }));
    setVariables(prev => ({
      ...prev,
      [currentTemplateKey]: extractVariablesFromContent(defaultContent)
    }));
    notifySuccess("تم إعادة تعيين القالب إلى النسخة الافتراضية");
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Helmet>
        <title>القوالب الرسائلية</title>
        <meta name="description" content="القوالب الرسائلية" />
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
              <Tab label="تذكير استحقاق دفعة" value="repayment-due" />
              <Tab label="تذكير تأخير سداد" value="repayment-late" />
              <Tab label="موافقة على دفعة" value="payment-approved" />
              <Tab label="رفض دفعة" value="payment-rejected" />
            </Tabs>
            <Box sx={{ mt: 3 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                  <CircularProgress size={40} />
                  <Typography sx={{ ml: 2 }}>جاري تحميل القوالب...</Typography>
                </Box>
              ) : (
                <>
                  {activeTab === "repayment-due" && (
                    <>
                      <VariablesList variables={variables["repayment-due"]} />
                      <ReactQuillWrapper
                        theme="snow"
                        value={templates.repaymentDue}
                        onChange={(value) => handleTemplateChange("repaymentDue", value)}
                        placeholder="أدخل نص قالب تذكير استحقاق الدفعة هنا..."
                        style={{ height: "500px", marginBottom: "40px" }}
                      />
                    </>
                  )}
                  {activeTab === "repayment-late" && (
                    <>
                      <VariablesList variables={variables["repayment-late"]} />
                      <ReactQuillWrapper
                        theme="snow"
                        value={templates.repaymentLate}
                        onChange={(value) => handleTemplateChange("repaymentLate", value)}
                        placeholder="أدخل نص قالب تذكير تأخير السداد هنا..."
                        style={{ height: "500px", marginBottom: "40px" }}
                      />
                    </>
                  )}
                  {activeTab === "payment-approved" && (
                    <>
                      <VariablesList variables={variables["payment-approved"]} />
                      <ReactQuillWrapper
                        theme="snow"
                        value={templates.paymentApproved}
                        onChange={(value) => handleTemplateChange("paymentApproved", value)}
                        placeholder="أدخل نص قالب موافقة على الدفعة هنا..."
                        style={{ height: "500px", marginBottom: "40px" }}
                      />
                    </>
                  )}
                  {activeTab === "payment-rejected" && (
                    <>
                      <VariablesList variables={variables["payment-rejected"]} />
                      <ReactQuillWrapper
                        theme="snow"
                        value={templates.paymentRejected}
                        onChange={(value) => handleTemplateChange("paymentRejected", value)}
                        placeholder="أدخل نص قالب رفض الدفعة هنا..."
                        style={{ height: "500px", marginBottom: "40px" }}
                      />
                    </>
                  )}
                </>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}