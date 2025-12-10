import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  History,
  Person,
  AccountBalance,
  Receipt,
  Business,
  Payment,
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { getLastActions } from '../../pages/dashboard/dashboardApi';
import { useTheme } from '@mui/material';
import moment from 'moment';

const LastActions = () => {
  const theme = useTheme();

  const { data: actions, isLoading } = useQuery({
    queryKey: ['last-actions'],
    queryFn: getLastActions,
  });

  // Get icon based on screen
  const getScreenIcon = (screen) => {
    switch (screen) {
      case 'Loans':
        return <AccountBalance sx={{ color: theme.palette.primary.main }} />;
      case 'Repayments':
        return <Payment sx={{ color: theme.palette.success.main }} />;
      case 'Partners':
        return <Business sx={{ color: theme.palette.info.main }} />;
      case 'Journals':
        return <Receipt sx={{ color: theme.palette.warning.main }} />;
      case 'Distribution':
        return <AccountBalance sx={{ color: theme.palette.secondary.main }} />;
      default:
        return <History sx={{ color: theme.palette.grey[500] }} />;
    }
  };

  // Get screen display name in Arabic
  const getScreenDisplayName = (screen) => {
    switch (screen) {
      case 'Loans':
        return 'السلف';
      case 'Repayments':
        return 'الدفعات';
      case 'Partners':
        return 'الشركاء';
      case 'Journals':
        return 'القيود اليومية';
      case 'Distribution':
        return 'التوزيعات';
      default:
        return screen;
    }
  };

  // Format relative time
  const formatRelativeTime = (date) => {
    const now = moment();
    const actionTime = moment(date);
    const diffMinutes = now.diff(actionTime, 'minutes');
    const diffHours = now.diff(actionTime, 'hours');
    const diffDays = now.diff(actionTime, 'days');

    if (diffMinutes < 1) return 'الآن';
    if (diffMinutes < 60) return `منذ ${diffMinutes} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return actionTime.format('DD/MM/YYYY');
  };


  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Card sx={{ width: '100%', mx: 'auto', boxShadow: 3 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <History sx={{ mr: 2, color: theme.palette.primary.main }} />
          <Typography variant="h5" component="h2" fontWeight="bold">
            آخر الأنشطة
          </Typography>
        </Box>

        {actions && actions.length > 0 ? (
          <List sx={{ width: '100%' }}>
            {actions.map((action, index) => (
              <React.Fragment key={action.id}>
                <ListItem
                  sx={{
                    px: 0,
                    py: 2,
                    '&:hover': { bgcolor: theme.palette.action.hover }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.grey[100] }}>
                      {getScreenIcon(action.screen)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {action.user?.name || 'مستخدم غير معروف'}
                        </Typography>
                        <Chip
                          label={getScreenDisplayName(action.screen)}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {action.description || action.action || 'نشاط غير محدد'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatRelativeTime(action.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < actions.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <History sx={{ fontSize: 64, color: theme.palette.grey[300], mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              لا توجد أنشطة حديثة
            </Typography>
            <Typography variant="body2" color="text.secondary">
              لم يتم تسجيل أي أنشطة في الوقت الحالي
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default LastActions;
