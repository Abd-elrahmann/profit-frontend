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
  const [templateVariables, setTemplateVariables] = useState({
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
      description: `متغير ${name}`
    }));
  };

  // Remove style tags from HTML content
  const removeStylesFromContent = (htmlContent) => {
    if (!htmlContent) return "";
    return htmlContent.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  };
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

 
  // Get default template content
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

  // Fetch template by name from API
  const fetchTemplateFromAPI = React.useCallback(async (templateName) => {
    try {
      const response = await Api.get(`/api/templates/${templateName}`);
      // If API returns content, use it, otherwise use default frontend template
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
  }, [getDefaultTemplate]);

  // Copy variable to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      notifySuccess('تم نسخ المتغير:', text);
    });
  };

  // Load all templates from API
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
        // Map tab keys to template state keys
        const stateKey = key === "promissory-note" ? "promissoryNote" :
                        key === "debt-acknowledgment" ? "debtAcknowledgment" :
                        key === "receipt-voucher" ? "receiptVoucher" :
                        key === "payment-voucher" ? "paymentVoucher" :
                        key === "payment-proof" ? "paymentProof" :
                        key === "settlement" ? "settlement" :
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
  }, [templateNameMap, fetchTemplateFromAPI, getDefaultTemplate]);

  // Render variables list component
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
                    fullWidth
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
                startIcon={<RestoreIcon sx={{marginLeft: '10px'}} />}
                onClick={handleResetToDefault}
              >
                إعادة تعيين
              </Button>
            )}
            {permissions.includes("templates_Add") && (
              <Button
                variant="contained"
                color="primary"
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon sx={{marginLeft: '10px'}} />}
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
          style={{ height: "600px", marginBottom: "40px" }}
        />
      </>
    );
  };

  // Initialize templates by loading from API
  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save current active template
      const currentTemplateKey = activeTab;
      const templateName = templateNameMap[currentTemplateKey];
      
      // Get the content for the current template
      const stateKey = currentTemplateKey === "promissory-note" ? "promissoryNote" :
                      currentTemplateKey === "debt-acknowledgment" ? "debtAcknowledgment" :
                      currentTemplateKey === "receipt-voucher" ? "receiptVoucher" :
                      currentTemplateKey === "payment-voucher" ? "paymentVoucher" :
                      currentTemplateKey === "payment-proof" ? "paymentProof" :
                      currentTemplateKey === "settlement" ? "settlement" :
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
        description: `Template for ${templateName} agreements`,
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
    
    // Get the content for the current template
    const stateKey = currentTemplateKey === "promissory-note" ? "promissoryNote" :
                    currentTemplateKey === "debt-acknowledgment" ? "debtAcknowledgment" :
                    currentTemplateKey === "receipt-voucher" ? "receiptVoucher" :
                    currentTemplateKey === "payment-voucher" ? "paymentVoucher" :
                    currentTemplateKey === "payment-proof" ? "paymentProof" :
                    currentTemplateKey === "settlement" ? "settlement" :
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

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Helmet>
        <title>القوالب المالية</title>
        <meta name="description" content="القوالب المالية" />
      </Helmet>
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
              <Tab label="إيصال سداد قسط" value="payment-proof" />
              <Tab label="إيصال تسوية قسط" value="settlement" />
            </Tabs>

            {/* Content */}
            <Box sx={{ mt: 3 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
                  <CircularProgress size={40} />
                  <Typography sx={{ ml: 2 }}>جاري تحميل القوالب...</Typography>
                </Box>
              ) : (
                <>
              {activeTab === "mudarabah" && renderTemplateEditor("mudarabah", "mudarabah", "أدخل نص قالب عقد المضاربة هنا...")}
              {activeTab === "promissory-note" && renderTemplateEditor("promissory-note", "promissoryNote", "أدخل نص قالب سند لأمر هنا...")}
              {activeTab === "debt-acknowledgment" && renderTemplateEditor("debt-acknowledgment", "debtAcknowledgment", "أدخل نص قالب إقرار دين وتعهد بالسداد هنا...")}
              {activeTab === "receipt-voucher" && renderTemplateEditor("receipt-voucher", "receiptVoucher", "أدخل نص قالب سند القبض هنا...")}
              {activeTab === "payment-voucher" && renderTemplateEditor("payment-voucher", "paymentVoucher", "أدخل نص قالب سند الصرف هنا...")}
              {activeTab === "payment-proof" && renderTemplateEditor("payment-proof", "paymentProof", "أدخل نص قالب إيصال سداد قسط هنا...")}
              {activeTab === "settlement" && renderTemplateEditor("settlement", "settlement", "أدخل نص قالب إيصال تسوية قسط هنا...")}
                </>
              )}
            </Box>

          
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}