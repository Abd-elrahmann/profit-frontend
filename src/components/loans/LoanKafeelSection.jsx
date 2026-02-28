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
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography
        variant={isSmallScreen ? "subtitle1" : "h6"}
        fontWeight="bold"
        color="text.primary"
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
                backgroundColor: "background.paper",
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
                backgroundColor: "background.paper",
              },
            }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            fullWidth
            label="تاريخ الميلاد"
            value={
              isViewMode
                ? (selectedLoan?.kafeel?.birthDate ? new Date(selectedLoan.kafeel.birthDate).toISOString().split("T")[0] : "")
                : (selectedKafeel?.birthDate ? new Date(selectedKafeel.birthDate).toISOString().split("T")[0] : "")
            }
            disabled
            InputLabelProps={{
              shrink: true,
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                height: "56px",
                backgroundColor: "background.paper",
              },
            }}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};
export default LoanKafeelSection;