import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  Chip,
  Typography,
  CircularProgress,
} from '@mui/material';
import { StyledTableCell, StyledTableRow } from '../layouts/tableLayout';
import { formatArabicDate } from '../../utilities/dateUtils';
import { getActionText, getActionColor, getScreenText } from './logsUtils';
const LogsTable = ({ logsData, isLoading, isDarkMode }) => (
  <TableContainer>
    <Table stickyHeader>
      <TableHead sx={{ bgcolor: isDarkMode ? 'background.paper' : '#F3F4F6' }}>
        <StyledTableRow>
          <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
            المستخدم
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
            الشاشة
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
            الإجراء
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
            الوصف
          </StyledTableCell>
          <StyledTableCell align="center" sx={{ fontWeight: 'bold' }}>
            التاريخ والوقت
          </StyledTableCell>
        </StyledTableRow>
      </TableHead>
      <TableBody>
        {isLoading ? (
          <StyledTableRow>
            <StyledTableCell colSpan={5} align="center">
              <CircularProgress size={20} />
            </StyledTableCell>
          </StyledTableRow>
        ) : logsData?.length === 0 ? (
          <StyledTableRow>
            <StyledTableCell colSpan={5} align="center">
              <Typography>لا توجد سجلات أنشطة</Typography>
            </StyledTableCell>
          </StyledTableRow>
        ) : (
          logsData?.map((log) => (
            <StyledTableRow key={log.id} hover>
              <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                {log.user.name}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                {getScreenText(log.screen)}
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                <Chip
                  label={getActionText(log.action)}
                  color={getActionColor(log.action)}
                  size="small"
                />
              </StyledTableCell>
              <StyledTableCell align="center" style={{ wordWrap: 'break-word', maxWidth: '170px' }}>
                <Typography variant="body2">{log.description}</Typography>
              </StyledTableCell>
              <StyledTableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                    {formatArabicDate(log.createdAt)}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '0.85rem' }}>
                    {log.createdAtHijri}
                  </Typography>
                </Box>
              </StyledTableCell>
            </StyledTableRow>
          ))
        )}
      </TableBody>
    </Table>
  </TableContainer>
);
export default LogsTable;