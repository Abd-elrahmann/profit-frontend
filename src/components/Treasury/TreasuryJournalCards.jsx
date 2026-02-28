import React from 'react';
import { Box, Card, CardContent, Typography, Chip, Stack } from '@mui/material';
import dayjs from 'dayjs';
export default function TreasuryJournalCards({ journals, isDarkMode }) {
  return (
    <Stack spacing={1.5} sx={{ p: 1, width: '100%' }}>
      {journals.map((journal) => (
        <Card
          key={journal.id}
          variant="outlined"
          sx={{
            width: '100%',
            borderRadius: 2,
            bgcolor: isDarkMode ? '#2a2a2a' : 'background.paper',
            border: '1px solid',
            borderColor: isDarkMode ? '#424242' : 'divider',
            boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" color="primary">
                    {journal.reference}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {dayjs(journal.date).format('DD/MM/YYYY')}
                  </Typography>
                </Box>
                <Chip
                  label={journal.status === 'POSTED' ? 'مرحل' : 'مسودة'}
                  size="small"
                  color={journal.status === 'POSTED' ? 'success' : 'default'}
                  variant="outlined"
                  sx={{ fontWeight: 'bold', fontSize: '0.7rem' }}
                />
              </Box>
              <Box>
                <Typography variant="body2" fontWeight="medium" sx={{ mb: 0.5 }}>
                  {journal.description}
                </Typography>
                {journal.postedBy && (
                  <Typography variant="caption" color="text.secondary">
                    بواسطة: {journal.postedBy}
                  </Typography>
                )}
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    مدين
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={journal.debit > 0 ? 'success.main' : 'text.secondary'}
                  >
                    {journal.debit > 0 ? journal.debit.toLocaleString('en-US') : '0'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    دائن
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={journal.credit > 0 ? 'error.main' : 'text.secondary'}
                  >
                    {journal.credit > 0 ? journal.credit.toLocaleString('en-US') : '0'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    الرصيد
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={journal.balance >= 0 ? 'success.main' : 'error.main'}
                  >
                    {journal.balance.toLocaleString('en-US')}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}