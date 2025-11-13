import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Paper,
  Stack,
  Tooltip,
  Divider,
  Tabs,
  Tab,
  Autocomplete,
  CircularProgress,
  MenuItem,
  Alert,
  Chip,

} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { debounce } from "lodash";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getClients,
  createLoan,
  getLoanById,
  updateLoan,
  getPartners,
} from "./loanApis";
import { getBanks } from "../Banks/bankApis";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import LoansTable from "../../components/modals/LoansTable";
import AddClient from "../../components/modals/AddClient";
import LoanContractGenerator from "../../components/LoanContractGenerator";
import LoanContractsPreview from "../../components/LoanContractsPreview";
import Api, { handleApiError } from "../../config/Api";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
const Loans = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedKafeel, setSelectedKafeel] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [banksSearchQuery, setBanksSearchQuery] = useState("");
  const [partnersSearchQuery, setPartnersSearchQuery] = useState("");
  const [clientsPage, setClientsPage] = useState(1);
  const [banksPage, setBanksPage] = useState(1);
  const [partnersPage, setPartnersPage] = useState(1);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [loanForm, setLoanForm] = useState({
    amount: "",
    interestRate: "",
    paymentAmount: "",
    type: "",
    startDate: new Date().toISOString().split("T")[0],
    repaymentDay: "",
  });

  const [selectedLoan, setSelectedLoan] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const queryClient = useQueryClient();
  // eslint-disable-next-line no-unused-vars
  const [generateContracts, setGenerateContracts] = useState(true);
  const [savedLoanData, setSavedLoanData] = useState(null);
  const [debtAckTemplate, setDebtAckTemplate] = useState("");
  const [promissoryNoteTemplate, setPromissoryNoteTemplate] = useState("");
  const [contractsGenerated, setContractsGenerated] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContracts, setPreviewContracts] = useState({
    debtAck: "",
    promissoryNote: "",
  });
  const [isCreatingLoan, setIsCreatingLoan] = useState(false);
  const [isAdditionalLoan, setIsAdditionalLoan] = useState(false);
  const { permissions } = usePermissions(); 
  const debtAckGeneratorRef = useRef(null);
  const promissoryNoteGeneratorRef = useRef(null);

  const { data: clientsData, isLoading: isClientsLoading } = useQuery({
    queryKey: ["clients", clientsPage, searchQuery],
    queryFn: () => getClients(clientsPage, searchQuery),
    enabled: activeTab === 1,
    retry: 1,
  });

  const { data: banksData, isLoading: isBanksLoading } = useQuery({
    queryKey: ["banks", banksPage, banksSearchQuery],
    queryFn: () => getBanks(banksPage, banksSearchQuery),
    enabled: activeTab === 1,
    retry: 1,
  });

  const { data: partnersData, isLoading: isPartnersLoading } = useQuery({
    queryKey: ["partners", partnersPage, partnersSearchQuery],
    queryFn: () => getPartners(partnersPage, partnersSearchQuery),
    enabled: activeTab === 1,
    retry: 1,
  });

  useEffect(() => {
    if (activeTab === 1) {
      fetchContractTemplates();
      calculateInstallments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchContractTemplates = async () => {
    try {
      const [debtResponse, promissoryResponse] = await Promise.all([
        Api.get("/api/templates/DEBT_ACKNOWLEDGMENT"),
        Api.get("/api/templates/PROMISSORY_NOTE"),
      ]);
  
      const debtContent = debtResponse.data.content || "";
      const promissoryContent = promissoryResponse.data.content || "";
  
      setDebtAckTemplate(debtContent);
      setPromissoryNoteTemplate(promissoryContent);
  
    } catch (error) {
      handleApiError(error);
    }
  };
  

  useEffect(() => {
    if (activeTab === 1) {
      calculateInstallments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    loanForm.amount,
    loanForm.interestRate,
    loanForm.paymentAmount,
    activeTab,
  ]);

  const debouncedSearch = debounce((value) => {
    setSearchQuery(value);
    setClientsPage(1);
  }, 500);

  const debouncedBanksSearch = debounce((value) => {
    setBanksSearchQuery(value);
    setBanksPage(1);
  }, 500);

  const debouncedPartnersSearch = debounce((value) => {
    setPartnersSearchQuery(value);
    setPartnersPage(1);
  }, 500);

  const handleSearchChange = (event, value) => {
    debouncedSearch(value);
  };

  const handleBanksSearchChange = (event, value) => {
    debouncedBanksSearch(value);
  };

  const handlePartnersSearchChange = (event, value) => {
    debouncedPartnersSearch(value);
  };

  const handleClientSelect = (event, newValue) => {
    setSelectedClient(newValue);
    // Reset kafeel when client changes
    setSelectedKafeel(null);
  };

  const handleKafeelSelect = (event, newValue) => {
    setSelectedKafeel(newValue);
  };

  const handleBankSelect = (event, newValue) => {
    setSelectedBank(newValue);
  };

  const handlePartnerSelect = (event, newValue) => {
    setSelectedPartner(newValue);
  };

  const formatAmount = (amount) => {
    if (!amount) return "";
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleOpenPreview = async () => {
    try {
      if (!selectedClient || !loanForm.amount) {
        notifyError("يرجى ملء بيانات العميل والسلفة أولاً");
        return;
      }

      const previewLoanData = {
        id: `preview-${Date.now()}`,
        amount: parseFloat(loanForm.amount.replace(/,/g, "")),
        paymentAmount: parseFloat(loanForm.paymentAmount.replace(/,/g, "")),
        startDate: loanForm.startDate,
        client: selectedClient.client,
      };

      const debtAckHtml = await debtAckGeneratorRef.current.generateContract(
        false,
        previewLoanData,
        selectedKafeel
      );
      const promissoryNoteHtml =
        await promissoryNoteGeneratorRef.current.generateContract(
          false,
          previewLoanData,
          selectedKafeel
        );

      setPreviewContracts({
        debtAck: debtAckHtml,
        promissoryNote: promissoryNoteHtml,
      });
      setPreviewOpen(true);
    } catch (error) {
      handleApiError(error);
      notifyError("حدث خطأ أثناء توليد معاينة العقود");
    }
  };

  const handleSaveContracts = async (contractType) => {
    try {
      if (!savedLoanData) {
        notifyError("لم يتم إنشاء السلفة بعد. يرجى إنشاء السلفة أولاً");
        return;
      }
  
      if (contractType === "both" || contractType === "debt-acknowledgment") {
        await debtAckGeneratorRef.current?.generatePDF();
      }
      
      if (contractType === "both" || contractType === "promissory-note") {
        await promissoryNoteGeneratorRef.current?.generatePDF();
      }
  
      notifySuccess("تم حفظ العقود بنجاح");
      setSavedLoanData(null);
      setContractsGenerated(0);
      setPreviewContracts({
        debtAck: "",
        promissoryNote: "",
      });
      setPreviewOpen(false);
      setInstallments([]);
      setIsEditMode(false);
      setIsViewMode(false);
      setActiveTab(0);
    } catch (error) {
      handleApiError(error);
      notifyError("حدث خطأ أثناء حفظ العقود");
    }
  };

  const calculateInstallments = () => {
    const amount = parseFloat(loanForm.amount.replace(/,/g, "")) || 0;
    const interestRate = parseFloat(loanForm.interestRate) || 0;
    const paymentAmount = parseFloat(loanForm.paymentAmount.replace(/,/g, "")) || 0;
    const loanType = loanForm.type;

    if (amount > 0 && paymentAmount > 0) {
      const profit = amount * (interestRate / 100);
      const total = amount + profit;
      
      const fullMonths = Math.floor(total / paymentAmount);
      const lastPayment = total - (paymentAmount * fullMonths);
      let months = fullMonths;
      if (lastPayment > 0) months += 1;

      const calculatedInstallments = [];
      let remainingPrincipal = amount;
      let remainingInterest = profit;

      for (let i = 1; i <= months; i++) {
        const dueDate = new Date(loanForm.startDate);
        if (loanType === "DAILY") {
          dueDate.setDate(dueDate.getDate() + i);
        } else if (loanType === "WEEKLY") {
          dueDate.setDate(dueDate.getDate() + i * 7);
        } else {
          dueDate.setMonth(dueDate.getMonth() + i);
          if (loanForm.repaymentDay) {
            dueDate.setDate(parseInt(loanForm.repaymentDay));
          }
        }

        let currentAmount = paymentAmount;
        if (i === months && lastPayment > 0) {
          currentAmount = lastPayment;
        }

        let principalAmount;
        let interestAmount;

        if (i === months && lastPayment > 0) {  
          principalAmount = remainingPrincipal;
          interestAmount = remainingInterest;
        } else {
          const interestRatio = remainingInterest / (remainingPrincipal + remainingInterest);
          interestAmount = parseFloat((currentAmount * interestRatio).toFixed(2));
          principalAmount = parseFloat((currentAmount - interestAmount).toFixed(2));
        }

        remainingPrincipal = parseFloat((remainingPrincipal - principalAmount).toFixed(2));
        remainingInterest = parseFloat((remainingInterest - interestAmount).toFixed(2));

        calculatedInstallments.push({
          installmentNumber: i,
          dueDate: dueDate,
          principal: principalAmount,
          interest: interestAmount,
          installment: currentAmount,
          remainingBalance: parseFloat((total - (i * paymentAmount) + (lastPayment > 0 && i === months ? paymentAmount - lastPayment : 0)).toFixed(2)),
          status: "PENDING",
          paidAmount: 0,
        });
      }

      setInstallments(calculatedInstallments);
    } else {
      setInstallments([]);
    }
  };

  const getSimulationSummary = () => {
    if (installments.length === 0) return null;

    const totalInterest = installments.reduce(
      (sum, inst) => sum + inst.interest,
      0
    );
    const totalAmount =
      (parseFloat(loanForm.amount.replace(/,/g, "")) || 0) + totalInterest;
    const paymentAmount = parseFloat(loanForm.paymentAmount.replace(/,/g, "")) || 0;
    
    const installmentsCount = installments.length;
    let numberOfMonths = installmentsCount;
    const loanType = loanForm.type;
    
    if (loanType === "DAILY") {
      numberOfMonths = Math.ceil(installmentsCount / 30);
    } else if (loanType === "WEEKLY") {
      numberOfMonths = Math.ceil(installmentsCount / 4);
    }


    return {
      paymentAmount,
      totalInterest,
      totalAmount,
      numberOfMonths,
      installmentsCount,
      loanType,
    };
  };

  const handleCreateLoan = async () => {
    if (!selectedClient) {
      notifyError("يرجى اختيار عميل");
      return;
    }
  
    try {
      setIsCreatingLoan(true);
  
      const loanData = {
        clientId: selectedClient.client.id,
        amount: parseFloat(loanForm.amount.replace(/,/g, "")),
        interestRate: parseFloat(loanForm.interestRate),
        paymentAmount: parseFloat(loanForm.paymentAmount.replace(/,/g, "")),
        type: loanForm.type,
        startDate: loanForm.startDate,
        repaymentDay: parseInt(loanForm.repaymentDay),
        bankAccountId: selectedBank?.id || null,
        partnerId: selectedPartner?.id || null,
        kafeelId: selectedKafeel?.id || null,
      };
  
  
      const response = await createLoan(loanData);
      const newLoan = response?.data?.loan || response?.loan;
  
      notifySuccess("تم إنشاء السلفة بنجاح");
  
      setSavedLoanData({
        ...newLoan,
        client: selectedClient.client,
        kafeel: selectedKafeel || null,
      });
      
      queryClient.invalidateQueries(["loans"]);
      
    } catch (error) {
      handleApiError(error);
      notifyError(
        error.response?.data?.message || "حدث خطأ أثناء إنشاء السلفة"
      );
    } finally {
      setIsCreatingLoan(false);
    }
  };

  const handleContractGenerated = (pdfBlob, contractType) => {
    console.log(`Contract generated: ${contractType}`);
    const newCount = contractsGenerated + 1;
    setContractsGenerated(newCount);
  };

  const resetLoanForm = () => {
    setSelectedClient(null);
    setSelectedKafeel(null);
    setSelectedLoan(null);
    setSelectedBank(null);
    setSelectedPartner(null);
    setLoanForm({
      amount: "",
      interestRate: "",
      paymentAmount: "",
      type: "",
      startDate: new Date().toISOString().split("T")[0],
      repaymentDay: "10",
    });
    setInstallments([]);
    setIsEditMode(false);
    setIsViewMode(false);
    setContractsGenerated(0);
    setSavedLoanData(null);
    setIsCreatingLoan(false);
    setIsAdditionalLoan(false);
  };

  const handleUpdateLoan = async () => {
    if (!selectedLoan) {
      notifyError("لا يوجد سلفة محددة للتعديل");
      return;
    }

    try {
      const loanData = {
        amount: parseFloat(loanForm.amount.replace(/,/g, "")),
        interestRate: parseFloat(loanForm.interestRate),
        paymentAmount: parseFloat(loanForm.paymentAmount.replace(/,/g, "")),
        type: loanForm.type,
        startDate: loanForm.startDate,
        repaymentDay: parseInt(loanForm.repaymentDay),
        bankAccountId: selectedBank?.id || null,
        partnerId: selectedPartner?.id || null,
        kafeelId: selectedKafeel?.id || null,
      };

      await updateLoan(selectedLoan.id, loanData);
      notifySuccess("تم تعديل السلفة بنجاح");

      resetLoanForm();
      queryClient.invalidateQueries(["loans"]);
      setActiveTab(0);
    } catch (error) {
      notifyError(
        error.response?.data?.message || "حدث خطأ أثناء تعديل السلفة"
      );
    }
  };

  const handleViewLoanDetails = async (loanId) => {
    try {
      const loan = await getLoanById(loanId);
      setSelectedLoan(loan);
      setIsViewMode(true);
      setIsEditMode(false);

      if (loan.client) {
        // محاولة تحميل بيانات العميل مع kafeels
        try {
          const clientsResponse = await getClients(1, loan.client.nationalId || loan.client.name);
          const fullClientData = clientsResponse?.clients?.find(
            (c) => c.client.id === loan.client.id
          );
          
          if (fullClientData) {
            setSelectedClient(fullClientData);
          } else {
            setSelectedClient({ client: loan.client, kafeels: [] });
          }
        } catch (error) {
          console.error("Error loading client data:", error);
          setSelectedClient({ client: loan.client, kafeels: [] });
        }
      }

      if (loan.bankAccount) {
        setSelectedBank(loan.bankAccount);
      }

      if (loan.partner) {
        setSelectedPartner(loan.partner);
      }

      if (loan.kafeel) {
        setSelectedKafeel(loan.kafeel);
      } else {
        setSelectedKafeel(null);
      }

      const repaymentCount = loan.repayments.length;

      const principalPerInstallment = loan.amount / repaymentCount;
      const interestPerInstallment = loan.interestAmount / repaymentCount;

      let remainingBalance = loan.totalAmount;
      const formattedRepayments = loan.repayments.map((repayment, index) => {
        const currentInstallment = {
          installmentNumber: index + 1,
          dueDate: repayment.dueDate,
          principal: principalPerInstallment,
          interest: interestPerInstallment,
          installment: repayment.amount,
          remainingBalance: Math.max(0, remainingBalance),
          status: repayment.status,
          paidAmount: repayment.paidAmount || 0,
        };

        remainingBalance -= repayment.amount;
        return currentInstallment;
      });

      setInstallments(formattedRepayments);

      setLoanForm({
        amount: loan.amount.toString(),
        interestRate: loan.interestRate.toString(),
        paymentAmount: loan.paymentAmount?.toString() || "",
        type: loan.type,
        startDate: loan.startDate.split("T")[0],
        repaymentDay: loan.repaymentDay?.toString() || "10",
      });

      setActiveTab(1);
    } catch (error) {
      notifyError(
        error.response?.data?.message || "حدث خطأ أثناء تحميل بيانات السلفة"
      );
    }
  };

  // تحديث الدالة لفتح صفحة الأقساط
  const handleViewInstallments = (loan) => {
    navigate(`/installments/${loan.id}`);
  };

  // دالة للتعامل مع السلفة الإضافية
  const handleCreateAdditionalLoan = async (client) => {
    // إعادة تعيين النموذج
    resetLoanForm();
    
    // تحميل بيانات العميل مع kafeels إذا لزم الأمر
    try {
      // البحث عن العميل في البيانات المحملة للحصول على kafeels
      const clientsResponse = await getClients(1, client.nationalId || client.name);
      const fullClientData = clientsResponse?.clients?.find(
        (c) => c.client.id === client.id
      );
      
      if (fullClientData) {
        setSelectedClient(fullClientData);
      } else {
        // إذا لم يتم العثور عليه، استخدم البيانات المتاحة
        setSelectedClient({ client, kafeels: [] });
      }
    } catch (error) {
      console.error("Error loading client data:", error);
      setSelectedClient({ client, kafeels: [] });
    }
    
    setIsAdditionalLoan(true);
    
    // الانتقال لتاب إنشاء السلفة
    setActiveTab(1);
  };

  const handleEditLoan = () => {
    if (selectedLoan.status !== "PENDING") {
      notifyError("يمكن تعديل القروض في حالة 'قيد المراجعة' فقط");
      return;
    }
    setIsEditMode(true);
    setIsViewMode(false);
  };

  const handleInputChange = (field, value) => {
    if (field === "amount" || field === "paymentAmount") {
      const rawValue = value.replace(/,/g, "");
      if (!isNaN(rawValue)) {
        value = formatAmount(rawValue);
      }
    }
    setLoanForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveLoan = () => {
    if (isEditMode) {
      handleUpdateLoan();
    } else {
      handleCreateLoan();
    }
  };

  const simulationSummary = getSimulationSummary();

  const isFormValid = () => {
    return selectedClient && 
           loanForm.amount && 
           loanForm.interestRate && 
           loanForm.paymentAmount && 
           loanForm.repaymentDay && 
           loanForm.type;
  };

  const canEditLoan = selectedLoan && selectedLoan.status === "PENDING";
  const isReadOnlyMode = isViewMode; // في وضع العرض، جميع الحقول تكون غير قابلة للتعديل

  return (
    <Box
      sx={{
        bgcolor: "#f6f6f8",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Helmet>
        <title>السلف</title>
        <meta name="description" content="السلف" />
      </Helmet>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row-reverse",
          flex: 1,
          height: "calc(100vh - 80px)",
          width: "100%",
        }}
      >
        {activeTab === 1 && (
          <Box
            sx={{
              width: "350px",
              borderRight: "1px solid #ddd",
              bgcolor: "#fafafa",
              height: "100%",
              overflowY: "auto",
              flexShrink: 0,
            }}
          >
            <Box
              sx={{ p: 3, borderBottom: "1px solid #ddd", bgcolor: "#fafafa" }}
            >
              <Typography variant="h6" fontWeight="bold" mb={3}>
                محاكاة السلفة
              </Typography>
              {simulationSummary ? (
                <Stack spacing={3}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography color="text.secondary">
                      {simulationSummary.loanType === "DAILY" ? "الدفعة اليومية" : 
                       simulationSummary.loanType === "WEEKLY" ? "الدفعة الأسبوعية" : 
                       "الدفعة الشهرية"}
                    </Typography>
                    <Typography
                      color="#0d40a5"
                      fontWeight="bold"
                      fontSize="20px"
                    >
                      {formatAmount(
                        simulationSummary.paymentAmount.toFixed(2)
                      )}{" "}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography color="text.secondary">
                      {simulationSummary.loanType === "DAILY" ? "عدد الأيام" : 
                       simulationSummary.loanType === "WEEKLY" ? "عدد الأسابيع" : 
                       "عدد الأشهر"}
                    </Typography>
                    <Typography
                      color="#0d40a5"
                      fontWeight="bold"
                      fontSize="18px"
                    >
                      {simulationSummary.installmentsCount}{" "}
                      {simulationSummary.loanType === "DAILY" ? "يوم" : 
                       simulationSummary.loanType === "WEEKLY" ? "أسبوع" : 
                       "شهر"}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography color="text.secondary">
                      إجمالي الفائدة
                    </Typography>
                    <Typography color="#333" fontSize="16px">
                      {formatAmount(simulationSummary.totalInterest.toFixed(2))}{" "}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography color="text.secondary">
                      المبلغ الإجمالي المستحق
                    </Typography>
                    <Typography color="#333" fontSize="16px">
                      {formatAmount(simulationSummary.totalAmount.toFixed(2))}{" "}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography color="text.secondary">حالة السلفة</Typography>
                    <Chip
                      label={
                        isViewMode ? "عرض" : 
                        isEditMode ? "تحت التعديل" : 
                        "جديد"
                      }
                      sx={{
                        backgroundColor: 
                          isViewMode ? "rgba(100, 100, 100, 0.2)" :
                          isEditMode ? "rgba(214, 158, 46, 0.2)" : 
                          "rgba(56, 161, 105, 0.2)",
                        color: 
                          isViewMode ? "#666" :
                          isEditMode ? "#D69E2E" : 
                          "#38A169",
                        fontWeight: "bold",
                      }}
                    />
                  </Box>
                </Stack>
              ) : (
                <Alert severity="info">أدخل بيانات السلفة لعرض المحاكاة</Alert>
              )}
            </Box>

            <Box sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" mb={3}>
                الإجراءات
              </Typography>
              <Stack spacing={2}>
                {!isViewMode && (
                  <Button
                    variant="contained"
                    onClick={handleSaveLoan}
                    disabled={!isFormValid()}
                    sx={{
                      bgcolor: "#0d40a5",
                      height: "48px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      "&:hover": { bgcolor: "rgba(13, 64, 165, 0.9)" },
                    }}
                  >
                    {isEditMode ? "حفظ التعديلات" : "إنشاء السلفة"}
                  </Button>
                )}

                {isViewMode && canEditLoan && (
                  <Button
                    variant="contained"
                    onClick={handleEditLoan}
                    sx={{
                      bgcolor: "primary.main",
                      height: "48px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      "&:hover": { bgcolor: "primary.dark" },
                    }}
                  >
                    تعديل السلفة
                  </Button>
                )}

                <Button
                  variant="outlined"
                  onClick={handleOpenPreview}
                  disabled={!savedLoanData}
                  sx={{
                    borderColor: "#0d40a5",
                    color: "#0d40a5",
                    height: "48px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    "&:hover": { bgcolor: "rgba(13, 64, 165, 0.1)" },
                  }}
                >
                  معاينة العقود
                </Button>
                
                {isEditMode && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setIsEditMode(false);
                      setIsViewMode(true);
                    }}
                    sx={{
                      borderColor: "rgba(255, 0, 0, 0.5)",
                      color: "error.main",
                      height: "48px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      "&:hover": { bgcolor: "rgba(255, 0, 0, 0.1)" },
                    }}
                  >
                    إلغاء التعديل
                  </Button>
                )}
              </Stack>
            </Box>
          </Box>
        )}

        <Box
          sx={{
            flex: 1,
            p: 4,
            bgcolor: "#fff",
            overflowY: "auto",
            width: "100%",
          }}
        >
          <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => {
                  setActiveTab(newValue);
                  if (newValue === 0) {
                    resetLoanForm();
                  }
                }}
              >
                <Tab
                  label="عرض جميع السلف"
                  sx={{
                    fontWeight: "bold",
                    borderBottom:
                      activeTab === 0 ? "3px solid #0d40a5" : "none",
                    color: activeTab === 0 ? "#0d40a5" : "text.secondary",
                  }}
                />
                {permissions.includes("loans_Add") && (
                <Tab
                  label={
                    isViewMode ? "عرض تفاصيل السلفة" : 
                    isEditMode ? "تعديل السلفة" : 
                    isAdditionalLoan ? "إنشاء سلفة إضافية" :
                    "إنشاء سلفة جديدة"
                  }
                  sx={{
                    fontWeight: "bold",
                    borderBottom:
                      activeTab === 1 ? "3px solid #0d40a5" : "none",
                    color: activeTab === 1 ? "#0d40a5" : "text.secondary",
                  }}
                />
                )}
              </Tabs>
            </Box>

            {activeTab === 0 ? (
              <Box
                sx={{ width: "100%", display: "flex", flexDirection: "column" }}
              >
                <LoansTable 
                  onViewDetails={handleViewLoanDetails} 
                  onViewInstallments={handleViewInstallments}
                  onCreateAdditionalLoan={handleCreateAdditionalLoan}
                />
              </Box>
            ) : (
              <Box>
                {permissions.includes("loans_Add") && (
                <Paper
                  sx={{
                    p: 4,
                    mb: 3,
                    borderRadius: 2,
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="#333"
                    mb={3}
                    textAlign="center"
                  >
                    {isAdditionalLoan ? "العميل المحدد للسلفة الإضافية" : "معلومات العميل"}
                  </Typography>
                  <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={12} md={8}>
                      <Autocomplete
                        options={clientsData?.clients || []}
                        getOptionLabel={(option) =>
                          `${option.client.name} - ${option.client.nationalId}`
                        }
                        value={selectedClient}
                        onChange={handleClientSelect}
                        onInputChange={handleSearchChange}
                        loading={isClientsLoading}
                        disabled={isViewMode || isEditMode || isAdditionalLoan}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="اختر عميل حالي"
                            placeholder="ابحث بالاسم أو رقم الهوية"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {isClientsLoading ? (
                                    <CircularProgress
                                      color="inherit"
                                      size={20}
                                    />
                                  ) : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                height: "56px",
                                width: "350px",
                                backgroundColor: (isViewMode || isEditMode || isAdditionalLoan)
                                  ? "#f5f5f5"
                                  : "#f9fafb",
                                "&:hover fieldset": {
                                  borderColor: "#0d40a5",
                                },
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      md={4}
                      sx={{ display: "flex", alignItems: "end" }}
                    >
                      {!isViewMode && !isEditMode && !isAdditionalLoan && (
                        <Button
                          variant="text"
                          sx={{
                            color: "#0d40a5",
                            fontWeight: "bold",
                            fontSize: "14px",
                          }}
                          onClick={() => setIsAddClientOpen(true)}
                        >
                          أو إنشاء عميل جديد
                        </Button>
                      )}
                    </Grid>
                    {selectedClient?.kafeels && selectedClient.kafeels.length > 0 && (
                      <Grid item xs={12} md={8}>
                        <Autocomplete
                          options={selectedClient.kafeels || []}
                          getOptionLabel={(option) =>
                            `${option.name} - ${option.nationalId}`
                          }
                          value={selectedKafeel}
                          onChange={handleKafeelSelect}
                          disabled={isViewMode}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="اختر الكفيل"
                              placeholder="ابحث بالاسم أو رقم الهوية"
                              sx={{
                                "& .MuiOutlinedInput-root": {
                                  height: "56px",
                                  width: "350px",
                                  backgroundColor: isViewMode
                                    ? "#f5f5f5"
                                    : "#f9fafb",
                                  "&:hover fieldset": {
                                    borderColor: "#0d40a5",
                                  },
                                },
                              }}
                            />
                          )}
                        />
                      </Grid>
                    )}
                  </Grid>
                </Paper>
                )}

                {/* Kafeel Information Section - Show when kafeel is selected or exists in view mode */}
                {((!isViewMode && selectedKafeel) || (isViewMode && selectedLoan?.kafeel)) && (
                  <Paper
                    sx={{
                      p: 4,
                      mb: 3,
                      borderRadius: 2,
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#fff",
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="#333"
                      mb={3}
                      textAlign="center"
                    >
                      معلومات الكفيل
                    </Typography>

                    <Grid container spacing={3} justifyContent="center">
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="اسم الكفيل"
                          value={
                            isViewMode 
                              ? selectedLoan?.kafeel?.name || "" 
                              : selectedKafeel?.name || ""
                          }
                          disabled
                          InputLabelProps={{
                            shrink: true,
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              height: "56px",
                              backgroundColor: "#f5f5f5",
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="رقم الهوية"
                          value={
                            isViewMode 
                              ? selectedLoan?.kafeel?.nationalId || "" 
                              : selectedKafeel?.nationalId || ""
                          }
                          disabled
                          InputLabelProps={{
                            shrink: true,
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              height: "56px",
                              backgroundColor: "#f5f5f5",
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="تاريخ الميلاد"
                          value={
                            (() => {
                              const birthDate = isViewMode 
                                ? selectedLoan?.kafeel?.birthDate 
                                : selectedKafeel?.birthDate;
                              return birthDate
                                ? new Date(birthDate).toISOString().split("T")[0]
                                : "";
                            })()
                          }
                          disabled
                          InputLabelProps={{
                            shrink: true,
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              height: "56px",
                              backgroundColor: "#f5f5f5",
                            },
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                {permissions.includes("loans_Add") && (
                <Paper
                  sx={{
                    p: 4,
                    mb: 3,
                    borderRadius: 2,
                    border: "1px solid #e5e7eb",
                    backgroundColor: "#fff",
                  }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="#333"
                    mb={3}
                    textAlign="center"
                  >
                    {isViewMode ? "تفاصيل السلفة" : 
                   isEditMode ? "تعديل تفاصيل السلفة" : 
                   "حدد تفاصيل السلفة"}
                  </Typography>

                  <Grid container spacing={3} justifyContent="center">
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="text"
                        label="مبلغ السلفة"
                        value={formatAmount(loanForm.amount)}
                        onChange={(e) =>
                          handleInputChange("amount", e.target.value)
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                        disabled={isReadOnlyMode}
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "+") e.preventDefault();
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "56px",
                            width: "250px",
                            backgroundColor: isReadOnlyMode ? "#f5f5f5" : "#f9fafb",
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="معدل الفائدة السنوي (%)"
                        value={loanForm.interestRate}
                        onChange={(e) =>
                          handleInputChange("interestRate", e.target.value)
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                        disabled={isReadOnlyMode}
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "+") e.preventDefault();
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "56px",
                            width: "250px",
                            backgroundColor: isReadOnlyMode ? "#f5f5f5" : "#f9fafb",
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="text"
                        label="مبلغ الدفعة الشهرية"
                        value={formatAmount(loanForm.paymentAmount)}
                        onChange={(e) =>
                          handleInputChange("paymentAmount", e.target.value)
                        }
                        InputLabelProps={{
                          shrink: true,
                        }}
                        disabled={isReadOnlyMode}
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "+") e.preventDefault();
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "56px",
                            width: "250px",
                            backgroundColor: isReadOnlyMode ? "#f5f5f5" : "#f9fafb",
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="text"
                        label="نوع السلفة"
                        select
                        value={loanForm.type}
                        onChange={(e) =>
                          handleInputChange("type", e.target.value)
                        }
                        disabled={isReadOnlyMode}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "56px",
                            width: "250px",
                            backgroundColor: isReadOnlyMode ? "#f5f5f5" : "#f9fafb",
                          },
                        }}
                      >
                        <MenuItem value="DAILY">يومي</MenuItem>
                        <MenuItem value="WEEKLY">أسبوعي</MenuItem>
                        <MenuItem value="MONTHLY">شهري</MenuItem>
                      </TextField>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="يوم السداد"
                        value={loanForm.repaymentDay}
                        onChange={(e) =>
                          handleInputChange("repaymentDay", e.target.value)
                        }
                        inputProps={{ min: 1, max: 31 }}
                        disabled={isReadOnlyMode}
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "+") e.preventDefault();
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "56px",
                            width: "250px",
                            backgroundColor: isReadOnlyMode ? "#f5f5f5" : "#f9fafb",
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        options={banksData?.data || []}
                        getOptionLabel={(option) =>
                          `${option.name} - ${option.accountNumber}`
                        }
                        value={selectedBank}
                        onChange={handleBankSelect}
                        onInputChange={handleBanksSearchChange}
                        loading={isBanksLoading}
                        disabled={isReadOnlyMode}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="اختر الحساب البنكي"
                            placeholder="ابحث باسم الحساب أو رقم الحساب"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {isBanksLoading ? (
                                    <CircularProgress
                                      color="inherit"
                                      size={20}
                                    />
                                  ) : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                height: "56px",
                                width: "250px",
                                backgroundColor: isReadOnlyMode ? "#f5f5f5" : "#f9fafb",
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        options={partnersData?.partners || []}
                        getOptionLabel={(option) => option.name}
                        value={selectedPartner}
                        onChange={handlePartnerSelect}
                        onInputChange={handlePartnersSearchChange}
                        loading={isPartnersLoading}
                        disabled={isReadOnlyMode}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="اختر المستثمر"
                            placeholder="ابحث باسم المستثمر"
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {isPartnersLoading ? (
                                    <CircularProgress
                                      color="inherit"
                                      size={20}
                                    />
                                  ) : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                height: "56px",
                                width: "250px",
                                backgroundColor: isReadOnlyMode ? "#f5f5f5" : "#f9fafb",
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Paper>
                )}
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <AddClient
        open={isAddClientOpen}
        onClose={() => setIsAddClientOpen(false)}
        onSuccess={() => {
          setIsAddClientOpen(false);
          queryClient.invalidateQueries(["clients"]);
        }}
      />

{generateContracts && savedLoanData && selectedClient && (
  <>
  <LoanContractGenerator
  ref={debtAckGeneratorRef}
  loanData={savedLoanData}
  clientData={selectedClient?.client}
  kafeelData={selectedKafeel}
  templateContent={debtAckTemplate}
  onContractGenerated={handleContractGenerated}
  contractType="DEBT_ACKNOWLEDGMENT"
  autoGenerate={false}
/>

<LoanContractGenerator
  ref={promissoryNoteGeneratorRef}
  loanData={savedLoanData}
  clientData={selectedClient?.client}
  kafeelData={selectedKafeel}
  templateContent={promissoryNoteTemplate}
  onContractGenerated={handleContractGenerated}
  contractType="PROMISSORY_NOTE"
  autoGenerate={false}
/>

<LoanContractsPreview
  open={previewOpen}
  onClose={() => setPreviewOpen(false)}
  debtAckHtml={previewContracts.debtAck}
  promissoryNoteHtml={previewContracts.promissoryNote}
  onSaveContracts={handleSaveContracts}
  loading={isCreatingLoan}
  clientName={selectedClient?.client?.name}
  loanAmount={parseFloat(loanForm.amount.replace(/,/g, "")) || 0}
/>

        </>
      )}
    </Box>
  );
};

export default Loans;