import React from 'react';
import { Box, Typography, Button, IconButton } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Close as CloseIcon, KeyboardArrowRight as ArrowRightIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function InstallmentsHeader({
  clientName,
  reviewStepsVisible,
  onToggleReviewSteps,
  isSettlementCompleted,
}) {
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon sx={{ marginLeft: '8px' }} />}
          onClick={() => navigate('/loans')}
          sx={{
            color: 'primary.main',
            '&:hover': { color: 'primary.dark' },
          }}
        >
          رجوع لجدول السلف
        </Button>
        <Typography variant="h6" fontWeight="bold">
          دفعات السلفة - {clientName}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
