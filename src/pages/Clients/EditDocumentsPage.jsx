import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Typography, Paper, CircularProgress } from '@mui/material';
import { NavigateNext, Home, People, CloudUpload } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import EditDocumentsForm from '../../components/forms/EditDocumentsForm';
import { Helmet } from 'react-helmet-async';
import { getClientDetails } from '../../components/clients';
const EditDocumentsPage = () => {
  const navigate = useNavigate();
  const { clientId } = useParams();
  const { data: clientDetails, isLoading } = useQuery({
    queryKey: ['client-details', clientId],
    queryFn: () => getClientDetails(clientId),
    enabled: !!clientId,
  });
  const handleSuccess = () => navigate('/clients');
  const handleCancel = () => navigate('/clients');
  if (!clientId) {
    navigate('/clients');
    return null;
  }
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }
  const documents = clientDetails?.documents?.[0];
  return (
    <Box sx={{ p: 3 }} dir="rtl">
      <Helmet>
        <title>تعديل مرفقات العميل - النظام المالي</title>
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
          <CloudUpload sx={{ fontSize: 18 }} />
          تعديل مرفقات العميل - {clientDetails?.client?.name}
        </Typography>
      </Breadcrumbs>
      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, boxShadow: 1 }}>
        <EditDocumentsForm
          clientId={clientId}
          clientName={clientDetails?.client?.name}
          documents={documents}
          hasKafeel={false}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </Paper>
    </Box>
  );
};
export default EditDocumentsPage;