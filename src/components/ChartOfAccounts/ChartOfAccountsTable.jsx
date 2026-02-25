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
} from '@mui/material';
import { AddCircle, Edit, Delete, KeyboardArrowDown, KeyboardArrowRight } from '@mui/icons-material';
import { StyledTableCell, StyledTableRow } from '../layouts/tableLayout';
import { getAccountTypeLabel } from './chartOfAccountsUtils';

const getAccountTypeChipColor = (type) => {
  const map = {
    ASSET: 'info',
    LIABILITY: 'error',
    EQUITY: 'secondary',
    REVENUE: 'success',
    EXPENSE: 'warning',
  };
  return map[type] || 'default';
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
}) => (
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
            const isTreeView = viewMode === 'tree';

            return (
              <StyledTableRow
                key={account.id}
                hover
                onClick={() => onSelect?.(account)}
                sx={{
                  cursor: 'pointer',
                  ...(isRoot && isTreeView && { fontWeight: 'bold', bgcolor: 'action.hover' }),
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
                    label={getAccountTypeLabel(account.type)}
                    color={getAccountTypeChipColor(account.type)}
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

export default React.memo(ChartOfAccountsTable);
