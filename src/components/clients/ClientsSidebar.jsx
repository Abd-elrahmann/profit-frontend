import React from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  CircularProgress,
  Pagination,
  Chip,
  IconButton,
} from "@mui/material";
import { Add, Search, Delete } from "@mui/icons-material";
import { STATUS_FILTERS } from "./constants";
import { getStatusColor, getClientStatusColor } from "./clientsUtils";
import { transparentSearchTextFieldSx } from "../../utilities/searchInputStyles";
export default function ClientsSidebar({
  permissions,
  isDarkMode,
  clientsData,
  isClientsLoading,
  search,
  selectedStatus,
  currentPage,
  selectedClient,
  onAddClient,
  onSearchChange,
  onStatusChange,
  onPageChange,
  onClientSelect,
  onDeleteClient,
  listScrollRef,
  isMobile = false,
}) {
  return (
    <Box
      ref={listScrollRef}
      sx={{
        width: { xs: "100%", md: "350px" },
        minWidth: { xs: 0, md: "350px" },
        borderRight: { xs: "none", md: "1px solid #ddd" },
        bgcolor: isDarkMode ? "background.paper" : "#fafafa",
        height: "100%",
        overflowY: "auto",
        flexShrink: 0,
        flex: isMobile ? 1 : "none",
      }}
    >
      <Box
        sx={{
          p: 3,
          borderBottom: "1px solid #ddd",
          bgcolor: isDarkMode ? "background.paper" : "#fafafa",
        }}
      >
        {permissions.includes("clients_Add") && (
          <Box sx={{ mb: 2 }}>
            <Button
              fullWidth
              size="small"
              variant="contained"
              startIcon={<Add sx={{ marginLeft: "10px" }} />}
              onClick={onAddClient}
              sx={{
                bgcolor: "primary.main",
                "&:hover": { bgcolor: "primary.dark" },
                fontWeight: "bold",
                borderRadius: 2,
                py: 1,
              }}
            >
              إضافة عميل جديد
            </Button>
          </Box>
        )}
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
                <Search />
              </InputAdornment>
            ),
          }}
        />
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 2 }}>
          {STATUS_FILTERS.map((status) => (
            <Chip
              key={status}
              label={status}
              color={getClientStatusColor(status)}
              variant={selectedStatus === status ? "filled" : "outlined"}
              onClick={() => onStatusChange(status)}
            />
          ))}
        </Box>
      </Box>
      {clientsData && !isClientsLoading && (
        <Box
          sx={{
            p: 2,
            borderBottom: "1px solid #eee",
            bgcolor: isDarkMode ? "background.paper" : "#f9f9f9",
          }}
        >
          <Typography variant="body2" color="text.primary" sx={{ mb: 2 }}>
            صفحة {clientsData.currentPage} من {clientsData.totalPages} - إجمالي{" "}
            {clientsData.totalClients} عميل
          </Typography>
          {clientsData.totalPages > 1 && (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Pagination
                count={clientsData.totalPages}
                page={currentPage}
                onChange={onPageChange}
                color="primary"
                size="small"
                siblingCount={1}
                boundaryCount={1}
                sx={{
                  "& .MuiPaginationItem-root": {
                    fontSize: "0.875rem",
                  },
                }}
              />
            </Box>
          )}
        </Box>
      )}
      {isClientsLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
          <CircularProgress />
        </Box>
      ) : clientsData?.clients?.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 4,
            flexDirection: "column",
          }}
        >
          <Typography variant="h6" color="text.secondary" mb={1}>
            لا توجد عملاء
          </Typography>
          <Typography variant="body2" color="text.primary">
            {search || selectedStatus !== "الكل"
              ? "لم يتم العثور على عملاء مطابقين للبحث"
              : "لا توجد عملاء مسجلين"}
          </Typography>
        </Box>
      ) : (
        clientsData?.clients?.map((item) => {
          const client = item.client;
          const isSelected = selectedClient?.id === client.id;
          return (
            <Box
              key={client.id}
              sx={{
                p: 2,
                mb: 1,
                mx: 2,
                mt: 2,
                cursor: "pointer",
                border: isSelected ? "2px solid" : "1px solid #E5E7EB",
                borderColor: isSelected ? "primary.main" : "#E5E7EB",
                borderRadius: "12px",
                bgcolor: isSelected ? "primary.50" : "background.paper",
                boxShadow: isSelected
                  ? "0 6px 16px rgba(46, 139, 69, 0.15)"
                  : "0 3px 12px rgba(15, 23, 42, 0.06)",
                transition: "0.2s",
                "&:hover": {
                  bgcolor: isDarkMode
                    ? "rgba(255, 255, 255, 0.08)"
                    : "#F3F4F6",
                },
              }}
              onClick={() => onClientSelect(client)}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <Box>
                  <Typography
                    fontWeight="bold"
                    color={isSelected ? "primary.main" : "text.primary"}
                  >
                    {client.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    رقم الهوية: {client.nationalId}
                  </Typography>
                </Box>
              </Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mt={1}
              >
                <Chip
                  label={client.status}
                  size="small"
                  color={getStatusColor(client.status)}
                  variant="outlined"
                />
                {permissions.includes("clients_Delete") && (
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteClient(client);
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                )}
              </Box>
            </Box>
          );
        })
      )}
    </Box>
  );
}