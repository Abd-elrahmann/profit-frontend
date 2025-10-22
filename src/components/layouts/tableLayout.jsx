import * as React from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Box, Typography, CircularProgress, TablePagination } from '@mui/material';

export const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.common.white,
    padding: "12px 14px",
    fontWeight: 500,
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
    borderBottom: `1px solid ${theme.palette.primary.dark}`,
    fontFamily: theme.typography.fontFamily
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: '0.88rem',
    padding: "12px 14px",
    color: theme.palette.text.primary,
    borderBottom: `1px solid ${theme.palette.secondary.main}`,
    fontFamily: theme.typography.fontFamily
  },
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: theme.palette.secondary.light,
  },
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.background.default,
  },
  '&:hover': {
    backgroundColor: theme.palette.secondary.main,
    transition: 'background-color 0.2s ease',
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const TableLayout = ({
  columns = [], // Add default empty array
  data = [], // Add default empty array
  isLoading = false,
  page = 0,
  setPage = () => {},
  rowsPerPage = 10,
  setRowsPerPage = () => {},
  totalCount = 0,
  emptyMessage,
  maxHeight = 650
}) => {
  const isRTL = true;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        width: '100%', 
        overflow: 'hidden', 
        borderRadius: 2, 
        direction: isRTL ? 'rtl' : 'ltr',
        border: '1px solid',
        borderColor: 'secondary.main',
        backgroundColor: 'background.paper'
      }}
    >
      <TableContainer sx={{ maxHeight }}>
        <Table stickyHeader sx={{ minWidth: 700 }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <StyledTableCell
                  key={column.id}
                  align={column.align || (isRTL ? 'right' : 'left')}
                  sx={{ 
                    minWidth: column.minWidth || 'auto',
                    backgroundColor: 'primary.main',
                    '&:first-of-type': {
                      borderTopLeftRadius: isRTL ? 0 : 8,
                      borderTopRightRadius: isRTL ? 8 : 0,
                    },
                    '&:last-child': {
                      borderTopRightRadius: isRTL ? 0 : 8,
                      borderTopLeftRadius: isRTL ? 8 : 0,
                    }
                  }}
                >
                  {isRTL ? column.arLabel : column.label}
                </StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.length > 0 ? (
              data.map((row, index) => (
                <StyledTableRow key={index}>
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <StyledTableCell 
                        key={column.id}
                        align={column.align || (isRTL ? 'right' : 'left')}
                      >
                        {column.format ? column.format(value, row) : value}
                      </StyledTableCell>
                    );
                  })}
                </StyledTableRow>
              ))
            ) : (
              <TableRow>
                <StyledTableCell 
                  colSpan={columns.length} 
                  align="center" 
                  sx={{ 
                    py: 8,
                    backgroundColor: 'background.paper',
                    borderBottom: 'none'
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'text.secondary',
                      fontWeight: 500,
                      fontFamily: theme => theme.typography.fontFamily
                    }}
                  >
                    {emptyMessage || 'لا يوجد بيانات'}
                  </Typography>
                </StyledTableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={'عدد العناصر لكل صفحة'}
        sx={{
          fontFamily: theme => theme.typography.fontFamily,
          '.MuiTablePagination-select': {
            fontFamily: theme => theme.typography.fontFamily
          }
        }}
      />
    </Paper>
  );
};

export default TableLayout;
