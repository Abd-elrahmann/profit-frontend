import React from 'react';
import { Card, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * Reusable chart wrapper card for dashboard sections
 * @param {string} variant - 'default' | 'glass' | 'simple'
 * @param {string} color - MUI palette color for gradient (when variant='default')
 */
const ChartCard = React.memo(({ title, children, variant = 'default', color = 'primary', sx = {} }) => {
  const theme = useTheme();
  const isGlass = variant === 'glass';
  const isSimple = variant === 'simple';

  const cardStyles = isGlass
    ? {
        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)'}`,
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
      }
    : isSimple
    ? {
        boxShadow: '0 4px 20px 0 rgba(0,0,0,0.08)',
        border: `1px solid ${theme.palette.divider}`,
      }
    : {
        background: `linear-gradient(135deg, ${theme.palette[color].main}08 0%, ${theme.palette[color].dark}05 100%)`,
        border: `1px solid ${theme.palette[color].main}20`,
        boxShadow: `
          0 2px 8px ${theme.palette[color].main}10,
          0 8px 24px rgba(0,0,0,0.08),
          inset 0 1px 0 rgba(255,255,255,0.5)
        `,
      };

  return (
    <Card
      sx={{
        p: { xs: 1.5, sm: 2, md: 3 },
        height: { xs: 300, sm: 350, md: 400 },
        borderRadius: variant === 'simple' ? 3 : 4,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        ...cardStyles,
        ...sx,
        '&:hover': {
          boxShadow: isGlass
            ? '0 4px 20px 0 rgba(0,0,0,0.12)'
            : `
              0 4px 16px ${theme.palette.primary.main}15,
              0 16px 48px rgba(0,0,0,0.1),
              inset 0 1px 0 rgba(255,255,255,0.6)
            `,
        },
      }}
    >
      {title && (
        <Typography
          variant="h6"
          fontWeight="bold"
          sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'center', fontSize: { xs: '1rem', sm: '1.25rem' } }}
        >
          {title}
        </Typography>
      )}
      {children}
    </Card>
  );
});

ChartCard.displayName = 'ChartCard';

export default ChartCard;
