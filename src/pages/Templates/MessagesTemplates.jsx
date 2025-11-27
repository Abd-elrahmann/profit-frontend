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
import PreviewIcon from "@mui/icons-material/Preview";
import EditIcon from "@mui/icons-material/Edit";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import CloseIcon from "@mui/icons-material/Close";
import RestoreIcon from "@mui/icons-material/Restore";
import WarningIcon from "@mui/icons-material/Warning";
import SearchIcon from "@mui/icons-material/Search";
import ReactQuillWrapper from "../../components/ReactQuillWrapper";
import TemplateVariablesManager from "../../components/TemplateVariablesManager";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import Api, { handleApiError } from "../../config/Api";
import { Helmet } from "react-helmet-async";
import { usePermissions } from "../../components/Contexts/PermissionsContext";

// CSS لتخصيص ReactQuill ليبدو مثل المعاينة
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
  const [dynamicVariables, setDynamicVariables] = useState({
    repaymentDue: [],
    repaymentLate: [],
    paymentApproved: [],
    paymentRejected: [],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [manageVariablesOpen, setManageVariablesOpen] = useState(false);
  const [viewMode, setViewMode] = useState("preview");
  const [searchTerm, setSearchTerm] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const { permissions } = usePermissions();

  const defaultMessageVariables = React.useMemo(() => ({
    "repayment-due": [
      { key: "{{اسم_العميل}}", description: "اسم العميل", group: "بيانات العميل" },
      { key: "{{اسم_الشركة}}", description: "اسم الشركة أو المؤسسة", group: "بيانات الشركة" },
      { key: "{{مبلغ_الدفعة}}", description: "مبلغ الدفعة المستحق", group: "البيانات المالية" },
      { key: "{{تاريخ_الاستحقاق}}", description: "تاريخ استحقاق الدفعة", group: "التواريخ" },
      { key: "{{رقم_الاتصال}}", description: "رقم الاتصال أو خدمة العملاء", group: "بيانات الاتصال" },
    ],
    "repayment-late": [
      { key: "{{اسم_العميل}}", description: "اسم العميل", group: "بيانات العميل" },
      { key: "{{اسم_الشركة}}", description: "اسم الشركة أو المؤسسة", group: "بيانات الشركة" },
      { key: "{{مبلغ_الدفعة}}", description: "مبلغ الدفعة المستحق", group: "البيانات المالية" },
      { key: "{{تاريخ_الاستحقاق}}", description: "تاريخ استحقاق الدفعة", group: "التواريخ" },
      { key: "{{رقم_الاتصال}}", description: "رقم الاتصال أو خدمة العملاء", group: "بيانات الاتصال" },
      { key: "{{عدد_أيام_التأخير}}", description: "عدد أيام التأخير", group: "بيانات التأخير" },
      { key: "{{الغرامات_المستحقة}}", description: "قيمة الغرامات المستحقة", group: "البيانات المالية" },
    ],
    "payment-approved": [
      { key: "{{اسم_العميل}}", description: "اسم العميل", group: "بيانات العميل" },
      { key: "{{اسم_الشركة}}", description: "اسم الشركة أو المؤسسة", group: "بيانات الشركة" },
      { key: "{{مبلغ_الدفعة}}", description: "مبلغ الدفعة المدفوع", group: "البيانات المالية" },
      { key: "{{رقم_المرجع}}", description: "رقم المرجع أو المعاملة", group: "بيانات المعاملة" },
      { key: "{{تاريخ_المعاملة}}", description: "تاريخ إتمام المعاملة", group: "التواريخ" },
    ],
    "payment-rejected": [
      { key: "{{اسم_العميل}}", description: "اسم العميل", group: "بيانات العميل" },
      { key: "{{اسم_الشركة}}", description: "اسم الشركة أو المؤسسة", group: "بيانات الشركة" },
      { key: "{{مبلغ_الدفعة}}", description: "مبلغ الدفعة المرفوضة", group: "البيانات المالية" },
      { key: "{{سبب_الرفض}}", description: "سبب رفض الدفعة", group: "بيانات المعاملة" },
      { key: "{{رقم_الاتصال}}", description: "رقم الاتصال أو خدمة العملاء", group: "بيانات الاتصال" },
    ],
  }), []);

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


  const fetchTemplateFromAPI = React.useCallback(async (templateName) => {
    try {
      const response = await Api.get(`/api/templates/${templateName}/with-variables`);
      if (response.data.content && response.data.content.trim() !== "") {
        return {
          content: response.data.content,
          variables: response.data.variables || [],
        };
      } else {
        return {
          content: getDefaultTemplate(templateName),
          variables: [],
        };
      }
    } catch {
      return {
        content: getDefaultTemplate(templateName),
        variables: [],
      };
    }
  }, [getDefaultTemplate]);

  const getStateKey = (tab) => {
    return tab === "repayment-due" ? "repaymentDue" :
           tab === "repayment-late" ? "repaymentLate" :
           tab === "payment-approved" ? "paymentApproved" :
           tab === "payment-rejected" ? "paymentRejected" : tab;
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
      const newVariables = {};

      results.forEach(({ key, content, variables: dynamicVars }) => {
        const stateKey = getStateKey(key);

        newTemplates[stateKey] = content;

        const defaultVars = defaultMessageVariables[key] || [];
        const dynamicVariablesList = dynamicVars || [];
        newVariables[stateKey] = [...defaultVars, ...dynamicVariablesList];
      });

      setTemplates(newTemplates);
      setDynamicVariables(newVariables);
    } catch (error) {
      notifyError("خطأ في تحميل القوالب");
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [templateNameMap, fetchTemplateFromAPI, defaultMessageVariables]);

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
          قد يسبب ذلك أخطاء في الرسائل الموجودة التي تستخدم هذا المتغير.
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

  const renderMessagePreview = (templateKey) => {
    const content = templates[templateKey];
    const processedContent = content.replace(/<p>/g, '').replace(/<\/p>/g, '\n\n').replace(/<br\s*\/?>/g, '\n');

    return (
      <Paper sx={{
        p: 4,
        mb: 4,
        minHeight: "400px",
        bgcolor: 'white',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '800px',
        margin: '0 auto',
        background: 'linear-gradient(45deg, #fafafa 25%, transparent 25%), linear-gradient(-45deg, #fafafa 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #fafafa 75%), linear-gradient(-45deg, transparent 75%, #fafafa 75%)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
      }}>
        <Box
          sx={{
            whiteSpace: 'pre-wrap',
            fontFamily: '"Noto Sans Arabic", "Cairo", "Segoe UI", sans-serif !important',
            direction: 'rtl',
            textAlign: 'right',
            lineHeight: 1.6,
            fontSize: '1rem',
            color: '#333'
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
      let templateContent = templates[stateKey];

      // Ensure all variables have {{ }} brackets before saving
      templateContent = ensureVariableBrackets(templateContent);

      await Api.post("/api/templates", {
        name: templateName,
        description: `Template for ${templateName} messages`,
        content: templateContent,
      });

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

  const handleResetToDefault = () => {
    const currentTemplateKey = activeTab;
    const templateName = templateNameMap[currentTemplateKey];
    const defaultContent = getDefaultTemplate(templateName);
    const stateKey = getStateKey(currentTemplateKey);

    setTemplates(prev => ({
      ...prev,
      [stateKey]: defaultContent
    }));

    const defaultVars = defaultMessageVariables[currentTemplateKey] || [];
    setDynamicVariables(prev => ({
      ...prev,
      [stateKey]: defaultVars
    }));

    notifySuccess("تم إعادة تعيين القالب إلى النسخة الافتراضية");
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: messageEditorStyles }} />
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
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
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
                          variant="outlined"
                          color="secondary"
                          startIcon={<RestoreIcon sx={{marginLeft:'10px'}} />}
                          onClick={handleResetToDefault}
                          sx={{ mr: 1 }}
                        >
                          إعادة تعيين
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
    </>
  );
}