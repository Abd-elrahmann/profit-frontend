import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  CircularProgress,
} from '@mui/material';
import { formatArabicDate } from '../../utilities/dateUtils';
import { getActionText, getActionColor, getScreenText } from './logsUtils';
const LogsCards = ({ logsData, isLoading, isMobile }) => (
  <Box sx={{ p: isMobile ? 1 : 2 }}>
    {isLoading ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={30} />
      </Box>
    ) : logsData?.length === 0 ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Typography variant="h6" color="textSecondary">
          لا توجد سجلات أنشطة
        </Typography>
      </Box>
    ) : (
      <Grid container spacing={2}>
        {logsData?.map((log) => (
          <Grid item xs={12} key={log.id}>
            <Card
              sx={{
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.15)' },
              }}
            >
              <CardContent sx={{ p: isMobile ? 2 : 3 }}>
                <Stack spacing={2}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: 1,
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {log.user.name}
                    </Typography>
                    <Chip
                      label={getActionText(log.action)}
                      color={getActionColor(log.action)}
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Box>
                  <Divider />
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" color="textSecondary">
                        الشاشة:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {getScreenText(log.screen)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{
                          fontSize: isMobile ? '0.75rem' : '0.875rem',
                          direction: 'ltr',
                          display: 'block',
                          mb: 0.5,
                        }}
                      >
                        {formatArabicDate(log.createdAt)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'primary.main',
                          fontWeight: 'bold',
                          fontSize: isMobile ? '0.65rem' : '0.85rem',
                          direction: 'ltr',
                          display: 'block',
                        }}
                      >
                        {log.createdAtHijri}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      الوصف:
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 2,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      <Typography variant="body2" sx={{ lineHeight: 1.6, textAlign: 'right' }}>
                        {log.description}
                      </Typography>
                    </Paper>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    )}
  </Box>
);
export default LogsCards;