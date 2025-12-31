import React from "react";
import {
  Box,
  Typography,
  Grid,
  Autocomplete,
  TextField,
  Button,
  Paper,
  CircularProgress,
} from "@mui/material";

const LoanClientSection = ({
  isSmallScreen,
  clientsData,
  isClientsLoading,
  selectedClient,
  handleClientSelect,
  handleSearchChange,
  isViewMode,
  isEditMode,
  isAdditionalLoan,
  setIsAddClientOpen,
  selectedKafeel,
  handleKafeelSelect,
}) => {
  // Get all kafeels for the selected client
  const getAvailableKafeels = () => {
    if (!selectedClient?.kafeels) return [];
    return selectedClient.kafeels;
  };

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
        {isAdditionalLoan ? "العميل المحدد للسلفة الإضافية" : "معلومات العميل"}
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
                        <CircularProgress color="inherit" size={20} />
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
                      "background.paper",
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
            justifyContent: isSmallScreen ? "center" : "flex-start",
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
          {selectedClient && !isViewMode && !isEditMode && (
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
          )}
        </Grid>
        {selectedClient && (
          <Grid item xs={12} sm={10} md={8}>
            <Autocomplete
              options={getAvailableKafeels()}
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
                      backgroundColor: "background.paper",
                      "&:hover fieldset": {
                        borderColor: "primary.main",
                      },
                    },
                  }}
                />
              )}
              noOptionsText={
                !selectedClient
                  ? "جاري تحميل البيانات..."
                  : selectedClient.kafeels?.length === 0
                  ? "لا يوجد كفلاء برجاء اضافه كفيل"
                  : "جميع الكفلاء مستخدمون في سلف أخرى"
              }
            />
          </Grid>
        )}

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
  );
};

export default LoanClientSection;
