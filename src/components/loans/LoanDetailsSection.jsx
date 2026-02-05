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
  Alert,
} from "@mui/material";

const LoanDetailsSection = ({
  isSmallScreen,
  isViewMode,
  isEditMode,
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
  mixBalances,
  formatAmount,
  selectedLoan,
}) => {
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
        <Grid item xs={12} sm={6} md={6}>
          <TextField
            fullWidth
            type="text"
            label="مصدر السلفة"
            select
            value={isViewMode ? (loanForm.source || selectedLoan?.source) : loanForm.source}
            onChange={(e) => handleInputChange("source", e.target.value)}
            disabled={isReadOnlyMode || isEditMode}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "56px",
                width: "300px",
                backgroundColor: "background.paper",
              },
            }}
          >
            <MenuItem value="GENERAL">عام</MenuItem>
            <MenuItem value="NEW_CAPITAL">رأس مال جديد</MenuItem>
            <MenuItem value="MIX">عام و رأس مال جديد</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
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
                  width: "300px",
                  backgroundColor: "background.paper",
                },
              }}
            />
            {!isReadOnlyMode && loanForm.source && loanForm.source.trim() !== "" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    fontSize: "16px",
                    mt: -0.5,
                    ml: 1,
                  }}
                >
                  {loanForm.source === "MIX" ? (
                    mixBalances.general !== null && mixBalances.newCapital !== null ? (
                      <>
                        <span style={{ color: "text.primary", fontSize: "14px" }}>
                          رصيد الصناديق:{" "}
                        </span>
                        <span
                          style={{
                            fontWeight: "bold",
                            fontSize: "14px",
                            color: "green",
                          }}
                        >
                          {formatAmount(mixBalances.general.toString())} صندوق عام + {formatAmount(mixBalances.newCapital.toString())} رأس مال جديد
                        </span>
                      </>
                    ) : (
                      "جاري تحميل أرصدة الصناديق..."
                    )
                  ) : bankBalance !== null ? (
                    <>
                      <span style={{ color: "text.primary", fontSize: "16px" }}>
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
                {loanForm.amount && loanForm.amount.replace(/,/g, "") !== "" && (
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.secondary",
                      fontSize: "14px",
                      ml: 1,
                    }}
                  >
                    {(() => {
                      const loanAmount = parseFloat(loanForm.amount.replace(/,/g, "") || 0);
                      if (isNaN(loanAmount) || loanAmount === 0) return null;

                      if (loanForm.source === "MIX") {
                        const totalBalances = (mixBalances.general || 0) + (mixBalances.newCapital || 0);
                        const remaining = totalBalances - loanAmount;
                        if (remaining >= 0) {
                          return (
                            <>
                              سيتبقي{" "}
                              <span style={{ fontWeight: "bold", color: "green" }}>
                                {formatAmount(remaining.toFixed(2))}
                              </span>{" "}
                              في الرصيد المتاح
                            </>
                          );
                        }
                      } else if (bankBalance !== null) {
                        const remaining = bankBalance - loanAmount;
                        if (remaining >= 0) {
                          return (
                            <>
                              سيتبقي{" "}
                              <span style={{ fontWeight: "bold", color: "green" }}>
                                {formatAmount(remaining.toFixed(2))}
                              </span>{" "}
                              في الرصيد المتاح
                            </>
                          );
                        }
                      }
                      return null;
                    })()}
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
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
              label="مبلغ الفائدة الإجمالي"
              value={formatAmount(loanForm.totalInterest)}
              onChange={(e) => handleInputChange("totalInterest", e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              disabled={isReadOnlyMode || loanForm.interestRate !== ""}
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "+") e.preventDefault();
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "56px",
                  width: "300px",
                  backgroundColor: loanForm.interestRate !== "" ? "#f5f5f5" : "background.paper",
                },
              }}
              helperText={loanForm.interestRate !== "" ? "مغلق عند إدخال نسبة الفائدة" : ""}
            />
            {!isReadOnlyMode && parseFloat(loanForm.totalInterest?.replace(/,/g, "") || 0) === 0 && loanForm.totalInterest !== "" && (
              <Alert severity="info" sx={{ mt: 1, mb: 1 }}>
                السلفة ستصبح بدون فوائد
              </Alert>
            )}
          </Box>
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <TextField
            fullWidth
            type="number"
            label="معدل الفائدة السنوي (%)"
            value={loanForm.interestRate}
            onChange={(e) => handleInputChange("interestRate", e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            disabled={isReadOnlyMode || loanForm.totalInterest !== ""}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "56px",
                width: "300px",
                backgroundColor: loanForm.totalInterest !== "" ? "#f5f5f5" : "background.paper",
              },
            }}
            helperText={loanForm.totalInterest !== "" ? "مغلق عند إدخال مبلغ الفائدة" : ""}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
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
                width: "300px",
                backgroundColor: "background.paper",
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
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
                width: "300px",
                backgroundColor: "background.paper",
              },
            }}
          >
            <MenuItem value="DAILY">يومي</MenuItem>
            <MenuItem value="WEEKLY">أسبوعي</MenuItem>
            <MenuItem value="MONTHLY">شهري</MenuItem>
          </TextField>
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <TextField
            fullWidth
            type="date"
            label="تاريخ بداية الدفعات"
            value={loanForm.repaymentDay}
            onChange={(e) => handleInputChange("repaymentDay", e.target.value)}
            disabled={isReadOnlyMode}
            required={!isReadOnlyMode}
            InputLabelProps={{
              shrink: true,
            }}
            helperText="تاريخ بداية الدفعات الأولى"
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "56px",
                width: "300px",
                backgroundColor: "background.paper",
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
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
                width: "300px",
                  backgroundColor: "background.paper",
              },
            }}
            helperText="إذا تُرك فارغاً، سيتم استخدام التاريخ الحالي"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <TextField
            fullWidth
            type="text"
            label="مدينة الإصدار"
            value={isViewMode ? (loanForm.issuanceCity || selectedLoan?.issuanceCity || "") : loanForm.issuanceCity || ""}
            onChange={(e) => handleInputChange("issuanceCity", e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            disabled={isReadOnlyMode}
            placeholder="مثال: شرورة - المملكة العربية السعودية"
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "56px",
                width: "300px",
                backgroundColor: "background.paper",
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <TextField
            fullWidth
            type="text"
            label="مدينة الوفاء"
            value={isViewMode ? (loanForm.paymentCity || selectedLoan?.paymentCity || "") : loanForm.paymentCity || ""}
            onChange={(e) => handleInputChange("paymentCity", e.target.value)}
            InputLabelProps={{
              shrink: true,
            }}
            disabled={isReadOnlyMode}
            placeholder="مثال: الرياض - المملكة العربية السعودية"
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "56px",
                width: "300px",
                backgroundColor: "background.paper",
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
          <TextField
            fullWidth
            type="text"
            label="تاريخ استحقاق السند"
            select
            value={isViewMode ? (loanForm.promissoryNoteType || selectedLoan?.promissoryNoteType || "") : loanForm.promissoryNoteType || ""}
            onChange={(e) => handleInputChange("promissoryNoteType", e.target.value)}
            disabled={isReadOnlyMode}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "56px",
                width: "300px",
                backgroundColor: "background.paper",
              },
            }}
          >
            <MenuItem value="inspection">لدي الاطلاع</MenuItem>
            <MenuItem value="manual">تحديد تاريخ يدوي</MenuItem>
          </TextField>
        </Grid>

        {(loanForm.promissoryNoteType === "manual" || (isViewMode && selectedLoan?.promissoryNoteType === "manual")) && (
          <Grid item xs={12} sm={6} md={6}>
            <TextField
              fullWidth
              type="date"
              label="تاريخ السند"
              value={isViewMode ? (loanForm.promissoryNoteDate || selectedLoan?.promissoryNoteDate?.split("T")[0] || "") : loanForm.promissoryNoteDate || ""}
              onChange={(e) => handleInputChange("promissoryNoteDate", e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              disabled={isReadOnlyMode}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "56px",
                  width: "300px",
                  backgroundColor: "background.paper",
                },
              }}
            />
          </Grid>
        )}

        <Grid item xs={12} sm={6} md={6}>
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
                    width: "300px",
                    backgroundColor: "background.paper",
                  },
                }}
              />
            )}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={6}>
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
                    width: "300px",
                    backgroundColor: "background.paper",
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
