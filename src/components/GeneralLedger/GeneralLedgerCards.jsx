import React from 'react';
import { Card, CardContent, Typography, Box, Stack } from '@mui/material';
import { formatArabicDate } from './generalLedgerUtils';

const GeneralLedgerCards = ({ journals }) => (
  <Stack spacing={2}>
    {journals?.map((journal) =>
      journal.lines.map((line) => (
        <Card key={`${journal.id}-${line.id}`} variant="outlined" sx={{ borderRadius: 2, bgcolor: 'background.paper' }}>
          <CardContent sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight="bold" color="primary">
                    {journal.reference}
                  </Typography>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5 }}>
                      {formatArabicDate(journal.date)}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: 'primary.main', fontWeight: 'bold', fontSize: '0.7rem', display: 'block' }}
                    >
                      {journal.hijriDate}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ mb: 0.5 }} fontWeight="medium">
                  {line.description}
                </Typography>
                {journal.postedBy && (
                  <Typography variant="caption" color="text.secondary">
                    بواسطة: {journal.postedBy}
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    مدين
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={line.debit > 0 ? 'success.main' : 'text.secondary'}
                  >
                    {line.debit > 0 ? line.debit.toLocaleString('en-US') : '0'}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    دائن
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={line.credit > 0 ? 'error.main' : 'text.secondary'}
                  >
                    {line.credit > 0 ? line.credit.toLocaleString('en-US') : '0'}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'center', flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    الرصيد
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                    color={line.balance >= 0 ? 'primary.main' : 'error.main'}
                  >
                    {line.balance.toLocaleString('en-US')}
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      ))
    )}
  </Stack>
);

export default React.memo(GeneralLedgerCards);
