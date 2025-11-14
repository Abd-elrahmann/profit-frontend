import React, { useRef } from "react";
import {
  Box,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Chip,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { 
  RestartAltOutlined, 
  FilterList,
  ExpandMore 
} from "@mui/icons-material";
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from "dayjs";

const LogsToolbar = ({
  filters,
  onFilterChange,
  onResetFilters,
  isMobile = false,
}) => {
  const {
    search,
    screen,
    action,
    from,
    to,
    userName,
  } = filters;

  const searchInputRef = useRef(null);

  const handleActionChange = (event) => {
    onFilterChange('action', event.target.value);
  };

  const handleScreenChange = (event) => {
    onFilterChange('screen', event.target.value);
  };

  const handleFromDateChange = (newValue) => {
    onFilterChange('from', newValue ? newValue.format('YYYY-MM-DD') : '');
  };

  const handleToDateChange = (newValue) => {
    onFilterChange('to', newValue ? newValue.format('YYYY-MM-DD') : '');
  };

  const handleReset = () => {
    if (searchInputRef.current) {
      searchInputRef.current.value = '';
    }
    onResetFilters();
  };

  // Check if any filters are active
  const hasActiveFilters = search || screen || action || from || to || userName;

  const screenOptions = [
    { value: "Auth", label: "المصادقة" },
    { value: "Bank Accounts", label: "الحسابات البنكية" },
    { value: "Clients", label: "العملاء" },
    { value: "Journals", label: "القيود" },
    { value: "Loans", label: "السلف" },
    { value: "Partners", label: "الشركاء" },
    { value: "Repayments", label: "الأقساط" },
    { value: "Roles", label: "الأدوار" },
    { value: "Templates", label: "القوالب" },
    { value: "Users", label: "المستخدمين" },
  ];

  // Action options with Arabic translations
  const actionOptions = [
    { value: "CREATE", label: "إنشاء" },
    { value: "UPDATE", label: "تعديل" },
    { value: "DELETE", label: "حذف" },
    { value: "VIEW", label: "عرض" },
    { value: "login", label: "تسجيل دخول" },
    { value: "logout", label: "تسجيل خروج" },
  ];

  // Render for large screens
  const renderDesktopView = () => (
    <>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterList color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            فلترة السجلات
          </Typography>
        </Box>
        
        {hasActiveFilters && (
          <Chip
            label="بحث مفعل"
            color="primary"
            variant="outlined"
            size="small"
          />
        )}
      </Box>

      {/* All filters in one row */}
      <Stack 
        direction="row"
        spacing={2}
        alignItems="center"
        justifyContent="space-between"
      >
        {/* Action and Screen Filters */}
        <Stack 
          direction="row" 
          spacing={2}
          alignItems="center"
          sx={{ flex: 1 }}
        >
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel shrink>نوع الإجراء</InputLabel>
            <Select
              value={action || ""}
              onChange={handleActionChange}
              label="نوع الإجراء"
              notched
            >
              <MenuItem value="">كل الإجراءات</MenuItem>
              {actionOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel shrink>الشاشة</InputLabel>
            <Select
              value={screen || ""}
              onChange={handleScreenChange}
              label="الشاشة"
              notched
            >
              <MenuItem value="">كل الشاشات</MenuItem>
              {screenOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Date Range Filters */}
        <Stack 
          direction="row" 
          spacing={2}
          alignItems="center"
          sx={{ flex: 1, justifyContent: 'center' }}
        >
          <DatePicker
            label="من تاريخ"
            value={from ? dayjs(from) : null}
            onChange={handleFromDateChange}
            slotProps={{
              textField: {
                size: 'small',
                InputLabelProps: {
                  shrink: true,
                },
                sx: { 
                  width: '200px',
                }
              }
            }}
            format="DD/MM/YYYY"
          />
          
          <DatePicker
            label="إلى تاريخ"
            value={to ? dayjs(to) : null}
            onChange={handleToDateChange}
            slotProps={{
              textField: {
                size: 'small',
                InputLabelProps: {
                  shrink: true,
                },
                sx: {
                  width: '200px',
                }
              }
            }}
            format="DD/MM/YYYY"
          />
        </Stack>

        {/* Reset Button */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          {hasActiveFilters && (
            <Button
              variant="outlined"
              startIcon={<RestartAltOutlined />}
              onClick={handleReset}
              color="inherit"
              size="small"
            >
              إعادة تعيين
            </Button>
          )}
        </Box>
      </Stack>
    </>
  );

  // Render for mobile screens
  const renderMobileView = () => (
    <Accordion 
      sx={{ 
        boxShadow: 'none',
        border: '1px solid',
        borderColor: 'divider',
        '&:before': { display: 'none' }
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: hasActiveFilters ? '2px solid' : 'none',
          borderColor: 'primary.main',
          minHeight: '60px !important',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
          <FilterList color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            فلترة السجلات
          </Typography>
          {hasActiveFilters && (
            <Chip
              label="مفعل"
              color="primary"
              size="small"
              sx={{ ml: 'auto' }}
            />
          )}
        </Box>
      </AccordionSummary>
      
      <AccordionDetails sx={{ p: 2 }}>
        <Stack spacing={2}>
          {/* Action Filter */}
          <FormControl fullWidth size="small">
            <InputLabel>نوع الإجراء</InputLabel>
            <Select
              value={action || ""}
              onChange={handleActionChange}
              label="نوع الإجراء"
            >
              <MenuItem value="">كل الإجراءات</MenuItem>
              {actionOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Screen Filter */}
          <FormControl fullWidth size="small">
            <InputLabel>الشاشة</InputLabel>
            <Select
              value={screen || ""}
              onChange={handleScreenChange}
              label="الشاشة"
            >
              <MenuItem value="">كل الشاشات</MenuItem>
              {screenOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Date Range Filters */}
          <DatePicker
            label="من تاريخ"
            value={from ? dayjs(from) : null}
            onChange={handleFromDateChange}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
              }
            }}
            format="DD/MM/YYYY"
          />
          
          <DatePicker
            label="إلى تاريخ"
            value={to ? dayjs(to) : null}
            onChange={handleToDateChange}
            slotProps={{
              textField: {
                size: 'small',
                fullWidth: true,
              }
            }}
            format="DD/MM/YYYY"
          />

          {/* Reset Button */}
          {hasActiveFilters && (
            <Button
              variant="outlined"
              startIcon={<RestartAltOutlined />}
              onClick={handleReset}
              color="inherit"
              size="small"
              fullWidth
            >
              إعادة تعيين الفلتر
            </Button>
          )}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );

  return (
    <Box 
      sx={{ 
        bgcolor: "background.paper", 
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        mb: 3,
        overflow: 'hidden'
      }}
    >
      {isMobile ? renderMobileView() : renderDesktopView()}

      {/* Active Filters Summary - Show for both views */}
      {hasActiveFilters && (
        <Box sx={{ 
          p: isMobile ? 1.5 : 2, 
          bgcolor: 'grey.50', 
          borderTop: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
            الفلاتر النشطة:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {search && (
              <Chip 
                label={`بحث: ${search}`} 
                size="small" 
                onDelete={() => onFilterChange('search', '')}
                variant="outlined"
              />
            )}
            {userName && (
              <Chip 
                label={`مستخدم: ${userName}`} 
                size="small" 
                onDelete={() => onFilterChange('userName', '')}
                variant="outlined"
              />
            )}
            {action && (
              <Chip 
                label={`إجراء: ${actionOptions.find(a => a.value === action)?.label}`} 
                size="small" 
                onDelete={() => onFilterChange('action', '')}
                variant="outlined"
              />
            )}
            {screen && (
              <Chip 
                label={`شاشة: ${screenOptions.find(s => s.value === screen)?.label}`} 
                size="small" 
                onDelete={() => onFilterChange('screen', '')}
                variant="outlined"
              />
            )}
            {from && (
              <Chip 
                label={`من: ${dayjs(from).format('DD/MM/YYYY')}`} 
                size="small" 
                onDelete={() => onFilterChange('from', '')}
                variant="outlined"
              />
            )}
            {to && (
              <Chip 
                label={`إلى: ${dayjs(to).format('DD/MM/YYYY')}`} 
                size="small" 
                onDelete={() => onFilterChange('to', '')}
                variant="outlined"
              />
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default LogsToolbar;