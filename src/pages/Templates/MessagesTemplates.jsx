import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  Paper,
  useTheme,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import PreviewIcon from "@mui/icons-material/Preview";
import EditIcon from "@mui/icons-material/Edit";
import ReactQuillWrapper from "../../components/editors/ReactQuillWrapper";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import Api, { handleApiError } from "../../config/Api";
import { Helmet } from "react-helmet-async";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
const messageEditorStyles = `
  .message-editor .ql-editor {
    font-family: "Noto Sans Arabic", "Cairo", "Segoe UI", sans-serif !important;
    direction: rtl !important;
    text-align: right !important;
    line-height: 1.6 !important;
    font-size: 1rem !important;
    color: #333 !important;
  }
  .message-editor .ql-container {
    font-family: "Noto Sans Arabic", "Cairo", "Segoe UI", sans-serif !important;
    direction: rtl !important;
  }
  .message-editor .ql-toolbar {
    direction: rtl !important;
  }
`;
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
  const [viewMode, setViewMode] = useState("preview");
  const { permissions } = usePermissions();
  const theme = useTheme();
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
  const getStateKey = (tab) => {
    return tab === "repayment-due" ? "repaymentDue" :
           tab === "repayment-late" ? "repaymentLate" :
           tab === "payment-approved" ? "paymentApproved" :
           tab === "payment-rejected" ? "paymentRejected" : tab;
  };
  const loadTemplates = React.useCallback(async () => {
    setLoading(true);
    try {
      const newTemplates = {};
      Object.keys(templateNameMap).forEach((key) => {
        const templateName = templateNameMap[key];
        const stateKey = getStateKey(key);
        newTemplates[stateKey] = getDefaultTemplate(templateName);
      });
      setTemplates(newTemplates);
    } catch (error) {
      notifyError("خطأ في تحميل القوالب");
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [templateNameMap, getDefaultTemplate]);
  const renderMessagePreview = (templateKey) => {
    const content = templates[templateKey];
    const processedContent = content.replace(/<p>/g, '').replace(/<\/p>/g, '\n\n').replace(/<br\s*\/?>/g, '\n');
    return (
      <Paper sx={{
        p: 4,
        mb: 4,
        minHeight: "400px",
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: `0 2px 4px ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        maxWidth: '800px',
        margin: '0 auto',
      }}>
        <Box
          sx={{
            whiteSpace: 'pre-wrap',
            fontFamily: '"Noto Sans Arabic", "Cairo", "Segoe UI", sans-serif !important',
            direction: 'rtl',
            textAlign: 'right',
            lineHeight: 1.6,
            fontSize: '1rem',
            color: theme.palette.text.primary
          }}
        >
          {processedContent}
        </Box>
      </Paper>
    );
  };
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);
  const handleSave = async () => {
    setSaving(true);
    try {
      const currentTemplateKey = activeTab;
      const templateName = templateNameMap[currentTemplateKey];
      const stateKey = getStateKey(currentTemplateKey);
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
  };
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: messageEditorStyles }} />
      <Box sx={{ display: "flex", height: "100vh", bgcolor: theme.palette.background.default }}>
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
                borderBottom: `1px solid ${theme.palette.divider}`,
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
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }}>
                      {activeTab === "repayment-due" && "تذكير استحقاق دفعة"}
                      {activeTab === "repayment-late" && "تذكير تأخير سداد"}
                      {activeTab === "payment-approved" && "موافقة على دفعة"}
                      {activeTab === "payment-rejected" && "رفض دفعة"}
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
                  {activeTab === "repayment-due" && (
                    viewMode === "preview"
                      ? renderMessagePreview("repaymentDue")
                      : <ReactQuillWrapper
                          className="message-editor"
                          theme="snow"
                          value={templates.repaymentDue}
                          onChange={(value) => handleTemplateChange("repaymentDue", value)}
                          placeholder="أدخل نص قالب تذكير استحقاق الدفعة هنا..."
                          style={{ height: "500px", marginBottom: "40px" }}
                        />
                  )}
                  {activeTab === "repayment-late" && (
                    viewMode === "preview"
                      ? renderMessagePreview("repaymentLate")
                      : <ReactQuillWrapper
                          className="message-editor"
                          theme="snow"
                          value={templates.repaymentLate}
                          onChange={(value) => handleTemplateChange("repaymentLate", value)}
                          placeholder="أدخل نص قالب تذكير تأخير السداد هنا..."
                          style={{ height: "500px", marginBottom: "40px" }}
                        />
                  )}
                  {activeTab === "payment-approved" && (
                    viewMode === "preview"
                      ? renderMessagePreview("paymentApproved")
                      : <ReactQuillWrapper
                          className="message-editor"
                          theme="snow"
                          value={templates.paymentApproved}
                          onChange={(value) => handleTemplateChange("paymentApproved", value)}
                          placeholder="أدخل نص قالب موافقة على الدفعة هنا..."
                          style={{ height: "500px", marginBottom: "40px" }}
                        />
                  )}
                  {activeTab === "payment-rejected" && (
                    viewMode === "preview"
                      ? renderMessagePreview("paymentRejected")
                      : <ReactQuillWrapper
                          className="message-editor"
                          theme="snow"
                          value={templates.paymentRejected}
                          onChange={(value) => handleTemplateChange("paymentRejected", value)}
                          placeholder="أدخل نص قالب رفض الدفعة هنا..."
                          style={{ height: "500px", marginBottom: "40px" }}
                        />
                  )}
                </>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
      </Box>
    </>
  );
}