import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Typography, Paper } from '@mui/material';
import { NavigateNext, Home, People, PersonAdd } from '@mui/icons-material';
import AddClientForm from '../../components/forms/AddClientForm';
import { Helmet } from 'react-helmet-async';

const AddClientPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const handleSuccess = () => {
    if (returnTo === 'loans') {
      navigate('/loans');
    } else {
      navigate('/clients');
    }
  };

  const handleCancel = () => {
    if (returnTo === 'loans') {
      navigate('/loans');
    } else {
      navigate('/clients');
    }
  };

  return (
    <Box sx={{ p: 3 }} dir="rtl">
      <Helmet>
        <title>إضافة عميل جديد - النظام المالي</title>
      </Helmet>

      {/* Breadcrumb */}
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        sx={{ mb: 3 }}
        aria-label="breadcrumb"
      >
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          <Home sx={{ fontSize: 18 }} />
          الرئيسية
        </Link>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', cursor: 'pointer' }}
          onClick={() => navigate('/clients')}
        >
          <People sx={{ fontSize: 18 }} />
          العملاء
        </Link>
        <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} color="text.primary">
          <PersonAdd sx={{ fontSize: 18 }} />
          إضافة عميل
        </Typography>
      </Breadcrumbs>

      <Paper
        sx={{
          p: { xs: 2, md: 4 },
          borderRadius: 2,
          boxShadow: 1,
        }}
      >
        <AddClientForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </Paper>
    </Box>
  );
};

export default AddClientPage;
