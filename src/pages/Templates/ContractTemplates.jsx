/**
 * ContractTemplates
 *
 * Administrative interface for managing contract templates.
 * Templates are loaded from trusted component functions and edited by authorized users.
 * Basic validation is applied to prevent template corruption during editing.
 */

import React, { useState, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Button,
  Paper,
  CircularProgress,
  useTheme,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import PreviewIcon from "@mui/icons-material/Preview";
import EditIcon from "@mui/icons-material/Edit";


import RichTextEditor from "../../components/RichTextEditor";
import { isValidTemplate } from "../../utilities/sanitize";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import MudarabahContract from "../../components/Contracts/MudarabahContract";
import PromissoryNote from "../../components/Contracts/PromissoryNote";
import DebtAcknowledgment from "../../components/Contracts/DebtAcknowledgment";
import PaymentVoucher from "../../components/Contracts/PaymentVoucher";
import InstallmentPaymentReceipt from "../../components/Contracts/InstallmentPaymentReceipt";
import InstallmentSettlementReceipt from "../../components/Contracts/InstallmentSettlementReceipt";
import WithdrawReceipt from "../../components/Contracts/WithdrawReceipt";
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
    withdrawalReceipt: "",
  });
  const [templateStyles, setTemplateStyles] = useState({
    mudarabah: "",
    promissoryNote: "",
    debtAcknowledgment: "",
    paymentVoucher: "",
    paymentProof: "",
    settlement: "",
    withdrawalReceipt: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState("preview");
  const { permissions } = usePermissions();
  const theme = useTheme();

  const templateNameMap = React.useMemo(() => ({
    "mudarabah": "MUDARABAH",
    "promissory-note": "PROMISSORY_NOTE",
    "debt-acknowledgment": "DEBT_ACKNOWLEDGMENT",
    "payment-voucher": "PAYMENT_VOUCHER",
    "payment-proof": "PAYMENT_PROOF",
    "settlement": "SETTLEMENT",
    "withdrawal-receipt": "WITHDRAWAL_RECEIPT",
  }), []);






  const getStateKey = (tab) => {
    return tab === "promissory-note" ? "promissoryNote" :
           tab === "debt-acknowledgment" ? "debtAcknowledgment" :
           tab === "payment-voucher" ? "paymentVoucher" :
           tab === "payment-proof" ? "paymentProof" :
           tab === "settlement" ? "settlement" :
           tab === "withdrawal-receipt" ? "withdrawalReceipt" : tab;
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
      case "WITHDRAWAL_RECEIPT":
        return WithdrawReceipt();
      default:
        return "";
    }
  }, []);


  const loadTemplates = React.useCallback(async () => {
    setLoading(true);
    try {
      const newTemplates = {};
      const newStyles = {};

      Object.keys(templateNameMap).forEach((key) => {
        const templateName = templateNameMap[key];
        const stateKey = getStateKey(key);

        newTemplates[stateKey] = getDefaultTemplate(templateName);
        newStyles[stateKey] = "";
      });

      setTemplates(newTemplates);
      setTemplateStyles(newStyles);
    } catch (error) {
      notifyError("خطأ في تحميل القوالب");
      handleApiError(error);
    } finally {
      setLoading(false);
    }
  }, [templateNameMap, getDefaultTemplate]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const currentTemplateKey = activeTab;
      const templateName = templateNameMap[currentTemplateKey];
      const stateKey = getStateKey(currentTemplateKey);
      const templateContent = templates[stateKey];

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





  const getStyledContent = (content, styles) => {
    if (content && !isValidTemplate(content)) {
      console.error('Template content contains potentially dangerous elements');
      return '<div style="color: red; text-align: center; padding: 20px;">القالب يحتوي على محتوى غير آمن</div>';
    }
    
    if (styles && styles.trim() !== "" && !isValidTemplate(`<style>${styles}</style>`)) {
      console.error('Template styles contain potentially dangerous content');
      return content;
    }

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
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: `0 2px 4px ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        maxWidth: '1200px',
        margin: '0 auto',
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
    return (
      <RichTextEditor
        value={templates[templateKey]}
        onChange={(value) => handleTemplateChange(templateKey, value)}
        height="600px"
      />
    );
  };



 

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: theme.palette.background.default }}>
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
              <Tab label="عقد المضاربة" value="mudarabah" />
              <Tab label="سند لأمر" value="promissory-note" />
              <Tab label="إقرار دين وتعهد بالسداد" value="debt-acknowledgment" />
              <Tab label="سند الصرف" value="payment-voucher" />
              <Tab label="سند قبض دفعة" value="payment-proof" />
              <Tab label="تسوية سلفة وخلو طرف" value="settlement" />
              <Tab label="مخالصة مالية نهائية" value="withdrawal-receipt" />
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
                      {activeTab === "mudarabah" && "عقد المضاربة"}
                      {activeTab === "promissory-note" && "سند لأمر"}
                      {activeTab === "debt-acknowledgment" && "إقرار دين وتعهد بالسداد"}
                      {activeTab === "payment-voucher" && "سند الصرف"}
                      {activeTab === "payment-proof" && "سند قبض دفعة"}
                      {activeTab === "settlement" && "إيصال تسوية دفعة"}
                      {activeTab === "withdrawal-receipt" && "مخالصة مالية نهائية"}
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
                  {activeTab === "withdrawal-receipt" && (
                    viewMode === "preview" 
                      ? renderTemplateContent("withdrawalReceipt", "withdrawalReceipt")
                      : renderTemplateEditor("withdrawalReceipt")
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