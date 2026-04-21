import React from "react";
import { Box, Grid, Autocomplete, TextField, CircularProgress, Paper, Typography } from "@mui/material";
import BankAccountBalanceInline from "./BankAccountBalanceInline";

/**
 * @param {'section' | 'field'} variant — section: عنوان + ورق؛ field: حقل فقط (للمدال أو صفوف مضغوطة)
 */
const BankAccountAutocomplete = ({
  variant = "section",
  sectionTitle = "معلومات البنك",
  showBalance = true,
  isSmallScreen,
  selectedBank,
  banksData,
  isBanksLoading,
  handleBankSelect,
  handleBanksSearchChange,
  isReadOnlyMode,
  label = "اختر الحساب البنكي",
  placeholder = "ابحث باسم الحساب أو رقم الحساب",
  fullWidth = false,
}) => {
  const inputWidth = fullWidth ? "100%" : isSmallScreen ? "250px" : "350px";
  const field = (
    <Autocomplete
      options={banksData?.data || []}
      getOptionLabel={(option) => `${option.name} - ${option.accountNumber}`}
      value={selectedBank}
      onChange={handleBankSelect}
      onInputChange={handleBanksSearchChange}
      loading={isBanksLoading}
      disabled={isReadOnlyMode}
      fullWidth={fullWidth}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {isBanksLoading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              height: "56px",
              width: fullWidth ? "100%" : inputWidth,
              backgroundColor: "transparent",
            },
          }}
        />
      )}
    />
  );

  if (variant === "field") {
    return (
      <Box sx={{ width: fullWidth ? "100%" : "auto" }}>
        {field}
        {showBalance && (
          <BankAccountBalanceInline bankAccountId={selectedBank?.id} />
        )}
      </Box>
    );
  }

  return (
    <Paper
      sx={{
        p: isSmallScreen ? 2 : 4,
        mb: isSmallScreen ? 2 : 3,
        borderRadius: 2,
      }}
    >
      <Typography
        variant={isSmallScreen ? "subtitle1" : "h6"}
        fontWeight="bold"
        color="text.primary"
        mb={isSmallScreen ? 2 : 3}
        textAlign="center"
      >
        {sectionTitle}
      </Typography>
      <Grid container spacing={isSmallScreen ? 2 : 3} justifyContent="center">
        <Grid item xs={12} sm={10} md={8}>
          <Box>
            {field}
            {showBalance && (
              <BankAccountBalanceInline
                bankAccountId={selectedBank?.id}
                sx={{ textAlign: "center" }}
              />
            )}
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default BankAccountAutocomplete;
