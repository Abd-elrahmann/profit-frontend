import React, { useState } from "react";
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
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { getPeriods } from "../../pages/periodClosing/periodApi";
import { StyledTableCell, StyledTableRow } from "../layouts/tableLayout";
import dayjs from "dayjs";
import { usePermissions } from "../Contexts/PermissionsContext";

const PeriodTable = ({ onViewDetails, isMobile = false, searchQuery = "" }) => {
  const [page, setPage] = useState(1);
  const { permissions } = usePermissions(); 
  
  const { data: periodsData, isLoading } = useQuery({
    queryKey: ["periods", page, searchQuery],
    queryFn: () => getPeriods(page, searchQuery),
  });

  const handleChangePage = (event, newPage) => {
    setPage(newPage + 1);
  };

  // Period Status Arabic translations
  const getStatusColor = (isClosed) => {
    return isClosed ? "success" : "warning";
  };

  const getStatusText = (isClosed) => {
    return isClosed ? "مقفلة" : "مفتوحة";
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "مستمرة";
    return dayjs(dateString).format("DD/MM/YYYY");
  };

  // Render table for large screens
  const renderTable = () => (
    <TableContainer sx={{ height: "100%", width: "100%" }}>
      <Table stickyHeader sx={{ width: "100%" }}>
        <TableHead>
          <StyledTableRow>
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
            <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
              الإجراءات
            </StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <StyledTableRow>
              <StyledTableCell colSpan={6} align="center">
                <CircularProgress size={20} />
              </StyledTableCell>
            </StyledTableRow>
          ) : periodsData?.periods?.length === 0 ? (
            <StyledTableRow>
              <StyledTableCell colSpan={6} align="center">
                <Typography>لا توجد فترات</Typography>
              </StyledTableCell>
            </StyledTableRow>
          ) : (
            periodsData?.periods?.map((period) => (
              <StyledTableRow 
                key={period.id}
              >
                <StyledTableCell align="center">
                  {period.name}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {formatDate(period.startDate)}
                </StyledTableCell>
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  {formatDate(period.endDate)}
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
                <StyledTableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                  <Stack direction="row" spacing={1} justifyContent="center">
                    {permissions.includes("period_View") && (
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
                    )}
                  </Stack>
                </StyledTableCell>
              </StyledTableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Render cards for small screens
  const renderCards = () => (
    <Box sx={{ p: 1 }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={30} />
        </Box>
      ) : periodsData?.periods?.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            لا توجد فترات
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {periodsData?.periods?.map((period) => (
            <Grid item xs={12} key={period.id}>
              <Card 
                sx={{ 
                  border: '1px solid #e0e0e0',
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  '&:hover': {
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                  },
                  cursor: 'pointer'
                }}
                onClick={() => onViewDetails(period.id)}
              >
                <CardContent sx={{ p: 2 }}>
                  <Stack spacing={1}>
                    {/* Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="h6" fontWeight="bold" color="primary.main">
                        {period.name}
                      </Typography>
                      <Chip
                        label={getStatusText(period.isClosed)}
                        color={getStatusColor(period.isClosed)}
                        size="small"
                      />
                    </Box>

                    {/* Period Details */}
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          تاريخ البداية:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatDate(period.startDate)}
                        </Typography>
                      </Box>
                      
                      <Box>
                        <Typography variant="body2" color="textSecondary">
                          تاريخ النهاية:
                        </Typography>
                        <Typography variant="body2" fontWeight="medium">
                          {formatDate(period.endDate)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Additional Info */}
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        تاريخ الإنشاء:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {dayjs(period.createdAt).format("DD/MM/YYYY")}
                      </Typography>
                    </Box>

                    {/* Action Button */}
                    {permissions.includes("period_View") && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1 }}>
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
      {/* Table for large screens, Cards for small screens */}
      <Paper sx={{ flex: 1, width: "100%", overflow: "hidden", borderRadius: 2 }}>
        {isMobile ? renderCards() : renderTable()}

        {/* Pagination */}
        {periodsData && (
          <TablePagination
            component="div"
            count={periodsData.totalPeriods || 0}
            page={page - 1}
            onPageChange={handleChangePage}
            rowsPerPage={10}
            rowsPerPageOptions={[10]}
            labelDisplayedRows={({ from, to, count }) =>
              `عرض ${from}-${to} من ${count}`
            }
            labelRowsPerPage="صفوف لكل صفحة:"
            sx={{
              '& .MuiTablePagination-toolbar': {
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 1 : 0,
                padding: isMobile ? 1 : 2
              },
            }}
          />
        )}
      </Paper>
    </Box>
  );
};

export default PeriodTable;