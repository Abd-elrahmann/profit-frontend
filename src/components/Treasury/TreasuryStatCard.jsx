import React from 'react';
import { Box, Card, CardContent, Typography, Chip } from '@mui/material';
export default function TreasuryStatCard({
  icon: Icon,
  iconColor,
  value,
  label,
  chipLabel,
  chipColor = 'primary',
  chipVariant = 'outlined',
  chipSx,
  isSmallScreen,
  children,
}) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
        height: '100%',
        bgcolor: 'background.paper',
      }}
    >
      <CardContent sx={{ p: isSmallScreen ? 2 : 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ p: 1, borderRadius: 2, mr: 2 }}>
            <Icon sx={{ color: iconColor, fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant={isSmallScreen ? 'h5' : 'h4'} fontWeight="bold" color={iconColor}>
              {typeof value === 'number' ? value.toLocaleString('en-US') : value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          </Box>
        </Box>
        {children}
        <Chip
          label={chipLabel}
          size="small"
          color={chipColor}
          variant={chipVariant}
          sx={{ mt: children ? 2 : 0, ...chipSx }}
        />
      </CardContent>
    </Card>
  );
}