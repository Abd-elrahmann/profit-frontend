import React, { useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Autocomplete,
  TextField,
  Paper,
  CircularProgress,
  Button,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import {
  getClients,
} from "../../pages/Loans/loanApis";
import { usePermissions } from "../../components/Contexts/PermissionsContext";
import LoanDetailsSection from "./LoanDetailsSection";

const LoanClientConversion = ({
  loan,
  isSmallScreen,
  selectedClient,
  onClientSelect,
  selectedKafeel,
  onKafeelSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [clientsPage, setClientsPage] = useState(1);
  const { permissions } = usePermissions();

  const { data: clientsData, isLoading: isClientsLoading } = useQuery({
    queryKey: ["clients", clientsPage, searchQuery],
    queryFn: () => getClients(clientsPage, searchQuery),
    enabled: !!permissions.includes("loans_Add"),
  });

  // Create loanForm from loan data for LoanDetailsSection
  const loanForm = {
    amount: loan?.amount?.toString() || "",
    totalInterest: loan?.interestAmount?.toString() || "",
    interestRate: loan?.interestRate?.toString() || "",
    paymentAmount: loan?.paymentAmount?.toString() || "",
    type: loan?.type || "",
    startDate: loan?.startDate ? new Date(loan.startDate).toISOString().split("T")[0] : "",
    repaymentDay: loan?.repaymentDay ? new Date(loan.repaymentDay).toISOString().split("T")[0] : "",
  };

  // Mock functions for LoanDetailsSection (since all fields are disabled)
  const handleInputChange = () => {}; // No-op since all fields are disabled
  const handleBankSelect = () => {};
  const handleBanksSearchChange = () => {};
  const handlePartnerSelect = () => {};
  const handlePartnersSearchChange = () => {};
  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return "";
    const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, "")) : amount;
    if (isNaN(numAmount)) return "";
    const rounded = parseFloat(numAmount.toFixed(2));
    return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleClientSelect = (event, newValue) => {
    onClientSelect(newValue);
  };

  const handleSearchChange = (event, value) => {
    setSearchQuery(value);
    setClientsPage(1);
  };

  // Filter out the current loan client from available options
  const availableClients = clientsData?.clients?.filter(
    (clientOption) => clientOption.client.id !== loan.clientId
  ) || [];

  return (
    <Box>
      <Typography
        variant="h6"
        fontWeight="bold"
        color="#333"
        mb={3}
        textAlign="center"
      >
        نقل مديونية السلفة الخاصة بالعميل{" "}
        <Box component="span" sx={{ color: "primary.main", fontWeight: "bold" }}>
          {loan.client?.name}
        </Box>
      </Typography>

      {/* Current Client Info */}
      <Paper
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          border: "1px solid #e5e7eb",
          backgroundColor: "#f8f9fa",
        }}
      >
        <Typography
          variant="subtitle1"
          fontWeight="bold"
          color="#666"
          mb={2}
          textAlign="center"
        >
          العميل الحالي
        </Typography>
        <Grid container spacing={2} justifyContent="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="اسم العميل"
              value={loan.client?.name || ""}
              disabled
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#e9ecef",
                },
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              label="رقم الهوية"
              value={loan.client?.nationalId || ""}
              disabled
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "#e9ecef",
                },
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Current Client Kafeel Info - Show if current client has kafeel */}
      {loan.kafeel && (
        <Paper
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: "1px solid #e5e7eb",
            backgroundColor: "#f8f9fa",
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            color="#666"
            mb={2}
            textAlign="center"
          >
            كفيل العميل الحالي
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="اسم الكفيل"
                value={loan.kafeel?.name || ""}
                disabled
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#e9ecef",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="رقم الهوية"
                value={loan.kafeel?.nationalId || ""}
                disabled
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#e9ecef",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="تاريخ الميلاد"
                value={loan.kafeel?.birthDate ? new Date(loan.kafeel.birthDate).toISOString().split("T")[0] : ""}
                disabled
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#e9ecef",
                  },
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* New Client Selection */}
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
          اختر العميل الجديد
        </Typography>
        <Grid
          container
          spacing={isSmallScreen ? 2 : 3}
          justifyContent="center"
        >
          <Grid item xs={12} sm={10} md={8}>
            <Autocomplete
              options={availableClients}
              getOptionLabel={(option) =>
                `${option.client.name} - ${option.client.nationalId}`
              }
              value={selectedClient}
              onChange={handleClientSelect}
              onInputChange={handleSearchChange}
              loading={isClientsLoading}
              noOptionsText="لا يوجد عملاء متاحين لنقل المديونية"
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
                      backgroundColor: "#f9fafb",
                      "&:hover fieldset": {
                        borderColor: "primary.main",
                      },
                    },
                  }}
                />
              )}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* New Client Kafeel Selection - Show if new client is selected */}
      {selectedClient && (
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
            اختيار الكفيل للعميل الجديد
          </Typography>
          <Grid
            container
            spacing={isSmallScreen ? 2 : 3}
            justifyContent="center"
          >
            <Grid item xs={12} sm={10} md={8}>
              <Autocomplete
                options={selectedClient.kafeels || []}
                getOptionLabel={(option) =>
                  `${option.name} - ${option.nationalId}`
                }
                value={selectedKafeel || null}
                onChange={(event, newValue) => {
                  onKafeelSelect(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="اختر الكفيل"
                    placeholder="ابحث بالاسم أو رقم الهوية"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: "56px",
                        width: isSmallScreen ? "250px" : "350px",
                        backgroundColor: "#f9fafb",
                        "&:hover fieldset": {
                          borderColor: "primary.main",
                        },
                      },
                    }}
                  />
                )}
                noOptionsText={
                  !selectedClient.kafeels || selectedClient.kafeels.length === 0
                    ? "لا يوجد كفلاء برجاء اضافه كفيل"
                    : "جميع الكفلاء مستخدمون في سلف أخرى"
                }
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
                justifyContent: isSmallScreen ? "center" : "flex-start",
                gap: 1.5,
              }}
            >
              <Button
                variant="outlined"
                onClick={() => window.dispatchEvent(new CustomEvent('open-add-kafeel-modal'))}
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
            </Grid>

            {selectedClient &&
              (!selectedClient.kafeels || selectedClient.kafeels.length === 0) && (
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

      {/* Selected New Client Kafeel Info - Show if kafeel is selected */}
      {selectedKafeel && (
        <Paper
          sx={{
            p: 3,
            mb: 3,
            borderRadius: 2,
            border: "1px solid #e5e7eb",
            backgroundColor: "#f8f9fa",
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight="bold"
            color="#666"
            mb={2}
            textAlign="center"
          >
            كفيل العميل الجديد المختار
          </Typography>
          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="اسم الكفيل"
                value={selectedKafeel?.name || ""}
                disabled
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#e9ecef",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="رقم الهوية"
                value={selectedKafeel?.nationalId || ""}
                disabled
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#e9ecef",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="تاريخ الميلاد"
                value={selectedKafeel?.birthDate ? new Date(selectedKafeel.birthDate).toISOString().split("T")[0] : ""}
                disabled
                InputLabelProps={{
                  shrink: true,
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#e9ecef",
                  },
                }}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Loan Details - Same as Edit Mode */}
      <LoanDetailsSection
        isSmallScreen={isSmallScreen}
        isMobile={false}
        isViewMode={true} // Show as view mode (all fields disabled)
        isEditMode={false}
        isAdditionalLoan={false}
        customTitle="تفاصيل السلفة" // Fixed title for conversion mode
        loanForm={loanForm}
        handleInputChange={handleInputChange}
        isReadOnlyMode={true} // All fields disabled
        banksData={{ data: [] }}
        isBanksLoading={false}
        selectedBank={loan?.bankAccount || null}
        handleBankSelect={handleBankSelect}
        handleBanksSearchChange={handleBanksSearchChange}
        partnersData={{ partners: [] }}
        isPartnersLoading={false}
        selectedPartner={loan?.partner || null}
        handlePartnerSelect={handlePartnerSelect}
        handlePartnersSearchChange={handlePartnersSearchChange}
        bankBalance={null}
        formatAmount={formatAmount}
      />

    </Box>
  );
};

export default LoanClientConversion;
