import React from "react";
import {
  Typography,
  Grid,
  TextField,
  Paper,
  Autocomplete,
  CircularProgress,
  MenuItem,
  Box,
} from "@mui/material";

const LoanDetailsSection = ({
  isSmallScreen,
  isMobile,
  isViewMode,
  isEditMode,
  isAdditionalLoan,
  customTitle,
  loanForm,
  handleInputChange,
  isReadOnlyMode,
  banksData,
  isBanksLoading,
  selectedBank,
  handleBankSelect,
  handleBanksSearchChange,
  partnersData,
  isPartnersLoading,
  selectedPartner,
  handlePartnerSelect,
  handlePartnersSearchChange,
  bankBalance,
  formatAmount,
}) => {
  return (
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
        {customTitle ||
          (isViewMode
            ? "تفاصيل السلفة"
            : isEditMode
            ? "تعديل تفاصيل السلفة"
            : "حدد تفاصيل السلفة")}
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
              onChange={(e) => handleInputChange("amount", e.target.value)}
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
                  width: "200px",
                  backgroundColor: isReadOnlyMode ? "#f5f5f5" : "#f9fafb",
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
                {bankBalance !== null ? (
                  <>
                    <span style={{ color: "black", fontSize: "16px" }}>
                      رصيد الصندوق المتاح:{" "}
                    </span>
                    <span
                      style={{
                        fontWeight: "bold",
                        fontSize: "16px",
                        color: "green",
                      }}
                    >
                      {formatAmount(bankBalance.toString())}
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
            onChange={(e) => handleInputChange("totalInterest", e.target.value)}
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
                width: "200px",
                backgroundColor: isReadOnlyMode ? "#f5f5f5" : "#f9fafb",
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
            onChange={(e) => handleInputChange("paymentAmount", e.target.value)}
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
                width: "200px",
                backgroundColor: isReadOnlyMode ? "#f5f5f5" : "#f9fafb",
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
            onChange={(e) => handleInputChange("type", e.target.value)}
            disabled={isReadOnlyMode}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "56px",
                width: "200px",
                backgroundColor: isReadOnlyMode ? "#f5f5f5" : "#f9fafb",
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
            type="date"
            label="تاريخ الاستحقاق"
            value={loanForm.repaymentDay}
            onChange={(e) => handleInputChange("repaymentDay", e.target.value)}
            disabled={isReadOnlyMode}
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "56px",
                width: "200px",
                backgroundColor: isReadOnlyMode ? "#f5f5f5" : "#f9fafb",
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
            onChange={(e) => handleInputChange("startDate", e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            disabled={isReadOnlyMode}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "56px",
                width: "200px",
                backgroundColor: isReadOnlyMode ? "#f5f5f5" : "#f9fafb",
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
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "56px",
                    width: "200px",
                    backgroundColor: isReadOnlyMode ? "#f5f5f5" : "#f9fafb",
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
              option.name + " - " + (option.isActive ? "نشط" : "غير نشط")
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
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    height: "56px",
                    width: "200px",
                    backgroundColor: isReadOnlyMode ? "#f5f5f5" : "#f9fafb",
                  },
                }}
              />
            )}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LoanDetailsSection;
