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
  Snackbar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Collapse,
  Stepper,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  InputLabel,
  FormControl,
  Select,
  MenuItem
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import InfoIcon from "@mui/icons-material/Info";
import HelpIcon from "@mui/icons-material/Help";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import PreviewIcon from "@mui/icons-material/Preview";
import EditIcon from "@mui/icons-material/Edit";
import SettingsIcon from "@mui/icons-material/Settings";
import AddIcon from "@mui/icons-material/Add";
import ManageSearchIcon from "@mui/icons-material/ManageSearch";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import WarningIcon from "@mui/icons-material/Warning";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GroupIcon from "@mui/icons-material/Group";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import PersonIcon from "@mui/icons-material/Person";

import CodeMirrorWrapper from "../../components/CodeMirrorWrapper";
import RichTextEditor from "../../components/RichTextEditor";
import TemplateVariablesManager from "../../components/TemplateVariablesManager";
import TemplateGallery from "../../components/TemplateGallery";
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
  const [templateGalleryOpen, setTemplateGalleryOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState("");
  const [editingContent, setEditingContent] = useState("");
  const [editingStyles, setEditingStyles] = useState("");
  const [editMode, setEditMode] = useState("styles");
  const [viewMode, setViewMode] = useState("preview");
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeGuide, setActiveGuide] = useState('template-basics');
  const [showPreviewExample, setShowPreviewExample] = useState(false);
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
    "receipt-voucher": [
      { key: "{{رقم_السند}}", description: "رقم سند القبض", group: "بيانات السند" },
      { key: "{{اسم_المستلم}}", description: "اسم الشخص المستلم للمبلغ", group: "بيانات الأطراف" },
      { key: "{{هوية_المستلم}}", description: "رقم هوية المستلم", group: "بيانات الأطراف" },
      { key: "{{المبلغ_رقما}}", description: "المبلغ المستلم بالأرقام", group: "البيانات المالية" },
      { key: "{{المبلغ_كتابة}}", description: "المبلغ المستلم مكتوباً بالحروف", group: "البيانات المالية" },
      { key: "{{سبب_الاستلام}}", description: "سبب استلام المبلغ", group: "بيانات السند" },
      { key: "{{التاريخ_الهجري}}", description: "التاريخ بالتقويم الهجري", group: "التواريخ" },
      { key: "{{التاريخ_الميلادي}}", description: "التاريخ بالتقويم الميلادي", group: "التواريخ" },
      { key: "{{اسم_المسلم}}", description: "اسم الشخص المسلم للمبلغ", group: "بيانات الأطراف" },
    ],
    "payment-voucher": [
      { key: "{{رقم_السند}}", description: "رقم سند الصرف", group: "بيانات السند" },
      { key: "{{اسم_المستلم}}", description: "اسم الشخص المستلم للمبلغ", group: "بيانات الأطراف" },
      { key: "{{هوية_المستلم}}", description: "رقم هوية المستلم", group: "بيانات الأطراف" },
      { key: "{{المبلغ_رقما}}", description: "المبلغ المصروف بالأرقام", group: "البيانات المالية" },
      { key: "{{المبلغ_كتابة}}", description: "المبلغ المصروف مكتوباً بالحروف", group: "البيانات المالية" },
      { key: "{{سبب_الصرف}}", description: "سبب صرف المبلغ", group: "بيانات السند" },
      { key: "{{طريقة_الصرف}}", description: "طريقة الصرف (نقداً، شيك، تحويل)", group: "بيانات السند" },
      { key: "{{التاريخ_الميلادي}}", description: "التاريخ بالتقويم الميلادي", group: "التواريخ" },
      { key: "{{اسم_المسلم}}", description: "اسم الشخص المسلم للمبلغ", group: "بيانات الأطراف" },
      { key: "{{ملاحظات}}", description: "ملاحظات إضافية", group: "بيانات السند" },
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

  // Quick Guide Component
  const QuickGuide = () => (
    <Paper sx={{ p: 3, mb: 3, bgcolor: '#f8f9fa', border: '1px solid #e9ecef' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <InfoIcon color="primary" sx={{ mt: 0.5 }} />
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ color: '#2d3748', fontWeight: 'bold' }}>
            🚀 طريقة استخدام القوالب - شرح مبسط
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                <ContentCopyIcon color="action" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">المتغيرات</Typography>
                  <Typography variant="body2" color="textSecondary">
                    استخدم المتغيرات مثل {`{{اسم_العميل}}`} لملء البيانات تلقائيًا
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                <EditIcon color="action" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">زر التحرير</Typography>
                  <Typography variant="body2" color="textSecondary">
                    اضغط لبدء تعديل النص والمحتوى
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 2 }}>
                <PreviewIcon color="action" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">زر المعاينة</Typography>
                  <Typography variant="body2" color="textSecondary">
                    اضغط لمشاهدة الشكل النهائي للقالب
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <SettingsIcon color="action" sx={{ mt: 0.5 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold">تنسيق CSS</Typography>
                  <Typography variant="body2" color="textSecondary">
                    اضغط لتعديل الشكل والمظهر فقط
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>
        <IconButton size="small" onClick={() => setActiveGuide(null)}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
    </Paper>
  );

  // Contextual Guide Component
  const ContextualGuide = ({ section, isOpen, onClose }) => {
    const guideContent = {
      "template-basics": {
        title: "أساسيات القالب",
        content: "هنا يمكنك تعديل المحتوى الأساسي للقالب. استخدم المتغيرات مثل {{اسم_العميل}} لتعبئة البيانات تلقائياً."
      },
      "variables": {
        title: "المتغيرات الديناميكية",
        content: "المتغيرات تستبدل تلقائياً بالبيانات الفعلية. انقر على أي متغير لنسخه ثم الصقه في المحرر."
      },
      "styling": {
        title: "التنسيق والإعدادات",
        content: "يمكنك تخصيص مظهر القالب باستخدام CSS. غير الألوان، الخطوط، والمسافات لتناسب احتياجاتك."
      }
    };

    const content = guideContent[section];
    if (!content) return null;

    return (
      <Collapse in={isOpen}>
        <Paper sx={{ 
          p: 2, 
          mb: 2, 
          bgcolor: 'info.light',
          border: '1px solid',
          borderColor: 'info.main'
        }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                💡 {content.title}
              </Typography>
              <Typography variant="body2">
                {content.content}
              </Typography>
            </Box>
            <IconButton size="small" onClick={onClose} sx={{ mt: -1, mr: -1 }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      </Collapse>
    );
  };

  // Grouped Variables Component
  const GroupedVariablesList = ({ variables, onManageVariables, onCopyVariable }) => {
    const filteredVariables = variables.filter(variable => 
      variable.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      variable.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const groupedVariables = filteredVariables.reduce((groups, variable) => {
      const group = variable.group || "أخرى";
      if (!groups[group]) groups[group] = [];
      groups[group].push(variable);
      return groups;
    }, {});

    const getGroupIcon = (groupName) => {
      switch (groupName) {
        case "بيانات الأطراف": return <PersonIcon sx={{ fontSize: 16 }} />;
        case "البيانات المالية": return <AttachMoneyIcon sx={{ fontSize: 16 }} />;
        case "التواريخ": return <CalendarTodayIcon sx={{ fontSize: 16 }} />;
        default: return <GroupIcon sx={{ fontSize: 16 }} />;
      }
    };

    return (
      <Card sx={{ mb: 3, border: '1px solid #e5e7eb' }}>
        <CardContent>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
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
            </Box>
          </Box>

          {/* Search Box */}
          <TextField
            fullWidth
            placeholder="ابحث في المتغيرات... (اسم، وصف، تاريخ، مبلغ)"
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
            <Typography variant="caption" sx={{ mb: 2, display: 'block' }}>
              {filteredVariables.length} متغير وجد
            </Typography>
          )}

          <Divider sx={{ mb: 2 }} />

          {/* Grouped Variables */}
          {Object.keys(groupedVariables).map(groupName => (
            <Accordion key={groupName} defaultExpanded sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {getGroupIcon(groupName)}
                  <Typography variant="subtitle1" fontWeight="bold">
                    {groupName}
                  </Typography>
                  <Chip label={groupedVariables[groupName].length} size="small" />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Grid container spacing={1}>
                  {groupedVariables[groupName].map((variable, index) => {
                    // Display variable name without brackets for easier editing
                    const displayName = variable.key.replace(/\{\{|\}\}/g, '');
                    return (
                      <Grid item xs={12} sm={6} key={index}>
                        <Tooltip title={`اضغط للنسخ: ${variable.description}`} arrow>
                          <Chip
                            label={displayName}
                            onClick={() => onCopyVariable(variable.key)}
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
                          />
                        </Tooltip>
                        {variable.description && (
                          <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}>
                            {variable.description}
                          </Typography>
                        )}
                      </Grid>
                    );
                  })}
                </Grid>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>
    );
  };

  // Copy Full Template Function
  const copyFullTemplate = () => {
    const stateKey = getStateKey(activeTab);
    const content = templates[stateKey];
    navigator.clipboard.writeText(content).then(() => {
      setCopySuccess(true);
      notifySuccess('تم نسخ القالب كاملاً');
    });
  };

  // Get State Key Helper
  const getStateKey = (tab) => {
    return tab === "promissory-note" ? "promissoryNote" :
           tab === "debt-acknowledgment" ? "debtAcknowledgment" :
           tab === "receipt-voucher" ? "receiptVoucher" :
           tab === "payment-voucher" ? "paymentVoucher" :
           tab === "payment-proof" ? "paymentProof" :
           tab === "settlement" ? "settlement" : tab;
  };

  // Process content to ensure variables have {{ }} brackets when saving
  const ensureVariableBrackets = (content) => {
    if (!content) return content;
    
    // Get all variable names from the current variables list
    const stateKey = getStateKey(activeTab);
    const allVariables = dynamicVariables[stateKey] || [];
    const variableNames = allVariables.map(v => {
      // Extract variable name without brackets
      const match = v.key.match(/\{\{([^}]+)\}\}/);
      return match ? match[1] : v.key.replace(/[{}]/g, '');
    });

    let processedContent = content;
    
    // Process each variable name
    variableNames.forEach(varName => {
      // Escape special regex characters
      const escapedVarName = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Create a regex that matches the variable name when it's NOT already wrapped in {{ }}
      // We want to match: variable name that's not preceded by {{ and not followed by }}
      // But we need to avoid matching inside HTML tags
      const regex = new RegExp(`(?!\\{\\{)${escapedVarName}(?!\\}\\})`, 'g');
      
      processedContent = processedContent.replace(regex, (match, offset) => {
        // Get context around the match
        const before = processedContent.substring(Math.max(0, offset - 20), offset);
        const after = processedContent.substring(offset + match.length, offset + match.length + 20);
        
        // Don't wrap if it's already wrapped (check nearby context)
        if (before.includes('{{') || after.includes('}}')) {
          return match;
        }
        
        // Don't wrap if inside HTML tag (check if we're between < and >)
        const beforeTag = processedContent.substring(Math.max(0, offset - 100), offset);
        const afterTag = processedContent.substring(offset + match.length, offset + match.length + 100);
        
        // Check if we're inside an HTML tag
        const lastOpenTag = beforeTag.lastIndexOf('<');
        const lastCloseTag = beforeTag.lastIndexOf('>');
        const nextCloseTag = afterTag.indexOf('>');
        const nextOpenTag = afterTag.indexOf('<');
        
        // If we're between < and > (inside a tag), don't wrap
        if (lastOpenTag > lastCloseTag && nextCloseTag !== -1 && (nextCloseTag < nextOpenTag || nextOpenTag === -1)) {
          return match;
        }
        
        // Wrap the variable
        return `{{${match}}}`;
      });
    });

    return processedContent;
  };

  // Copy Variable Function - strip brackets for easier editing
  const copyToClipboard = (text) => {
    // Remove {{ }} brackets for easier editing
    const variableName = text.replace(/\{\{|\}\}/g, '');
    navigator.clipboard.writeText(variableName).then(() => {
      notifySuccess('تم نسخ المتغير:', variableName);
    });
  };

  // Rest of your existing functions (loadTemplates, handleSave, etc.)
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

  const handleEditTemplate = () => {
    const currentTemplateKey = activeTab;
    const stateKey = getStateKey(currentTemplateKey);
    
    setEditingTemplate(currentTemplateKey);
    setEditingContent(templates[stateKey]);
    setEditingStyles(templateStyles[stateKey] || "");
    setEditMode("styles");
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setEditingTemplate("");
    setEditingContent("");
    setEditingStyles("");
  };

  const handleSaveEdit = () => {
    const stateKey = getStateKey(editingTemplate);

    setTemplateStyles(prev => ({
      ...prev,
      [stateKey]: editingStyles
    }));

    notifySuccess("تم تحديث التنسيق بنجاح");
    handleCloseEditModal();
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

  // Preview with realistic data
  const getPreviewContent = (content) => {
    if (!showPreviewExample) return content;
    
    const demoValues = {
      "{{اسم_العميل}}": "أحمد محمد",
      "{{رقم_هوية_العميل}}": "1234567890",
      "{{المبلغ_رقما}}": "50,000",
      "{{المبلغ_كتابة}}": "خمسون ألف ريال",
      "{{التاريخ_الهجري}}": "15/03/1445",
      "{{التاريخ_الميلادي}}": "01/10/2023",
      "{{اسم_الدائن}}": "شركة التمويل المثالية",
      "{{رقم_السند}}": "SN-2023-001",
    };

    let previewContent = content;
    Object.entries(demoValues).forEach(([key, value]) => {
      previewContent = previewContent.replace(new RegExp(key, 'g'), value);
    });

    return previewContent;
  };

  const renderTemplateContent = (templateKey, stylesKey) => {
    const content = templates[templateKey];
    const styles = templateStyles[stylesKey];
    const previewContent = getPreviewContent(content);
    
    return (
      <Paper sx={{ 
        p: 4, 
        mb: 4, 
        minHeight: "600px", 
        bgcolor: 'white',
        border: '1px solid #e0e0e0',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxWidth: '210mm', // A4 width
        margin: '0 auto',
        background: 'linear-gradient(45deg, #fafafa 25%, transparent 25%), linear-gradient(-45deg, #fafafa 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #fafafa 75%), linear-gradient(-45deg, transparent 75%, #fafafa 75%)',
        backgroundSize: '20px 20px',
        backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
      }}>
        <Box
          dangerouslySetInnerHTML={{ __html: getStyledContent(previewContent, styles) }}
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
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Tooltip title="نسخ القالب كاملاً للنسخ الاحتياطي">
            <Button
              variant="outlined"
              startIcon={<FileCopyIcon />}
              onClick={copyFullTemplate}
              size="small"
            >
              نسخ القالب كاملاً
            </Button>
          </Tooltip>
        </Box>
        <RichTextEditor
          value={templates[templateKey]}
          onChange={(value) => handleTemplateChange(templateKey, value)}
          variables={variablesWithoutBrackets}
          height="600px"
        />
      </Box>
    );
  };

  // Sidebar Component
  const ManagementSidebar = () => (
    <Drawer
      anchor="right"
      open={sidebarOpen}
      onClose={() => setSidebarOpen(false)}
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          p: 2
        }
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">إدارة القالب</Typography>
        <IconButton onClick={() => setSidebarOpen(false)}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* CSS Management */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>تنسيق CSS</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            تنسيق الشكل والمظهر فقط
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleEditTemplate}
          >
            فتح محرر CSS
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* Variables Management */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>إدارة المتغيرات</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            إضافة، تعديل، أو حذف المتغيرات
          </Typography>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setManageVariablesOpen(true)}
          >
            فتح مدير المتغيرات
          </Button>
        </AccordionDetails>
      </Accordion>

      {/* Preview Options */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>خيارات المعاينة</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <FormControl fullWidth>
            <InputLabel>نمط المعاينة</InputLabel>
            <Select
              value={showPreviewExample ? 'demo' : 'original'}
              onChange={(e) => setShowPreviewExample(e.target.value === 'demo')}
              label="نمط المعاينة"
            >
              <MenuItem value="original">المتغيرات كما هي</MenuItem>
              <MenuItem value="demo">بيانات تجريبية</MenuItem>
            </Select>
          </FormControl>
        </AccordionDetails>
      </Accordion>
    </Drawer>
  );

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
            {/* Quick Guide */}
            {activeGuide && <QuickGuide />}

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
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2d3748' }}>
                      {activeTab === "mudarabah" && "عقد المضاربة"}
                      {activeTab === "promissory-note" && "سند لأمر"}
                      {activeTab === "debt-acknowledgment" && "إقرار دين وتعهد بالسداد"}
                      {activeTab === "receipt-voucher" && "سند القبض"}
                      {activeTab === "payment-voucher" && "سند الصرف"}
                      {activeTab === "payment-proof" && "إيصال سداد دفعة"}
                      {activeTab === "settlement" && "إيصال تسوية دفعة"}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                      {permissions.includes('templates_Update') && (
                        <Button
                          variant="contained"
                          color="success"
                          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon sx={{marginLeft:'10px'}} />}
                          disabled={saving}
                          sx={{ 
                            fontWeight: "bold",
                            fontSize: '1rem'
                          }}
                          onClick={handleSave}
                        >
                          {saving ? 'جاري الحفظ...' : ' حفظ القالب'}
                        </Button>
                      )}
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
                        startIcon={<SettingsIcon sx={{marginLeft:'10px'}} />}
                        onClick={() => setSidebarOpen(true)}
                      >
                        الإدارة
                      </Button>
                      )}
                    </Box>
                  </Box>

                  <ContextualGuide 
                    section="variables" 
                    isOpen={activeGuide === 'variables'}
                    onClose={() => setActiveGuide(null)}
                  />

                  <GroupedVariablesList 
                    variables={getCurrentVariables()} 
                    onManageVariables={() => setManageVariablesOpen(true)}
                    onCopyVariable={copyToClipboard}
                  />

                  <ContextualGuide 
                    section="template-basics" 
                    isOpen={activeGuide === 'template-basics' && viewMode === 'edit'}
                    onClose={() => setActiveGuide(null)}
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

      {/* Management Sidebar */}
      <ManagementSidebar />

      {/* Edit Template Modal */}
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
          <Tabs 
            value={editMode} 
            onChange={(e, val) => setEditMode(val)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="التنسيق (CSS)" value="styles" />
            <Tab label="معاينة" value="preview" />
          </Tabs>

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
          {permissions.includes('templates_Update') && (
          <Button 
            onClick={handleSaveEdit} 
            variant="contained" 
            color="primary"
          >
            حفظ التغييرات
          </Button>
          )}
        </DialogActions>
      </Dialog>

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

      {/* Template Gallery */}
      <TemplateGallery
        open={templateGalleryOpen}
        onClose={() => setTemplateGalleryOpen(false)}
        onSelectTemplate={(templateContent) => {
          const stateKey = getStateKey(activeTab);
          handleTemplateChange(stateKey, templateContent);
          setTemplateGalleryOpen(false);
          notifySuccess('تم تحميل القالب بنجاح');
        }}
        currentTemplateType={activeTab}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmation />

      {/* Copy Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        message="تم نسخ القالب كاملاً"
      />

      {/* Help Button */}
      <Button 
        startIcon={<HelpIcon />}
        onClick={() => setActiveGuide(activeGuide ? null : 'template-basics')}
        sx={{ 
          position: 'fixed', 
          bottom: 20, 
          left: 20, 
          zIndex: 1000,
          bgcolor: 'primary.main',
          boxShadow: 2,
          color: 'white'
        }}
        variant="contained"
        size="small"
      >
        مساعدة
      </Button>
    </Box>
  );
}