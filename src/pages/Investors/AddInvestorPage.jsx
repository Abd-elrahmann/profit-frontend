import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Typography, Paper } from '@mui/material';
import { NavigateNext, Home, AccountBalanceWallet, PersonAdd } from '@mui/icons-material';
import AddInvestorForm from '../../components/forms/AddInvestorForm';
import { Helmet } from 'react-helmet-async';
const AddInvestorPage = () => {
  const navigate = useNavigate();
  const handleSuccess = () => {
    navigate('/investors');
  };
  const handleCancel = () => {
    navigate('/investors');
  };
  return (
    <Box sx={{ p: 3 }} dir="rtl">
      <Helmet>
        <title>إضافة مستثمر جديد - النظام المالي</title>
      </Helmet>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }} aria-label="breadcrumb">
        <Link underline="hover" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <Home sx={{ fontSize: 18 }} />
          الرئيسية
        </Link>
        <Link underline="hover" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', cursor: 'pointer' }} onClick={() => navigate('/investors')}>
          <AccountBalanceWallet sx={{ fontSize: 18 }} />
          المستثمرين
        </Link>
        <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} color="text.primary">
          <PersonAdd sx={{ fontSize: 18 }} />
          إضافة مستثمر
        </Typography>
      </Breadcrumbs>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, boxShadow: 1 }}>
        <AddInvestorForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </Paper>
    </Box>
  );
};
export default AddInvestorPage;