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
import Api from "../../config/Api";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
const Loans = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedClient, setSelectedClient] = useState(null);
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
    durationMonths: "",
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

  const debtAckGeneratorRef = useRef(null);
  const promissoryNoteGeneratorRef = useRef(null);

  const { data: clientsData, isLoading: isClientsLoading } = useQuery({
    queryKey: ["clients", clientsPage, searchQuery],
    queryFn: () => getClients(clientsPage, searchQuery),
    enabled: activeTab === 1,
  });

  const { data: banksData, isLoading: isBanksLoading } = useQuery({
    queryKey: ["banks", banksPage, banksSearchQuery],
    queryFn: () => getBanks(banksPage, banksSearchQuery),
    enabled: activeTab === 1,
  });

  const { data: partnersData, isLoading: isPartnersLoading } = useQuery({
    queryKey: ["partners", partnersPage, partnersSearchQuery],
    queryFn: () => getPartners(partnersPage, partnersSearchQuery),
    enabled: activeTab === 1,
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
      console.log("Fetching contract templates...");
      const [debtResponse, promissoryResponse] = await Promise.all([
        Api.get("/api/templates/DEBT_ACKNOWLEDGMENT"),
        Api.get("/api/templates/PROMISSORY_NOTE"),
      ]);

      setDebtAckTemplate(debtResponse.data.content || "");
      setPromissoryNoteTemplate(promissoryResponse.data.content || "");

      console.log("Templates fetched successfully");
    } catch (error) {
      console.warn("Could not fetch contract templates:", error);
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
    loanForm.durationMonths,
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
        durationMonths: parseInt(loanForm.durationMonths),
        startDate: loanForm.startDate,
        client: selectedClient.client,
      };

      const debtAckHtml = await debtAckGeneratorRef.current.generateContract(
        false,
        previewLoanData
      );
      const promissoryNoteHtml =
        await promissoryNoteGeneratorRef.current.generateContract(
          false,
          previewLoanData
        );

      setPreviewContracts({
        debtAck: debtAckHtml,
        promissoryNote: promissoryNoteHtml,
      });
      setPreviewOpen(true);
    } catch (error) {
      console.error("Error generating preview:", error);
      notifyError("حدث خطأ أثناء توليد معاينة العقود");
    }
  };

  const handleSaveContracts = async (contractType) => {
    try {
      if (!savedLoanData) {
        notifyError("لم يتم إنشاء السلفة بعد. يرجى إنشاء السلفة أولاً");
        return;
      }
  
      console.log("Saving contracts for loan:", savedLoanData.id);
      
      if (contractType === "both" || contractType === "debt-acknowledgment") {
        console.log("Generating debt acknowledgment...");
        await debtAckGeneratorRef.current?.generatePDF();
      }
      
      if (contractType === "both" || contractType === "promissory-note") {
        console.log("Generating promissory note...");
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
      console.error("Error saving contracts:", error);
      notifyError("حدث خطأ أثناء حفظ العقود");
    }
  };

  const calculateInstallments = () => {
    const amount = parseFloat(loanForm.amount.replace(/,/g, "")) || 0;
    const interestRate = parseFloat(loanForm.interestRate) || 0;
    const durationMonths = parseInt(loanForm.durationMonths) || 0;
    const loanType = loanForm.type;

    if (amount > 0 && durationMonths > 0) {
      const profit = amount * (interestRate / 100);
      const total = amount + profit;

      const repaymentCount =
        loanType === "DAILY"
          ? durationMonths * 30
          : loanType === "WEEKLY"
          ? durationMonths * 4
          : durationMonths;

      const installmentAmount = total / repaymentCount;
      const principalPerInstallment = amount / repaymentCount;
      const interestPerInstallment = profit / repaymentCount;

      const calculatedInstallments = [];
      let remainingBalance = total;

      for (let i = 1; i <= repaymentCount; i++) {
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

        remainingBalance -= installmentAmount;

        calculatedInstallments.push({
          installmentNumber: i,
          dueDate: dueDate,
          principal: principalPerInstallment,
          interest: interestPerInstallment,
          installment: installmentAmount,
          remainingBalance: Math.max(0, remainingBalance),
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
    const monthlyInstallment = installments[0]?.installment || 0;

    return {
      monthlyInstallment,
      totalInterest,
      totalAmount,
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
        durationMonths: parseInt(loanForm.durationMonths),
        type: loanForm.type,
        startDate: loanForm.startDate,
        repaymentDay: parseInt(loanForm.repaymentDay),
        bankAccountId: selectedBank?.id || null,
        partnerId: selectedPartner?.id || null,
      };
  
      console.log("Creating loan with data:", loanData);
  
      const response = await createLoan(loanData);
      const newLoan = response?.data?.loan || response?.loan;
  
      console.log("Loan created successfully:", newLoan);
      notifySuccess("تم إنشاء السلفة بنجاح");
  
      setSavedLoanData({
        ...newLoan,
        client: selectedClient.client,
      });
      
      queryClient.invalidateQueries(["loans"]);
      
    } catch (error) {
      console.error("Error creating loan:", error);
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
    setSelectedLoan(null);
    setSelectedBank(null);
    setSelectedPartner(null);
    setLoanForm({
      amount: "",
      interestRate: "",
      durationMonths: "",
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
        durationMonths: parseInt(loanForm.durationMonths),
        type: loanForm.type,
        startDate: loanForm.startDate,
        repaymentDay: parseInt(loanForm.repaymentDay),
        bankAccountId: selectedBank?.id || null,
        partnerId: selectedPartner?.id || null,
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
        setSelectedClient({ client: loan.client });
      }

      if (loan.bankAccount) {
        setSelectedBank(loan.bankAccount);
      }

      if (loan.partner) {
        setSelectedPartner(loan.partner);
      }

      const repaymentCount =
        loan.type === "DAILY"
          ? loan.durationMonths * 30
          : loan.type === "WEEKLY"
          ? loan.durationMonths * 4
          : loan.durationMonths;

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
        durationMonths: loan.durationMonths.toString(),
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

  const handleEditLoan = () => {
    if (selectedLoan.status !== "PENDING") {
      notifyError("يمكن تعديل القروض في حالة 'قيد المراجعة' فقط");
      return;
    }
    setIsEditMode(true);
    setIsViewMode(false);
  };

  const handleInputChange = (field, value) => {
    if (field === "amount") {
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
           loanForm.durationMonths && 
           loanForm.repaymentDay && 
           loanForm.type;
  };

  const canEditLoan = selectedLoan && selectedLoan.status === "PENDING";
  const isReadOnlyMode = isViewMode && selectedLoan && selectedLoan.status !== "PENDING";

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
                    <Typography color="text.secondary">القسط الشهري</Typography>
                    <Typography
                      color="#0d40a5"
                      fontWeight="bold"
                      fontSize="20px"
                    >
                      {formatAmount(
                        simulationSummary.monthlyInstallment.toFixed(2)
                      )}{" "}
                      ر.س
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
                      ر.س
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
                      ر.س
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
                <Tab
                  label={
                    isViewMode ? "عرض تفاصيل السلفة" : 
                    isEditMode ? "تعديل السلفة" : 
                    "إنشاء سلفة جديدة"
                  }
                  sx={{
                    fontWeight: "bold",
                    borderBottom:
                      activeTab === 1 ? "3px solid #0d40a5" : "none",
                    color: activeTab === 1 ? "#0d40a5" : "text.secondary",
                  }}
                />
              </Tabs>
            </Box>

            {activeTab === 0 ? (
              <Box
                sx={{ width: "100%", display: "flex", flexDirection: "column" }}
              >
                <LoansTable 
                  onViewDetails={handleViewLoanDetails} 
                  onViewInstallments={handleViewInstallments}
                />
              </Box>
            ) : (
              <Box>
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
                    معلومات العميل
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
                        disabled={isViewMode || isEditMode}
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
                                backgroundColor: (isViewMode || isEditMode)
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
                      {!isViewMode && !isEditMode && (
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
                  </Grid>
                </Paper>

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
                            backgroundColor: (isViewMode && !isEditMode) ? "#f5f5f5" : "#f9fafb",
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
                            backgroundColor: (isViewMode && !isEditMode) ? "#f5f5f5" : "#f9fafb",
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="مدة السلفة (بالأشهر)"
                        value={loanForm.durationMonths}
                        onChange={(e) =>
                          handleInputChange("durationMonths", e.target.value)
                        }
                        disabled={isReadOnlyMode}
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "+") e.preventDefault();
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "56px",
                            width: "250px",
                            backgroundColor: (isViewMode && !isEditMode) ? "#f5f5f5" : "#f9fafb",
                          },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        label="عدد الأقساط"
                        value={loanForm.durationMonths}
                        onChange={(e) =>
                          handleInputChange("durationMonths", e.target.value)
                        }
                        disabled={isReadOnlyMode}
                        onKeyDown={(e) => {
                          if (e.key === "-" || e.key === "+") e.preventDefault();
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "56px",
                            width: "250px",
                            backgroundColor: (isViewMode && !isEditMode) ? "#f5f5f5" : "#f9fafb",
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
                            backgroundColor: (isViewMode && !isEditMode) ? "#f5f5f5" : "#f9fafb",
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
                            backgroundColor: (isViewMode && !isEditMode) ? "#f5f5f5" : "#f9fafb",
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
                                backgroundColor: (isViewMode && !isEditMode) ? "#f5f5f5" : "#f9fafb",
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
                                backgroundColor: (isViewMode && !isEditMode) ? "#f5f5f5" : "#f9fafb",
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Paper>
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
            templateContent={debtAckTemplate}
            onContractGenerated={handleContractGenerated}
            contractType="DEBT_ACKNOWLEDGMENT"
            autoGenerate={false}
          />

          <LoanContractGenerator
            ref={promissoryNoteGeneratorRef}
            loanData={savedLoanData}
            clientData={selectedClient?.client}
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