import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Paper,
  Stack,
  Divider,
  Tabs,
  Tab,
  Autocomplete,
  CircularProgress,
  MenuItem,
  Alert,
  Chip,
  useMediaQuery,
} from "@mui/material";
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
import { notifySuccess, notifyError, notifyWarning } from "../../utilities/toastify";
import LoansTable from "../../components/modals/LoansTable";
import AddClient from "../../components/modals/AddClient";
import AddAdditionalKafeel from "../../components/modals/AddAdditionalKafeel";
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
  const [isAddKafeelOpen, setIsAddKafeelOpen] = useState(false);
  const [loanForm, setLoanForm] = useState({
    amount: "",
    totalInterest: "",
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
  const [_isCreatingLoan, setIsCreatingLoan] = useState(false);
  const [isSavingContracts, setIsSavingContracts] = useState(false);
  const [isAdditionalLoan, setIsAdditionalLoan] = useState(false);
  const [bankBalance, setBankBalance] = useState(null);
  const [isLoadingBankBalance, setIsLoadingBankBalance] = useState(false);
  const { permissions } = usePermissions();
  const debtAckGeneratorRef = useRef(null);
  const promissoryNoteGeneratorRef = useRef(null);
  const interestWarningTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (interestWarningTimeoutRef.current) {
        clearTimeout(interestWarningTimeoutRef.current);
      }
    };
  }, []);

  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;

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
    fetchContractTemplates(); 
    if (activeTab === 1) {
      calculateInstallments();
      fetchBankBalance();
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
    loanForm.totalInterest,
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
    setSelectedKafeel(null);
  };

  const handleKafeelSelect = (event, newValue) => {
    setSelectedKafeel(newValue);
  };

  const refreshSelectedClientData = async () => {
    if (!selectedClient?.client?.id) return;
    try {
      const clientsResponse = await getClients(
        1,
        selectedClient.client.nationalId || selectedClient.client.name
      );
      const updatedClient = clientsResponse?.clients?.find(
        (c) => c.client.id === selectedClient.client.id
      );
      if (updatedClient) {
        setSelectedClient(updatedClient);
      }
    } catch (error) {
      console.error("Error refreshing client data:", error);
    }
  };

  const handleBankSelect = async (event, newValue) => {
    setSelectedBank(newValue);
    await fetchBankBalance();
  };

  const fetchBankBalance = async () => {
    try {
      setIsLoadingBankBalance(true);
      const response = await Api.get("/api/accounts/bank");
      const balance = response?.data?.account?.balance || 0;
      setBankBalance(balance);
    } catch (error) {
      handleApiError(error);
      setBankBalance(null);
    } finally {
      setIsLoadingBankBalance(false);
    }
  };

  const handlePartnerSelect = (event, newValue) => {
    setSelectedPartner(newValue);
  };

  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return "";
    const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, "")) : amount;
    if (isNaN(numAmount)) return "";
    const rounded = parseFloat(numAmount.toFixed(2));
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleOpenPreview = async () => {
    try {
      const loanDataToUse = savedLoanData || {
        id: `preview-${Date.now()}`,
        amount: parseFloat(loanForm.amount.replace(/,/g, "")),
        paymentAmount: parseFloat(loanForm.paymentAmount.replace(/,/g, "")),
        startDate: loanForm.startDate,
      };

      const clientDataToUse = savedLoanData?.client || selectedClient?.client;

      if (!clientDataToUse || !loanDataToUse.amount) {
        notifyError("يرجى ملء بيانات العميل والسلفة أولاً");
        return;
      }

      if (!debtAckTemplate || !promissoryNoteTemplate) {
        notifyError("جاري تحميل قوالب العقود، يرجى المحاولة مرة أخرى");
        return;
      }

      const previewLoanData = {
        ...loanDataToUse,
        client: clientDataToUse,
        partner: loanDataToUse.partner || selectedPartner,
        kafeel: loanDataToUse.kafeel || selectedKafeel,
      };

      if (!debtAckGeneratorRef.current || !promissoryNoteGeneratorRef.current) {
        notifyError("مولدات العقود غير جاهزة بعد، يرجى المحاولة مرة أخرى");
        return;
      }

      const debtAckHtml = await debtAckGeneratorRef.current.generateContract(
        false,
        previewLoanData,
        selectedKafeel || savedLoanData?.kafeel
      );
      const promissoryNoteHtml =
        await promissoryNoteGeneratorRef.current.generateContract(
          false,
          previewLoanData,
          selectedKafeel || savedLoanData?.kafeel
        );

      setPreviewContracts({
        debtAck: debtAckHtml,
        promissoryNote: promissoryNoteHtml,
      });
      setPreviewOpen(true);
    } catch (error) {
      handleApiError(error);
      notifyError(
        error.response?.data?.message || "حدث خطأ أثناء توليد معاينة العقود"
      );
    }
  };

  const handleSaveContracts = async (contractType) => {
    try {
      setIsSavingContracts(true);
      
      if (!savedLoanData) {
        notifyError("لم يتم إنشاء السلفة بعد. يرجى إنشاء السلفة أولاً");
        return;
      }

      if (contractType === "both" || contractType === "debt-acknowledgment") {
        const debtAckHtml = await debtAckGeneratorRef.current?.generateContract(false, savedLoanData, savedLoanData?.kafeel, true);
        await debtAckGeneratorRef.current?.generatePDF(debtAckHtml);
      }

      if (contractType === "both" || contractType === "promissory-note") {
        const promissoryNoteHtml = await promissoryNoteGeneratorRef.current?.generateContract(false, savedLoanData, savedLoanData?.kafeel, true);
        await promissoryNoteGeneratorRef.current?.generatePDF(promissoryNoteHtml);
      }

      notifySuccess("تم حفظ العقود بنجاح");
      
      setSavedLoanData(null);
      setContractsGenerated(0);
      setPreviewContracts({
        debtAck: "",
        promissoryNote: "",
      });
      setPreviewOpen(false);
      
      setLoanForm({
        amount: "",
        totalInterest: "",
        interestRate: "",
        paymentAmount: "",
        type: "",
        startDate: new Date().toISOString().split("T")[0],
        repaymentDay: "",
      });
      
      setSelectedClient(null);
      setSelectedKafeel(null);
      setSelectedBank(null);
      setSelectedPartner(null);
      setSelectedLoan(null);
      
      setInstallments([]);
      setIsEditMode(false);
      setIsViewMode(false);
      setActiveTab(0);
    } catch (error) {
      handleApiError(error);
      notifyError(error.response?.data?.message || "حدث خطأ أثناء حفظ العقود");
    } finally {
      setIsSavingContracts(false);
    }
  };

  const calculateInstallments = () => {
    const amount = parseFloat(loanForm.amount.replace(/,/g, "")) || 0;
    const totalInterest = parseFloat(loanForm.totalInterest.replace(/,/g, "")) || 0;
    const paymentAmount =
      parseFloat(loanForm.paymentAmount.replace(/,/g, "")) || 0;
    const loanType = loanForm.type;

    if (amount > 0 && paymentAmount > 0 && totalInterest > 0) {
      const profit = totalInterest;
      const total = amount + profit;

      const fullMonths = Math.floor(total / paymentAmount);
      const lastPayment = total - paymentAmount * fullMonths;
      const months = fullMonths;
      const hasRemainder = lastPayment > 0;

      const calculatedInstallments = [];
      let remainingPrincipal = amount;
      let remainingInterest = profit;
      let totalPaidSoFar = 0;

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
        if (i === months && hasRemainder) {
          currentAmount = paymentAmount + lastPayment;
        }

        let principalAmount;
        let interestAmount;

        if (i === months && hasRemainder) {
          principalAmount = remainingPrincipal;
          interestAmount = remainingInterest;
        } else {
          const interestRatio =
            remainingInterest / (remainingPrincipal + remainingInterest);
          interestAmount = parseFloat(
            (currentAmount * interestRatio).toFixed(2)
          );
          principalAmount = parseFloat(
            (currentAmount - interestAmount).toFixed(2)
          );
        }

        remainingPrincipal = parseFloat(
          (remainingPrincipal - principalAmount).toFixed(2)
        );
        remainingInterest = parseFloat(
          (remainingInterest - interestAmount).toFixed(2)
        );

        totalPaidSoFar += currentAmount;
        const remainingBalance = Math.max(0, parseFloat((total - totalPaidSoFar).toFixed(2)));

        calculatedInstallments.push({
          installmentNumber: i,
          dueDate: dueDate,
          principal: principalAmount,
          interest: interestAmount,
          installment: currentAmount,
          remainingBalance: remainingBalance,
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
    const paymentAmount =
      parseFloat(loanForm.paymentAmount.replace(/,/g, "")) || 0;

    const installmentsCount = installments.length;
    const loanType = loanForm.type;

    const getPluralForm = (count, singular, plural) => {
      return count === 1 ? singular : plural;
    };

    let approximateMonths = installmentsCount;
    let durationLabel = "عدد الأشهر";
    let durationText = `${installmentsCount} ${getPluralForm(installmentsCount, 'شهر', 'أشهر')}`;

    if (loanType === "DAILY") {
      approximateMonths = Math.ceil(installmentsCount / 30);
      durationLabel = "عدد الأيام";
      durationText = `${installmentsCount} ${getPluralForm(installmentsCount, 'يوم', 'أيام')} (≈ ${approximateMonths} ${getPluralForm(approximateMonths, 'شهر', 'أشهر')})`;
    } else if (loanType === "WEEKLY") {
      approximateMonths = Math.ceil(installmentsCount / 4);
      durationLabel = "عدد الأسابيع";
      durationText = `${installmentsCount} ${getPluralForm(installmentsCount, 'أسبوع', 'أسابيع')} (≈ ${approximateMonths} ${getPluralForm(approximateMonths, 'شهر', 'أشهر')})`;
    }

    return {
      paymentAmount,
      totalInterest,
      totalAmount,
      numberOfMonths: approximateMonths,
      installmentsCount,
      loanType,
      durationLabel,
      durationText,
    };
  };

  const handleCreateLoan = async () => {
    if (!selectedClient) {
      notifyError("يرجى اختيار عميل");
      return;
    }

    if (!selectedPartner) {
      notifyError("يرجى اختيار المستثمر");
      return;
    }

    if (bankBalance !== null) {
      const loanAmount = parseFloat(loanForm.amount.replace(/,/g, ""));
      if (loanAmount > bankBalance) {
        notifyError(
          `المبلغ المدخل (${formatAmount(
            loanAmount.toFixed(2)
          )}) يتجاوز رصيد الصندوق المتاح (${formatAmount(
            bankBalance.toFixed(2)
          )})`
        );
        return;
      }
    }

    try {
      setIsCreatingLoan(true);

      const loanData = {
        clientId: selectedClient.client.id,
        amount: parseFloat(loanForm.amount.replace(/,/g, "")),
        TotalInterest: parseFloat(loanForm.totalInterest.replace(/,/g, "")),
        InterestPercentage: parseFloat(loanForm.interestRate),
        paymentAmount: parseFloat(loanForm.paymentAmount.replace(/,/g, "")),
        type: loanForm.type,
        startDate: loanForm.startDate || undefined,
        repaymentDay: parseInt(loanForm.repaymentDay),
        bankAccountId: selectedBank?.id || null,
        partnerId: selectedPartner?.id || null,
        kafeelId: selectedKafeel?.id ?? selectedLoan?.kafeel?.id ?? null,
      };

      const response = await createLoan(loanData);
      const newLoan = response?.data?.loan || response?.loan;

      notifySuccess("تم إنشاء السلفة بنجاح");

      const finalPartner = selectedPartner || newLoan.partner;

      setSavedLoanData({
        ...newLoan,
        partner: finalPartner,
        client: selectedClient.client,
        kafeel: selectedKafeel || null,
      });

      queryClient.invalidateQueries(["loans"]);
      
      await handleOpenPreview();
    } catch (error) {
      handleApiError(error);
      notifyError(
        error.response?.data?.message || "حدث خطأ أثناء إنشاء السلفة"
      );
    } finally {
      setIsCreatingLoan(false);
    }
  };

  const handleContractGenerated = () => {
    const newCount = contractsGenerated + 1;
    setContractsGenerated(newCount);
  };

  const resetLoanForm = () => {
    setSelectedClient(null);
    setSelectedKafeel(null);
    setSelectedLoan(null);
    setSelectedBank(null);
    setSelectedPartner(null);
    setBankBalance(null);
    setLoanForm({
      amount: "",
      totalInterest: "",
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
        TotalInterest: parseFloat(loanForm.totalInterest.replace(/,/g, "")),
        InterestPercentage: parseFloat(loanForm.interestRate),
        paymentAmount: parseFloat(loanForm.paymentAmount.replace(/,/g, "")),
        type: loanForm.type,
        startDate: loanForm.startDate || undefined,
        repaymentDay: parseInt(loanForm.repaymentDay),
        bankAccountId: selectedBank?.id || null,
        partnerId: selectedPartner?.id || null,
        kafeelId: selectedKafeel?.id ?? selectedLoan?.kafeel?.id ?? null,
      };

      const oldAmount = selectedLoan.amount;
      const newAmount = loanData.amount;
      const amountChanged = oldAmount !== newAmount;

      await updateLoan(selectedLoan.id, loanData);
      notifySuccess("تم تعديل السلفة بنجاح");

      if (amountChanged) {
        const updatedLoan = await getLoanById(selectedLoan.id);

        setSavedLoanData({
          ...updatedLoan,
          client: selectedClient?.client || updatedLoan.client,
          kafeel: selectedKafeel || updatedLoan.kafeel || null,
        });

        try {
          const previewLoanData = {
            id: updatedLoan.id,
            amount: newAmount,
            paymentAmount: loanData.paymentAmount,
            startDate: loanData.startDate,
            client: selectedClient?.client || updatedLoan.client,
          };

          const debtAckHtml =
            await debtAckGeneratorRef.current.generateContract(
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
          console.error("Error generating preview contracts:", error);
          notifyError("تم تحديث السلفة لكن حدث خطأ أثناء توليد معاينة العقود");
        }
      }

      queryClient.invalidateQueries(["loans"]);
      setIsEditMode(false);
      setIsViewMode(false);
    } catch (error) {
      handleApiError(error);
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
        try {
          const clientsResponse = await getClients(
            1,
            loan.client.nationalId || loan.client.name
          );
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
        await fetchBankBalance();
      } else {
        setSelectedBank(null);
        setBankBalance(null);
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

      const totalInterestAmount = loan.interestAmount || 0;
      const formattedTotalInterest = parseFloat(totalInterestAmount.toFixed(2));

      setLoanForm({
        amount: loan.amount.toString(),
        totalInterest: formattedTotalInterest.toString(),
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

  const handleViewInstallments = (loan) => {
    navigate(`/installments/${loan.id}`);
  };

  const handleCreateAdditionalLoan = async (client) => {
    resetLoanForm();

    try {
      const clientsResponse = await getClients(
        1,
        client.nationalId || client.name
      );
      const fullClientData = clientsResponse?.clients?.find(
        (c) => c.client.id === client.id
      );

      if (fullClientData) {
        setSelectedClient(fullClientData);
      } else {
        setSelectedClient({ client, kafeels: [] });
      }
    } catch (error) {
      console.error("Error loading client data:", error);
      setSelectedClient({ client, kafeels: [] });
    }

    setIsAdditionalLoan(true);

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
    if (field === "amount" || field === "paymentAmount" || field === "totalInterest") {
      const rawValue = value.replace(/,/g, "");
      if (!isNaN(rawValue)) {
        value = formatAmount(rawValue);

        if (field === "amount" && bankBalance !== null) {
          const numericAmount = parseFloat(rawValue);
          if (numericAmount > bankBalance) {
            notifyError(
              `المبلغ المدخل (${formatAmount(
                numericAmount.toFixed(2)
              )}) يتجاوز رصيد الصندوق المتاح (${formatAmount(
                bankBalance.toFixed(2)
              )})`
            );
          }
        }
      }
    }

    setLoanForm((prev) => {
      const updatedForm = {
        ...prev,
        [field]: value,
      };
      
      if (field === "amount" || field === "totalInterest") {
        const amount = parseFloat((field === "amount" ? value : prev.amount).replace(/,/g, "")) || 0;
        const totalInterest = parseFloat((field === "totalInterest" ? value : prev.totalInterest).replace(/,/g, "")) || 0;

        if (amount > 0 && totalInterest > 0) {
          const percentage = (totalInterest / amount) * 100;
          updatedForm.interestRate = percentage.toFixed(2);

          if (interestWarningTimeoutRef.current) {
            clearTimeout(interestWarningTimeoutRef.current);
          }
          interestWarningTimeoutRef.current = setTimeout(() => {
            if (totalInterest > amount) {
              notifyWarning("مبلغ الفائدة أكبر من مبلغ رأس المال المدخل");
            }
          }, 600);
        } else if (amount > 0) {
          updatedForm.interestRate = "";
        }
      }

      return updatedForm;
    });
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
    return (
      selectedClient &&
      loanForm.amount &&
      loanForm.totalInterest &&
      loanForm.interestRate &&
      loanForm.paymentAmount &&
      loanForm.repaymentDay &&
      loanForm.type
    );
  };

  const canEditLoan = selectedLoan && selectedLoan.status === "PENDING";
  const isReadOnlyMode = isViewMode;

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
          flexDirection: isSmallScreen ? "column" : "row-reverse",
          flex: 1,
          height: isSmallScreen ? "auto" : "calc(100vh - 80px)",
          width: "100%",
        }}
      >
        {activeTab === 1 && !isSmallScreen && (
          <Box
            sx={{
              width: isTablet ? "300px" : "350px",
              borderRight: "1px solid #ddd",
              bgcolor: "#fafafa",
              height: "100%",
              overflowY: "auto",
              flexShrink: 0,
            }}
          >
            <Box
              sx={{
                p: isTablet ? 2 : 3,
                borderBottom: "1px solid #ddd",
                bgcolor: "#fafafa",
              }}
            >
              <Typography
                variant={isTablet ? "subtitle1" : "h6"}
                fontWeight="bold"
                mb={isTablet ? 2 : 3}
              >
                محاكاة السلفة
              </Typography>
              {simulationSummary && loanForm.type ? (
                <Stack spacing={3}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Typography color="text.secondary">
                      {simulationSummary.loanType === "DAILY"
                        ? "عدد الأيام"
                        : simulationSummary.loanType === "WEEKLY"
                        ? "عدد الأسابيع"
                        : "عدد الأشهر"}
                    </Typography>
                    <Typography
                      color="primary.main"
                      fontWeight="bold"
                      fontSize="20px"
                    >
                      {simulationSummary.durationText}
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
                        isViewMode ? "عرض" : isEditMode ? "تحت التعديل" : "جديد"
                      }
                      sx={{
                        backgroundColor: isViewMode
                          ? "rgba(100, 100, 100, 0.2)"
                          : isEditMode
                          ? "rgba(214, 158, 46, 0.2)"
                          : "rgba(56, 161, 105, 0.2)",
                        color: isViewMode
                          ? "#666"
                          : isEditMode
                          ? "#D69E2E"
                          : "#38A169",
                        fontWeight: "bold",
                      }}
                    />
                  </Box>
                </Stack>
              ) : (
                <Alert severity="info">أدخل بيانات السلفة لعرض المحاكاة</Alert>
              )}
            </Box>

            <Box sx={{ p: isTablet ? 2 : 3 }}>
              <Typography
                variant={isTablet ? "subtitle1" : "h6"}
                fontWeight="bold"
                mb={isTablet ? 2 : 3}
              >
                الإجراءات
              </Typography>
              <Stack spacing={2}>
                {/* Alert for active loans that cannot be edited */}
                {isViewMode && selectedLoan?.status === "ACTIVE" && (
                  <Alert
                    severity="warning"
                    sx={{ mb: 2 }}
                    action={
                      <Button
                        color="inherit"
                        size="small"
                        onClick={() => navigate('/installments/' + selectedLoan.id)}
                        sx={{ fontWeight: "bold" }}
                      >
                        عرض الأقساط
                      </Button>
                    }
                  >
                    لا يمكنك تعديل هذه السلفة لأنها في حالة نشطة. للتعديل يجب إلغاء تفعيل السلفة أولاً.
                  </Alert>
                )}

                {!isViewMode && (
                  <Button
                    variant="contained"
                    onClick={handleSaveLoan}
                    disabled={!isFormValid()}
                    sx={{
                      bgcolor: "primary.main",
                      height: isTablet ? "44px" : "48px",
                      fontSize: isTablet ? "14px" : "16px",
                      fontWeight: "bold",
                      "&:hover": { bgcolor: "primary.dark" },
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
                      height: isTablet ? "44px" : "48px",
                      fontSize: isTablet ? "14px" : "16px",
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
                    borderColor: "primary.main",
                    color: "primary.main",
                    height: isTablet ? "44px" : "48px",
                    fontSize: isTablet ? "14px" : "16px",
                    fontWeight: "bold",
                    "&:hover": { bgcolor: "rgba(25, 118, 210, 0.1)" },
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
                      height: isTablet ? "44px" : "48px",
                      fontSize: isTablet ? "14px" : "16px",
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
            p: isSmallScreen ? 2 : 4,
            bgcolor: "#fff",
            overflowY: "auto",
            width: "100%",
          }}
        >
          <Box sx={{ width: "100%" }}>
            <Box
              sx={{
                borderBottom: 1,
                borderColor: "divider",
                mb: isSmallScreen ? 2 : 4,
              }}
            >
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => {
                  setActiveTab(newValue);
                  if (newValue === 0) {
                    resetLoanForm();
                  }
                }}
                variant={isSmallScreen ? "scrollable" : "standard"}
                scrollButtons={isSmallScreen ? "auto" : false}
                sx={{
                  "& .MuiTab-root": {
                    fontSize: isSmallScreen ? "0.875rem" : "1rem",
                    minWidth: isSmallScreen ? "auto" : 72,
                    padding: isSmallScreen ? "12px 8px" : "12px 16px",
                  },
                }}
              >
                <Tab
                  label="عرض جميع السلف"
                  sx={{
                    fontWeight: "bold",
                    borderBottom:
                      activeTab === 0 ? "3px solid" : "none",
                    borderBottomColor: activeTab === 0 ? "primary.main" : "transparent",
                    color: activeTab === 0 ? "primary.main" : "black",
                  }}
                />
                {permissions.includes("loans_Add") && (
                  <Tab
                    label={
                      isViewMode
                        ? "عرض تفاصيل السلفة"
                        : isEditMode
                        ? "تعديل السلفة"
                        : isAdditionalLoan
                        ? "إنشاء سلفة إضافية"
                        : "إنشاء سلفة جديدة"
                    }
                    sx={{
                      fontWeight: "bold",
                      borderBottom:
                        activeTab === 1 ? "3px solid" : "none",
                      borderBottomColor: activeTab === 1 ? "primary.main" : "transparent",
                      color: activeTab === 1 ? "primary.main" : "black",
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
                      p: isSmallScreen ? 2 : 4,
                      mb: isSmallScreen ? 2 : 3,
                      borderRadius: 2,
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <Typography
                      variant={isSmallScreen ? "subtitle1" : "h6"}
                      fontWeight="bold"
                      color="#333"
                      mb={isSmallScreen ? 2 : 3}
                      textAlign="center"
                    >
                      {isAdditionalLoan
                        ? "العميل المحدد للسلفة الإضافية"
                        : "معلومات العميل"}
                    </Typography>
                    <Grid
                      container
                      spacing={isSmallScreen ? 2 : 3}
                      justifyContent="center"
                    >
                      <Grid item xs={12} sm={10} md={8}>
                        <Autocomplete
                          options={clientsData?.clients || []}
                          getOptionLabel={(option) =>
                            `${option.client.name} - ${option.client.nationalId}`
                          }
                          value={selectedClient}
                          onChange={handleClientSelect}
                          onInputChange={handleSearchChange}
                          loading={isClientsLoading}
                          disabled={
                            isViewMode || isEditMode || isAdditionalLoan
                          }
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
                                  width: isSmallScreen ? "250px" : "350px",
                                  backgroundColor:
                                    isViewMode || isEditMode || isAdditionalLoan
                                      ? "#f5f5f5"
                                      : "#f9fafb",
                                  "&:hover fieldset": {
                                    borderColor: "primary.main",
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
                        sm={10}
                        md={4}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: isSmallScreen
                            ? "center"
                            : "flex-start",
                          gap: 1.5,
                        }}
                      >
                        {!isViewMode &&
                          !isEditMode &&
                          !isAdditionalLoan &&
                          !selectedClient && (
                          <Button
                            variant="outlined"
                            sx={{
                              color: "primary.main",
                              borderColor: "primary.main",
                              fontWeight: "bold",
                              fontSize: isSmallScreen ? "12px" : "14px",
                              whiteSpace: "nowrap",
                            }}
                            onClick={() => setIsAddClientOpen(true)}
                          >
                            إنشاء عميل جديد
                          </Button>
                        )}
                        {selectedClient &&
                          (!selectedClient.kafeels ||
                            selectedClient.kafeels.length === 0) &&
                          !isViewMode && (
                            <Button
                              variant="outlined"
                              onClick={() => setIsAddKafeelOpen(true)}
                              sx={{
                                color: "primary.main",
                                borderColor: "primary.main",
                                fontWeight: "bold",
                                fontSize: isSmallScreen ? "12px" : "14px",
                                whiteSpace: "nowrap",
                              }}
                            >
                              إضافة كفيل جديد
                            </Button>
                          )}
                      </Grid>
                      {selectedClient?.kafeels &&
                        selectedClient.kafeels.length > 0 && (
                          <Grid item xs={12} sm={10} md={8}>
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
                                      width: isSmallScreen ? "250px" : "350px",
                                      backgroundColor: isViewMode
                                        ? "#f5f5f5"
                                        : "#f9fafb",
                                      "&:hover fieldset": {
                                        borderColor: "primary.main",
                                      },
                                    },
                                  }}
                                />
                              )}
                            />
                          </Grid>
                        )}
                      {selectedClient &&
                        (!selectedClient.kafeels ||
                          selectedClient.kafeels.length === 0) && (
                          <Grid item xs={12} sm={10} md={8}>
                            <Typography
                              variant="body2"
                              color="error"
                              sx={{ fontWeight: "bold", mt: 1 }}
                            >
                              هذا العميل لا يوجد له كفيل.
                            </Typography>
                          </Grid>
                        )}
                    </Grid>
                  </Paper>
                )}

                {/* Kafeel Information Section - Show when kafeel is selected or exists in view mode */}
                {((!isViewMode && selectedKafeel) ||
                  (isViewMode && selectedLoan?.kafeel)) && (
                  <Paper
                    sx={{
                      p: isSmallScreen ? 2 : 4,
                      mb: isSmallScreen ? 2 : 3,
                      borderRadius: 2,
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#fff",
                    }}
                  >
                    <Typography
                      variant={isSmallScreen ? "subtitle1" : "h6"}
                      fontWeight="bold"
                      color="#333"
                      mb={isSmallScreen ? 2 : 3}
                      textAlign="center"
                    >
                      معلومات الكفيل
                    </Typography>

                    <Grid
                      container
                      spacing={isSmallScreen ? 2 : 3}
                      justifyContent="center"
                    >
                      <Grid item xs={12} sm={6} md={4}>
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

                      <Grid item xs={12} sm={6} md={4}>
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

                      <Grid item xs={12} sm={6} md={4}>
                        <TextField
                          fullWidth
                          label="تاريخ الميلاد"
                          value={(() => {
                            const birthDate = isViewMode
                              ? selectedLoan?.kafeel?.birthDate
                              : selectedKafeel?.birthDate;
                            return birthDate
                              ? new Date(birthDate).toISOString().split("T")[0]
                              : "";
                          })()}
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
                      p: isSmallScreen ? 2 : 4,
                      mb: isSmallScreen ? 2 : 3,
                      borderRadius: 2,
                      border: "1px solid #e5e7eb",
                      backgroundColor: "#fff",
                    }}
                  >
                    <Typography
                      variant={isSmallScreen ? "subtitle1" : "h6"}
                      fontWeight="bold"
                      color="#333"
                      mb={isSmallScreen ? 2 : 3}
                      textAlign="center"
                    >
                      {isViewMode
                        ? "تفاصيل السلفة"
                        : isEditMode
                        ? "تعديل تفاصيل السلفة"
                        : "حدد تفاصيل السلفة"}
                    </Typography>

                    <Grid
                      container
                      spacing={isSmallScreen ? 2 : 3}
                      justifyContent="center"
                    >
                      <Grid item xs={12} sm={isMobile ? 12 : 6} md={6}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 1,
                          }}
                        >
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
                              if (e.key === "-" || e.key === "+")
                                e.preventDefault();
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                height: "56px",
                                width: "200px",
                                backgroundColor: isReadOnlyMode
                                  ? "#f5f5f5"
                                  : "#f9fafb",
                              },
                            }}
                          />
                          {!isReadOnlyMode && (
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                                fontSize: "16px",
                                mt: -0.5,
                                ml: 1,
                              }}
                            >
                              {isLoadingBankBalance ? (
                                "جاري تحميل رصيد الصندوق..."
                              ) : bankBalance !== null ? (
                                <>
                                  رصيد الصندوق المتاح:{" "}
                                  <span
                                    style={{
                                      fontWeight: "bold",
                                      fontSize: "16px",
                                      color:
                                        parseFloat(
                                          loanForm.amount.replace(/,/g, "") || 0
                                        ) > bankBalance
                                          ? "error.main"
                                          : "primary.main",
                                    }}
                                  >
                                    {formatAmount(
                                      Math.round(bankBalance).toString()
                                    )}
                                  </span>
                                </>
                              ) : (
                                "لا يوجد رصيد متاح"
                              )}
                            </Typography>
                          )}
                        </Box>
                      </Grid>

                      <Grid item xs={12} sm={isMobile ? 12 : 6} md={6}>
                        <TextField
                          fullWidth
                          type="text"
                          label="مبلغ الفائدة الإجمالي"
                          value={formatAmount(loanForm.totalInterest)}
                          onChange={(e) =>
                            handleInputChange("totalInterest", e.target.value)
                          }
                          InputLabelProps={{
                            shrink: true,
                          }}
                          disabled={isReadOnlyMode}
                          onKeyDown={(e) => {
                            if (e.key === "-" || e.key === "+")
                              e.preventDefault();
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              height: "56px",
                              width: "200px",
                              backgroundColor: isReadOnlyMode
                                ? "#f5f5f5"
                                : "#f9fafb",
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={isMobile ? 12 : 6} md={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="معدل الفائدة السنوي (%)"
                          value={loanForm.interestRate}
                          disabled={true} // Always read-only, calculated automatically
                          InputLabelProps={{
                            shrink: true,
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              height: "56px",
                              width: "200px",
                              backgroundColor: "#f5f5f5", // Always disabled appearance
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={isMobile ? 12 : 6} md={6}>
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
                            if (e.key === "-" || e.key === "+")
                              e.preventDefault();
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              height: "56px",
                              width: "200px",
                              backgroundColor: isReadOnlyMode
                                ? "#f5f5f5"
                                : "#f9fafb",
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={isMobile ? 12 : 6} md={6}>
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
                              width: "200px",
                              backgroundColor: isReadOnlyMode
                                ? "#f5f5f5"
                                : "#f9fafb",
                            },
                          }}
                        >
                          <MenuItem value="DAILY">يومي</MenuItem>
                          <MenuItem value="WEEKLY">أسبوعي</MenuItem>
                          <MenuItem value="MONTHLY">شهري</MenuItem>
                        </TextField>
                      </Grid>

                      <Grid item xs={12} sm={isMobile ? 12 : 6} md={6}>
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
                            if (e.key === "-" || e.key === "+")
                              e.preventDefault();
                          }}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              height: "56px",
                              width: "200px",
                              backgroundColor: isReadOnlyMode
                                ? "#f5f5f5"
                                : "#f9fafb",
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={isMobile ? 12 : 6} md={6}>
                        <TextField
                          fullWidth
                          type="date"
                          label="تاريخ البداية (اختياري)"
                          value={loanForm.startDate}
                          onChange={(e) =>
                            handleInputChange("startDate", e.target.value)
                          }
                          InputLabelProps={{
                            shrink: true,
                          }}
                          disabled={isReadOnlyMode}
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              height: "56px",
                              width: "200px",
                              backgroundColor: isReadOnlyMode
                                ? "#f5f5f5"
                                : "#f9fafb",
                            },
                          }}
                          helperText="إذا تُرك فارغاً، سيتم استخدام التاريخ الحالي"
                        />
                      </Grid>

                      <Grid item xs={12} sm={isMobile ? 12 : 6} md={6}>
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
                                  width: "200px",
                                  backgroundColor: isReadOnlyMode
                                    ? "#f5f5f5"
                                    : "#f9fafb",
                                },
                              }}
                            />
                          )}
                        />
                      </Grid>

                      <Grid item xs={12} sm={isMobile ? 12 : 6} md={6}>
                        <Autocomplete
                          options={partnersData?.partners || []}
                          getOptionLabel={(option) =>
                            option.name +
                            " - " +
                            (option.isActive ? "نشط" : "غير نشط")
                          }
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
                                  width: "200px",
                                  backgroundColor: isReadOnlyMode
                                    ? "#f5f5f5"
                                    : "#f9fafb",
                                },
                              }}
                            />
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                {/* محاكاة السلفة على الشاشات الصغيرة */}
                {activeTab === 1 && isSmallScreen && (
                  <Paper
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 2,
                      border: "1px solid #e5e7eb",
                      bgcolor: "#fafafa",
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                      محاكاة السلفة
                    </Typography>
                    {simulationSummary && loanForm.type ? (
                      <Stack spacing={2}>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography color="text.secondary" variant="body2">
                            {simulationSummary.loanType === "DAILY"
                              ? "الدفعة اليومية"
                              : simulationSummary.loanType === "WEEKLY"
                              ? "الدفعة الأسبوعية"
                              : "الدفعة الشهرية"}
                          </Typography>
                          <Typography
                            color="primary.main"
                            fontWeight="bold"
                            fontSize="18px"
                          >
                            {formatAmount(
                              simulationSummary.paymentAmount.toString()
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
                          <Typography color="text.secondary" variant="body2">
                            {simulationSummary.durationLabel}
                          </Typography>
                          <Typography
                            color="primary.main"
                            fontWeight="bold"
                            fontSize="16px"
                          >
                            {simulationSummary.durationText}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <Typography color="text.secondary" variant="body2">
                            إجمالي الفائدة
                          </Typography>
                          <Typography color="#333" fontSize="14px">
                            {formatAmount(
                              simulationSummary.totalInterest.toFixed(2)
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
                          <Typography color="text.secondary" variant="body2">
                            المبلغ الإجمالي المستحق
                          </Typography>
                          <Typography color="#333" fontSize="14px">
                            {formatAmount(
                              simulationSummary.totalAmount.toFixed(2)
                            )}{" "}
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
                          <Typography color="text.secondary" variant="body2">
                            حالة السلفة
                          </Typography>
                          <Chip
                            label={
                              isViewMode
                                ? "عرض"
                                : isEditMode
                                ? "تحت التعديل"
                                : "جديد"
                            }
                            size="small"
                            sx={{
                              backgroundColor: isViewMode
                                ? "rgba(100, 100, 100, 0.2)"
                                : isEditMode
                                ? "rgba(214, 158, 46, 0.2)"
                                : "rgba(56, 161, 105, 0.2)",
                              color: isViewMode
                                ? "#666"
                                : isEditMode
                                ? "#D69E2E"
                                : "#38A169",
                              fontWeight: "bold",
                            }}
                          />
                        </Box>
                      </Stack>
                    ) : (
                      <Alert severity="info" sx={{ fontSize: "0.875rem" }}>
                        أدخل بيانات السلفة لعرض المحاكاة
                      </Alert>
                    )}
                  </Paper>
                )}

                {/* أزرار الإجراءات على الشاشات الصغيرة */}
                {activeTab === 1 && isSmallScreen && (
                  <Paper
                    sx={{
                      p: 2,
                      mb: 2,
                      borderRadius: 2,
                      border: "1px solid #e5e7eb",
                      bgcolor: "#fafafa",
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                      الإجراءات
                    </Typography>
                    <Stack spacing={1.5}>
                      {/* Alert for active loans that cannot be edited */}
                      {isViewMode && selectedLoan?.status === "ACTIVE" && (
                        <Alert
                          severity="warning"
                          sx={{ mb: 2 }}
                          action={
                            <Button
                              color="inherit"
                              size="small"
                              onClick={() => navigate('/installments/' + selectedLoan.id)}
                              sx={{ fontWeight: "bold" }}
                            >
                              عرض الأقساط
                            </Button>
                          }
                        >
                          لا يمكنك تعديل هذه السلفة لأنها في حالة نشطة. للتعديل يجب إلغاء تفعيل السلفة أولاً.
                        </Alert>
                      )}

                      {!isViewMode && (
                        <Button
                          variant="contained"
                          onClick={handleSaveLoan}
                          disabled={!isFormValid()}
                          fullWidth
                          sx={{
                            bgcolor: "primary.main",
                            height: "44px",
                            fontSize: "14px",
                            fontWeight: "bold",
                            "&:hover": { bgcolor: "primary.dark" },
                          }}
                        >
                          {isEditMode ? "حفظ التعديلات" : "إنشاء السلفة"}
                        </Button>
                      )}

                      {isViewMode && canEditLoan && (
                        <Button
                          variant="contained"
                          onClick={handleEditLoan}
                          fullWidth
                          sx={{
                            bgcolor: "primary.main",
                            height: "44px",
                            fontSize: "14px",
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
                        fullWidth
                        sx={{
                          borderColor: "primary.main",
                          color: "primary.main",
                          height: "44px",
                          fontSize: "14px",
                          fontWeight: "bold",
                          "&:hover": { bgcolor: "rgba(25, 118, 210, 0.1)" },
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
                          fullWidth
                          sx={{
                            borderColor: "rgba(255, 0, 0, 0.5)",
                            color: "error.main",
                            height: "44px",
                            fontSize: "14px",
                            fontWeight: "bold",
                            "&:hover": { bgcolor: "rgba(255, 0, 0, 0.1)" },
                          }}
                        >
                          إلغاء التعديل
                        </Button>
                      )}
                    </Stack>
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

      <AddAdditionalKafeel
        open={isAddKafeelOpen}
        onClose={async () => {
          setIsAddKafeelOpen(false);
          queryClient.invalidateQueries(["clients"]);
          await refreshSelectedClientData();
        }}
        clientId={selectedClient?.client?.id}
      />

      {generateContracts && debtAckTemplate && promissoryNoteTemplate && (
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
            loading={isSavingContracts}
            clientName={selectedClient?.client?.name}
            loanAmount={parseFloat(loanForm.amount.replace(/,/g, "")) || 0}
          />
        </>
      )}
    </Box>
  );
};

export default Loans;
