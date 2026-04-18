import React from "react";
import {
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
  IconButton,
  CircularProgress,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";
import AutorenewIcon from "@mui/icons-material/Autorenew";
const InvestorHeader = ({
  investorDetails,
  isMobile = false,
  onBackToList,
  isExporting,
  exportMenuAnchor,
  onExportMenuOpen,
  onExportMenuClose,
  onExportExcel,
  onExportPDF,
  onWithdraw,
  onEdit,
  onDelete,
  onRegenerateMudarabah,
  isRegeneratingMudarabah,
  permissions,
}) => {
  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        bgcolor: 'background.paper',
        p: 2,
        borderBottom: '1px solid #ddd',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "stretch", sm: "center" },
        flexWrap: "wrap",
        gap: 2,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
        {isMobile && onBackToList && (
          <IconButton
            onClick={onBackToList}
            size="small"
            sx={{ flexShrink: 0, transform: "scaleX(-1)" }}
            aria-label="العودة للقائمة"
          >
            <ArrowBackIcon />
          </IconButton>
        )}
        <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" fontWeight="bold" noWrap>
          {investorDetails.name}
        </Typography>
        <Typography color="text.secondary" variant="body2" noWrap>
          رقم الهوية: {investorDetails.nationalId}
        </Typography>
        {investorDetails.duration && (
          <Typography color="primary.main" variant="body2" noWrap fontWeight="bold">
            المدة: {
              [
                investorDetails.duration.years > 0 && `${investorDetails.duration.years} سنة`,
                investorDetails.duration.months > 0 && `${investorDetails.duration.months} شهر`,
                investorDetails.duration.days > 0 && `${investorDetails.duration.days} يوم`
              ].filter(Boolean).join(' و ') || 'أقل من يوم'
            }
          </Typography>
        )}
        </Box>
      </Box>
      {}
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: 'flex-end' }}>
        {}
        {permissions.includes("partners_Add") && (
          <>
            <Button
              variant="outlined"
              size={isMobile ? "small" : "medium"}
              startIcon={<AccountBalanceWalletIcon sx={{marginLeft: '10px'}} />}
              onClick={onWithdraw}
              sx={{
                borderColor: investorDetails?.WithdrawingStatus === 'WITHDRAWING' || investorDetails?.WithdrawingStatus === 'WITHDRAWN' 
                  ? "warning.main" 
                  : "error.main",
                color: investorDetails?.WithdrawingStatus === 'WITHDRAWING' || investorDetails?.WithdrawingStatus === 'WITHDRAWN' 
                  ? "warning.main" 
                  : "error.main",
                "&:hover": { 
                  bgcolor: investorDetails?.WithdrawingStatus === 'WITHDRAWING' || investorDetails?.WithdrawingStatus === 'WITHDRAWN' 
                    ? "warning.50" 
                    : "error.50", 
                  borderColor: investorDetails?.WithdrawingStatus === 'WITHDRAWING' || investorDetails?.WithdrawingStatus === 'WITHDRAWN' 
                    ? "warning.dark" 
                    : "error.dark" 
                },
                borderRadius: 2,
                px: 2,
                fontWeight: 500,
              }}
            >
              {investorDetails?.WithdrawingStatus === 'WITHDRAWING' || investorDetails?.WithdrawingStatus === 'WITHDRAWN' 
                ? 'إلغاء الانسحاب' 
                : 'انسحاب المستثمر'}
            </Button>
            {}
            {investorDetails?.WithdrawingStatus === 'WITHDRAWING' && (
              <Button
                variant="outlined"
                size={isMobile ? "small" : "medium"}
                startIcon={<EditIcon sx={{marginLeft: '10px'}} />}
                onClick={onEdit}
                sx={{
                  borderColor: "warning.main",
                  color: "warning.main",
                  "&:hover": { bgcolor: "warning.50", borderColor: "warning.dark" },
                  borderRadius: 2,
                  px: 2,
                  fontWeight: 500,
                }}
              >
                تعديل مبلغ الانسحاب
              </Button>
            )}
            {}
            {permissions.includes("partners_Delete") && (
              <Button
                variant="contained"
                size={isMobile ? "small" : "medium"}
                color="error"
                startIcon={<DeleteIcon sx={{marginLeft: '10px'}} />}
                onClick={onDelete}
                sx={{
                  borderColor: "error.main",
                  "&:hover": { bgcolor: "error.50", borderColor: "error.dark" },
                  borderRadius: 2,
                  px: 2,
                  fontWeight: 500,
                }}
              >
                حذف المستثمر
              </Button>
            )}
          </>
        )}
        {}
        {(permissions.includes("partners_Export") || permissions.includes("partners_Update")) && onRegenerateMudarabah && (
          <Button
            variant="outlined"
            size={isMobile ? "small" : "medium"}
            onClick={onRegenerateMudarabah}
            disabled={isRegeneratingMudarabah}
            startIcon={
              isRegeneratingMudarabah ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <AutorenewIcon sx={{ marginLeft: "10px" }} />
              )
            }
            sx={{
              borderColor: "primary.main",
              color: "primary.main",
              "&:hover": { bgcolor: "primary.50", borderColor: "primary.dark" },
              borderRadius: 2,
              px: 2,
              fontWeight: 500,
            }}
          >
            {isRegeneratingMudarabah ? "جاري التجهيز..." : "إعادة توليد ملف المضاربة"}
          </Button>
        )}
        {}
        {permissions.includes("partners_Export") && (
          <>
            <Button
              variant="text"
              startIcon={<DownloadIcon sx={{marginLeft: '10px'}} />}
              endIcon={<KeyboardArrowDownIcon />}
              onClick={onExportMenuOpen}
              disabled={isExporting}
              sx={{
                color: "black",
                borderRadius: 2,
                px: 2,
                fontWeight: 500,
              }}
            >
              تصدير
            </Button>
            <Menu
              anchorEl={exportMenuAnchor}
              open={Boolean(exportMenuAnchor)}
              onClose={onExportMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem
                onClick={() => {
                  onExportMenuClose();
                  onExportExcel();
                }}
                disabled={isExporting}
              >
                <TableChartIcon sx={{ mr: 1, fontSize: '18px', color: 'primary.main' }} />
                تصدير Excel
              </MenuItem>
              <MenuItem
                onClick={() => {
                  onExportMenuClose();
                  onExportPDF();
                }}
                disabled={isExporting}
              >
                <PictureAsPdfIcon sx={{ mr: 1, fontSize: '18px', color: 'error.main' }} />
                تصدير PDF
              </MenuItem>
            </Menu>
          </>
        )}
      </Box>
    </Box>
  );
};
export default InvestorHeader;
