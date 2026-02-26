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
  isSmallScreen = false,
}) => {
  const columnPairs = [];
  for (let i = 0; i < columns.length; i += COLUMNS_PER_ROW) {
    columnPairs.push(columns.slice(i, i + COLUMNS_PER_ROW));
  }

  const menuMaxHeight = isSmallScreen ? 320 : maxHeight;
  const menuWidth = isSmallScreen ? 280 : width;

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      onClose={onClose}
      PaperProps={{
        style: { maxHeight: menuMaxHeight, width: menuWidth },
      }}
    >
      <MenuItem sx={{ pointerEvents: 'none', py: isSmallScreen ? 0.5 : 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pointerEvents: 'auto', gap: 1 }}>
          <Button size={isSmallScreen ? 'small' : 'medium'} onClick={onSelectAll} sx={{ minWidth: 0, fontSize: isSmallScreen ? '0.75rem' : undefined }}>
            تحديد الكل
          </Button>
          <Button size={isSmallScreen ? 'small' : 'medium'} onClick={onDeselectAll} sx={{ minWidth: 0, fontSize: isSmallScreen ? '0.75rem' : undefined }}>
            إلغاء الكل
          </Button>
        </Box>
      </MenuItem>

      {columnPairs.map((pair, rowIndex) => (
        <MenuItem
          key={`row-${rowIndex}`}
          sx={{ display: 'flex', justifyContent: 'space-between', gap: isSmallScreen ? 1 : 2, py: isSmallScreen ? 0.5 : 1 }}
        >
          {pair.map((column) => (
            <FormControlLabel
              key={column.id}
              control={
                <Checkbox
                  checked={column.show}
                  onChange={() => onColumnToggle(column.id)}
                  disabled={column.required}
                  size={isSmallScreen ? 'small' : 'medium'}
                />
              }
              label={column.label}
              sx={{ flex: 1, '& .MuiFormControlLabel-label': { fontSize: isSmallScreen ? '0.8rem' : undefined } }}
            />
          ))}
        </MenuItem>
      ))}
    </Menu>
  );
};

export default React.memo(ColumnsVisibilityMenu);
