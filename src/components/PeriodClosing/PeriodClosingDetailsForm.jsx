import React from "react";
import {
  Paper,
  Typography,
  Stack,
  Box,
  Chip as MuiChip,
  Grid,
} from "@mui/material";
import { formatDateWithHijri } from "./periodClosingUtils.jsx";
export default function PeriodClosingDetailsForm({ periodData }) {
  return (
    <Paper sx={{ p: 3, borderRadius: 2, mb: 2 }}>
      <Typography variant="h6" fontWeight="bold" mb={3} textAlign="center">
        معلومات الفترة
      </Typography>
      <Stack spacing={2}>
        <Box>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            اسم الفترة
          </Typography>
          <Typography variant="body1" fontWeight="bold">
            {periodData?.name || "-"}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            تاريخ البداية
          </Typography>
          {formatDateWithHijri(
            periodData?.startDate,
            periodData?.startDateHijri
          )}
        </Box>
        <Box>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            تاريخ النهاية
          </Typography>
          {formatDateWithHijri(
            periodData?.endDate,
            periodData?.endDateHijri
          )}
        </Box>
        <Box>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            الحالة
          </Typography>
          <MuiChip
            label={periodData?.isClosed ? "مقفلة" : "مفتوحة"}
            color={periodData?.isClosed ? "success" : "warning"}
            size="small"
          />
        </Box>
      </Stack>
    </Paper>
  );
}