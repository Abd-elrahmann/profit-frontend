import React, { useState, useEffect, useRef } from "react";
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
  Autocomplete,
} from "@mui/material";
import { Close as CloseIcon, Search as SearchIcon } from "@mui/icons-material";
import { debounce } from "lodash";
import Api from "../../config/Api";

const AdvancedSearchModal = ({ open, onClose, onSearch }) => {
  const [searchFilters, setSearchFilters] = useState({
    reference: "",
    description: "",
    sourceType: "",
    postedByName: "",
    status: "",
    type: "",
    dateFrom: "",
    dateTo: "",
  });
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Fetch users when modal opens
  useEffect(() => {
    if (open) {
      setSelectedUser(null); // Clear selected user when modal opens
      if (users.length === 0) {
        fetchUsers();
      }
    }
  }, [open, users.length]);

  const fetchUsers = async (searchQuery = '') => {
    try {
      setLoadingUsers(true);
      // Clear previous results before any search
      setUsers([]);

      const response = await Api.get(`/api/users/1?name=${encodeURIComponent(searchQuery)}`);
      const userResults = response.data.users || [];

      // Set the results from the API response
      setUsers(userResults);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Debounced search function using useRef to avoid dependency issues
  const debouncedFetchUsers = useRef(
    debounce((searchQuery) => {
      fetchUsers(searchQuery);
    }, 300)
  ).current;

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedFetchUsers.cancel();
    };
  }, [debouncedFetchUsers]);

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
      dateFrom: "",
      dateTo: "",
    });
    setSelectedUser(null);
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
              sx={{ width: "250px" }}
              label="رقم القيد"
              value={searchFilters.reference}
              onChange={(e) => handleFilterChange("reference", e.target.value)}
              placeholder="ابحث برقم القيد..."
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              sx={{ width: "250px" }}
              label="الوصف"
              value={searchFilters.description}
              onChange={(e) => handleFilterChange("description", e.target.value)}
              placeholder="ابحث في وصف القيد..."
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              sx={{ width: "250px" }}
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
            <Autocomplete
              sx={{ width: "250px" }}
              options={users}
              getOptionLabel={(option) => option.name || ''}
              value={selectedUser}
              onChange={(event, newValue) => {
                setSelectedUser(newValue);
                handleFilterChange("postedByName", newValue ? newValue.name : "");
              }}
              onInputChange={(event, newInputValue, reason) => {
                if (reason === 'input') {
                  setSelectedUser(null);

                  if (newInputValue.trim() === '') {
                    setUsers([]);
                    return;
                  }

                  debouncedFetchUsers(newInputValue);
                }
              }}
              loading={loadingUsers}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="اسم المعتمد"
                  placeholder="ابحث باسم المعتمد..."
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              sx={{ width: "250px" }}
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
              sx={{ width: "250px" }}
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

          <Grid item xs={12} md={6}>
            <TextField
              sx={{ width: "250px" }}
              label="من تاريخ"
              type="date"
              value={searchFilters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              sx={{ width: "250px" }}
              label="إلى تاريخ"
              type="date"
              value={searchFilters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions sx={{ p: 3, gap: 1,flexDirection: "row-reverse", justifyContent: "space-between" }}>
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
          startIcon={<SearchIcon sx={{marginLeft: "10px"}} />}
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