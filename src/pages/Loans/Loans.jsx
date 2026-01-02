import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  Stack,
  Divider,
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
  convertLoanClient,
  transferPartialLoanAmount,
} from "./loanApis";
import { getBanks } from "../Banks/bankApis";
import { notifySuccess, notifyError, notifyWarning } from "../../utilities/toastify";
import LoansTable from "../../components/modals/LoansTable";
import EditSmallLoanForm from "../../components/modals/EditSmallLoanForm";
import SmallLoansTable from "../../components/modals/SmallLoansTable";
import AddClient from "../../components/modals/AddClient";
import AddAdditionalKafeel from "../../components/modals/AddAdditionalKafeel";
import LoanContractGenerator from "../../components/LoanContractGenerator";
import LoanContractsPreview from "../../components/LoanContractsPreview";
import LoanTabs from "../../components/loans/LoanTabs";
import LoanMainTab from "../../components/loans/LoanMainTab";
import LoanClientSection from "../../components/loans/LoanClientSection";
import LoanKafeelSection from "../../components/loans/LoanKafeelSection";
import LoanDetailsSection from "../../components/loans/LoanDetailsSection";
import LoanSimulation from "../../components/loans/LoanSimulation";
import LoanActions from "../../components/loans/LoanActions";
import LoanClientConversion from "../../components/loans/LoanClientConversion";
import LoanConversionConfirmModal from "../../components/modals/LoanConversionConfirmModal";
import Api, { handleApiError } from "../../config/Api";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
const Loans = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [subTab, setSubTab] = useState(0);
  const [selectedClient, setSelectedClient] = useState(null);
  const [selectedKafeel, setSelectedKafeel] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [banksSearchQuery, setBanksSearchQuery] = useState("");
  const [partnersSearchQuery, setPartnersSearchQuery] = useState("");
  const [loansTableSearchQuery, setLoansTableSearchQuery] = useState("");
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
    source: "",
    startDate: new Date().toISOString().split("T")[0],
    repaymentDay: "",
    issuanceCity: "",
    paymentCity: "",
  });

  const dayToDateString = (day) => {
    if (!day || isNaN(day)) return "";
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const dateToDay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.getDate().toString();
  };

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
  const [isClientConversion, setIsClientConversion] = useState(false);
  const [loanForConversion, setLoanForConversion] = useState(null);
  const [selectedClientForConversion, setSelectedClientForConversion] = useState(null);
  const [selectedKafeelForConversion, setSelectedKafeelForConversion] = useState(null);
  const [showConversionConfirmModal, setShowConversionConfirmModal] = useState(false);
  const [conversionType, setConversionType] = useState("full"); // "full" or "partial"
  const [partialTransferAmount, setPartialTransferAmount] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [bankBalance, setBankBalance] = useState(null);
  const [_isLoadingBankBalance, setIsLoadingBankBalance] = useState(false);
  const [selectedLoanForEdit, setSelectedLoanForEdit] = useState(null);
  const [_isSmallLoanEditMode, setIsSmallLoanEditMode] = useState(false);
  const { permissions } = usePermissions();
  const debtAckGeneratorRef = useRef(null);
  const promissoryNoteGeneratorRef = useRef(null);


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

  const { data: clientLoansData } = useQuery({
    queryKey: ["client-loans", selectedClient?.client?.id],
    queryFn: async () => {
      if (!selectedClient?.client?.id) return [];
      // Get all loans for this client with pagination
      const allLoans = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await Api.get(`/api/loans/all/${page}?clientId=${selectedClient.client.id}&limit=10`);
        const pageData = response.data?.data || [];
        allLoans.push(...pageData);

        if (pageData.length < 10) {
          hasMore = false;
        } else {
          page++;
        }
      }

      return allLoans;
    },
    enabled: !!selectedClient?.client?.id && activeTab === 6,
    retry: 1,
  });

  const { data: loansNeedingContracts } = useQuery({
    queryKey: ["loans-needing-contracts"],
    queryFn: async () => {
      // Get all loans with pagination to find those needing contracts
      const allLoans = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await Api.get(`/api/loans/all/${page}?limit=10`);
        const pageData = response.data?.data || [];
        allLoans.push(...pageData);

        if (pageData.length < 10) {
          hasMore = false;
        } else {
          page++;
        }
      }

      return allLoans.filter(loan =>
        loan.status !== "COMPLETED" &&
        (loan.DEBT_ACKNOWLEDGMENT === null || loan.PROMISSORY_NOTE === null)
      );
    },
    enabled: activeTab === 0,
    retry: 1,
  });

  useEffect(() => {
    // Reset loan-related states when changing tabs to prevent stale state
    if (activeTab !== 1) {
      setIsViewMode(false);
      setIsEditMode(false);
      setIsClientConversion(false);
      setIsAdditionalLoan(false);
      setLoanForConversion(null);
      setSelectedClientForConversion(null);
      setSelectedKafeelForConversion(null);
      setShowConversionConfirmModal(false);
    }

    if (activeTab !== 2 && activeTab !== 3) {
      fetchContractTemplates();
    }
    if (activeTab === 1) {
      calculateInstallments();
      fetchBankBalance();
      setBanksSearchQuery("");
      setPartnersSearchQuery("");
      setSearchQuery("");
      setBanksPage(1);
      setPartnersPage(1);
      setClientsPage(1);
    }
    if (activeTab !== 2) {
      setIsSmallLoanEditMode(false);
      setSelectedLoanForEdit(null);
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
    if (activeTab === 6) {
      calculateInstallments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    loanForm.amount,
    loanForm.totalInterest,
    loanForm.paymentAmount,
    activeTab,
  ]);

  // Recalculate simulation whenever relevant loan data changes
  useEffect(() => {
    if (activeTab === 1 || activeTab === 6) {
      calculateInstallments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    loanForm.amount,
    loanForm.totalInterest,
    loanForm.paymentAmount,
    loanForm.type,
    activeTab,
  ]);

  // Fetch bank balance when source changes
  useEffect(() => {
    if (activeTab === 1 && loanForm.source) {
      fetchBankBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loanForm.source, activeTab]);

  const handleConversionSuccess = useCallback(() => {
    setIsClientConversion(false);
    setLoanForConversion(null);
    setSelectedClientForConversion(null);
    setSelectedKafeelForConversion(null);
    setShowConversionConfirmModal(false);
    setActiveTab(0); // Return to main tab
    queryClient.invalidateQueries(["loans"]);
  }, [queryClient]);

  const calculateRemainingAmount = (loan) => {
    // Use pagination.totalRemainingAmount if available (most accurate)
    if (loan?.pagination?.totalRemainingAmount !== undefined) {
      return loan.pagination.totalRemainingAmount;
    }
    // Use totalRemainingAmount if available, otherwise fallback to remainingBalance
    if (loan?.totalRemainingAmount !== undefined) {
      return loan.totalRemainingAmount;
    }
    if (loan?.remainingBalance !== undefined) {
      return loan.remainingBalance;
    }
    // Fallback to calculating from repayments if available
    if (!loan?.repayments) return 0;
    return loan.repayments
      .filter(repayment => !["PAID", "EARLY_PAID"].includes(repayment.status))
      .reduce((sum, repayment) => {
        const remaining = repayment.amount - (repayment.paidAmount || 0);
        return sum + Math.max(0, remaining);
      }, 0);
  };

  const handleOpenPreview = useCallback(async (loanData = null) => {
    try {
      const isEvent = loanData && typeof loanData === 'object' && loanData._reactName;
      const actualLoanData = isEvent ? null : loanData;

      const loanDataToUse = actualLoanData || savedLoanData || selectedLoan;

      if (!loanDataToUse) {
        notifyError("يرجى حفظ السلفة أولاً قبل عرض معاينة العقود");
        return;
      }

      const clientDataToUse = loanDataToUse.client;

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
  }, [savedLoanData, selectedLoan, debtAckTemplate, promissoryNoteTemplate, selectedPartner, selectedKafeel, debtAckGeneratorRef, promissoryNoteGeneratorRef, setPreviewContracts, setPreviewOpen]);

  const handleConfirmConversion = useCallback(async (partialAmount = null) => {
    setIsConverting(true);
    try {
      if (conversionType === "partial") {
        // Partial transfer
        const amount = parseFloat(partialAmount.replace(/,/g, ""));
        await transferPartialLoanAmount(
          loanForConversion.clientId,
          selectedClientForConversion.client.id,
          loanForConversion.id,
          amount,
          selectedKafeelForConversion?.id || null
        );
        notifySuccess("تم نقل جزء من المديونية بنجاح");
      } else {
        // Full transfer
        await convertLoanClient(loanForConversion.clientId, selectedClientForConversion.client.id, loanForConversion.id, selectedKafeelForConversion?.id || null);

        // Get updated loan data after conversion
        const updatedLoan = await getLoanById(loanForConversion.id);

        // Get full client data for the new client
        const newClientResponse = await getClients(1, selectedClientForConversion.client.nationalId || selectedClientForConversion.client.name);
        const fullNewClientData = newClientResponse?.clients?.find(
          (c) => c.client.id === selectedClientForConversion.client.id
        );

        // Create loan data for preview with new client information
        const loanDataForPreview = {
          ...updatedLoan,
          client: fullNewClientData?.client || selectedClientForConversion.client,
          partner: updatedLoan.partner,
          kafeel: updatedLoan.kafeel || null,
        };

        // Set the loan data for contracts generation
        setSavedLoanData(loanDataForPreview);

        notifySuccess("تم نقل المديونية بنجاح");

        // Open preview with new client data
        setTimeout(async () => {
          try {
            await handleOpenPreview(loanDataForPreview);
          } catch (previewError) {
            console.error("Error opening preview after conversion:", previewError);
            notifyWarning("يرجى فتح معاينة العقود يدوياً من الزر المخصص");
          }
        }, 100);
      }

      setShowConversionConfirmModal(false);
      setPartialTransferAmount("");
      handleConversionSuccess();
    } catch (error) {
      handleApiError(error);
      notifyError(error.response?.data?.message || `حدث خطأ أثناء ${conversionType === "partial" ? "نقل جزء من المديونية" : "نقل المديونية"}`);
    } finally {
      setIsConverting(false);
    }
  }, [conversionType, loanForConversion, selectedClientForConversion, selectedKafeelForConversion, handleConversionSuccess, handleOpenPreview]);

  useEffect(() => {
    const handleOpenAddKafeelModal = () => {
      setIsAddKafeelOpen(true);
    };

    const handleNavigateToInstallments = (event) => {
      navigate(`/installments/${event.detail}`);
    };



    window.addEventListener('open-add-kafeel-modal', handleOpenAddKafeelModal);
    window.addEventListener('navigate-to-installments', handleNavigateToInstallments);

    return () => {
      window.removeEventListener('open-add-kafeel-modal', handleOpenAddKafeelModal);
      window.removeEventListener('navigate-to-installments', handleNavigateToInstallments);
    };

  }, [navigate, selectedClient, loanForConversion, queryClient, handleConversionSuccess]);


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
    setBanksSearchQuery("");
    setBanksPage(1);
    await fetchBankBalance();
  };

  const fetchBankBalance = async () => {
    try {
      setIsLoadingBankBalance(true);

      let balance = 0;

      if (loanForm.source === "NEW_CAPITAL") {
        // Use new endpoint for NEW_CAPITAL source
        const response = await Api.get(`/api/accounts/NewBank/1`);
        balance = response?.data?.account?.balance || 0;
      } else {
        // Use existing endpoint for other sources
        const params = new URLSearchParams();
        params.append('limit', '1');
        const queryString = params.toString();
        const response = await Api.get(`/api/accounts/bank/1?${queryString}`);
        balance = response?.data?.account?.balance || 0;
      }

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


  const handleSaveContracts = async (contractType) => {
    try {
      setIsSavingContracts(true);

      const loanDataToUse = savedLoanData || selectedLoan;

      if (!loanDataToUse) {
        notifyError("لم يتم تحديد السلفة. يرجى اختيار سلفة أولاً");
        return;
      }

      if (contractType === "both" || contractType === "debt-acknowledgment") {
        const debtAckHtml = await debtAckGeneratorRef.current?.generateContract(false, loanDataToUse, selectedKafeel || loanDataToUse?.kafeel, true);
        await debtAckGeneratorRef.current?.generatePDF(debtAckHtml, loanDataToUse);
      }

      if (contractType === "both" || contractType === "promissory-note") {
        const promissoryNoteHtml = await promissoryNoteGeneratorRef.current?.generateContract(false, loanDataToUse, selectedKafeel || loanDataToUse?.kafeel, true);
        await promissoryNoteGeneratorRef.current?.generatePDF(promissoryNoteHtml, loanDataToUse);
      }

      notifySuccess("تم حفظ العقود بنجاح");

      // إعادة جلب البيانات لتحديث الأرقام المحفوظة
      queryClient.invalidateQueries(["loans"]);
      if (loanDataToUse?.id) {
        queryClient.invalidateQueries(["loan", loanDataToUse.id]);
      }

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
      issuanceCity: "",
      paymentCity: "",
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

    if (amount > 0 && paymentAmount > 0 && totalInterest >= 0) {
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
            dueDate.setDate(parseInt(dateToDay(loanForm.repaymentDay)));
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

    const totalInterest = parseFloat(loanForm.totalInterest.replace(/,/g, "")) || 0;
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
        source: loanForm.source,
        startDate: loanForm.startDate ? new Date(loanForm.startDate).toISOString() : undefined,
        repaymentDay: new Date(loanForm.repaymentDay).toISOString(),
        bankAccountId: selectedBank?.id || null,
        partnerId: selectedPartner?.id || null,
        kafeelId: selectedKafeel?.id ?? selectedLoan?.kafeel?.id ?? null,
        issuanceCity: loanForm.issuanceCity || null,
        paymentCity: loanForm.paymentCity || null,
      };

      const response = await createLoan(loanData);
      const newLoan = response?.data?.loan || response?.loan;

      notifySuccess("تم إنشاء السلفة بنجاح");

      const finalPartner = selectedPartner || newLoan.partner;

      const loanDataForPreview = {
        ...newLoan,
        partner: finalPartner,
        client: selectedClient.client,
        kafeel: selectedKafeel || null,
      };

      setSavedLoanData(loanDataForPreview);

      queryClient.invalidateQueries(["loans"]);

      setTimeout(async () => {
        try {
          await handleOpenPreview(loanDataForPreview);
        } catch (previewError) {
          console.error("Error opening preview:", previewError);
          notifyWarning("يرجى فتح معاينة العقود يدوياً من الزر المخصص");
        }
      }, 100);
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
      source: "",
      startDate: new Date().toISOString().split("T")[0],
      repaymentDay: dayToDateString(10),
      issuanceCity: "",
      paymentCity: "",
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
        source: loanForm.source,
        startDate: loanForm.startDate ? new Date(loanForm.startDate).toISOString() : undefined,
        repaymentDay: new Date(loanForm.repaymentDay).toISOString(),
        bankAccountId: selectedBank?.id || null,
        partnerId: selectedPartner?.id || null,
        kafeelId: selectedKafeel?.id ?? selectedLoan?.kafeel?.id ?? null,
        issuanceCity: loanForm.issuanceCity || null,
        paymentCity: loanForm.paymentCity || null,
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
            TotalInterest: loanData.TotalInterest,
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
      setIsViewMode(true);
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
        source: loan.source,
        startDate: loan.startDate.split("T")[0],
        repaymentDay: loan.repaymentDay ? loan.repaymentDay.split("T")[0] : "",
        issuanceCity: loan.issuanceCity || "",
        paymentCity: loan.paymentCity || "",
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

  const handleEditSmallLoan = (loan) => {
    setSelectedLoanForEdit(loan);
    setIsSmallLoanEditMode(true);
    setActiveTab(2); // Switch to edit tab
  };

  const handleConvertClient = async (loan) => {
    try {
      // Get full loan details including repayments for accurate remaining amount calculation
      const fullLoanData = await getLoanById(loan.id);
      // Merge with original loan data to ensure amount is available
      const mergedLoanData = { ...fullLoanData, amount: loan.amount };
      setLoanForConversion(mergedLoanData);
      setIsClientConversion(true);
      setActiveTab(1); // Switch to loan creation tab
    } catch (error) {
      handleApiError(error);
      notifyError("حدث خطأ في تحميل بيانات السلفة");
    }
  };

  const handleCancelConversion = () => {
    setIsClientConversion(false);
    setLoanForConversion(null);
    setSelectedClientForConversion(null);
    setSelectedKafeelForConversion(null);
    setActiveTab(0); // Return to main tab
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

    setActiveTab(4);
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

        if (amount > 0 && totalInterest >= 0) {
          const percentage = totalInterest > 0 ? (totalInterest / amount) * 100 : 0;
          updatedForm.interestRate = percentage.toFixed(2);

        } else if (amount > 0) {
          updatedForm.interestRate = "";
        }
      }

      return updatedForm;
    });
    
    // Note: calculateInstallments() is now handled automatically by useEffect when relevant fields change
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
      selectedPartner &&
      selectedBank &&
      loanForm.amount &&
      (loanForm.totalInterest || loanForm.totalInterest === 0) &&
      (loanForm.interestRate || loanForm.interestRate === 0) &&
      loanForm.paymentAmount &&
      loanForm.type &&
      loanForm.source &&
      loanForm.repaymentDay
    );
  };

  const canEditLoan = selectedLoan && selectedLoan.status === "PENDING";
  const isReadOnlyMode = isViewMode;


  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
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
              width: isSmallScreen ? "300px" : "350px",
              bgcolor: 'background.paper',
              height: "100%",
              overflowY: "auto",
              flexShrink: 0,
            }}
          >
            {!isClientConversion && (
              <Box
                sx={{
                  p: isTablet ? 2 : 3,
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
            )}

            <Box sx={{ p: isTablet ? 2 : 3 }}>
              <Typography
                variant={isTablet ? "subtitle1" : "h6"}
                fontWeight="bold"
                mb={isTablet ? 2 : 3}
              >
                الإجراءات
              </Typography>
              <Stack spacing={2}>
                {/* Client Conversion Actions */}
                {isClientConversion && (
                  <>
                    <Button
                      variant="contained"
                      onClick={() => {
                        if (!selectedClientForConversion) {
                          notifyError("يرجى اختيار العميل الجديد أولاً");
                          return;
                        }
                        if (selectedClientForConversion.client.id === loanForConversion.clientId) {
                          notifyError("لا يمكن نقل المديونية لنفس العميل");
                          return;
                        }
                        setConversionType("full");
                        setShowConversionConfirmModal(true);
                      }}
                      disabled={!selectedClientForConversion}
                      sx={{
                        bgcolor: selectedClientForConversion ? "primary.main" : "grey.400",
                        height: isTablet ? "44px" : "48px",
                        fontSize: isTablet ? "14px" : "16px",
                        fontWeight: "bold",
                        "&:hover": {
                          bgcolor: selectedClientForConversion ? "primary.dark" : "grey.400"
                        },
                        "&:disabled": {
                          bgcolor: "grey.400",
                          color: "grey.600"
                        }
                      }}
                    >
                      نقل كامل المديونية
                    </Button>

                    <Button
                      variant="contained"
                      onClick={() => {
                        if (!selectedClientForConversion) {
                          notifyError("يرجى اختيار العميل الجديد أولاً");
                          return;
                        }
                        if (selectedClientForConversion.client.id === loanForConversion.clientId) {
                          notifyError("لا يمكن نقل المديونية لنفس العميل");
                          return;
                        }
                        setConversionType("partial");
                        setShowConversionConfirmModal(true);
                      }}
                      disabled={!selectedClientForConversion}
                      sx={{
                        bgcolor: selectedClientForConversion ? "warning.main" : "grey.400",
                        height: isTablet ? "44px" : "48px",
                        fontSize: isTablet ? "14px" : "16px",
                        fontWeight: "bold",
                        "&:hover": {
                          bgcolor: selectedClientForConversion ? "warning.dark" : "grey.400"
                        },
                        "&:disabled": {
                          bgcolor: "grey.400",
                          color: "grey.600"
                        }
                      }}
                    >
                      نقل جزء من المديونية
                    </Button>

                    <Button
                      variant="outlined"
                      onClick={handleCancelConversion}
                      sx={{
                        borderColor: "rgba(255, 0, 0, 0.5)",
                        color: "error.main",
                        height: isTablet ? "44px" : "48px",
                        fontSize: isTablet ? "14px" : "16px",
                        fontWeight: "bold",
                        "&:hover": { bgcolor: "rgba(255, 0, 0, 0.1)" },
                      }}
                    >
                      إلغاء
                    </Button>
                  </>
                )}

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

                {!isViewMode && !isClientConversion && (
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

                {!isClientConversion && (
                  <Button
                    variant="outlined"
                    onClick={handleOpenPreview}
                    disabled={!savedLoanData && (!isViewMode || (selectedLoan?.DEBT_ACKNOWLEDGMENT && selectedLoan?.PROMISSORY_NOTE))}
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
                )}

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
            bgcolor: 'background.paper',
            overflowY: "auto",
            width: "100%",
          }}
        >
          <Box sx={{ width: "100%" }}>
            <LoanTabs
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              resetLoanForm={resetLoanForm}
              isSmallScreen={isSmallScreen}
              permissions={permissions}
              isClientConversion={isClientConversion}
              isViewMode={isViewMode}
              isEditMode={isEditMode}
              isAdditionalLoan={isAdditionalLoan}
              searchQuery={loansTableSearchQuery}
              onSearchChange={(e) => setLoansTableSearchQuery(e.target.value)}
            />

            {activeTab === 0 ? (
              <Box
                sx={{ width: "100%", display: "flex", flexDirection: "column" }}
              >
                <LoanMainTab
                  loansNeedingContracts={loansNeedingContracts}
                  subTab={subTab}
                  setSubTab={setSubTab}
                  handleViewLoanDetails={handleViewLoanDetails}
                />

                <LoansTable
                  onViewDetails={handleViewLoanDetails}
                  onViewInstallments={handleViewInstallments}
                  onCreateAdditionalLoan={handleCreateAdditionalLoan}
                  onConvertClient={handleConvertClient}
                  statusFilter={
                    subTab === 0 ? "PENDING" :
                    subTab === 1 ? "ACTIVE" :
                    subTab === 2 ? "COMPLETED" : null
                  }
                  searchQuery={loansTableSearchQuery}
                />
              </Box>
            ) : activeTab === 1 ? (
              <Box>
                {isClientConversion ? (
                  <LoanClientConversion
                    loan={loanForConversion}
                    onConversionSuccess={handleConversionSuccess}
                    onCancel={handleCancelConversion}
                    isSmallScreen={isSmallScreen}
                    selectedClient={selectedClientForConversion}
                    onClientSelect={setSelectedClientForConversion}
                    selectedKafeel={selectedKafeelForConversion}
                    onKafeelSelect={setSelectedKafeelForConversion}
                  />
                ) : permissions.includes("loans_Add") && (
                  <LoanClientSection
                    isSmallScreen={isSmallScreen}
                    clientsData={clientsData}
                    isClientsLoading={isClientsLoading}
                    selectedClient={selectedClient}
                    handleClientSelect={handleClientSelect}
                    handleSearchChange={handleSearchChange}
                    isViewMode={isViewMode}
                    isEditMode={isEditMode}
                    isAdditionalLoan={isAdditionalLoan}
                    setIsAddClientOpen={setIsAddClientOpen}
                    selectedKafeel={selectedKafeel}
                    handleKafeelSelect={handleKafeelSelect}
                    clientLoansData={clientLoansData}
                    isReadOnlyMode={isReadOnlyMode}
                  />
                )}

                {/* Kafeel Information Section - Show when kafeel is selected or exists in view mode */}
                {((!isViewMode && selectedKafeel) ||
                  (isViewMode && selectedLoan?.kafeel)) && (
                  <LoanKafeelSection
                    isSmallScreen={isSmallScreen}
                    selectedKafeel={selectedKafeel}
                    selectedLoan={selectedLoan}
                    isViewMode={isViewMode}
                  />
                )}

                {permissions.includes("loans_Add") && !isClientConversion && (
                  <LoanDetailsSection
                    isSmallScreen={isSmallScreen}
                    isMobile={isMobile}
                    isViewMode={isViewMode}
                    isEditMode={isEditMode}
                    isAdditionalLoan={isAdditionalLoan}
                    loanForm={loanForm}
                    handleInputChange={handleInputChange}
                    isReadOnlyMode={isReadOnlyMode}
                    banksData={banksData}
                    isBanksLoading={isBanksLoading}
                    selectedBank={selectedBank}
                    handleBankSelect={handleBankSelect}
                    handleBanksSearchChange={handleBanksSearchChange}
                    partnersData={partnersData}
                    isPartnersLoading={isPartnersLoading}
                    selectedPartner={selectedPartner}
                    handlePartnerSelect={handlePartnerSelect}
                    handlePartnersSearchChange={handlePartnersSearchChange}
                    bankBalance={bankBalance}
                    formatAmount={formatAmount}
                    selectedLoan={selectedLoan}
                  />
                )}

                {/* محاكاة السلفة على الشاشات الصغيرة */}
                {activeTab === 1 && isSmallScreen && (
                  <LoanSimulation
                    isSmallScreen={isSmallScreen}
                    simulationSummary={simulationSummary}
                    loanForm={loanForm}
                    isViewMode={isViewMode}
                    isEditMode={isEditMode}
                    formatAmount={formatAmount}
                  />
                )}

                {/* أزرار الإجراءات على الشاشات الصغيرة */}
                {activeTab === 1 && isSmallScreen && (
                  <LoanActions
                    isSmallScreen={isSmallScreen}
                    isViewMode={isViewMode}
                    selectedLoan={selectedLoan}
                    canEditLoan={canEditLoan}
                    handleEditLoan={handleEditLoan}
                    handleSaveLoan={handleSaveLoan}
                    isFormValid={isFormValid}
                    isEditMode={isEditMode}
                    handleOpenPreview={handleOpenPreview}
                    savedLoanData={savedLoanData}
                    selectedLoanForPreview={selectedLoan}
                    onCancelEdit={() => {
                      setIsEditMode(false);
                      setIsViewMode(true);
                    }}
                    isClientConversion={isClientConversion}
                    selectedClient={isClientConversion ? selectedClientForConversion : selectedClient}
                    isConverting={false}
                    onCancelConversion={handleCancelConversion}
                  />
                )}
              </Box>
            ) : activeTab === 2 ? (
              <Box>
                <EditSmallLoanForm
                  selectedLoan={selectedLoanForEdit}
                  onLoanUpdated={() => {
                    setSelectedLoanForEdit(null);
                    setIsSmallLoanEditMode(false);
                    setActiveTab(3); // Switch back to view tab
                  }}
                />
              </Box>
            ) : activeTab === 3 ? (
              <Box
                sx={{ width: "100%", display: "flex", flexDirection: "column" }}
              >
                <SmallLoansTable onEditLoan={handleEditSmallLoan} />
              </Box>
            ) : null}
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

          // Refresh the appropriate client data based on context
          if (isClientConversion && selectedClientForConversion?.client?.id) {
            try {
              const clientsResponse = await getClients(
                1,
                selectedClientForConversion.client.nationalId || selectedClientForConversion.client.name
              );
              const updatedClient = clientsResponse?.clients?.find(
                (c) => c.client.id === selectedClientForConversion.client.id
              );
              if (updatedClient) {
                setSelectedClientForConversion(updatedClient);
              }
            } catch (error) {
              console.error("Error refreshing conversion client data:", error);
            }
          } else {
            await refreshSelectedClientData();
          }
        }}
        clientId={isClientConversion ? selectedClientForConversion?.client?.id : selectedClient?.client?.id}
      />

      {generateContracts && debtAckTemplate && promissoryNoteTemplate && (
        <>
          <LoanContractGenerator
            ref={debtAckGeneratorRef}
            loanData={savedLoanData}
            clientData={selectedClient?.client}
            kafeelData={savedLoanData?.kafeel || selectedKafeel}
            templateContent={debtAckTemplate}
            onContractGenerated={handleContractGenerated}
            contractType="DEBT_ACKNOWLEDGMENT"
            autoGenerate={false}
          />

          <LoanContractGenerator
            ref={promissoryNoteGeneratorRef}
            loanData={savedLoanData}
            clientData={selectedClient?.client}
            kafeelData={savedLoanData?.kafeel || selectedKafeel}
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

      <LoanConversionConfirmModal
        open={showConversionConfirmModal}
        onClose={() => !isConverting && setShowConversionConfirmModal(false)}
        onConfirm={handleConfirmConversion}
        fromClient={loanForConversion?.client}
        toClient={selectedClientForConversion?.client}
        selectedKafeel={selectedKafeelForConversion}
        loan={loanForConversion}
        remainingAmount={calculateRemainingAmount(loanForConversion)}
        isLoading={isConverting}
        transferType={conversionType}
        partialAmount={partialTransferAmount}
        onPartialAmountChange={setPartialTransferAmount}
        maxPartialAmount={calculateRemainingAmount(loanForConversion)}
      />

    </Box>
  );
};

export default Loans;
