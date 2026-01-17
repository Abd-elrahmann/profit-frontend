import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  useMediaQuery,
} from "@mui/material";
import { updateSmallLoan, createSmallLoan } from "../../pages/Loans/loanApis";
import { notifySuccess, notifyError } from "../../utilities/toastify";

const EditSmallLoanForm = ({ selectedLoan, onLoanUpdated }) => {
  const [formData, setFormData] = useState({
    Name: "",
    amount: "",
    notes: "",
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
    }

    if (selectedLoan) {
      const formattedAmount = selectedLoan.amount.toLocaleString();
      setFormData({
        Name: selectedLoan.Name,
        amount: formattedAmount,
        notes: selectedLoan.notes || "",
      });
    } else if (!lastSelectedLoan) {
      setFormData({
        Name: "",
        amount: "",
        notes: "",
      });
    }

    setLastSelectedLoan(selectedLoan);
  }, [selectedLoan, lastSelectedLoan]);

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

    try {
      setIsLoading(true);

      const submitData = {
        Name: formData.Name.trim(),
        amount: parseFloat(formData.amount.replace(/,/g, "")),
        notes: formData.notes.trim(),
      };

      if (isEditMode) {
        await updateSmallLoan(selectedLoan.id, submitData);
        notifySuccess("تم تعديل السلفة الصغيرة بنجاح");
      } else {
        await createSmallLoan(submitData);
        notifySuccess("تم إنشاء السلفة الصغيرة بنجاح");
      }

      setFormData({
        Name: "",
        amount: "",
        notes: "",
      });
      
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

  const isFormValid = formData.Name.trim() && formData.amount;

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
              onClick={handleSubmit}
              disabled={!isFormValid || isLoading}
              sx={{
                fontSize: "16px",
                fontWeight: "bold",
                "&:hover": {
                  bgcolor: "#2E8B45",
                },
              }}
            >
              {selectedLoan
                ? (isLoading ? "جاري التعديل..." : "تعديل السلفة")
                : (isLoading ? "جاري الإنشاء..." : "إنشاء السلفة")
              }
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default EditSmallLoanForm;
