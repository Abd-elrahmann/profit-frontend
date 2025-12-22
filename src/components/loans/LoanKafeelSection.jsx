import React from "react";
import {
  Typography,
  Grid,
  TextField,
  Paper,
} from "@mui/material";

const LoanKafeelSection = ({
  isSmallScreen,
  selectedKafeel,
  selectedLoan,
  isViewMode,
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
        معلومات الكفيل
      </Typography>

      <Grid
        container
        spacing={isSmallScreen ? 2 : 3}
        justifyContent="center"
      >
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="اسم الكفيل"
            value={
              isViewMode
                ? selectedLoan?.kafeel?.name || ""
                : selectedKafeel?.name || ""
            }
            disabled
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "56px",
                backgroundColor: "#f5f5f5",
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="رقم الهوية"
            value={
              isViewMode
                ? selectedLoan?.kafeel?.nationalId || ""
                : selectedKafeel?.nationalId || ""
            }
            disabled
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "56px",
                backgroundColor: "#f5f5f5",
              },
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="تاريخ الميلاد"
            value={() => {
              const birthDate = isViewMode
                ? selectedLoan?.kafeel?.birthDate
                : selectedKafeel?.birthDate;
              return birthDate ? new Date(birthDate).toISOString().split("T")[0] : "";
            }}
            disabled
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "56px",
                backgroundColor: "#f5f5f5",
              },
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default LoanKafeelSection;
