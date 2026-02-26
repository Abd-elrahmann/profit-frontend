import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  Stack,
  Button,
  Collapse,
  Chip,
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { formatArabicDate } from './expensesUtils';

const ExpenseTypeChip = ({ type }) => (
  <Chip
    label={type}
    color={type === 'مصروف رواتب' ? 'primary' : 'default'}
    size="small"
    variant="outlined"
  />
);

const ExpensesCards = ({
  groupedExpenses,
  isLoading,
  expandedRows,
  onToggleExpand,
  onEdit,
  onDelete,
  canUpdate,
  canDelete,
  isDeleting,
  isSmallScreen,
}) => {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          جاري التحميل...
        </Typography>
      </Box>
    );
  }

  if (groupedExpenses.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
        لا توجد مصروفات
      </Typography>
    );
  }

  return (
    <Box sx={{ p: isSmallScreen ? 1 : 2, width: '100%' }}>
      <Stack spacing={1.5} sx={{ width: '100%' }}>
        {groupedExpenses.map((group) => (
            <Card
              key={group.journalId}
              sx={{
                width: '100%',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
              }}
            >
              <CardContent sx={{ p: isSmallScreen ? 1.5 : 2 }}>
                <Stack spacing={1.5}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      التاريخ
                    </Typography>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                        {formatArabicDate(group.date)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '0.7rem', display: 'block' }}
                      >
                        {group.createdAtHijri}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      عدد المصروفات
                    </Typography>
                    <Typography variant="body1">{group.expenses.length}</Typography>
                  </Box>
                  <Divider />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="text.secondary">
                      إجمالي المبلغ
                    </Typography>
                    <Typography variant="body1" fontWeight="bold" color="primary.main">
                      {group.totalAmount.toLocaleString('en-US')}
                    </Typography>
                  </Box>
                  <Divider />

                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      الأنواع:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                      {group.types.map((type, idx) => (
                        <ExpenseTypeChip key={idx} type={type} />
                      ))}
                    </Stack>
                  </Box>
                  <Divider />

                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      مضافة بواسطة:
                    </Typography>
                    <Typography variant="body2">{group.addedBy?.name || '-'}</Typography>
                  </Box>

                  <Typography
                    variant="body2"
                    sx={{ mb: 0.5, cursor: 'pointer', color: 'primary.main' }}
                    onClick={() => onToggleExpand(group.journalId)}
                  >
                    {expandedRows.includes(group.journalId) ? 'إخفاء التفاصيل ▲' : 'عرض التفاصيل ▼'}
                  </Typography>

                  <Collapse in={expandedRows.includes(group.journalId)}>
                    <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        تفاصيل المصروفات:
                      </Typography>
                      {group.expenses.map((expense, idx) => (
                        <Box
                          key={idx}
                          sx={{
                            mb: 2,
                            pb: 2,
                            borderBottom:
                              idx < group.expenses.length - 1 ? '1px dashed #e0e0e0' : 'none',
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              النوع:
                            </Typography>
                            <ExpenseTypeChip type={expense.type} />
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary">
                              المبلغ:
                            </Typography>
                            <Typography variant="body2" fontWeight="bold">
                              {expense.amount.toLocaleString('en-US')}
                            </Typography>
                          </Box>
                          {expense.description && (
                            <Box sx={{ mb: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                الوصف:
                              </Typography>
                              <Typography variant="body2">{expense.description}</Typography>
                            </Box>
                          )}
                          {expense.employee && (
                            <Box>
                              <Typography variant="body2" color="text.secondary">
                                الموظف:
                              </Typography>
                              <Typography variant="body2">{expense.employee.name}</Typography>
                            </Box>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Collapse>

                  {(canUpdate || canDelete) && (
                    <>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, pt: 1 }}>
                        {canUpdate && (
                          <Button
                            size="small"
                            color="primary"
                            startIcon={<Edit />}
                            onClick={() => onEdit(group)}
                            variant="outlined"
                          >
                            تعديل
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            size="small"
                            color="error"
                            startIcon={<Delete />}
                            onClick={() => onDelete(group.journalId)}
                            disabled={isDeleting}
                            variant="outlined"
                          >
                            حذف
                          </Button>
                        )}
                      </Box>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>
        ))}
      </Stack>
    </Box>
  );
};

export default React.memo(ExpensesCards);
