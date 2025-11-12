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
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SaveIcon from "@mui/icons-material/Save";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import RestoreIcon from "@mui/icons-material/Restore";
import ReactQuillWrapper from "../../components/ReactQuillWrapper";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import Api, { handleApiError } from "../../config/Api";
import { Helmet } from "react-helmet-async";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
const DefaultRepaymentDue = () => `
  <p>عزيزي/عزيزتي {{اسم_العميل}}،</p>
  <p>نود تذكيركم بأن قسطكم البالغ {{مبلغ_القسط}} ريال سيكون مستحق الدفع في {{تاريخ_الاستحقاق}}.</p>
  <p>يرجى اتخاذ الإجراءات اللازمة لضمان السداد في الوقت المحدد.</p>
  <p>شكراً لتعاونكم،</p>
  <p>{{اسم_الشركة}}</p>
`;

const DefaultRepaymentLate = () => `
  <p>عزيزي/عزيزتي {{اسم_العميل}}،</p>
  <p>نود إعلامكم بأن قسطكم البالغ {{مبلغ_القسط}} ريال والمستحق في {{تاريخ_الاستحقاق}} أصبح متأخراً.</p>
  <p>الرجاء السداد في أقرب وقت ممكن لتجنب أي رسوم إضافية.</p>
  <p>للاستفسار، يرجى التواصل معنا على {{رقم_الاتصال}}.</p>
  <p>شكراً،</p>
  <p>{{اسم_الشركة}}</p>
`;

const DefaultPaymentApproved = () => `
  <p>عزيزي/عزيزتي {{اسم_العميل}}،</p>
  <p>نود إعلامكم بأن دفعتكم البالغة {{مبلغ_الدفعة}} ريال قد تمت الموافقة عليها بنجاح.</p>
  <p>رقم المرجع: {{رقم_المرجع}}</p>
  <p>تاريخ المعاملة: {{تاريخ_المعاملة}}</p>
  <p>شكراً لتعاونكم،</p>
  <p>{{اسم_الشركة}}</p>
`;

const DefaultPaymentRejected = () => `
  <p>عزيزي/عزيزتي {{اسم_العميل}}،</p>
  <p>نأسف لإعلامكم بأن دفعتكم البالغة {{مبلغ_الدفعة}} ريال قد تم رفضها.</p>
  <p>السبب: {{سبب_الرفض}}</p>
  <p>يرجى التواصل معنا على {{رقم_الاتصال}} لمزيد من المعلومات.</p>
  <p>شكراً،</p>
  <p>{{اسم_الشركة}}</p>
`;

