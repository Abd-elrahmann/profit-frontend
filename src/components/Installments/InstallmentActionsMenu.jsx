import React from 'react';
import { Menu, MenuItem } from '@mui/material';
import {
  Check as ApproveIcon,
  Close as RejectIcon,
  Payment as PartialPaymentIcon,
  Schedule as PostponeIcon,
  Description as DocumentIcon,
} from '@mui/icons-material';

export default function InstallmentActionsMenu({
  anchorEl,
  onClose,
  selectedInstallment,
  onApprove,
  onReject,
  onPartialPayment,
  onPostpone,
  onDocuments,
  shouldDisableActions,
  permissions,
}) {
  const open = Boolean(anchorEl);
  const canApprove =
    selectedInstallment?.status !== 'PAID' &&
    selectedInstallment?.status !== 'PARTIAL_PAID' &&
    !shouldDisableActions() &&
    permissions.includes('repayments_Post');
  const canReject =
    !shouldDisableActions() && permissions.includes('repayments_Post');
  const canPartialPayment =
    selectedInstallment?.status !== 'PAID' &&
    !shouldDisableActions() &&
    permissions.includes('repayments_Add');
  const canPostpone =
    selectedInstallment?.status !== 'PAID' &&
    !shouldDisableActions() &&
    permissions.includes('repayments_Add');
  const showDocuments = selectedInstallment?.status === 'PAID';

  return (
    <Menu anchorEl={anchorEl} open={open} onClose={onClose}>
      {canApprove && (
        <MenuItem onClick={() => onApprove(selectedInstallment)} sx={{ color: 'green' }}>
          <ApproveIcon sx={{ mr: 1, color: 'green', marginLeft: '10px' }} />
          موافقة
        </MenuItem>
      )}
      {canReject && (
        <MenuItem onClick={() => onReject(selectedInstallment)} sx={{ color: 'red' }}>
          <RejectIcon sx={{ mr: 1, color: 'red', marginLeft: '10px' }} />
          رفض
        </MenuItem>
      )}
      {canPartialPayment && (
        <MenuItem onClick={onPartialPayment} sx={{ color: 'blue' }}>
          <PartialPaymentIcon sx={{ mr: 1, color: 'blue', marginLeft: '10px' }} />
          إضافة دفع جزئي
        </MenuItem>
      )}
      {canPostpone && (
        <MenuItem onClick={onPostpone} sx={{ color: 'orange' }}>
          <PostponeIcon sx={{ mr: 1, color: 'orange', marginLeft: '10px' }} />
          تأجيل
        </MenuItem>
      )}
      {showDocuments && (
        <MenuItem onClick={onDocuments}>
          <DocumentIcon sx={{ mr: 1, marginLeft: '10px' }} />
          عرض المستندات
        </MenuItem>
      )}
    </Menu>
  );
}
