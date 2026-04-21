import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  useMediaQuery,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { updateSmallLoan, createSmallLoan } from "../../pages/Loans/loanApis";
import { getBanks } from "../../pages/Banks/bankApis";
import { debounce } from "../../utilities/debounce";
import { notifySuccess, notifyError } from "../../utilities/toastify";
import BankAccountAutocomplete from "./BankAccountAutocomplete";

const EditSmallLoanForm = ({ selectedLoan, onLoanUpdated }) => {
  const [formData, setFormData] = useState({
    Name: "",
    amount: "",
    notes: "",
  });
  const [banksPage, setBanksPage] = useState(1);
  const [banksSearchQuery, setBanksSearchQuery] = useState("");
  const [selectedBank, setSelectedBank] = useState(null);
  const debouncedBanksSearch = useMemo(
    () => debounce((v) => { setBanksSearchQuery(v); setBanksPage(1); }, 400),
    []
  );
  const { data: banksData, isLoading: isBanksLoading } = useQuery({
    queryKey: ["banks", "small-loan-form", banksPage, banksSearchQuery],
    queryFn: () => getBanks(banksPage, banksSearchQuery),
    retry: 1,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [lastSelectedLoan, setLastSelectedLoan] = useState(null);
  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;
  useEffect(() => {
    if (lastSelectedLoan && !selectedLoan) {
      setFormData({
        Name: "",
        amount: "",
        notes: "",
      });
      setSelectedBank(null);
    }
    if (selectedLoan) {
      const formattedAmount = selectedLoan.amount.toLocaleString();
      setFormData({
        Name: selectedLoan.Name,
        amount: formattedAmount,
        notes: selectedLoan.notes || "",
      });
      setSelectedBank(selectedLoan.bankAccount || null);
    } else if (!lastSelectedLoan) {
      setFormData({
        Name: "",
        amount: "",
        notes: "",
      });
      setSelectedBank(null);
    }
    setLastSelectedLoan(selectedLoan);
  }, [selectedLoan, lastSelectedLoan]);
  const handleBanksSearchChange = (event, value) => {
    debouncedBanksSearch(value);
  };
  const handleBankSelect = (event, newValue) => {
    setSelectedBank(newValue);
  };
  const handleInputChange = (field, value) => {
    if (field === "amount") {
      const rawValue = value.replace(/,/g, "");
      if (!isNaN(rawValue) && rawValue !== "") {
        const numValue = parseFloat(rawValue);
        if (numValue >= 0) {
          value = numValue.toLocaleString();
        }
      } else if (rawValue === "") {
        value = "";
      }
    }
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  const handleSubmit = async () => {
    const isEditMode = !!selectedLoan;
    if (!formData.Name.trim()) {
      notifyError("يرجى إدخال اسم صاحب السلفة");
      return;
    }
    if (!formData.amount) {
      notifyError("يرجى إدخال مبلغ السلفة");
      return;
    }
    if (!selectedBank?.id) {
      notifyError("يرجى اختيار الحساب البنكي");
      return;
    }
    try {
      setIsLoading(true);
      const submitData = {
        Name: formData.Name.trim(),
        amount: parseFloat(formData.amount.replace(/,/g, "")),
        notes: formData.notes.trim(),
      };
      if (isEditMode) {
        await updateSmallLoan(selectedLoan.id, { ...submitData, bankId: selectedBank.id });
        notifySuccess("تم تعديل السلفة الصغيرة بنجاح");
      } else {
        await createSmallLoan({ ...submitData, BankId: selectedBank.id });
        notifySuccess("تم إنشاء السلفة الصغيرة بنجاح");
      }
      setFormData({
        Name: "",
        amount: "",
        notes: "",
      });
      setSelectedBank(null);
      if (onLoanUpdated) {
        onLoanUpdated();
      }
    } catch (error) {
      const action = isEditMode ? "تعديل" : "إنشاء";
      notifyError(error.response?.data?.message || `حدث خطأ أثناء ${action} السلفة الصغيرة`);
    } finally {
      setIsLoading(false);
    }
  };
  const isFormValid = formData.Name.trim() && formData.amount && selectedBank?.id;
  return (
    <Box>
      <Paper
        sx={{
          p: isSmallScreen ? 2 : 4,
          mb: isSmallScreen ? 2 : 3,
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <BankAccountAutocomplete
          variant="section"
          sectionTitle="معلومات البنك"
          isSmallScreen={isSmallScreen}
          selectedBank={selectedBank}
          banksData={banksData}
          isBanksLoading={isBanksLoading}
          handleBankSelect={handleBankSelect}
          handleBanksSearchChange={handleBanksSearchChange}
          isReadOnlyMode={false}
        />
        <Grid container spacing={isSmallScreen ? 2 : 3} justifyContent="center">
          <Grid item xs={12} sm={8} md={6}>
            <TextField
              fullWidth
              label="اسم صاحب السلفة"
              value={formData.Name}
              onChange={(e) => handleInputChange("Name", e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "56px",
                  width:"350px",
                  backgroundColor: "background.paper",
                },
              }}
              placeholder="أدخل اسم صاحب السلفة"
            />
          </Grid>
          <Grid item xs={12} sm={8} md={6}>
            <TextField
              fullWidth
              label="مبلغ السلفة"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "56px",
                  width:"350px",
                  backgroundColor: "background.paper",
                },
              }}
              placeholder="أدخل مبلغ السلفة"
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "+") e.preventDefault();
              }}
            />
          </Grid>
          <Grid item xs={12} sm={8} md={6}>
            <TextField
              fullWidth
              label="الملاحظات"
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              multiline
              rows={1}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "background.paper",
                  width:"350px",
                  height:"56px",
                },
              }}
              placeholder="أدخل الملاحظات (اختياري)"
            />
          </Grid>
          <Grid item xs={12} sm={8} md={6}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              disabled={!isFormValid || isLoading}
              onClick={handleSubmit}
              sx={{ height: "56px", maxWidth: 350 }}
            >
              {isLoading ? "جاري الحفظ..." : selectedLoan ? "حفظ التعديلات" : "إنشاء السلفة الصغيرة"}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};
export default EditSmallLoanForm;