export default function MessagesTemplates() {
  const [activeTab, setActiveTab] = useState("repayment-due");
  const [templates, setTemplates] = useState({
    repaymentDue: "",
    repaymentLate: "",
    paymentApproved: "",
    paymentRejected: "",
  });
  const [templateStyles, setTemplateStyles] = useState({
    repaymentDue: "",
    repaymentLate: "",
    paymentApproved: "",
    paymentRejected: "",
  });
  const [templateVariables, setTemplateVariables] = useState({
    repaymentDue: [],
    repaymentLate: [],
    paymentApproved: [],
    paymentRejected: [],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { permissions } = usePermissions();
  
  // Extract CSS from HTML template
  const extractStyles = (htmlContent) => {
    if (!htmlContent) return "";
    const styleMatch = htmlContent.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    return styleMatch ? styleMatch[1].trim() : "";
  };

  // Extract variables from template content
  const extractVariables = (content) => {
    if (!content) return [];
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const variables = new Set();
    let match;
    
    while ((match = variableRegex.exec(content)) !== null) {
      variables.add(match[1].trim());
    }
    
    return Array.from(variables).map(name => ({
      name: `{{${name}}}`,
      description: getVariableDescription(`{{${name}}}`)
    }));
  };

  // Remove style tags from HTML content
  const removeStylesFromContent = (htmlContent) => {
    if (!htmlContent) return "";
    return htmlContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  };
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


  const getVariableDescription = (variable) => {
    const variableDescriptions = {
      "{{اسم_العميل}}": "اسم العميل",
      "{{اسم_الشركة}}": "اسم الشركة أو المؤسسة",
      "{{رقم_الاتصال}}": "رقم الاتصال أو خدمة العملاء",
      "{{البريد_الإلكتروني}}": "البريد الإلكتروني للشركة",
      "{{الموقع_الإلكتروني}}": "الموقع الإلكتروني للشركة",
      "{{مبلغ_القسط}}": "مبلغ القسط المستحق",
      "{{تاريخ_الاستحقاق}}": "تاريخ استحقاق القسط",
      "{{مبلغ_الدفعة}}": "مبلغ الدفعة المقدمة",
      "{{رقم_المرجع}}": "رقم المرجع أو المعاملة",
      "{{تاريخ_المعاملة}}": "تاريخ إتمام المعاملة",
      "{{سبب_الرفض}}": "سبب رفض الدفعة",
      "{{رقم_العقد}}": "رقم العقد",
      "{{رقم_القسط}}": "رقم القسط",
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
        // Extract styles from content if styles field is empty in API
        const apiStyles = response.data.styles || "";
        const extractedStylesFromContent = extractStyles(response.data.content);
        const finalStyles = (apiStyles && apiStyles.trim() !== "") 
          ? apiStyles 
          : extractedStylesFromContent;
        
        console.log(`Fetched template ${templateName} from API:`, {
          hasApiStyles: !!(apiStyles && apiStyles.trim() !== ""),
          hasContentStyles: !!(extractedStylesFromContent && extractedStylesFromContent.trim() !== ""),
          finalStylesLength: finalStyles?.length || 0
        });
        
        return {
          content: response.data.content,
          styles: finalStyles,
          variables: response.data.variables || []
        };
      } else {
        console.log(`Template ${templateName} found in API but empty, using frontend default`);
        const defaultContent = getDefaultTemplate(templateName);
        return {
          content: defaultContent,
          styles: extractStyles(defaultContent),
          variables: extractVariables(defaultContent)
        };
      }
    } catch {
      console.log(`Template ${templateName} not found in API, using frontend default`);
      const defaultContent = getDefaultTemplate(templateName);
      return {
        content: defaultContent,
        styles: extractStyles(defaultContent),
        variables: extractVariables(defaultContent)
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      
      results.forEach(({ key, content, styles, variables }) => {
        const stateKey = key === "repayment-due" ? "repaymentDue" :
                        key === "repayment-late" ? "repaymentLate" :
                        key === "payment-approved" ? "paymentApproved" :
                        key === "payment-rejected" ? "paymentRejected" :
                        key;
        
        // Extract styles BEFORE removing them from content
        // First try to use styles from API, then try to extract from content, then use empty string
        let finalStyles = "";
        if (styles && styles.trim() !== "") {
          finalStyles = styles;
        } else {
          // Try to extract from content (in case styles are still in content)
          const extractedFromContent = extractStyles(content);
          if (extractedFromContent && extractedFromContent.trim() !== "") {
            finalStyles = extractedFromContent;
          } else {
            // If no styles found, try to get from default template
            const templateName = templateNameMap[key];
            const defaultContent = getDefaultTemplate(templateName);
            const defaultStyles = extractStyles(defaultContent);
            finalStyles = defaultStyles || "";
          }
        }
        
        // Remove styles from content for editing
        const contentWithoutStyles = removeStylesFromContent(content);
        
        console.log(`Loading template ${key}:`, {
          stylesFromAPI: styles,
          extractedFromContent: extractStyles(content),
          finalStyles: finalStyles,
          finalStylesLength: finalStyles?.length || 0
        });
        
        newTemplates[stateKey] = contentWithoutStyles;
        newStyles[stateKey] = finalStyles;
        newVariables[stateKey] = variables && variables.length > 0 ? variables : extractVariables(content);
      });

      setTemplates(newTemplates);
      setTemplateStyles(newStyles);
      setTemplateVariables(newVariables);
    } catch (error) {
      notifyError("خطأ في تحميل القوالب");
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateNameMap, fetchTemplateFromAPI]);

  const VariablesList = ({ variables, onVariablesChange }) => {
    const [newVarName, setNewVarName] = useState("");
    const [newVarDesc, setNewVarDesc] = useState("");
    
    const handleAddVariable = () => {
      if (newVarName.trim() && newVarDesc.trim()) {
        // Convert spaces to underscores and remove {{ }} if present
        let varNameText = newVarName.trim();
        
        // Remove {{ }} if user entered them
        if (varNameText.startsWith("{{") && varNameText.endsWith("}}")) {
          varNameText = varNameText.slice(2, -2).trim();
        }
        
        // Replace spaces with underscores
        varNameText = varNameText.replace(/\s+/g, '_');
        
        // Format as {{variable_name}}
        const varName = `{{${varNameText}}}`;
        
        const updatedVars = [...variables, { name: varName, description: newVarDesc.trim() }];
        onVariablesChange(updatedVars);
        setNewVarName("");
        setNewVarDesc("");
        notifySuccess("تم إضافة المتغير بنجاح");
      }
    };
    
    const handleDeleteVariable = (index) => {
      const updatedVars = variables.filter((_, i) => i !== index);
      onVariablesChange(updatedVars);
      notifySuccess("تم حذف المتغير بنجاح");
    };
    
    return (
      <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#2d3748' }}>
              المتغيرات المتاحة
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
            انقر على أي متغير لنسخه واستخدامه في القالب
          </Typography>
          
          {/* Add new variable */}
          {permissions.includes("templates_Update") && (
            <Box sx={{ mb: 2, p: 2, bgcolor: '#f8f9fc', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                إضافة متغير جديد
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={5}>
                  <TextField
                    size="small"
                    label="اسم المتغير"
                    placeholder="رقم هاتف العميل أو رقم_هاتف_العميل"
                    value={newVarName}
                    onChange={(e) => setNewVarName(e.target.value)}
                    helperText="سيتم تحويل المسافات إلى underscores تلقائياً"
                    sx={{
                      '& .MuiOutlinedInput-root': {
                       width: '300px',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={5}>
                  <TextField
                    fullWidth
                    size="small"
                    label="الوصف"
                    placeholder="اسم العميل"
                    value={newVarDesc}
                    onChange={(e) => setNewVarDesc(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                       width: '300px',
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={handleAddVariable}
                    disabled={!newVarName.trim() || !newVarDesc.trim()}
                    sx={{
                      width: '100px',
                    }}
                  >
                    إضافة
                  </Button>
                </Grid>
              </Grid>
            </Box>
          )}
          
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={1}>
            {variables.map((variable, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Chip
                  label={variable.name}
                  onClick={() => copyToClipboard(variable.name)}
                  onDelete={permissions.includes("templates_Update") ? () => handleDeleteVariable(index) : undefined}
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
            {variables.length === 0 && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                  لا توجد متغيرات. أضف متغيرات جديدة أو سيتم استخراجها تلقائياً من القالب.
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
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
      
      const stateKey = currentTemplateKey === "repayment-due" ? "repaymentDue" :
                      currentTemplateKey === "repayment-late" ? "repaymentLate" :
                      currentTemplateKey === "payment-approved" ? "paymentApproved" :
                      currentTemplateKey === "payment-rejected" ? "paymentRejected" :
                      currentTemplateKey;
      
      const templateContent = templates[stateKey] || "";
      const templateStyle = templateStyles[stateKey] || "";
      const templateVars = templateVariables[stateKey] || [];

      // Merge styles with content inside <style> tags for contract generation
      let finalContent = templateContent;
      
      // Always merge styles if they exist
      if (templateStyle && templateStyle.trim() !== "") {
        // Remove any existing style tags from content first
        finalContent = finalContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
        
        // Add styles at the beginning of content
        finalContent = `<style>\n${templateStyle}\n</style>\n\n${finalContent}`;
      }

      console.log("Saving template:", {
        name: templateName,
        contentLength: templateContent?.length || 0,
        stylesLength: templateStyle?.length || 0,
        finalContentLength: finalContent?.length || 0,
        hasStylesInContent: /<style[^>]*>/i.test(finalContent),
        stylesPreview: templateStyle?.substring(0, 100) || "",
        finalContentPreview: finalContent?.substring(0, 200) || "",
        variablesCount: templateVars?.length || 0
      });

      await Api.post("/api/templates", {
        name: templateName,
        description: `Template for ${templateName} messages`,
        content: finalContent,
        styles: templateStyle || "",
        variables: templateVars || [],
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
    
    // Auto-extract variables when content changes
    const extractedVars = extractVariables(value);
    setTemplateVariables(prev => ({
      ...prev,
      [templateKey]: extractedVars
    }));
  };

  const handleStylesChange = (templateKey, value) => {
    setTemplateStyles(prev => ({
      ...prev,
      [templateKey]: value
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
    
    const contentWithoutStyles = removeStylesFromContent(defaultContent);
    const extractedStyles = extractStyles(defaultContent);
    const extractedVars = extractVariables(defaultContent);
    
    setTemplates(prev => ({
      ...prev,
      [stateKey]: contentWithoutStyles
    }));
    
    setTemplateStyles(prev => ({
      ...prev,
      [stateKey]: extractedStyles
    }));
    
    setTemplateVariables(prev => ({
      ...prev,
      [stateKey]: extractedVars
    }));
    
    notifySuccess("تم إعادة تعيين القالب إلى النسخة الافتراضية");
  };

  // Helper function to render template editor
  const renderTemplateEditor = (tabKey, stateKey, placeholder) => {
    const currentVariables = templateVariables[stateKey] || [];
    const currentStyles = templateStyles[stateKey] || "";
    
    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5" fontWeight="bold">محرر القالب</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            {permissions.includes("templates_Update") && (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<RestoreIcon />}
                onClick={handleResetToDefault}
              >
                إعادة تعيين
              </Button>
            )}
            {permissions.includes("templates_Add") && (
              <Button
                variant="contained"
                color="primary"
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                disabled={saving}
                onClick={handleSave}
              >
                {saving ? 'جاري الحفظ...' : 'حفظ'}
              </Button>
            )}
          </Box>
        </Box>
        <VariablesList 
          variables={currentVariables} 
          onVariablesChange={(vars) => setTemplateVariables(prev => ({ ...prev, [stateKey]: vars }))}
        />
        <Accordion sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight="bold">تعديل CSS</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TextField
              fullWidth
              multiline
              rows={10}
              value={currentStyles}
              onChange={(e) => handleStylesChange(stateKey, e.target.value)}
              placeholder="أدخل CSS هنا..."
              sx={{ fontFamily: 'monospace' }}
            />
          </AccordionDetails>
        </Accordion>
        <ReactQuillWrapper
          theme="snow"
          value={templates[stateKey]}
          onChange={(value) => handleTemplateChange(stateKey, value)}
          placeholder={placeholder}
          style={{ height: "500px", marginBottom: "40px" }}
        />
      </>
    );
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
              <Tab label="تذكير استحقاق قسط" value="repayment-due" />
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
                  {activeTab === "repayment-due" && renderTemplateEditor("repayment-due", "repaymentDue", "أدخل نص قالب تذكير استحقاق القسط هنا...")}
                  {activeTab === "repayment-late" && renderTemplateEditor("repayment-late", "repaymentLate", "أدخل نص قالب تذكير تأخير السداد هنا...")}
                  {activeTab === "payment-approved" && renderTemplateEditor("payment-approved", "paymentApproved", "أدخل نص قالب موافقة على الدفعة هنا...")}
                  {activeTab === "payment-rejected" && renderTemplateEditor("payment-rejected", "paymentRejected", "أدخل نص قالب رفض الدفعة هنا...")}
                </>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}