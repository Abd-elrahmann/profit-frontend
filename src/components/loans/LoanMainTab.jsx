import React from "react";
import {
  Box,
  Alert,
  Stack,
  Typography,
  Button,
  Tabs,
  Tab,
} from "@mui/material";

const LoanMainTab = ({
  loansNeedingContracts,
  subTab,
  setSubTab,
  handleViewLoanDetails,
}) => {
  return (
    <Box
      sx={{ width: "100%", display: "flex", flexDirection: "column" }}
    >
      {/* Alert for loans needing contracts */}
      {loansNeedingContracts && loansNeedingContracts.length > 0 && (
        <Alert
          severity="warning"
          sx={{
            mb: 3,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            "& .MuiAlert-message": { flex: 1 },
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" mb={2}>
            السلف التالية تحتاج إلى حفظ العقود:
          </Typography>
          <Stack spacing={1.5} sx={{ gap: 2 }}>
            {loansNeedingContracts.map((loan) => (
              <Box
                key={loan.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 4,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ flex: 1, pr: 2 }}
                >
                  السلفة #{loan.id} - العميل: {loan.client?.name}
                  {!loan.DEBT_ACKNOWLEDGMENT && !loan.PROMISSORY_NOTE && " (إقرار الدين وسند الأمر)"}
                  {!loan.DEBT_ACKNOWLEDGMENT && loan.PROMISSORY_NOTE && " (إقرار الدين)"}
                  {loan.DEBT_ACKNOWLEDGMENT && !loan.PROMISSORY_NOTE && " (سند الأمر)"}
                </Typography>

                <Button
                  size="small"
                  variant="outlined"
                  color="primary"
                  onClick={() => handleViewLoanDetails(loan.id)}
                >
                  عرض تفاصيل السلفة
                </Button>
              </Box>
            ))}
          </Stack>
        </Alert>
      )}

      {/* Sub-tabs for loan status filtering */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "center" }}>
        <Tabs
          value={subTab}
          onChange={(e, newValue) => setSubTab(newValue)}
          sx={{
            "& .MuiTab-root": {
              fontSize: "0.9rem",
              fontWeight: "500",
              width: "200px",
            },
          }}
        >
          <Tab label="قيد الانتظار" />
          <Tab label="نشطة" />
          <Tab label="مكتملة" />
        </Tabs>
      </Box>
    </Box>
  );
};

export default LoanMainTab;
