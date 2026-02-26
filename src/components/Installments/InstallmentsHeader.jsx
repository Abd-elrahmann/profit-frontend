import React from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Close as CloseIcon, KeyboardArrowRight as ArrowRightIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function InstallmentsHeader({
  clientName,
  reviewStepsVisible,
  onToggleReviewSteps,
  isSettlementCompleted,
  isSmallScreen = false,
}) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: isSmallScreen ? 'column' : 'row',
        justifyContent: isSmallScreen ? 'center' : 'space-between',
        alignItems: isSmallScreen ? 'center' : 'center',
        mb: 3,
        gap: isSmallScreen ? 2 : 0,
      }}
    >
      {isSmallScreen && (
        <Typography
          variant="h6"
          fontWeight="bold"
          color="primary.main"
          sx={{
            textAlign: 'center',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            px: 1,
          }}
        >
          دفعات السلفة - {clientName}
        </Typography>
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: isSmallScreen ? 1 : 2,
          width: isSmallScreen ? '100%' : 'auto',
          maxWidth: isSmallScreen ? 320 : 'none',
          justifyContent: isSmallScreen ? 'center' : 'flex-start',
        }}
      >
        <Button
          variant="outlined"
          size={isSmallScreen ? 'small' : 'medium'}
          startIcon={<ArrowBackIcon sx={{ marginLeft: '8px' }} />}
          onClick={() => navigate('/loans')}
          sx={{
            color: 'primary.main',
            '&:hover': { color: 'primary.dark' },
            flex: isSmallScreen ? 1 : 'none',
          }}
        >
          {isSmallScreen ? 'رجوع' : 'رجوع لجدول السلف'}
        </Button>
        {!isSmallScreen && (
          <Typography variant="h6" fontWeight="bold">
            دفعات السلفة - {clientName}
          </Typography>
        )}
        {!isSettlementCompleted && (
          <IconButton
            onClick={onToggleReviewSteps}
            sx={{
              color: 'primary.main',
              '&:hover': {
                bgcolor: 'action.selected',
                color: 'primary.dark',
              },
            }}
            title={reviewStepsVisible ? 'إخفاء خطوات المراجعة' : 'إظهار خطوات المراجعة'}
          >
            {reviewStepsVisible ? <CloseIcon /> : <ArrowRightIcon />}
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
