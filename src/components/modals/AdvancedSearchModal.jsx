import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  MenuItem,
  Box,
  IconButton,
  Typography,
} from "@mui/material";
import { Close as CloseIcon, Search as SearchIcon } from "@mui/icons-material";

const AdvancedSearchModal = ({ open, onClose, onSearch }) => {
  const [searchFilters, setSearchFilters] = useState({
    reference: "",
    description: "",
    sourceType: "",
    postedByName: "",
    status: "",
    type: "",
  });

  const handleFilterChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSearch = () => {
    // Remove empty filters
    const filters = Object.fromEntries(
      // eslint-disable-next-line no-unused-vars
      Object.entries(searchFilters).filter(([_, value]) => value !== "")
    );
    onSearch(filters);
    onClose();
  };

  const handleReset = () => {
    setSearchFilters({
      reference: "",
      description: "",
      sourceType: "",
      postedByName: "",
      status: "",
      type: "",
    });
  };

  const sourceTypeOptions = [
    { value: "LOAN", label: "سلفة" },
    { value: "REPAYMENT", label: "سداد" },
    { value: "PARTNER", label: "شريك" },
    { value: "PERIOD_CLOSING", label: "إقفال فترة" },
    { value: "OTHER", label: "أخرى" },
  ];

  const statusOptions = [
    { value: "DRAFT", label: "مسودة" },
    { value: "POSTED", label: "معتمد" },
    { value: "CANCELLED", label: "ملغي" },
  ];

  const typeOptions = [
    { value: "GENERAL", label: "عام" },
    { value: "OPENING", label: "افتتاحي" },
    { value: "CLOSING", label: "ختامي" },
    { value: "ADJUSTMENT", label: "تسوية" },
  ];

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" fontWeight="bold">
            البحث المتقدم في القيود
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="رقم القيد"
              value={searchFilters.reference}
              onChange={(e) => handleFilterChange("reference", e.target.value)}
              placeholder="ابحث برقم القيد..."
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="الوصف"
              value={searchFilters.description}
              onChange={(e) => handleFilterChange("description", e.target.value)}
              placeholder="ابحث في وصف القيد..."
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="نوع المصدر"
              value={searchFilters.sourceType}
              onChange={(e) => handleFilterChange("sourceType", e.target.value)}
            >
              <MenuItem value="">كل أنواع المصادر</MenuItem>
              {sourceTypeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="اسم المعتمد"
              value={searchFilters.postedByName}
              onChange={(e) => handleFilterChange("postedByName", e.target.value)}
              placeholder="ابحث باسم المعتمد..."
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="حالة القيد"
              value={searchFilters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <MenuItem value="">كل الحالات</MenuItem>
              {statusOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="نوع القيد"
              value={searchFilters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
            >
              <MenuItem value="">كل الأنواع</MenuItem>
              {typeOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          onClick={handleReset}
          variant="outlined"
          color="inherit"
        >
          إعادة تعيين
        </Button>
        <Button 
          onClick={handleSearch}
          variant="contained"
          startIcon={<SearchIcon />}
          sx={{
            bgcolor: "#0d40a5",
            "&:hover": { bgcolor: "rgba(13, 64, 165, 0.9)" },
          }}
        >
          بحث
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdvancedSearchModal;