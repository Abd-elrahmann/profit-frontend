import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TablePagination,
  IconButton,
  Chip,
  Stack,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Button,
  InputBase,
  Tooltip,
  Checkbox,
  Alert,
  useMediaQuery,
} from "@mui/material";
import {
  Visibility,
  FilterList,
  Clear,
  Search as SearchIcon,
  CompareArrows,
} from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { getPeriods } from "../../pages/periodClosing/periodApi";
import { StyledTableCell, StyledTableRow } from "../layouts/tableLayout";
import dayjs from "dayjs";
import { usePermissions } from "../Contexts/PermissionsContext";
import PeriodsAdvancedSearch from "./PeriodsAdvancedSearch";
import { transparentSearchInputBaseSx } from "../../utilities/searchInputStyles";
const PeriodTable = ({
  onViewDetails,
  isMobile = false,
  selectedPeriods = [],
  onSelectionChange,
  showSelection = false,
  onPeriodsDataChange,
  onComparePeriods,
}) => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState("");
  const { permissions } = usePermissions();
  const isLargeScreen = useMediaQuery("(min-width: 1200px)");
  const handlePeriodSelect = (periodId, checked) => {
    if (!onSelectionChange) return;
    let newSelected = [...selectedPeriods];
    if (checked) {
      if (!newSelected.includes(periodId) && newSelected.length < 2) {
        newSelected.push(periodId);
      }
    } else {
      newSelected = newSelected.filter((id) => id !== periodId);
    }
    onSelectionChange(newSelected);
  };
  const handleSelectAll = (checked) => {
    if (!onSelectionChange || !checked) return;
    const currentPagePeriods = periodsData?.periods || [];
    const selectablePeriods = currentPagePeriods.slice(0, 2 - selectedPeriods.length);
    const newSelected = [...selectedPeriods];
    selectablePeriods.forEach((period) => {
      if (!newSelected.includes(period.id)) {
        newSelected.push(period.id);
      }
    });
    onSelectionChange(newSelected);
  };
  const isAllSelected = () => {
    if (!periodsData?.periods) return false;
    const currentPagePeriods = periodsData.periods;
    const selectableCount = Math.min(currentPagePeriods.length, 2 - selectedPeriods.length);
    return (
      selectableCount > 0 &&
      currentPagePeriods.slice(0, selectableCount).every((period) =>
        selectedPeriods.includes(period.id)
      )
    );
  };
  const isPeriodSelected = (periodId) => selectedPeriods.includes(periodId);
  const { data: periodsData, isLoading } = useQuery({
    queryKey: ["periods", page, filters],
    queryFn: () => getPeriods(page, filters),
  });
  useEffect(() => {
    if (periodsData?.periods && onPeriodsDataChange) {
      onPeriodsDataChange(periodsData.periods);
    }
  }, [periodsData?.periods, onPeriodsDataChange]);
  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };
  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };
  const handleClearFilters = () => {
    setFilters({});
    setLocalSearch("");
    setPage(1);
  };
  const handleQuickSearch = (e) => {
    const value = e.target.value;
    setLocalSearch(value);
    if (value.trim() === "") {
      setFilters({});
    } else {
      setFilters({ name: value });
    }
    setPage(1);
  };
  const getActiveFilterCount = () => {
    return Object.keys(filters).filter(
      (key) =>
        filters[key] !== undefined &&
        filters[key] !== null &&
        filters[key] !== ""
    ).length;
  };
  const getStatusColor = (isClosed) => {
    return isClosed ? "success" : "warning";
  };
  const getStatusText = (isClosed) => {
    return isClosed ? "مقفلة" : "مفتوحة";
  };
  const formatDate = (dateString) => {
    if (!dateString) return "مستمرة";
    return dayjs(dateString).format("DD/MM/YYYY");
  };
  const formatDateWithHijri = (period, dateType) => {
    const dateString = dateType === "start" ? period.startDate : period.endDate;
    const hijriDate = dateType === "start" ? period.startDateHijri : period.endDateHijri;
    if (!dateString) return "مستمرة";
    const gregorianDate = dayjs(dateString).format("DD/MM/YYYY");
    const hijriText = hijriDate || "غير محدد";
    return (
      <Box sx={{ textAlign: "center" }}>
        <Typography variant="body2" sx={{ fontWeight: "medium" }}>
          {gregorianDate}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: "text.secondary", fontSize: "0.8rem", fontWeight: "bold" }}
        >
          {hijriText}
        </Typography>
      </Box>
    );
  };
  const renderCompareButton = () => {
    if (!showSelection || selectedPeriods.length !== 2 || !onComparePeriods) return null;
    return (
      <Box
        sx={{
          mb: 2,
          display: "flex",
          justifyContent: "center",
          animation: "fadeIn 0.3s ease-in",
        }}
      >
        <Button
          variant="contained"
          startIcon={<CompareArrows />}
          onClick={() => onComparePeriods(selectedPeriods[0], selectedPeriods[1])}
          sx={{
            bgcolor: "primary.main",
            "&:hover": { bgcolor: "primary.dark" },
            px: 4,
            py: 1.5,
            borderRadius: 2,
            fontWeight: "bold",
            boxShadow: "0 4px 12px rgba(46, 139, 69, 0.3)",
          }}
        >
          مقارنة الفترتين المحددتين
        </Button>
      </Box>
    );
  };
  const renderSelectionInfo = () => {
    if (!showSelection || selectedPeriods.length === 0) return null;
    return (
      <Alert
        severity={selectedPeriods.length === 2 ? "success" : "info"}
        sx={{
          mb: 2,
          borderRadius: 2,
          "& .MuiAlert-message": {
            width: "100%",
          },
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2">
            {selectedPeriods.length === 2
              ? "✓ تم اختيار فترتين - يمكنك إجراء المقارنة"
              : `✓ تم اختيار فترة واحدة - اختر فترة أخرى للمقارنة (${selectedPeriods.length}/2)`}
          </Typography>
          {selectedPeriods.length > 0 && (
            <Button
              size="small"
              onClick={() => onSelectionChange([])}
              sx={{ minWidth: "auto", px: 1 }}
            >
              إلغاء الاختيار
            </Button>
          )}
        </Box>
      </Alert>
    );
  };
  const renderTable = () => (
    <TableContainer sx={{ height: "100%", width: "100%" }}>
      <Table stickyHeader sx={{ width: "100%" }}>
        <TableHead>
          <StyledTableRow>
            {showSelection && (
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap", width: "60px" }}>
                <Tooltip title="اختيار جميع الفترات في هذه الصفحة">
                  <Checkbox
                    checked={isAllSelected()}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    disabled={selectedPeriods.length >= 2 && !isAllSelected()}
                    size="small"
                    indeterminate={selectedPeriods.length > 0 && !isAllSelected()}
                    sx={{ color: "white" }}
                  />
                </Tooltip>
              </StyledTableCell>
            )}
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              اسم الفترة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              تاريخ البداية
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              تاريخ النهاية
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              الحالة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              تاريخ الإنشاء
            </StyledTableCell>
            {(permissions.includes("period_Update") ||
              permissions.includes("period_Delete") ||
              permissions.includes("period_Add") ||
              permissions.includes("period_Export")) && (
              <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                الإجراءات
              </StyledTableCell>
            )}
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <StyledTableRow>
              <StyledTableCell colSpan={showSelection ? 8 : 7} align="center">
                <CircularProgress size={20} />
              </StyledTableCell>
            </StyledTableRow>
          ) : periodsData?.periods?.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell colSpan={showSelection ? 8 : 7} align="center">
                <Typography>لا توجد فترات</Typography>
                {getActiveFilterCount() > 0 && (
                  <Button size="small" onClick={handleClearFilters} sx={{ mt: 1 }}>
                    مسح الفلاتر
                  </Button>
                )}
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            periodsData?.periods?.map((period) => (
              <StyledTableRow
                key={period.id}
                sx={{
                  "&:hover": {
                    bgcolor: "rgba(0, 0, 0, 0.04)",
                  },
                }}
              >
                {showSelection && (
                  <StyledTableCell align="center">
                    <Tooltip
                      title={
                        !isPeriodSelected(period.id) && selectedPeriods.length >= 2
                          ? "لقد قمت باختيار فترتين بالفعل"
                          : "اختيار للمقارنة"
                      }
                    >
                      <Checkbox
                        checked={isPeriodSelected(period.id)}
                        onChange={(e) => handlePeriodSelect(period.id, e.target.checked)}
                        disabled={!isPeriodSelected(period.id) && selectedPeriods.length >= 2}
                        size="small"
                        sx={{
                          color: isPeriodSelected(period.id) ? "primary.main" : "default",
                        }}
                      />
                    </Tooltip>
                  </StyledTableCell>
                )}
                <StyledTableCell align="center">
                  <Typography>{period.name}</Typography>
                </StyledTableCell>
                <StyledTableCell align="center">
                  {formatDateWithHijri(period, "start")}
                </StyledTableCell>
                <StyledTableCell align="center">
                  {formatDateWithHijri(period, "end")}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Chip
                    label={getStatusText(period.isClosed)}
                    color={getStatusColor(period.isClosed)}
                    size="small"
                  />
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {dayjs(period.createdAt).format("DD/MM/YYYY")}
                </StyledTableCell>
                {(permissions.includes("period_Update") ||
                  permissions.includes("period_Delete") ||
                  permissions.includes("period_Add") ||
                  permissions.includes("period_Export")) && (
                  <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    <Stack direction="row" spacing={1} justifyContent="center">
                      {permissions.includes("period_View") && (
                        <Tooltip title="عرض التفاصيل">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetails(period.id);
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </StyledTableCell>
                )}
              </StyledTableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
  const renderSearchBar = () => (
    <Box sx={{ p: 2, pb: 1, borderBottom: 1, borderColor: "divider" }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={6}>
          <InputBase
            fullWidth
            placeholder="ابحث باسم الفترة..."
            value={localSearch}
            onChange={handleQuickSearch}
            sx={{
              borderRadius: "6px",
              p: 1,
              border: "1px solid #e0e0e0",
              "&:focus": {
                borderColor: "primary.main",
              },
              ...transparentSearchInputBaseSx,
            }}
            startAdornment={<SearchIcon sx={{ color: "action.active", mr: 1 }} />}
            endAdornment={
              localSearch && (
                <IconButton
                  size="small"
                  onClick={() => {
                    setLocalSearch("");
                    handleClearFilters();
                  }}
                >
                  <Clear fontSize="small" />
                </IconButton>
              )
            }
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setSearchModalOpen(true)}
              sx={{ minWidth: 120 }}
            >
              بحث متقدم
              {getActiveFilterCount() > 0 && (
                <Chip
                  label={getActiveFilterCount()}
                  size="small"
                  color="primary"
                  sx={{ ml: 1, height: 20, minWidth: 20 }}
                />
              )}
            </Button>
            {getActiveFilterCount() > 0 && (
              <Button
                variant="text"
                color="error"
                startIcon={<Clear />}
                onClick={handleClearFilters}
                size="small"
              >
                مسح الفلاتر
              </Button>
            )}
          </Stack>
        </Grid>
      </Grid>
      {getActiveFilterCount() > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            الفلاتر النشطة:
          </Typography>
          <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: "wrap" }}>
            {filters.name && (
              <Chip
                label={`اسم: ${filters.name}`}
                size="small"
                onDelete={() => setFilters({ ...filters, name: undefined })}
              />
            )}
            {filters.startDate && (
              <Chip
                label={`من: ${filters.startDate}`}
                size="small"
                onDelete={() => setFilters({ ...filters, startDate: undefined })}
              />
            )}
            {filters.endDate && (
              <Chip
                label={`إلى: ${filters.endDate}`}
                size="small"
                onDelete={() => setFilters({ ...filters, endDate: undefined })}
              />
            )}
            {filters.isClosed !== undefined && (
              <Chip
                label={`الحالة: ${filters.isClosed ? "مقفلة" : "مفتوحة"}`}
                size="small"
                onDelete={() => setFilters({ ...filters, isClosed: undefined })}
              />
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
  const renderCards = () => (
    <Box sx={{ width: "100%", py: 2, px: 0, boxSizing: "border-box" }}>
      <Box sx={{ mb: 2 }}>
        <InputBase
          fullWidth
          placeholder="ابحث باسم الفترة..."
          value={localSearch}
          onChange={handleQuickSearch}
          sx={{
            borderRadius: "6px",
            p: 1.5,
            border: "1px solid #e0e0e0",
            mb: 2,
            ...transparentSearchInputBaseSx,
          }}
          startAdornment={<SearchIcon sx={{ color: "action.active", mr: 1 }} />}
        />
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            fullWidth
            startIcon={<FilterList />}
            onClick={() => setSearchModalOpen(true)}
          >
            بحث متقدم
            {getActiveFilterCount() > 0 && (
              <Chip
                label={getActiveFilterCount()}
                size="small"
                color="primary"
                sx={{ ml: 1 }}
              />
            )}
          </Button>
          {getActiveFilterCount() > 0 && (
            <Button
              variant="text"
              color="error"
              onClick={handleClearFilters}
              startIcon={<Clear />}
            >
              مسح
            </Button>
          )}
        </Stack>
      </Box>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress size={30} />
        </Box>
      ) : periodsData?.periods?.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            py: 4,
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" color="textSecondary">
            لا توجد فترات
          </Typography>
          {getActiveFilterCount() > 0 && (
            <Button size="small" onClick={handleClearFilters} sx={{ mt: 2 }}>
              مسح الفلاتر
            </Button>
          )}
        </Box>
      ) : (
        <Grid container spacing={2} sx={{ width: "100%" }}>
          {periodsData?.periods?.map((period) => (
            <Grid item xs={12} key={period.id} sx={{ width: "100%", maxWidth: "100%" }}>
              <Card
                sx={{
                  width: "100%",
                  minWidth: "100%",
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  "&:hover": {
                    boxShadow: "0 4px 8px rgba(0,0,0,0.15)",
                  },
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (showSelection) {
                    handlePeriodSelect(period.id, !isPeriodSelected(period.id));
                  } else {
                    onViewDetails(period.id);
                  }
                }}
              >
                <CardContent sx={{ p: 2, width: "100%", boxSizing: "border-box" }}>
                  <Stack spacing={1}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        {showSelection && (
                          <Tooltip
                            title={
                              !isPeriodSelected(period.id) && selectedPeriods.length >= 2
                                ? "لقد قمت باختيار فترتين بالفعل"
                                : "اختيار للمقارنة"
                            }
                          >
                            <Checkbox
                              checked={isPeriodSelected(period.id)}
                              onChange={(e) => {
                                e.stopPropagation();
                                handlePeriodSelect(period.id, e.target.checked);
                              }}
                              disabled={
                                !isPeriodSelected(period.id) && selectedPeriods.length >= 2
                              }
                              size="small"
                              sx={{
                                color: isPeriodSelected(period.id) ? "primary.main" : "default",
                              }}
                            />
                          </Tooltip>
                        )}
                        <Typography variant="h6" color="primary.main">
                          {period.name}
                        </Typography>
                      </Box>
                      <Chip
                        label={getStatusText(period.isClosed)}
                        color={getStatusColor(period.isClosed)}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          تاريخ البداية:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatDate(period.startDate)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary", fontSize: "0.65rem" }}
                        >
                          {period.startDateHijri || "غير محدد"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          تاريخ النهاية:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatDate(period.endDate)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary", fontSize: "0.65rem" }}
                        >
                          {period.endDateHijri || "غير محدد"}
                        </Typography>
                      </Box>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        تاريخ الإنشاء:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {dayjs(period.createdAt).format("DD/MM/YYYY")}
                      </Typography>
                    </Box>
                    {permissions.includes("period_View") && (
                      <Box sx={{ display: "flex", justifyContent: "center", pt: 1 }}>
                        <IconButton
                          title="عرض التفاصيل"
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewDetails(period.id);
                          }}
                        >
                          <Visibility fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
      }}
    >
      <PeriodsAdvancedSearch
        open={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onApplyFilters={handleApplyFilters}
        initialFilters={filters}
      />
      {renderCompareButton()}
      {renderSelectionInfo()}
      <Paper
        sx={{
          flex: 1,
          width: "100%",
          maxWidth: "100%",
          overflow: "hidden",
          borderRadius: 2,
          ...(isMobile && { mx: -2, px: 2 }),
        }}
      >
        {!isMobile && renderSearchBar()}
        {isMobile ? renderCards() : renderTable()}
        {periodsData && (
          <TablePagination
            component="div"
            count={periodsData.totalPeriods || 0}
            page={page - 1}
            onPageChange={handleChangePage}
            rowsPerPage={filters.limit || 10}
            rowsPerPageOptions={[5, 10, 20, 50]}
            onRowsPerPageChange={(e) => {
              handleApplyFilters({ ...filters, limit: parseInt(e.target.value) });
            }}
            labelDisplayedRows={({ from, to, count }) => `عرض ${from}-${to} من ${count}`}
            labelRowsPerPage="صفوف لكل صفحة:"
            sx={{
              "& .MuiTablePagination-toolbar": {
                flexDirection: isMobile ? "column" : "row",
                gap: isMobile ? 1 : 0,
                padding: isMobile ? 1 : isLargeScreen ? 1.5 : 2,
              },
            }}
          />
        )}
      </Paper>
    </Box>
  );
};
export default PeriodTable;