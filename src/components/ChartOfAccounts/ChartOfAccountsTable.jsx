import React from 'react';
import {
  Table,
  TableBody,
  TableHead,
  Box,
  IconButton,
  Chip,
  Stack,
  Paper,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
} from '@mui/material';
import { AddCircle, Edit, Delete, KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';
import { StyledTableCell, StyledTableRow } from '../layouts/tableLayout';
import { getAccountNatureLabel } from './chartOfAccountsUtils';

const CHILD_GROUP_COLORS = ['#e8f3ff', '#e8f8ee', '#fff3e6', '#f2ebff', '#e8f7f7', '#ffeef6'];

const getChildGroupColor = (account) => {
  const depth = account?._depth ?? 0;
  if (depth <= 0) return null;
  return CHILD_GROUP_COLORS[(depth - 1) % CHILD_GROUP_COLORS.length];
};

const getAccountNatureChipColor = (nature) => {
  const map = {
    DEBIT: 'error',
    CREDIT: 'success',
  };
  return map[nature] || 'default';
};
const ChartOfAccountsTable = ({
  flatAccounts,
  expandedIds,
  onToggleExpand,
  onAddChild,
  onEdit,
  onDelete,
  onSelect,
  canAdd,
  canUpdate,
  canDelete,
  viewMode = 'tree',
  isSmallScreen = false,
}) => {
  const renderCards = () => (
    <Box sx={{ p: 1 }}>
      <Stack spacing={1.5}>
        {flatAccounts.map((account) => {
          const hasChildren = account.children && account.children.length > 0;
          const isExpanded = expandedIds.has(account.id);
          const depth = account._depth ?? 0;
          const childGroupColor = getChildGroupColor(account);
          const isTreeView = viewMode === 'tree';
          return (
            <Card
              key={account.id}
              sx={{
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                ml: isTreeView ? depth * 2 : 0,
                bgcolor: isTreeView && childGroupColor ? childGroupColor : 'background.paper',
              }}
              onClick={() => onSelect?.(account)}
            >
              <CardContent sx={{ p: 1.5 }}>
                <Stack spacing={1}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {isTreeView && hasChildren && (
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleExpand(account.id);
                          }}
                          sx={{ p: 0.25 }}
                        >
                          {isExpanded ? <KeyboardArrowDown fontSize="small" /> : <KeyboardArrowRight fontSize="small" />}
                        </IconButton>
                      )}
                      <Typography variant="subtitle2" fontWeight="bold">
                        {account.code} - {account.name}
                      </Typography>
                    </Box>
                    <Chip
                      label={getAccountNatureLabel(account.nature)}
                      color={getAccountNatureChipColor(account.nature)}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                  <Divider />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">الرصيد (SAR)</Typography>
                    <Typography variant="body2" fontWeight="600">
                      {(account.balance ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">الحالة</Typography>
                    <Chip
                      label={account.isActive !== false ? 'نشط' : 'غير نشط'}
                      color={account.isActive !== false ? 'success' : 'default'}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.7rem' }}
                    />
                  </Box>
                  {(canAdd || canUpdate || canDelete) && (
                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', pt: 0.5 }} onClick={(e) => e.stopPropagation()}>
                      {canAdd && (
                        <Button size="small" variant="outlined" color="primary" startIcon={<AddCircle sx={{ fontSize: 16 }} />} onClick={() => onAddChild(account)}>
                          فرعي
                        </Button>
                      )}
                      {canUpdate && (
                        <Button size="small" variant="outlined" color="primary" startIcon={<Edit sx={{ fontSize: 16 }} />} onClick={() => onEdit(account)}>
                          تعديل
                        </Button>
                      )}
                      {canDelete && (
                        <Button size="small" variant="outlined" color="error" startIcon={<Delete sx={{ fontSize: 16 }} />} onClick={() => onDelete(account)}>
                          حذف
                        </Button>
                      )}
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
  const renderTable = () => (
  <Paper
    elevation={0}
    sx={{
      width: '100%',
      overflow: 'hidden',
      borderRadius: 2,
      direction: 'rtl',
      border: '1px solid',
      borderColor: 'secondary.main',
      backgroundColor: 'background.paper',
    }}
  >
    <Box sx={{ overflow: 'visible' }}>
      <Table sx={{ minWidth: 800 }}>
        <TableHead>
          <StyledTableRow>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              كود الحساب
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              اسم الحساب
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              النوع
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              الرصيد (SAR)
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              الحالة
            </StyledTableCell>
            <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
              الإجراءات
            </StyledTableCell>
          </StyledTableRow>
        </TableHead>
        <TableBody>
          {flatAccounts.map((account) => {
            const hasChildren = account.children && account.children.length > 0;
            const isExpanded = expandedIds.has(account.id);
            const depth = account._depth ?? 0;
            const isRoot = depth === 0;
            const childGroupColor = getChildGroupColor(account);
            const isTreeView = viewMode === 'tree';
            return (
              <StyledTableRow
                key={account.id}
                hover
                onClick={() => onSelect?.(account)}
                sx={{
                  cursor: 'pointer',
                  ...(isRoot && isTreeView && { fontWeight: 'bold', bgcolor: 'action.hover' }),
                  ...(!isRoot &&
                    isTreeView &&
                    childGroupColor && {
                      '& > td': {
                        backgroundColor: childGroupColor,
                      },
                      '&:hover': {
                        '& > td': {
                          backgroundColor: childGroupColor,
                        },
                      },
                    }),
                }}
              >
                <StyledTableCell
                  align="center"
                  sx={{
                    pl: 2,
                    pr: 2 + (isTreeView ? depth * 2 : 0),
                  }}
                >
                  {account.code}
                </StyledTableCell>
                <StyledTableCell
                  align="center"
                  sx={{
                    pl: 2,
                    pr: 2 + (isTreeView ? depth * 2 : 0),
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
                    {isTreeView && hasChildren && (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleExpand(account.id);
                        }}
                        sx={{ p: 0.5 }}
                      >
                        {isExpanded ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
                      </IconButton>
                    )}
                    <span>{account.name}</span>
                  </Box>
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Chip
                    label={getAccountNatureLabel(account.nature)}
                    color={getAccountNatureChipColor(account.nature)}
                    size="small"
                    variant="outlined"
                  />
                </StyledTableCell>
                <StyledTableCell align="center">
                  {(account.balance ?? 0).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </StyledTableCell>
                <StyledTableCell align="center">
                  <Chip
                    label={account.isActive !== false ? 'نشط' : 'غير نشط'}
                    color={account.isActive !== false ? 'success' : 'default'}
                    size="small"
                    variant="outlined"
                  />
                </StyledTableCell>
                <StyledTableCell align="center" onClick={(e) => e.stopPropagation()}>
                  <Stack direction="row" spacing={0.5} justifyContent="center">
                    {canAdd && (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onAddChild(account)}
                        title="إضافة حساب فرعي"
                      >
                        <AddCircle fontSize="small" />
                      </IconButton>
                    )}
                    {canUpdate && (
                      <IconButton size="small" color="primary" onClick={() => onEdit(account)} title="تعديل">
                        <Edit fontSize="small" />
                      </IconButton>
                    )}
                    {canDelete && (
                      <IconButton size="small" color="error" onClick={() => onDelete(account)} title="حذف">
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </Stack>
                </StyledTableCell>
              </StyledTableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  </Paper>
  );
  return isSmallScreen ? (
    <Paper
      elevation={0}
      sx={{
        width: '100%',
        overflow: 'hidden',
        borderRadius: 2,
        direction: 'rtl',
        border: '1px solid',
        borderColor: 'secondary.main',
        backgroundColor: 'background.paper',
      }}
    >
      {renderCards()}
    </Paper>
  ) : (
    renderTable()
  );
};
export default React.memo(ChartOfAccountsTable);