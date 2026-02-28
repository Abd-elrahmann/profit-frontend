import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Stack,
  Divider,
  IconButton,
  Chip,
  CircularProgress,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { getBankStatusText, getBankStatusColor } from "./banksUtils";
const BanksCards = ({
  banksData,
  isLoading,
  isSmallScreen,
  permissions,
  onEdit,
  onDelete,
  i18nLanguage = "ar",
}) => {
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={30} />
      </Box>
    );
  }
  if (!banksData?.length) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <Typography variant="body1" color="textSecondary">لا توجد حسابات بنكية</Typography>
      </Box>
    );
  }
  return (
    <Stack spacing={1.5} sx={{ width: "100%" }}>
      {banksData.map((bank) => (
        <Card
          key={bank.id}
          sx={{
            width: "100%",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            boxShadow: "0 2px 4px rgba(0,0,0,0.08)",
            "&:hover": { boxShadow: "0 4px 8px rgba(0,0,0,0.12)" }
          }}
        >
          <CardContent sx={{ p: isSmallScreen ? 1.5 : 3 }}>
            <Stack spacing={2}>
              <Box sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                flexDirection: isSmallScreen ? "column" : "row",
                gap: 1
              }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: "bold", color: "primary.main" }}>
                    {bank.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">#{bank.id}</Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                  {permissions.includes("banks_Update") && (
                    <IconButton color="primary" onClick={() => onEdit(bank)} size="small" title="تعديل">
                      <Edit fontSize={isSmallScreen ? "small" : "medium"} />
                    </IconButton>
                  )}
                  {permissions.includes("banks_Delete") && (
                    <IconButton color="error" onClick={() => onDelete(bank)} size="small" title="حذف">
                      <Delete fontSize={isSmallScreen ? "small" : "medium"} />
                    </IconButton>
                  )}
                </Box>
              </Box>
              <Divider />
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>اسم المالك:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "medium" }}>{bank.owner}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>رقم الحساب:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "medium" }}>{bank.accountNumber}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>رقم الايبان:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "medium", wordBreak: "break-all" }}>{bank.IBAN}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5 }}>السلف المسموح بها:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: "medium" }}>{bank.limit}</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
                <Chip
                  label={getBankStatusText(bank.status, i18nLanguage)}
                  color={getBankStatusColor(bank.status)}
                  variant="outlined"
                  sx={{
                    fontWeight: "bold",
                    fontSize: isSmallScreen ? "0.75rem" : "0.875rem",
                    padding: "4px 8px",
                    borderRadius: "16px",
                  }}
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
};
export default BanksCards;