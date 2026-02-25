import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Typography, Paper } from '@mui/material';
import { NavigateNext, Home, People, PersonAdd } from '@mui/icons-material';
import AddKafeelForm from '../../components/forms/AddKafeelForm';
import { Helmet } from 'react-helmet-async';

const AddKafeelPage = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();

  const handleSuccess = () => {
    navigate(`/clients`);
  };

  const handleCancel = () => {
    navigate('/clients');
  };

  if (!clientId) {
    navigate('/clients');
    return null;
  }

  return (
    <Box sx={{ p: 3 }} dir="rtl">
      <Helmet>
        <title>إضافة كفيل جديد - النظام المالي</title>
      </Helmet>

      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }} aria-label="breadcrumb">
        <Link underline="hover" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <Home sx={{ fontSize: 18 }} />
          الرئيسية
        </Link>
        <Link underline="hover" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', cursor: 'pointer' }} onClick={() => navigate('/clients')}>
          <People sx={{ fontSize: 18 }} />
          العملاء
        </Link>
        <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} color="text.primary">
          <PersonAdd sx={{ fontSize: 18 }} />
          إضافة كفيل
        </Typography>
      </Breadcrumbs>

      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, boxShadow: 1 }}>
        <AddKafeelForm clientId={clientId} onSuccess={handleSuccess} onCancel={handleCancel} />
      </Paper>
    </Box>
  );
};

export default AddKafeelPage;
