import React from "react";
import {
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Autocomplete,
} from "@mui/material";
import { Add as AddIcon, Save as SaveIcon } from "@mui/icons-material";

export default function JournalsLinesForm({
  currentLine,
  chartAccounts,
  editingLineIndex,
  onLineInputChange,
  onAddLine,
}) {
  const handleDebitChange = (e) => {
    const val = e.target.value;
    if (val.includes("-")) return;
    onLineInputChange("debit", val);
  };

  const handleCreditChange = (e) => {
    const val = e.target.value;
    if (val.includes("-")) return;
    onLineInputChange("credit", val);
  };

  return (
    <Paper
      sx={{
        p: 3,
        mb: 3,
        borderRadius: 2,
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h6" fontWeight="bold" mb={3} textAlign="center">
        {editingLineIndex !== null ? "تعديل البند" : "إضافة بند جديد"}
      </Typography>

      <Grid container spacing={2} alignItems="center" justifyContent="center">
        <Grid item xs={12} md={3}>
          <Autocomplete
            sx={{ width: "250px" }}
            options={chartAccounts}
            getOptionLabel={(option) => `${option.code} - ${option.name}`}
            value={
              chartAccounts.find((acc) => acc.id === currentLine.accountId) ||
              null
            }
            onChange={(event, newValue) => {
              onLineInputChange("accountId", newValue?.id || "");
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="الحساب"
                required
                variant="outlined"
                sx={{ width: "250px" }}
              />
            )}
            isOptionEqualToValue={(option, value) => option.id === value.id}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            label="مدين"
            type="number"
            value={currentLine.debit}
            onChange={handleDebitChange}
            inputProps={{ min: 0 }}
            sx={{ width: "200px" }}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            label="دائن"
            type="number"
            value={currentLine.credit}
            onChange={handleCreditChange}
            inputProps={{ min: 0 }}
            sx={{ width: "200px" }}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <TextField
            label="الوصف"
            value={currentLine.description}
            onChange={(e) => onLineInputChange("description", e.target.value)}
            sx={{ width: "250px" }}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            sx={{ fontWeight: "bold" }}
            variant="contained"
            startIcon={
              editingLineIndex !== null ? (
                <SaveIcon sx={{ marginLeft: "10px" }} />
              ) : (
                <AddIcon sx={{ marginLeft: "10px" }} />
              )
            }
            onClick={onAddLine}
            size="small"
          >
            {editingLineIndex !== null ? "تحديث" : "إضافة"}
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}
