import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Breadcrumbs, Link, Typography, Paper, CircularProgress } from '@mui/material';
import { NavigateNext, Home, People, CloudUpload } from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import EditKafeelDocumentsForm from '../../components/forms/EditKafeelDocumentsForm';
import { Helmet } from 'react-helmet-async';
import { getClientDetails } from '../../components/clients';

const EditKafeelDocumentsPage = () => {
  const navigate = useNavigate();
  const { clientId, kafeelId } = useParams();

  const { data: clientDetails, isLoading } = useQuery({
    queryKey: ['client-details', clientId],
    queryFn: () => getClientDetails(clientId),
    enabled: !!clientId,
  });

  const kafeel = React.useMemo(() => {
    if (!clientDetails) return null;
    if (clientDetails.kafeels?.length) {
      return clientDetails.kafeels.find((k) => String(k.id) === String(kafeelId));
    }
    if (clientDetails.kafeel && String(clientDetails.kafeel.id) === String(kafeelId)) {
      return clientDetails.kafeel;
    }
    return null;
  }, [clientDetails, kafeelId]);

  useEffect(() => {
    if (!clientId || !kafeelId) {
      navigate('/clients');
    } else if (!isLoading && !kafeel) {
      navigate('/clients');
    }
  }, [clientId, kafeelId, isLoading, kafeel, navigate]);

  const handleSuccess = () => navigate('/clients');
  const handleCancel = () => navigate('/clients');

  if (!clientId || !kafeelId) {
    return null;
  }

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!kafeel) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }} dir="rtl">
      <Helmet>
        <title>تعديل مرفقات الكفيل - النظام المالي</title>
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
          تعديل مرفقات الكفيل - {kafeel.name}
        </Typography>
      </Breadcrumbs>

      <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, boxShadow: 1 }}>
        <EditKafeelDocumentsForm
          kafeelId={kafeelId}
          kafeel={kafeel}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </Paper>
    </Box>
  );
};

export default EditKafeelDocumentsPage;
