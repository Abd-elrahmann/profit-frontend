import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useMediaQuery } from "@mui/material";
import { debounce } from "../../utilities/debounce";
import { useQuery, useQueries, useQueryClient } from "@tanstack/react-query";
import {
  getClients,
  createLoan,
  getLoanById,
  updateLoan,
  getPartners,
  convertLoanClient,
  transferPartialLoanAmount,
  getLoans,
} from "./loanApis";
import { getBanks, getBankAccountBalance } from "../Banks/bankApis";
import { BANK_ACCOUNT_BALANCE_QUERY_KEY } from "../../components/loans/BankAccountBalanceInline";
import { notifySuccess, notifyError, notifyWarning } from "../../utilities/toastify";
import {
  LoansTable,
  EditSmallLoanForm,
  SmallLoansTable,
} from "../../components/loans";
import LoanContractGenerator from "../../components/contractGenerators/LoanContractGenerator";
import LoanContractsPreview from "../../components/contractGenerators/LoanContractsPreview";
import LoanTabs from "../../components/loans/LoanTabs";
import LoanMainTab from "../../components/loans/LoanMainTab";
import LoanClientSection from "../../components/loans/LoanClientSection";
import LoanKafeelSection from "../../components/loans/LoanKafeelSection";
import LoanDetailsSection from "../../components/loans/LoanDetailsSection";
import BankAccountAutocomplete from "../../components/loans/BankAccountAutocomplete";
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
    promissoryNoteType: "",
    promissoryNoteDate: "",
    hasAdvancePayment: "no",
    advancePayment: "",
  });
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
  const [conversionType, setConversionType] = useState("full");
  const [partialTransferAmount, setPartialTransferAmount] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [mixBalances, setMixBalances] = useState({ general: null, newCapital: null });
  const [loanPrincipalSummaryAr, setLoanPrincipalSummaryAr] = useState("");
  const [_isLoadingBankBalance, setIsLoadingBankBalance] = useState(false);
  const [selectedLoanForEdit, setSelectedLoanForEdit] = useState(null);
  const [_isSmallLoanEditMode, setIsSmallLoanEditMode] = useState(false);
  const { permissions } = usePermissions();
  const debtAckGeneratorRef = useRef(null);
  const promissoryNoteGeneratorRef = useRef(null);
  const previousSourceRef = useRef(loanForm.source);
  const isRestoringFromAddKafeelRef = useRef(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1024px)");
  const isLargeScreen = useMediaQuery("(min-width: 1200px)");
  const isSmallScreen = isMobile || isTablet;
  const shouldFetchGeneralBankBalance =
    !!selectedBank?.id && loanForm.source === "GENERAL" && activeTab === 1;
  const { data: generalBankBalanceRaw } = useQuery({
    queryKey: [BANK_ACCOUNT_BALANCE_QUERY_KEY, selectedBank?.id],
    queryFn: () => getBankAccountBalance(selectedBank.id),
    enabled: shouldFetchGeneralBankBalance,
  });
  const shouldFetchNewCapitalFundBalance =
    loanForm.source === "NEW_CAPITAL" && activeTab === 1;
  const { data: newCapitalFundBalanceRaw } = useQuery({
    queryKey: ["new-capital-fund-balance-loan-form"],
    queryFn: async () => {
      const r = await Api.get(`/api/accounts/NewBank/1`);
      return r?.data?.account?.balance;
    },
    enabled: shouldFetchNewCapitalFundBalance,
    retry: 1,
  });
  const fundBalanceForLoanForm = useMemo(() => {
    if (loanForm.source === "GENERAL") {
      if (!shouldFetchGeneralBankBalance) return null;
      return generalBankBalanceRaw != null && generalBankBalanceRaw !== ""
        ? Number(generalBankBalanceRaw)
        : null;
    }
    if (loanForm.source === "NEW_CAPITAL") {
      if (!shouldFetchNewCapitalFundBalance) return null;
      if (newCapitalFundBalanceRaw == null || newCapitalFundBalanceRaw === "") return null;
      return Number(newCapitalFundBalanceRaw);
    }
    return null;
  }, [
    loanForm.source,
    shouldFetchGeneralBankBalance,
    shouldFetchNewCapitalFundBalance,
    generalBankBalanceRaw,
    newCapitalFundBalanceRaw,
  ]);
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
  const [debouncedLoansSearchForCounts, setDebouncedLoansSearchForCounts] = useState(loansTableSearchQuery);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedLoansSearchForCounts(loansTableSearchQuery), 500);
    return () => clearTimeout(t);
  }, [loansTableSearchQuery]);
  const statusCountsQueries = useQueries({
    queries: ["PENDING", "ACTIVE", "COMPLETED"].map((status) => ({
      queryKey: ["loans-count", status, debouncedLoansSearchForCounts],
      queryFn: () => getLoans(1, debouncedLoansSearchForCounts, 1, status),
      enabled: activeTab === 0,
      retry: 1,
    })),
  });
  const statusCounts = useMemo(
    () => ({
      PENDING: statusCountsQueries[0]?.data?.total ?? 0,
      ACTIVE: statusCountsQueries[1]?.data?.total ?? 0,
      COMPLETED: statusCountsQueries[2]?.data?.total ?? 0,
    }),
    [statusCountsQueries]
  );
  const { data: loansNeedingContracts } = useQuery({
    queryKey: ["loans-needing-contracts"],
    queryFn: async () => {
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
    const savedState = sessionStorage.getItem('LOANS_RETURN_STATE');
    if (savedState) {
      try {
        isRestoringFromAddKafeelRef.current = true;
        const state = JSON.parse(savedState);
        sessionStorage.removeItem('LOANS_RETURN_STATE');
        setActiveTab(state.tab ?? 1);
        if (state.loanForm) {
          setLoanForm(state.loanForm);
          previousSourceRef.current = state.loanForm.source ?? '';
        }
        const fetchAndRestoreClient = async () => {
          const search = state.clientNationalId || state.clientName || state.clientId;
          if (!search) {
            isRestoringFromAddKafeelRef.current = false;
            return;
          }
          try {
            const clientsResponse = await getClients(1, String(search));
            const found = clientsResponse?.clients?.find((c) => c.client.id === state.clientId);
            if (found) {
              if (state.isClientConversion) {
                setSelectedClientForConversion(found);
                if (state.loanId) {
                  const loanRes = await getLoanById(state.loanId);
                  const loanData = loanRes?.loan ?? loanRes;
                  if (loanData) setLoanForConversion(loanData);
                }
                setIsClientConversion(true);
              } else {
                setSelectedClient(found);
              }
            }
          } catch (err) {
            console.error('Error restoring loan state:', err);
          } finally {
            isRestoringFromAddKafeelRef.current = false;
          }
        };
        fetchAndRestoreClient();
      } catch {
        isRestoringFromAddKafeelRef.current = false;
      }
    }
  }, []);
  useEffect(() => {
    if (isRestoringFromAddKafeelRef.current) return;
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
      fetchMixBalances();
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
    loanForm.interestRate,
    loanForm.hasAdvancePayment,
    loanForm.advancePayment,
    activeTab,
  ]);
  useEffect(() => {
    if (activeTab === 1 || activeTab === 6) {
      calculateInstallments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    loanForm.amount,
    loanForm.totalInterest,
    loanForm.paymentAmount,
    loanForm.interestRate,
    loanForm.type,
    loanForm.hasAdvancePayment,
    loanForm.advancePayment,
    loanForm.startDate,
    loanForm.repaymentDay,
    activeTab,
  ]);
  useEffect(() => {
    if (activeTab === 1 && loanForm.source) {
      fetchMixBalances();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loanForm.source, activeTab]);
  useEffect(() => {
    const prevSource = previousSourceRef.current;
    const isUserSourceChange =
      prevSource !== null &&
      prevSource !== "" &&
      prevSource !== loanForm.source;
    if (
      activeTab === 1 &&
      loanForm.source &&
      isUserSourceChange &&
      !isEditMode &&
      !selectedLoan?.id
    ) {
      setLoanForm((p) => ({
        ...p,
        amount: "",
      }));
      setLoanPrincipalSummaryAr("");
    }
    previousSourceRef.current = loanForm.source;
  }, [loanForm.source, activeTab, isEditMode, selectedLoan?.id]);
  const handleConversionSuccess = useCallback(() => {
    setIsClientConversion(false);
    setLoanForConversion(null);
    setSelectedClientForConversion(null);
    setSelectedKafeelForConversion(null);
    setShowConversionConfirmModal(false);
    setActiveTab(0);
    queryClient.invalidateQueries(["loans"]);
    queryClient.invalidateQueries(["unposted-loan-journals"]);
    queryClient.invalidateQueries(["unposted-journals-all"]);
  }, [queryClient]);
  const calculateRemainingAmount = (loan) => {
    if (loan?.pagination?.totalRemainingAmount !== undefined) {
      return loan.pagination.totalRemainingAmount;
    }
    if (loan?.totalRemainingAmount !== undefined) {
      return loan.totalRemainingAmount;
    }
    if (loan?.remainingBalance !== undefined) {
      return loan.remainingBalance;
    }
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
  const handleConfirmConversion = useCallback(async (partialAmount = null, paymentAmount = null, repaymentDay = null) => {
    setIsConverting(true);
    try {
      const repaymentDayValue = repaymentDay || null;
      const paymentAmountValue = paymentAmount ? parseFloat(String(paymentAmount).replace(/,/g, "")) : null;
      if (conversionType === "partial") {
        const amount = parseFloat(partialAmount.replace(/,/g, ""));
        await transferPartialLoanAmount(
          loanForConversion.clientId,
          selectedClientForConversion.client.id,
          loanForConversion.id,
          amount,
          selectedKafeelForConversion?.id || null,
          paymentAmountValue,
          repaymentDayValue
        );
        notifySuccess("تم نقل جزء من المديونية بنجاح");
      } else {
          await convertLoanClient(
            loanForConversion.clientId, 
            selectedClientForConversion.client.id, 
            loanForConversion.id, 
            selectedKafeelForConversion?.id || null,
            paymentAmountValue,
            repaymentDayValue
          );
        const updatedLoan = await getLoanById(loanForConversion.id);
        const newClientResponse = await getClients(1, selectedClientForConversion.client.nationalId || selectedClientForConversion.client.name);
        const fullNewClientData = newClientResponse?.clients?.find(
          (c) => c.client.id === selectedClientForConversion.client.id
        );
        const loanDataForPreview = {
          ...updatedLoan,
          client: fullNewClientData?.client || selectedClientForConversion.client,
          partner: updatedLoan.partner,
          kafeel: updatedLoan.kafeel || null,
        };
        setSavedLoanData(loanDataForPreview);
        notifySuccess("تم نقل المديونية بنجاح");
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
    const handleNavigateToInstallments = (event) => {
      navigate(`/installments/${event.detail}`);
    };
    window.addEventListener('navigate-to-installments', handleNavigateToInstallments);
    return () => {
      window.removeEventListener('navigate-to-installments', handleNavigateToInstallments);
    };
  }, [navigate]);
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
  const handleAddKafeelClick = useCallback((clientId) => {
    if (!clientId) return;
    const client = isClientConversion ? selectedClientForConversion?.client : selectedClient?.client;
    const state = {
      tab: 1,
      clientId,
      clientName: client?.name,
      clientNationalId: client?.nationalId,
      loanForm,
      isClientConversion,
    };
    if (isClientConversion && loanForConversion?.id) {
      state.loanId = loanForConversion.id;
      state.conversionClientId = selectedClientForConversion?.client?.id;
      state.conversionClientName = selectedClientForConversion?.client?.name;
      state.conversionClientNationalId = selectedClientForConversion?.client?.nationalId;
    }
    try {
      sessionStorage.setItem('LOANS_RETURN_STATE', JSON.stringify(state));
    } catch { /* ignore */ }
    navigate(`/clients/${clientId}/add-kafeel?returnTo=loans`);
  }, [isClientConversion, selectedClient, selectedClientForConversion, loanForConversion, loanForm, navigate]);
  const handleKafeelSelect = (event, newValue) => {
    setSelectedKafeel(newValue);
  };
  const handleBankSelect = async (event, newValue) => {
    setSelectedBank(newValue);
    setBanksSearchQuery("");
    setBanksPage(1);
    if (loanForm.source === "MIX") {
      await fetchMixBalances();
    }
  };
  const fetchMixBalances = async () => {
    try {
      setIsLoadingBankBalance(true);
      if (loanForm.source === "MIX") {
        const [generalResponse, newCapitalResponse] = await Promise.all([
          Api.get(`/api/accounts/bank/1?limit=1`),
          Api.get(`/api/accounts/NewBank/1`),
        ]);
        const generalBalance = generalResponse?.data?.account?.balance || 0;
        const newCapitalBalance = newCapitalResponse?.data?.account?.balance || 0;
        setMixBalances({ general: generalBalance, newCapital: newCapitalBalance });
      } else {
        setMixBalances({ general: null, newCapital: null });
      }
    } catch (error) {
      handleApiError(error);
      setMixBalances({ general: null, newCapital: null });
    } finally {
      setIsLoadingBankBalance(false);
    }
  };
  const handlePartnerSelect = (event, newValue) => {
    setSelectedPartner(newValue);
  };
  const sanitizeLoanPrincipalInput = (input) => {
    let s = String(input).replace(/,/g, "").replace(/[^\d.]/g, "");
    const firstSep = s.indexOf(".");
    if (firstSep !== -1) {
      s = s.slice(0, firstSep + 1) + s.slice(firstSep + 1).replace(/\./g, "");
    }
    if (!s) return "";
    const endsWithDotOnly = /\.$/.test(s) && s.indexOf(".") === s.length - 1;
    const [intRaw, decRaw] = s.split(".");
    const intDigits = (intRaw || "").replace(/\D/g, "");
    const intFormatted = intDigits.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    if (decRaw !== undefined) {
      return `${intFormatted}.${decRaw.slice(0, 2)}`;
    }
    if (endsWithDotOnly) {
      return intFormatted === "" ? "." : `${intFormatted}.`;
    }
    return intFormatted;
  };
  const formatCurrencySar = (amount) => {
    if (amount === "" || amount === null || amount === undefined) return "";
    const numAmount =
      typeof amount === "string"
        ? parseFloat(String(amount).replace(/,/g, ""))
        : Number(amount);
    if (Number.isNaN(numAmount)) return "";
    return numAmount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return "";
    const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, "")) : amount;
    if (isNaN(numAmount)) return "";
    const rounded = parseFloat(numAmount.toFixed(2));
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  const handleLoanPrincipalBlur = () => {
    const raw = String(loanForm.amount || "").replace(/,/g, "");
    if (!raw || raw === "." || Number.isNaN(parseFloat(raw))) {
      setLoanPrincipalSummaryAr("");
      setLoanForm((p) => ({ ...p, amount: "" }));
      return;
    }
    const n = parseFloat(raw);
    const rounded = Math.round(n * 100) / 100;
    const totalHalalas = Math.round(rounded * 100);
    const riyals = Math.floor(totalHalalas / 100);
    const halalas = totalHalalas % 100;
    let summary = "";
    if (riyals !== 0 || halalas !== 0) {
      summary =
        halalas === 0
          ? `لقد أدخلت ${riyals.toLocaleString("en-US")} ريال`
          : `لقد أدخلت ${riyals.toLocaleString("en-US")} ريال و ${halalas} هللة`;
    }
    setLoanPrincipalSummaryAr(summary);
    setLoanForm((p) => ({ ...p, amount: formatCurrencySar(rounded.toFixed(2)) }));
  };
  const handleSaveContracts = async (contractType) => {
    try {
      setIsSavingContracts(true);
      const loanDataToUse = savedLoanData || selectedLoan;
      if (!loanDataToUse) {
        notifyError("لم يتم تحديد السلفة. يرجى اختيار سلفة أولاً");
        return;
      }
      if (contractType === "both" || contractType === "debt-acknowledgment" || contractType === "promissory-note") {
        try {
          const countResponse = await Api.get(`/api/loans/get/counts/${loanDataToUse.id}`);
          const count = countResponse.data.count;
          const contractNumber = count.toString();
          const numbersToSave = {};
          if (contractType === "both" || contractType === "debt-acknowledgment") {
            numbersToSave.debtAcknowledgmentNumber = contractNumber;
          }
          if (contractType === "both" || contractType === "promissory-note") {
            numbersToSave.promissoryNoteNumber = contractNumber;
          }
          await Api.post(`/api/loans/${loanDataToUse.id}/save-contract-numbers`, numbersToSave);
          if (numbersToSave.debtAcknowledgmentNumber) {
            loanDataToUse.debtAcknowledgmentNumber = contractNumber;
          }
          if (numbersToSave.promissoryNoteNumber) {
            loanDataToUse.promissoryNoteNumber = contractNumber;
          }
        } catch (error) {
          console.error('Error fetching loan count:', error);
          notifyError("حدث خطأ في جلب رقم العقد");
          return;
        }
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
      queryClient.invalidateQueries(["loans"]);
      queryClient.invalidateQueries(["unposted-loan-journals"]);
      queryClient.invalidateQueries(["unposted-journals-all"]);
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
      source: "",
      startDate: new Date().toISOString().split("T")[0],
      repaymentDay: "",
      issuanceCity: "",
      paymentCity: "",
      promissoryNoteType: "",
      promissoryNoteDate: "",
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
    const amountGross = parseFloat(String(loanForm.amount || "").replace(/,/g, "")) || 0;
    const advancePayment =
      loanForm.hasAdvancePayment === "yes"
        ? parseFloat(String(loanForm.advancePayment || "").replace(/,/g, "")) || 0
        : 0;
    const amount = Math.max(0, amountGross - advancePayment);
    let totalInterest = parseFloat(String(loanForm.totalInterest || "").replace(/,/g, "")) || 0;
    const paymentAmount =
      parseFloat(loanForm.paymentAmount.replace(/,/g, "")) || 0;
    const loanType = loanForm.type;
    if (totalInterest === 0 && loanForm.interestRate !== "" && amount > 0) {
      const interestRate = parseFloat(loanForm.interestRate) || 0;
      totalInterest = (amount * interestRate) / 100;
    }
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
    const amountGross = parseFloat(String(loanForm.amount || "").replace(/,/g, "")) || 0;
    const advancePayment =
      loanForm.hasAdvancePayment === "yes"
        ? parseFloat(String(loanForm.advancePayment || "").replace(/,/g, "")) || 0
        : 0;
    const principalNet = Math.max(0, amountGross - advancePayment);
    let totalInterest = parseFloat(String(loanForm.totalInterest || "").replace(/,/g, "")) || 0;
    if (totalInterest === 0 && loanForm.interestRate !== "" && principalNet > 0) {
      const interestRate = parseFloat(loanForm.interestRate) || 0;
      totalInterest = (principalNet * interestRate) / 100;
    }
    const totalAmount = principalNet + totalInterest;
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
      advancePayment,
      principalNet,
      hasAdvanceBreakdown: advancePayment > 0,
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
    if (loanForm.source === "MIX") {
      const loanAmount = parseFloat(loanForm.amount.replace(/,/g, ""));
      const totalBalances = (mixBalances.general || 0) + (mixBalances.newCapital || 0);
      if (loanAmount > totalBalances) {
        notifyError(
          `المبلغ المدخل (${formatAmount(
            loanAmount.toFixed(2)
          )}) يتجاوز مجموع أرصدة الصناديق المتاحة (${formatAmount(
            totalBalances.toFixed(2)
          )})`
        );
        return;
      }
    } else if (fundBalanceForLoanForm !== null) {
      const loanAmount = parseFloat(loanForm.amount.replace(/,/g, ""));
      if (loanAmount > fundBalanceForLoanForm) {
        notifyError(
          `المبلغ المدخل (${formatAmount(
            loanAmount.toFixed(2)
          )}) يتجاوز رصيد الصندوق المتاح (${formatAmount(
            fundBalanceForLoanForm.toFixed(2)
          )})`
        );
        return;
      }
    }
    try {
      setIsCreatingLoan(true);
      let totalInterest = parseFloat(loanForm.totalInterest.replace(/,/g, "")) || 0;
      if (totalInterest === 0 && loanForm.interestRate !== "") {
        const amount = parseFloat(loanForm.amount.replace(/,/g, "")) || 0;
        const interestRate = parseFloat(loanForm.interestRate) || 0;
        totalInterest = (amount * interestRate) / 100;
      }
      const loanData = {
        clientId: selectedClient.client.id,
        amount: parseFloat(loanForm.amount.replace(/,/g, "")),
        TotalInterest: totalInterest,
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
        promissoryNoteType: loanForm.promissoryNoteType,
        promissoryNoteDate: loanForm.promissoryNoteType === "manual" && loanForm.promissoryNoteDate
          ? new Date(loanForm.promissoryNoteDate).toISOString()
          : null,
        advancePayment: loanForm.hasAdvancePayment === "yes" 
          ? parseFloat(loanForm.advancePayment.replace(/,/g, "")) || 0
          : 0,
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
      queryClient.invalidateQueries(["unposted-loan-journals"]);
      queryClient.invalidateQueries(["unposted-journals-all"]);
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
    setLoanForm({
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
      promissoryNoteType: "",
      promissoryNoteDate: "",
      hasAdvancePayment: "no",
      advancePayment: "",
    });
    setInstallments([]);
    setIsEditMode(false);
    setIsViewMode(false);
    setContractsGenerated(0);
    setSavedLoanData(null);
    setIsCreatingLoan(false);
    setIsAdditionalLoan(false);
    setLoanPrincipalSummaryAr("");
  };
  const handleUpdateLoan = async () => {
    if (!selectedLoan) {
      notifyError("لا يوجد سلفة محددة للتعديل");
      return;
    }
    try {
      const normalizeNumber = (value) => {
        if (value === null || value === undefined || value === "") return null;
        const parsed = parseFloat(String(value).replace(/,/g, ""));
        return Number.isNaN(parsed) ? null : parsed;
      };
      const dateOnly = (value) => (value ? String(value).split("T")[0] : "");
      const payload = {};

      const amountValue = normalizeNumber(loanForm.amount);
      if (amountValue !== null && amountValue !== Number(selectedLoan.amount || 0)) {
        payload.amount = amountValue;
      }

      const totalInterestValue = normalizeNumber(loanForm.totalInterest);
      if (
        totalInterestValue !== null &&
        totalInterestValue !== Number(selectedLoan.interestAmount || 0)
      ) {
        payload.TotalInterest = totalInterestValue;
      }

      const interestRateValue = normalizeNumber(loanForm.interestRate);
      if (
        interestRateValue !== null &&
        interestRateValue !== Number(selectedLoan.interestRate || 0)
      ) {
        payload.InterestPercentage = interestRateValue;
      }

      const paymentAmountValue = normalizeNumber(loanForm.paymentAmount);
      if (
        paymentAmountValue !== null &&
        paymentAmountValue !== Number(selectedLoan.paymentAmount || 0)
      ) {
        payload.paymentAmount = paymentAmountValue;
      }

      if ((loanForm.type || "") !== (selectedLoan.type || "")) {
        payload.type = loanForm.type;
      }

      if ((loanForm.source || "") !== (selectedLoan.source || "")) {
        payload.source = loanForm.source;
      }

      const startDateValue = dateOnly(loanForm.startDate);
      if (startDateValue && startDateValue !== dateOnly(selectedLoan.startDate)) {
        payload.startDate = new Date(startDateValue).toISOString();
      }

      const repaymentDayValue = dateOnly(loanForm.repaymentDay);
      if (repaymentDayValue && repaymentDayValue !== dateOnly(selectedLoan.repaymentDay)) {
        payload.repaymentDay = new Date(repaymentDayValue).toISOString();
      }

      const bankAccountId = selectedBank?.id || null;
      const oldBankAccountId = selectedLoan?.bankAccount?.id || null;
      if (bankAccountId !== oldBankAccountId) {
        payload.bankAccountId = bankAccountId;
      }

      const partnerId = selectedPartner?.id || null;
      const oldPartnerId = selectedLoan?.partner?.id || null;
      if (partnerId !== oldPartnerId) {
        payload.partnerId = partnerId;
      }

      const kafeelId = selectedKafeel?.id ?? selectedLoan?.kafeel?.id ?? null;
      const oldKafeelId = selectedLoan?.kafeel?.id ?? null;
      if (kafeelId !== oldKafeelId) {
        payload.kafeelId = kafeelId;
      }

      const issuanceCity = loanForm.issuanceCity || null;
      if ((issuanceCity || "") !== (selectedLoan.issuanceCity || "")) {
        payload.issuanceCity = issuanceCity;
      }

      const paymentCity = loanForm.paymentCity || null;
      if ((paymentCity || "") !== (selectedLoan.paymentCity || "")) {
        payload.paymentCity = paymentCity;
      }

      if ((loanForm.promissoryNoteType || "") !== (selectedLoan.promissoryNoteType || "")) {
        payload.promissoryNoteType = loanForm.promissoryNoteType;
      }

      const promissoryNoteDateValue =
        loanForm.promissoryNoteType === "manual" && loanForm.promissoryNoteDate
          ? dateOnly(loanForm.promissoryNoteDate)
          : "";
      const oldPromissoryNoteDateValue = dateOnly(selectedLoan.promissoryNoteDate);
      if (
        (promissoryNoteDateValue || "") !== (oldPromissoryNoteDateValue || "")
      ) {
        payload.promissoryNoteDate = promissoryNoteDateValue
          ? new Date(promissoryNoteDateValue).toISOString()
          : null;
      }

      const advancePaymentValue = loanForm.hasAdvancePayment === "yes" 
        ? normalizeNumber(loanForm.advancePayment)
        : 0;
      const oldAdvancePaymentValue = Number(selectedLoan.advancePayment || 0);
      if (advancePaymentValue !== oldAdvancePaymentValue) {
        payload.advancePayment = advancePaymentValue;
      }

      if (Object.keys(payload).length === 0) {
        notifyWarning("لا توجد تعديلات لحفظها");
        return;
      }

      await updateLoan(selectedLoan.id, payload);
      notifySuccess("تم تعديل السلفة بنجاح");

      const updatedLoan = await getLoanById(selectedLoan.id);
      const mergedForPreview = {
        ...updatedLoan,
        client: selectedClient?.client || updatedLoan.client,
      };
      setSelectedLoan(mergedForPreview);
      setSavedLoanData(mergedForPreview);

      if (generateContracts && debtAckTemplate && promissoryNoteTemplate) {
        try {
          await handleOpenPreview(mergedForPreview);
        } catch (error) {
          console.error("Error generating preview contracts:", error);
          notifyError("تم تحديث السلفة لكن حدث خطأ أثناء توليد معاينة العقود");
        }
      }
      queryClient.invalidateQueries(["loans"]);
      queryClient.invalidateQueries(["unposted-loan-journals"]);
      queryClient.invalidateQueries(["unposted-journals-all"]);
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
      } else {
        setSelectedBank(null);
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
        amount: formatCurrencySar(Number(loan.amount ?? 0).toFixed(2)),
        totalInterest: formattedTotalInterest.toString(),
        interestRate: (loan.interestRate ?? 0).toString(),
        paymentAmount: loan.paymentAmount?.toString() || "",
        type: loan.type || "",
        source: loan.source || "",
        startDate: loan.startDate ? String(loan.startDate).split("T")[0] : "",
        repaymentDay: loan.repaymentDay ? String(loan.repaymentDay).split("T")[0] : "",
        issuanceCity: loan.issuanceCity || "",
        paymentCity: loan.paymentCity || "",
        promissoryNoteType: loan.promissoryNoteType || "",
        promissoryNoteDate: loan.promissoryNoteDate ? loan.promissoryNoteDate.split("T")[0] : "",
        hasAdvancePayment: Number(loan.advancePayment) > 0 ? "yes" : "no",
        advancePayment:
          Number(loan.advancePayment) > 0 ? String(loan.advancePayment) : "",
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
    setActiveTab(2);
  };
  const handleConvertClient = async (loan) => {
    try {
      const fullLoanData = await getLoanById(loan.id);
      const mergedLoanData = { ...fullLoanData, amount: loan.amount };
      setLoanForConversion(mergedLoanData);
      setIsClientConversion(true);
      setActiveTab(1);
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
    setActiveTab(0);
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
    setLoanForm((prev) => {
      const raw = String(prev.amount || "").replace(/,/g, "").trim();
      if (!raw && selectedLoan != null) {
        return {
          ...prev,
          amount: formatCurrencySar(Number(selectedLoan.amount ?? 0).toFixed(2)),
        };
      }
      return prev;
    });
  };
  const handleInputChange = (field, value) => {
    if (field === "amount") {
      setLoanPrincipalSummaryAr("");
      value = sanitizeLoanPrincipalInput(value);
      const rawValue = value.replace(/,/g, "");
      const numericAmount = parseFloat(rawValue);
      const canValidate =
        rawValue !== "" &&
        rawValue !== "." &&
        !Number.isNaN(numericAmount) &&
        !rawValue.endsWith(".");
      if (canValidate) {
        if (loanForm.source === "MIX") {
          const totalBalances = (mixBalances.general || 0) + (mixBalances.newCapital || 0);
          if (numericAmount > totalBalances) {
            notifyError(
              `المبلغ المدخل (${formatAmount(
                numericAmount.toFixed(2)
              )}) يتجاوز مجموع أرصدة الصناديق المتاحة (${formatAmount(
                totalBalances.toFixed(2)
              )})`
            );
            return;
          }
        } else if (fundBalanceForLoanForm !== null) {
          if (numericAmount > fundBalanceForLoanForm) {
            notifyError(
              `المبلغ المدخل (${formatAmount(
                numericAmount.toFixed(2)
              )}) يتجاوز رصيد الصندوق المتاح (${formatAmount(
                fundBalanceForLoanForm.toFixed(2)
              )})`
            );
            return;
          }
        }
      }
    } else if (field === "paymentAmount" || field === "totalInterest" || field === "advancePayment") {
      const rawValue = value.replace(/,/g, "");
      if (!isNaN(rawValue)) {
        value = formatAmount(rawValue);
      }
    }
    setLoanForm((prev) => {
      const updatedForm = {
        ...prev,
        [field]: value,
      };
      if (field === "totalInterest") {
        if (value !== "") {
          const amount = parseFloat(prev.amount.replace(/,/g, "")) || 0;
          const totalInterest = parseFloat(value.replace(/,/g, "")) || 0;
          if (amount > 0) {
            const percentage = totalInterest > 0 ? (totalInterest / amount) * 100 : 0;
            updatedForm.interestRate = percentage.toFixed(2);
          }
        } else {
          updatedForm.interestRate = "";
        }
      } else if (field === "interestRate") {
        if (value !== "") {
          const amount = parseFloat(prev.amount.replace(/,/g, "")) || 0;
          const rate = parseFloat(value) || 0;
          if (amount > 0) {
            const calculatedInterest = (amount * rate) / 100;
            updatedForm.totalInterest = formatAmount(calculatedInterest.toFixed(2));
          }
        } else {
          updatedForm.totalInterest = "";
        }
      } else if (field === "amount" && value !== "") {
        const amount = parseFloat(value.replace(/,/g, "")) || 0;
        if (prev.interestRate !== "" && amount > 0) {
          const rate = parseFloat(prev.interestRate) || 0;
          const calculatedInterest = (amount * rate) / 100;
          updatedForm.totalInterest = formatAmount(calculatedInterest.toFixed(2));
        } else if (prev.totalInterest !== "" && amount > 0) {
          const totalInterest = parseFloat(prev.totalInterest.replace(/,/g, "")) || 0;
          const percentage = totalInterest > 0 ? (totalInterest / amount) * 100 : 0;
          updatedForm.interestRate = percentage.toFixed(2);
        }
      }
      if (field === "promissoryNoteType") {
        if (value === "inspection") {
          updatedForm.promissoryNoteDate = "";
        } else if (value === "manual" && !prev.promissoryNoteDate) {
          updatedForm.promissoryNoteDate = "";
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
  const isFormValid = useMemo(() => {
    if (isEditMode) {
      return (
        !!selectedLoan &&
        !!loanForm.source &&
        String(loanForm.source).trim() !== ""
      );
    }

    const isPromissoryNoteValid = 
      loanForm.promissoryNoteType && 
      loanForm.promissoryNoteType.trim() !== "" &&
      (loanForm.promissoryNoteType === "inspection" ||
        (loanForm.promissoryNoteType === "manual" && loanForm.promissoryNoteDate && loanForm.promissoryNoteDate.trim() !== ""));
    const totalInterestValue = loanForm.totalInterest === "" ? null : parseFloat(String(loanForm.totalInterest).replace(/,/g, ""));
    const interestRateValue = loanForm.interestRate === "" ? null : parseFloat(String(loanForm.interestRate));
    const isTotalInterestValid = totalInterestValue !== null && !isNaN(totalInterestValue) && totalInterestValue >= 0;
    const isInterestRateValid = interestRateValue !== null && !isNaN(interestRateValue) && interestRateValue >= 0;
    return (
      selectedClient &&
      selectedPartner &&
      selectedBank &&
      loanForm.amount &&
      String(loanForm.amount).trim() !== "" &&
      isTotalInterestValid &&
      isInterestRateValid &&
      loanForm.paymentAmount &&
      String(loanForm.paymentAmount).trim() !== "" &&
      loanForm.type &&
      String(loanForm.type).trim() !== "" &&
      loanForm.source &&
      String(loanForm.source).trim() !== "" &&
      loanForm.repaymentDay &&
      String(loanForm.repaymentDay).trim() !== "" &&
      isPromissoryNoteValid
    );
  }, [
    isEditMode,
    selectedLoan,
    selectedClient,
    selectedPartner,
    selectedBank,
    loanForm.amount,
    loanForm.totalInterest,
    loanForm.interestRate,
    loanForm.paymentAmount,
    loanForm.type,
    loanForm.source,
    loanForm.repaymentDay,
    loanForm.promissoryNoteType,
    loanForm.promissoryNoteDate
  ]);
  const canEditLoan = selectedLoan && selectedLoan.status === "PENDING";
  const isReadOnlyMode = isViewMode;
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-slate-900">
      <Helmet>
        <title>السلف</title>
        <meta name="description" content="السلف" />
      </Helmet>
      <div
        className={`flex w-full flex-1 ${isSmallScreen ? "flex-col" : "flex-row-reverse"} ${isSmallScreen ? "h-auto" : "h-[calc(100vh-80px)]"}`}
      >
        {activeTab === 1 && !isSmallScreen && (
          <div className="flex h-full w-[350px] shrink-0 flex-col overflow-y-auto bg-white dark:bg-slate-900">
            {!isClientConversion && (
              <div className={isTablet ? "p-4" : "p-6"}>
                <h3 className={`font-bold ${isTablet ? "mb-4 text-base" : "mb-6 text-lg"}`}>
                  محاكاة السلفة
                </h3>
              {simulationSummary && loanForm.type ? (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      {simulationSummary.loanType === "DAILY"
                        ? "عدد الأيام"
                        : simulationSummary.loanType === "WEEKLY"
                        ? "عدد الأسابيع"
                        : "عدد الأشهر"}
                    </span>
                    <span className="text-xl font-bold text-primary">
                      {simulationSummary.durationText}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      إجمالي الفائدة
                    </span>
                    <span className="text-base text-slate-800 dark:text-slate-200">
                      {formatAmount(simulationSummary.totalInterest.toFixed(2))}{" "}
                    </span>
                  </div>
                  {simulationSummary.hasAdvanceBreakdown && (
                    <>
                      <div className="flex flex-col gap-1 rounded-lg border border-red-200 bg-red-50 px-3 py-2 dark:border-red-900/50 dark:bg-red-950/40">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-red-700 dark:text-red-400">
                            الدفع المقدم
                          </span>
                          <span className="text-base font-semibold text-red-600 dark:text-red-400">
                            {formatAmount(simulationSummary.advancePayment.toFixed(2))}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                          يُخصم من أصل السلفة المدخل في النموذج فقط، ولا يُخصم من إجمالي الفائدة.
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          أصل السلفة بعد خصم الدفع المقدم
                        </span>
                        <span className="text-base text-slate-800 dark:text-slate-200">
                          {formatAmount(simulationSummary.principalNet.toFixed(2))}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                      المبلغ الإجمالي المستحق
                    </span>
                    <span className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatAmount(simulationSummary.totalAmount.toFixed(2))}{" "}
                    </span>
                  </div>
                  {simulationSummary.hasAdvanceBreakdown && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      (= أصل السلفة بعد الخصم + إجمالي الفائدة)
                    </p>
                  )}
                  <hr className="border-slate-200 dark:border-slate-700" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500 dark:text-slate-400">حالة السلفة</span>
                    <span
                      className={`rounded-lg border px-3 py-1 text-xs font-bold ${
                        isViewMode
                          ? "border-slate-200 bg-slate-100 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
                          : isEditMode
                          ? "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-400"
                          : "border-primary/20 bg-primary/10 text-primary"
                      }`}
                    >
                      {isViewMode ? "عرض" : isEditMode ? "تحت التعديل" : "جديد"}
                    </span>
                  </div>
                </div>
              ) : !isViewMode && (
                <div className="rounded-xl border border-primary/30 bg-primary/10 px-4 py-3 text-sm text-primary dark:border-primary/50 dark:bg-primary/20 dark:text-primary">
                  أدخل بيانات السلفة لعرض المحاكاة
                </div>
              )}
            </div>
            )}
            <div className={isTablet ? "p-4" : "p-6"}>
              <h3 className={`font-bold ${isTablet ? "mb-4 text-base" : "mb-6 text-lg"}`}>
                الإجراءات
              </h3>
              <div className="flex flex-col gap-3">
                {isClientConversion && (
                  <>
                    <button
                      type="button"
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
                      className={`w-full rounded-xl font-bold transition-colors ${
                        selectedClientForConversion
                          ? "bg-primary text-white hover:bg-primary/90"
                          : "cursor-not-allowed bg-slate-300 text-slate-600 dark:bg-slate-600 dark:text-slate-400"
                      } ${isTablet ? "h-11 text-sm" : "h-12 text-base"}`}
                    >
                      نقل كامل المديونية
                    </button>
                    <button
                      type="button"
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
                      className={`w-full rounded-xl font-bold transition-colors ${
                        selectedClientForConversion
                          ? "bg-amber-500 text-white hover:bg-amber-600"
                          : "cursor-not-allowed bg-slate-300 text-slate-600 dark:bg-slate-600 dark:text-slate-400"
                      } ${isTablet ? "h-11 text-sm" : "h-12 text-base"}`}
                    >
                      نقل جزء من المديونية
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelConversion}
                      className={`w-full rounded-xl border border-red-500/50 font-bold text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10 ${
                        isTablet ? "h-11 text-sm" : "h-12 text-base"
                      }`}
                    >
                      إلغاء
                    </button>
                  </>
                )}
                {isViewMode && selectedLoan?.status === "ACTIVE" && (
                  <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-900/20">
                    <span className="text-sm text-amber-800 dark:text-amber-200">
                      لا يمكنك تعديل هذه السلفة لأنها في حالة نشطة. للتعديل يجب إلغاء تفعيل السلفة أولاً.
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate('/installments/' + selectedLoan.id)}
                      className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-bold text-white hover:bg-amber-700"
                    >
                      عرض الدفعات
                    </button>
                  </div>
                )}
                {!isViewMode && !isClientConversion && (
                  <button
                    type="button"
                    onClick={handleSaveLoan}
                    disabled={!isFormValid}
                    className={`w-full rounded-xl bg-primary font-bold text-white transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 ${
                      isTablet ? "h-11 text-sm" : "h-12 text-base"
                    }`}
                  >
                    {isEditMode ? "حفظ التعديلات" : "إنشاء السلفة"}
                  </button>
                )}
                {isViewMode && canEditLoan && (
                  <button
                    type="button"
                    onClick={handleEditLoan}
                    className={`w-full rounded-xl bg-primary font-bold text-white transition-colors hover:bg-primary/90 ${
                      isTablet ? "h-11 text-sm" : "h-12 text-base"
                    }`}
                  >
                    تعديل السلفة
                  </button>
                )}
                {!isClientConversion && (
                  <button
                    type="button"
                    onClick={handleOpenPreview}
                    disabled={!savedLoanData && (!isViewMode || (selectedLoan?.DEBT_ACKNOWLEDGMENT && selectedLoan?.PROMISSORY_NOTE))}
                    className={`w-full rounded-xl border border-primary font-bold text-primary transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 ${
                      isTablet ? "h-11 text-sm" : "h-12 text-base"
                    }`}
                  >
                    معاينة العقود
                  </button>
                )}
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditMode(false);
                      setIsViewMode(true);
                    }}
                    className={`w-full rounded-xl border border-red-500/50 font-bold text-red-600 transition-colors hover:bg-red-50 dark:hover:bg-red-900/10 ${
                      isTablet ? "h-11 text-sm" : "h-12 text-base"
                    }`}
                  >
                    إلغاء التعديل
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        <div
          className={`flex flex-1 flex-col overflow-y-auto bg-white dark:bg-slate-900 ${
            isSmallScreen ? "p-4" : isLargeScreen ? "p-6" : "p-8"
          }`}
        >
          <div className="w-full">
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
              <div className="flex w-full flex-col">
                <LoanMainTab
                  loansNeedingContracts={loansNeedingContracts}
                  subTab={subTab}
                  setSubTab={setSubTab}
                  handleViewLoanDetails={handleViewLoanDetails}
                  statusCounts={statusCounts}
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
              </div>
            ) : activeTab === 1 ? (
              <div>
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
                    onAddKafeelClick={handleAddKafeelClick}
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
                    onAddClientClick={() => navigate("/clients/add?returnTo=loans")}
                    onAddKafeelClick={handleAddKafeelClick}
                    selectedKafeel={selectedKafeel}
                    handleKafeelSelect={handleKafeelSelect}
                    clientLoansData={clientLoansData}
                    isReadOnlyMode={isReadOnlyMode}
                  />
                )}
                {permissions.includes("loans_Add") && !isClientConversion && (
                  <BankAccountAutocomplete
                    isSmallScreen={isSmallScreen}
                    showBalance={false}
                    selectedBank={selectedBank}
                    banksData={banksData}
                    isBanksLoading={isBanksLoading}
                    handleBankSelect={handleBankSelect}
                    handleBanksSearchChange={handleBanksSearchChange}
                    isReadOnlyMode={isReadOnlyMode}
                  />
                )}
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
                    partnersData={partnersData}
                    isPartnersLoading={isPartnersLoading}
                    selectedPartner={selectedPartner}
                    handlePartnerSelect={handlePartnerSelect}
                    handlePartnersSearchChange={handlePartnersSearchChange}
                    bankBalance={fundBalanceForLoanForm}
                    mixBalances={mixBalances}
                    formatAmount={formatAmount}
                    formatLoanPrincipal={formatCurrencySar}
                    loanPrincipalSummaryText={loanPrincipalSummaryAr}
                    onLoanPrincipalBlur={handleLoanPrincipalBlur}
                    selectedLoan={selectedLoan}
                  />
                )}
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
              </div>
            ) : activeTab === 2 ? (
              <div>
                <EditSmallLoanForm
                  selectedLoan={selectedLoanForEdit}
                  onLoanUpdated={() => {
                    setSelectedLoanForEdit(null);
                    setIsSmallLoanEditMode(false);
                    setActiveTab(3);
                    queryClient.invalidateQueries(["unposted-small-loan-journals"]);
                    queryClient.invalidateQueries(["unposted-journals-all"]);
                    queryClient.invalidateQueries(["small-loans"]);
                  }}
                />
              </div>
            ) : activeTab === 3 ? (
              <div className="flex w-full flex-col">
                <SmallLoansTable onEditLoan={handleEditSmallLoan} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
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
    </div>
  );
};
export default Loans;