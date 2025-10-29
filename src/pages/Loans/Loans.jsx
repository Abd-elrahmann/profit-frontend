import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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
import { debounce } from "lodash";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getClients, createLoan, getLoan, updateLoan } from "./loanApis";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import LoansTable from "../../components/modals/LoansTable";
import AddClient from "../../components/modals/AddClient";

const Loans = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedClient, setSelectedClient] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [clientsPage, setClientsPage] = useState(1);
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
  const [isEditMode, setIsEditMode] = useState(false); // New state for edit mode
  const queryClient = useQueryClient();

  const { data: clientsData, isLoading: isClientsLoading } = useQuery({
    queryKey: ["clients", clientsPage, searchQuery],
    queryFn: () => getClients(clientsPage, searchQuery),
    enabled: activeTab === 1,
  });

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

  const handleSearchChange = (event, value) => {
    debouncedSearch(value);
  };

  const handleClientSelect = (event, newValue) => {
    setSelectedClient(newValue);
  };

  const formatAmount = (amount) => {
    if (!amount) return "";
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const calculateInstallments = () => {
    const amount = parseFloat(loanForm.amount.replace(/,/g, "")) || 0;
    const interestRate = parseFloat(loanForm.interestRate) || 0;
    const durationMonths = parseInt(loanForm.durationMonths) || 0;

    if (amount > 0 && durationMonths > 0) {
      const monthlyInterestRate = interestRate / 100 / 12;
      const monthlyPayment =
        (amount *
          monthlyInterestRate *
          Math.pow(1 + monthlyInterestRate, durationMonths)) /
        (Math.pow(1 + monthlyInterestRate, durationMonths) - 1);

      const calculatedInstallments = [];
      let remainingBalance = amount;

      for (let i = 1; i <= durationMonths; i++) {
        const interest = remainingBalance * monthlyInterestRate;
        const principal = monthlyPayment - interest;
        remainingBalance -= principal;

        calculatedInstallments.push({
          installmentNumber: i,
          dueDate: calculateDueDate(i),
          principal: principal,
          interest: interest,
          installment: monthlyPayment,
          remainingBalance: Math.max(0, remainingBalance),
        });
      }

      setInstallments(calculatedInstallments);
    } else {
      setInstallments([]);
    }
  };

  const calculateDueDate = (installmentNumber) => {
    const startDate = new Date(loanForm.startDate);
    startDate.setMonth(startDate.getMonth() + installmentNumber);
    return startDate.toISOString().split("T")[0];
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

  // eslint-disable-next-line no-unused-vars
  const handleCreateLoan = async (status = "PENDING") => {
    if (!selectedClient) {
      notifyError("يرجى اختيار عميل");
      return;
    }

    try {
      const loanData = {
        clientId: selectedClient.client.id,
        amount: parseFloat(loanForm.amount.replace(/,/g, "")),
        interestRate: parseFloat(loanForm.interestRate),
        durationMonths: parseInt(loanForm.durationMonths),
        type: loanForm.type,
        startDate: loanForm.startDate,
        repaymentDay: parseInt(loanForm.repaymentDay),
      };

      await createLoan(loanData);
      notifySuccess("تم إنشاء السلفة بنجاح");

      resetForm();
      queryClient.invalidateQueries(["loans"]);
      setActiveTab(0);
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء إنشاء السلفة");
    }
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
      };

      await updateLoan(selectedLoan.id, loanData);
      notifySuccess("تم تعديل السلفة بنجاح");

      resetForm();
      queryClient.invalidateQueries(["loans"]);
      setActiveTab(0);
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء تعديل السلفة");
    }
  };

  const handleViewLoanDetails = async (loanId) => {
    try {
      const loan = await getLoan(loanId);
      setSelectedLoan(loan);

      if (loan.client) {
        setSelectedClient({ client: loan.client });
      }

      setLoanForm({
        amount: loan.amount.toString(),
        interestRate: loan.interestRate.toString(),
        durationMonths: loan.durationMonths.toString(),
        type: loan.type,
        startDate: loan.startDate.split("T")[0],
        repaymentDay: loan.repaymentDay?.toString() || "10",
      });

      setIsEditMode(true);
      setActiveTab(1);
    } catch (error) {
      notifyError(
        error.response?.data?.message || "حدث خطأ أثناء تحميل بيانات السلفة"
      );
    }
  };

  const resetForm = () => {
    setSelectedClient(null);
    setSelectedLoan(null);
    setLoanForm({
      amount: "",
      interestRate: "",
      durationMonths: "",
      type: "",
      startDate: new Date().toISOString().split("T")[0],
      repaymentDay: "",
    });
    setInstallments([]);
    setIsEditMode(false);
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

  const handleSaveLoan = (status = "PENDING") => {
    if (isEditMode) {
      handleUpdateLoan();
    } else {
      handleCreateLoan(status);
    }
  };

  const simulationSummary = getSimulationSummary();

  return (
    <Box sx={{ bgcolor: "#f6f6f8", minHeight: "100vh" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row-reverse",
          height: "calc(100vh - 80px)",
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
                      label={isEditMode ? "تحت التعديل" : "نشط"}
                      sx={{
                        backgroundColor: isEditMode
                          ? "rgba(214, 158, 46, 0.2)"
                          : "rgba(56, 161, 105, 0.2)",
                        color: isEditMode ? "#D69E2E" : "#38A169",
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
                {!isEditMode && (
                  <Button
                    variant="outlined"
                    onClick={() => handleSaveLoan("PENDING")}
                    disabled={!selectedClient || !loanForm.amount}
                    sx={{
                      borderColor: "#d1d5db",
                      color: "#333",
                      height: "48px",
                      fontSize: "16px",
                      fontWeight: "bold",
                      "&:hover": { bgcolor: "#f9fafb" },
                    }}
                  >
                    حفظ كمسودة
                  </Button>
                )}

                <Button
                  variant="contained"
                  onClick={() => handleSaveLoan("ACTIVE")}
                  disabled={!selectedClient || !loanForm.amount}
                  sx={{
                    bgcolor: "#0d40a5",
                    height: "48px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    "&:hover": { bgcolor: "rgba(13, 64, 165, 0.9)" },
                  }}
                >
                  {isEditMode ? "تعديل السلفة" : "إنشاء السلفة"}
                </Button>

                <Button
                  variant="outlined"
                  onClick={resetForm}
                  sx={{
                    borderColor: "rgba(13, 64, 165, 0.5)",
                    color: "#0d40a5",
                    height: "48px",
                    fontSize: "16px",
                    fontWeight: "bold",
                    "&:hover": { bgcolor: "rgba(13, 64, 165, 0.1)" },
                  }}
                >
                  {isEditMode ? "إلغاء التعديل" : "إضافة سلفة آخرة"}
                </Button>
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
            width: activeTab === 0 ? "100%" : "calc(100% - 350px)",
          }}
        >
          <Box sx={{ maxWidth: "1200px", margin: "0 auto" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
              <Tabs
                value={activeTab}
                onChange={(e, newValue) => {
                  setActiveTab(newValue);
                  if (newValue === 0) {
                    resetForm();
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
                  label={isEditMode ? "تعديل السلفة" : "إنشاء سلفة جديدة"}
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
              <Box sx={{ width: "100%", flexGrow: 1 }}>
                <LoansTable onViewDetails={handleViewLoanDetails} />
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
                        disabled={isEditMode}
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
                                backgroundColor: isEditMode
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
                      {!isEditMode && (
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
                    {isEditMode ? "تعديل تفاصيل السلفة" : "حدد تفاصيل السلفة"}
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
                        InputProps={{
                          endAdornment: (
                            <Typography
                              sx={{
                                color: "text.secondary",
                                marginLeft: "5px",
                              }}
                            >
                              ر.س
                            </Typography>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "56px",
                            width: "250px",
                            backgroundColor: "#f9fafb",
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
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "56px",
                            width: "250px",
                            backgroundColor: "#f9fafb",
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
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "56px",
                            width: "250px",
                            backgroundColor: "#f9fafb",
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
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "56px",
                            width: "250px",
                            backgroundColor: "#f9fafb",
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
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "56px",
                            width: "250px",
                            backgroundColor: "#f9fafb",
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
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            height: "56px",
                            width: "250px",
                            backgroundColor: "#f9fafb",
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Paper>

                <Paper
                  sx={{ p: 4, borderRadius: 2 }}
                >
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="#333"
                    mb={3}
                    textAlign="center"
                  >
                    جدول الأقساط الذي تم إنشاؤه
                  </Typography>
                  {installments.length > 0 ? (
                    <Box sx={{ overflow: "auto" }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ borderBottom: "1px solid #e5e7eb" }}>
                            <TableCell
                              sx={{ fontWeight: "bold", color: "#333" }}
                            >
                              #
                            </TableCell>
                            <TableCell
                              sx={{ fontWeight: "bold", color: "#333" }}
                            >
                              تاريخ الاستحقاق
                            </TableCell>
                            <TableCell
                              align="left"
                              sx={{ fontWeight: "bold", color: "#333" }}
                            >
                              المبلغ الأصلي
                            </TableCell>
                            <TableCell
                              align="left"
                              sx={{ fontWeight: "bold", color: "#333" }}
                            >
                              الفائدة
                            </TableCell>
                            <TableCell
                              align="left"
                              sx={{ fontWeight: "bold", color: "#333" }}
                            >
                              القسط
                            </TableCell>
                            <TableCell
                              align="left"
                              sx={{ fontWeight: "bold", color: "#333" }}
                            >
                              الرصيد المتبقي
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {installments.slice(0, 5).map((installment) => (
                            <TableRow
                              key={installment.installmentNumber}
                              sx={{ borderBottom: "1px solid #f3f4f6" }}
                            >
                              <TableCell>
                                {installment.installmentNumber}
                              </TableCell>
                              <TableCell>{installment.dueDate}</TableCell>
                              <TableCell align="left">
                                {installment.principal.toFixed(2)} ر.س
                              </TableCell>
                              <TableCell align="left">
                                {installment.interest.toFixed(2)} ر.س
                              </TableCell>
                              <TableCell
                                align="left"
                                sx={{ fontWeight: "bold", color: "#333" }}
                              >
                                {installment.installment.toFixed(2)} ر.س
                              </TableCell>
                              <TableCell align="left">
                                {installment.remainingBalance.toFixed(2)} ر.س
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Box>
                  ) : (
                    <Alert severity="info">
                      أدخل بيانات السلفة لعرض جدول الأقساط
                    </Alert>
                  )}
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
    </Box>
  );
};

export default Loans;
