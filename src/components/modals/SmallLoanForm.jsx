import React, { useState } from "react";
import {
  Box,
  Paper,
  TextField,
  Button,
  Grid,
  useMediaQuery,
} from "@mui/material";
import { createSmallLoan } from "../../pages/Loans/loanApis";
import { notifySuccess, notifyError } from "../../utilities/toastify";

const SmallLoanForm = () => {
  const [formData, setFormData] = useState({
    Name: "",
    amount: "",
    notes: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const isMobile = useMediaQuery("(max-width: 480px)");
  const isTablet = useMediaQuery("(max-width: 768px)");
  const isSmallScreen = isMobile || isTablet;

  const handleInputChange = (field, value) => {
    if (field === "amount") {
      // Only allow numbers and format with commas
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
    // Validate required fields
    if (!formData.Name.trim()) {
      notifyError("يرجى إدخال الاسم");
      return;
    }

    if (!formData.amount) {
      notifyError("يرجى إدخال المبلغ");
      return;
    }

    try {
      setIsLoading(true);

      const submitData = {
        Name: formData.Name.trim(),
        amount: parseFloat(formData.amount.replace(/,/g, "")),
        notes: formData.notes.trim(),
      };

      await createSmallLoan(submitData);
      notifySuccess("تم إنشاء السلفة الصغيرة بنجاح");

      // Reset form
      setFormData({
        Name: "",
        amount: "",
        notes: "",
      });
    } catch (error) {
      notifyError(error.response?.data?.message || "حدث خطأ أثناء إنشاء السلفة الصغيرة");
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
          border: "1px solid #e5e7eb",
          backgroundColor: "#fff",
        }}
      >
     
        <Grid container spacing={isSmallScreen ? 2 : 3} justifyContent="center">
          <Grid item xs={12} sm={8} md={6}>
            <TextField
              fullWidth
              label="الاسم"
              value={formData.Name}
              onChange={(e) => handleInputChange("Name", e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "56px",
                  width:"250px",
                  backgroundColor: "#f9fafb",
                },
              }}
              placeholder="أدخل الاسم"
            />
          </Grid>

          <Grid item xs={12} sm={8} md={6}>
            <TextField
              fullWidth
              label="المبلغ"
              value={formData.amount}
              onChange={(e) => handleInputChange("amount", e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: "56px",
                  width:"250px",
                  backgroundColor: "#f9fafb",
                },
              }}
              placeholder="أدخل المبلغ"
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "+") {
                  e.preventDefault();
                }
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
                  backgroundColor: "#f9fafb",
                  height: "56px",
                  width:"350px",
                },
              }}
              placeholder="أدخل الملاحظات (اختياري)"
            />
          </Grid>

          <Grid item xs={12} sm={8} md={6}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!isFormValid || isLoading}
              fullWidth
              sx={{
                bgcolor: "primary.main",
                height: isSmallScreen ? "44px" : "48px",
                fontSize: isSmallScreen ? "14px" : "16px",
                fontWeight: "bold",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              {isLoading ? "جاري الإنشاء..." : "إنشاء السلفة "}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default SmallLoanForm;