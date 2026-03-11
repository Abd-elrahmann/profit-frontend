import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Autocomplete,
  TextField,
  Box,
  Chip,
} from '@mui/material';
import { EXPENSE_TYPES } from '../../utilities/expenseConstants';

const modalInputSx = {
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: 'divider',
      borderWidth: '1px',
    },
    '&:hover fieldset': {
      borderColor: 'primary.main',
      borderWidth: '1.5px',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'primary.main',
      borderWidth: '2px',
    },
  },
};
const ExpenseExportFilterModal = ({
  open,
  onClose,
  selectedExpenseTypes,
  onExpenseTypesChange,
  selectedEmployees,
  onEmployeesChange,
  employeesOptions = [],
  onConfirm,
}) => {
  const showEmployeesFilter = selectedExpenseTypes.includes('مصروف رواتب');
  const handleExpenseTypesChange = (event, newValue) => {
    onExpenseTypesChange(newValue);
    if (!newValue.includes('مصروف رواتب')) {
      onEmployeesChange([]);
    }
  };
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>اختيار أنواع المصروفات</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Autocomplete
            multiple
            options={EXPENSE_TYPES}
            value={selectedExpenseTypes}
            onChange={handleExpenseTypesChange}
            renderInput={(params) => (
              <TextField {...params} label="اختر أنواع المصروفات" placeholder="ابحث عن نوع..." sx={modalInputSx} />
            )}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });
                return <Chip key={key} label={option} {...tagProps} color="primary" size="small" />;
              })
            }
          />
          {showEmployeesFilter && (
            <Autocomplete
              multiple
              options={employeesOptions}
              getOptionLabel={(option) => option.name || ''}
              value={selectedEmployees}
              onChange={(event, newValue) => onEmployeesChange(newValue)}
              renderInput={(params) => (
                <TextField {...params} label="اختر الموظفين (اختياري)" placeholder="ابحث عن موظف..." sx={modalInputSx} />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => {
                  const { key, ...tagProps } = getTagProps({ index });
                  return <Chip key={key} label={option.name} {...tagProps} color="secondary" size="small" />;
                })
              }
            />
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          إلغاء
        </Button>
        <Button onClick={onConfirm} variant="contained" color="primary" disabled={selectedExpenseTypes.length === 0}>
          تأكيد التصدير
        </Button>
      </DialogActions>
    </Dialog>
  );
};
export default ExpenseExportFilterModal;
