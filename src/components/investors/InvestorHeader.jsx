import React from "react";
import {
  Box,
  Typography,
  Button,
  Menu,
  MenuItem,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import TableChartIcon from "@mui/icons-material/TableChart";

/**
 * InvestorHeader Component - Header section with investor info and actions
 * Displays investor name, ID, duration and action buttons
 */
const InvestorHeader = ({
  // Investor data
  investorDetails,
  
  // Export state
  isExporting,
  exportMenuAnchor,
  onExportMenuOpen,
  onExportMenuClose,
  onExportExcel,
  onExportPDF,
  
  // Actions
  onWithdraw,
  onEdit,
  onDelete,
  
  // Permissions
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
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      {/* Investor Info */}
      <Box sx={{ minWidth: '200px' }}>
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
      
      {/* Action Buttons */}
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: 'flex-end' }}>
        {/* Export Menu */}
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

        {/* Withdraw Button */}
        {permissions.includes("partners_Add") && (
          <>
            <Button
              variant="outlined"
              startIcon={<AccountBalanceWalletIcon sx={{marginLeft: '10px'}} />}
              onClick={onWithdraw}
              disabled={investorDetails?.WithdrawingStatus === 'WITHDRAWING' || investorDetails?.WithdrawingStatus === 'WITHDRAWN'}
              sx={{
                borderColor: "error.main",
                color: "error.main",
                "&:hover": { bgcolor: "error.50", borderColor: "error.dark" },
                borderRadius: 2,
                px: 2,
                fontWeight: 500,
              }}
            >
              انسحاب المستثمر
            </Button>

            {/* Delete Button */}
            {permissions.includes("partners_Delete") && (
              <Button
                variant="contained"
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
            
            {/* Edit Withdrawal Button */}
            {investorDetails?.WithdrawingStatus === 'WITHDRAWING' && (
              <Button
                variant="outlined"
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
          </>
        )}
      </Box>
    </Box>
  );
};

export default InvestorHeader;
