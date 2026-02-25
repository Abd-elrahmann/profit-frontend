import React from 'react';
import { Menu, MenuItem, Box, Button, FormControlLabel, Checkbox } from '@mui/material';

const COLUMNS_PER_ROW = 2;

const ColumnsVisibilityMenu = ({
  anchorEl,
  onClose,
  columns,
  onColumnToggle,
  onSelectAll,
  onDeselectAll,
  maxHeight = 400,
  width = 500,
}) => {
  const columnPairs = [];
  for (let i = 0; i < columns.length; i += COLUMNS_PER_ROW) {
    columnPairs.push(columns.slice(i, i + COLUMNS_PER_ROW));
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{
        style: { maxHeight, width },
      }}
    >
      <MenuItem sx={{ pointerEvents: 'none' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pointerEvents: 'auto' }}>
          <Button size="small" onClick={onSelectAll}>
            تحديد الكل
          </Button>
          <Button size="small" onClick={onDeselectAll}>
            إلغاء الكل
          </Button>
        </Box>
      </MenuItem>

      {columnPairs.map((pair, rowIndex) => (
        <MenuItem
          key={`row-${rowIndex}`}
          sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}
        >
          {pair.map((column) => (
            <FormControlLabel
              key={column.id}
              control={
                <Checkbox
                  checked={column.show}
                  onChange={() => onColumnToggle(column.id)}
                  disabled={column.required}
                />
              }
              label={column.label}
              sx={{ flex: 1 }}
            />
          ))}
        </MenuItem>
      ))}
    </Menu>
  );
};

export default React.memo(ColumnsVisibilityMenu);
