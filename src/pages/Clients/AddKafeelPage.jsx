import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Typography, Paper } from '@mui/material';
import { NavigateNext, Home, People, PersonAdd, AccountBalance } from '@mui/icons-material';
import AddKafeelForm from '../../components/forms/AddKafeelForm';
import { Helmet } from 'react-helmet-async';
const AddKafeelPage = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const returnTab = searchParams.get('tab') ?? '2';
  const rawClientName = searchParams.get('clientName');
  const clientNameForTitle = rawClientName ? decodeURIComponent(rawClientName) : '';
  const returnPath = returnTo === 'loans' ? '/loans' : (clientId ? `/clients?clientId=${clientId}&tab=${returnTab}` : '/clients');
  const handleSuccess = () => {
    navigate(returnPath);
  };
  const handleCancel = () => {
    navigate(returnPath);
  };
  if (!clientId) {
    navigate(returnTo === 'loans' ? '/loans' : '/clients', { replace: true });
    return null;
  }
  return (
    <Box sx={{ p: 3 }} dir="rtl">
      <Helmet>
        <title>
          {clientNameForTitle
            ? `إضافة كفيل للعميل ${clientNameForTitle} - النظام المالي`
            : 'إضافة كفيل جديد - النظام المالي'}
        </title>
      </Helmet>
      <Breadcrumbs separator={<NavigateNext fontSize="small" />} sx={{ mb: 3 }} aria-label="breadcrumb">
        <Link underline="hover" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
          <Home sx={{ fontSize: 18 }} />
          الرئيسية
        </Link>
        <Link underline="hover" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', cursor: 'pointer' }} onClick={() => navigate(returnTo === 'loans' ? '/loans' : '/clients')}>
          {returnTo === 'loans' ? <AccountBalance sx={{ fontSize: 18 }} /> : <People sx={{ fontSize: 18 }} />}
          {returnTo === 'loans' ? 'السلف' : 'العملاء'}
        </Link>
        <Typography sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }} color="text.primary">
          <PersonAdd sx={{ fontSize: 18 }} />
          {clientNameForTitle ? `إضافة كفيل للعميل ${clientNameForTitle}` : 'إضافة كفيل جديد'}
        </Typography>
      </Breadcrumbs>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, boxShadow: 1 }}>
        <AddKafeelForm clientId={clientId} clientName={clientNameForTitle} onSuccess={handleSuccess} onCancel={handleCancel} />
      </Paper>
    </Box>
  );
};
export default AddKafeelPage;
