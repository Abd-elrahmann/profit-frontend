import React from "react";
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Card,
  CardContent,
  Typography,
  Pagination,
  Skeleton,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { getStatusText, getStatusColor } from "./investorsUtils";
import { transparentSearchTextFieldSx } from "../../utilities/searchInputStyles";
const InvestorsList = ({
  investorsData,
  isLoading,
  selectedInvestor,
  showWithdrawnOnly,
  search,
  selectedStatus,
  selectedActiveStatus,
  onSearchChange,
  onStatusChange,
  onActiveStatusChange,
  currentPage,
  onPageChange,
  onInvestorSelect,
  onAddInvestor,
  onViewWithdrawn,
  permissions,
  isDarkMode,
  listScrollRef,
  isMobile = false,
}) => {
  return (
    <Box
      sx={{
        width: { xs: "100%", md: "350px" },
        minWidth: { xs: 0, md: "350px" },
        borderRight: { xs: "none", md: "1px solid #ddd" },
        bgcolor: isDarkMode ? 'background.default' : '#fafafa',
        height: "100%",
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        flex: isMobile ? 1 : "none",
      }}
    >
      <Box sx={{ p: 2, borderBottom: "1px solid #ddd", bgcolor: isDarkMode ? 'background.paper' : '#fafafa', flexShrink: 0 }}>
        <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {permissions.includes("partners_Add") && (
            <Button
              fullWidth
              size="small"
              variant="contained"
              startIcon={<AddIcon sx={{ marginLeft: '10px' }} />}
              onClick={onAddInvestor}
              sx={{
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
                fontWeight: "bold",
                borderRadius: 2,
                py: 1,
              }}
            >
              إضافة مستثمر جديد
            </Button>
          )}
          <Button
            fullWidth
            size="small"
            variant="outlined"
            startIcon={<VisibilityIcon sx={{ marginLeft: '10px' }} />}
            onClick={onViewWithdrawn}
            sx={{
              color: "text.secondary",
              borderColor: "divider",
              "&:hover": {
                bgcolor: "action.hover",
                borderColor: "text.secondary",
              },
              fontWeight: 500,
              borderRadius: 2,
              py: 1,
            }}
          >
            عرض المنسحبين
          </Button>
        </Box>
        <TextField
          placeholder="البحث بالاسم أو رقم الهوية"
          fullWidth
          size="small"
          variant="outlined"
          onChange={onSearchChange}
          sx={transparentSearchTextFieldSx}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.5 }}>
          <Chip
            label="الكل"
            color={selectedStatus === "" ? "primary" : "default"}
            variant="outlined"
            onClick={() => onStatusChange("")}
          />
          <Chip
            label="قديم"
            color={selectedStatus === "قديم" ? "info" : "default"}
            variant="outlined"
            onClick={() => onStatusChange("قديم")}
          />
          <Chip
            label="جديد"
            color={selectedStatus === "جديد" ? "success" : "default"}
            variant="outlined"
            onClick={() => onStatusChange("جديد")}
          />
          <Chip
            label="منسحب"
            color={selectedStatus === "منسحب" ? "warning" : "default"}
            variant="outlined"
            onClick={() => onStatusChange("منسحب")}
          />
        </Box>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.5 }}>
          <Chip
            label="نشط"
            color={selectedActiveStatus === "نشط" ? "success" : "default"}
            variant="outlined"
            onClick={() => onActiveStatusChange("نشط")}
          />
          <Chip
            label="غير نشط"
            color={selectedActiveStatus === "غير نشط" ? "error" : "default"}
            variant="outlined"
            onClick={() => onActiveStatusChange("غير نشط")}
          />
        </Box>
      </Box>
      {investorsData && !isLoading && investorsData.partners && investorsData.partners.length > 0 && (
        <Box sx={{ p: 2, borderBottom: '1px solid #eee', bgcolor: isDarkMode ? 'background.paper' : '#f9f9f9', flexShrink: 0 }}>
          <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
            صفحة {investorsData.currentPage} من {investorsData.totalPages} - إجمالي {investorsData.totalPartners} {showWithdrawnOnly ? 'مستثمر منسحب' : 'مستثمر'}
          </Typography>
          {investorsData.totalPages > 1 && (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
              <Pagination
                count={investorsData.totalPages}
                page={currentPage}
                onChange={onPageChange}
                color="primary"
                size="small"
                siblingCount={1}
                boundaryCount={1}
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontSize: '0.875rem',
                  }
                }}
              />
            </Box>
          )}
        </Box>
      )}
      <Box ref={listScrollRef} sx={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <Box sx={{ p: 2 }}>
            {[...Array(5)].map((_, index) => (
              <Card key={index} sx={{ mb: 1, mx: 2, mt: index === 0 ? 1 : 0 }}>
                <CardContent sx={{ p: 2 }}>
                  <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="40%" height={20} />
                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    <Skeleton variant="rounded" width={80} height={24} />
                    <Skeleton variant="rounded" width={80} height={24} />
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : !investorsData || !investorsData.partners || investorsData.partners.length === 0 ? (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            p: 4,
            flexDirection: 'column',
            minHeight: 'calc(100vh - 400px)',
            height: '100%'
          }}>
            <Typography variant="body1" color="text.secondary" textAlign="center" mb={2}>
              {search || selectedStatus ? 'لم يتم العثور على مستثمرين مطابقين للبحث' : showWithdrawnOnly ? 'لا توجد مستثمرين منسحبين مسجلين في النظام' : 'لا توجد مستثمرين مسجلين في النظام'}
            </Typography>
          </Box>
        ) : (
          <>
            {investorsData.partners.map((investor) => {
              const isSelected = selectedInvestor?.id === investor.id;
              return (
                <Card
                  key={investor.id}
                  onClick={() => onInvestorSelect(investor)}
                  sx={{
                    mb: 1,
                    mx: 2,
                    mt: 1,
                    cursor: "pointer",
                    border: isSelected ? "2px solid" : "1px solid #E5E7EB",
                    borderColor: isSelected ? "primary.main" : "#E5E7EB",
                    bgcolor: isSelected ? "primary.50" : "background.paper",
                    transition: "0.1s",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1,
                      }}
                    >
                      <Box sx={{ flex: 1, mr: 2 }}>
                        <Typography fontWeight="bold" sx={{ fontSize: '1rem', mb: 0.5 }}>
                          {investor.name}
                        </Typography>
                        {(investor.WithdrawingStatus === 'WITHDRAWING' || investor.WithdrawingStatus === 'WITHDRAWN') && (
                          <Chip
                            label={investor.WithdrawingStatus === 'WITHDRAWING' ? 'جاري السحب' : 'تم السحب'}
                            size="small"
                            color={investor.WithdrawingStatus === 'WITHDRAWING' ? 'warning' : 'info'}
                            sx={{ fontSize: '0.65rem', height: '20px', mt: 0.5 }}
                          />
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                        <Chip
                          label={getStatusText(investor)}
                          size="small"
                          color={getStatusColor(investor)}
                        />
                        <Chip
                          label={investor.isActive ? 'نشط' : 'غير نشط'}
                          size="small"
                          color={investor.isActive ? 'success' : 'error'}
                          sx={{ fontSize: '0.8rem', height: '22px' }}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ mb: 1, pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                        رأس المال الكلي
                      </Typography>
                      <Typography variant="h6" fontWeight="bold" color="primary.main" sx={{ fontSize: '1.1rem' }}>
                        {(investor.capitalAmount + investor.newCapitalAmount + (investor.totalProfit || 0))?.toLocaleString()}
                      </Typography>
                    </Box>
                    <Box sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
                      <Typography variant="body2" component="div" sx={{ mb: 0.75, display: 'flex', justifyContent: 'space-between' }}>
                        <span>رأس مال أصلي:</span>
                        <Box component="span" sx={{ fontWeight: 500, color: 'text.primary' }}>
                          {investor.capitalAmount?.toLocaleString()}
                        </Box>
                      </Typography>
                      <Typography variant="body2" component="div" sx={{ mb: 0.75, display: 'flex', justifyContent: 'space-between' }}>
                        <span>رأس مال جديد:</span>
                        <Box component="span" sx={{ fontWeight: 500, color: 'text.primary' }}>
                          {investor.newCapitalAmount?.toLocaleString()}
                        </Box>
                      </Typography>
                      {(investor.totalProfit || 0) > 0 && (
                        <Typography variant="body2" component="div" sx={{ mb: 0.75, display: 'flex', justifyContent: 'space-between' }}>
                          <span>أرباح:</span>
                          <Box component="span" sx={{ fontWeight: 500, color: 'primary.main' }}>
                            {investor.totalProfit?.toLocaleString() || 0}
                          </Box>
                        </Typography>
                      )}
                      {(investor.totalAvilableSaving || 0) > 0 && (
                        <Typography variant="body2" component="div" sx={{ mb: 0.75, display: 'flex', justifyContent: 'space-between' }}>
                          <span>مدخرات متاحة:</span>
                          <Box component="span" sx={{ fontWeight: 500, color: 'primary.main' }}>
                            {(investor.totalAvilableSaving || 0)?.toLocaleString()}
                          </Box>
                        </Typography>
                      )}
                      {(investor.upcomingProfit || 0) > 0 && (
                        <Typography variant="body2" component="div" sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between' }}>
                          <span>أرباح قادمة:</span>
                          <Box component="span" sx={{ fontWeight: 600, color: 'success.main' }}>
                            {(investor.upcomingProfit || 0)?.toLocaleString()}
                          </Box>
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </>
        )}
      </Box>
    </Box>
  );
};
export default InvestorsList;
