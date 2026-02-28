import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
const cardStyles = (theme, color) => ({
  height: { xs: '180px', sm: '100%', md: '200px' },
  width: { xs: '250px', sm: '100%', md: '250px' },
  borderRadius: 4,
  background: `linear-gradient(135deg, ${theme.palette[color].main}15 0%, ${theme.palette[color].dark}08 100%)`,
  border: `1px solid ${theme.palette[color].main}20`,
  boxShadow: `
    0 2px 8px ${theme.palette[color].main}10,
    0 8px 24px rgba(0,0,0,0.08),
    inset 0 1px 0 rgba(255,255,255,0.5)
  `,
  position: 'relative',
  overflow: 'hidden',
  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: `linear-gradient(90deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`,
  },
  '&:hover': {
    transform: 'translateY(-8px) scale(1.02)',
    boxShadow: `
      0 4px 16px ${theme.palette[color].main}20,
      0 16px 48px rgba(0,0,0,0.12),
      inset 0 1px 0 rgba(255,255,255,0.6)
    `,
    borderColor: `${theme.palette[color].main}40`,
  },
});
const iconBoxStyles = (theme, color) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 64,
  height: 64,
  borderRadius: '16px',
  background: `linear-gradient(135deg, ${theme.palette[color].main}20 0%, ${theme.palette[color].dark}10 100%)`,
  border: `2px solid ${theme.palette[color].main}30`,
  mb: 2.5,
  boxShadow: `0 4px 12px ${theme.palette[color].main}20`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: `0 6px 20px ${theme.palette[color].main}30`,
  },
});
const StatCard = React.memo(({ icon, title, value, color = 'primary', subtitle, sx = {} }) => {
  const theme = useTheme();
  return (
    <Card sx={{ ...cardStyles(theme, color), ...sx }}>
      <CardContent sx={{ p: { xs: 2.5, sm: 3 }, textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <Box sx={iconBoxStyles(theme, color)}>
          {React.cloneElement(icon, { sx: { fontSize: '2rem', color: theme.palette[color].main } })}
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1.5, fontSize: { xs: '0.75rem', sm: '0.875rem' }, fontWeight: 600, letterSpacing: '0.5px' }}
        >
          {title}
        </Typography>
        <Typography
          variant="h4"
          fontWeight="800"
          sx={{
            mb: subtitle ? 2.5 : 0,
            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
            background: `linear-gradient(135deg, ${theme.palette[color].main}, ${theme.palette[color].dark})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          {value}
        </Typography>
        {subtitle && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              p: 1.5,
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette[subtitle.color || 'success'].main}15 0%, ${theme.palette[subtitle.color || 'success'].dark}08 100%)`,
              border: `1px solid ${theme.palette[subtitle.color || 'success'].main}30`,
              boxShadow: `0 2px 8px ${theme.palette[subtitle.color || 'success'].main}10`,
            }}
          >
            <Typography variant="body2" color={`${subtitle.color || 'success'}.main`} sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, fontWeight: 600 }}>
              {subtitle.label}
            </Typography>
            <Typography variant="h6" fontWeight="700" color={`${subtitle.color || 'success'}.main`} sx={{ fontSize: { xs: '1rem', sm: '1.125rem' } }}>
              {subtitle.value}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
});
StatCard.displayName = 'StatCard';
export default StatCard;