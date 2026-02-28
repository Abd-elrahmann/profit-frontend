import React from 'react';
import { Security as SecurityIcon, Lock as LockIcon } from '@mui/icons-material';
const ProfileSecurityCard = ({ onPasswordClick }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <SecurityIcon className="text-primary" sx={{ fontSize: 24 }} />
        <h3 className="font-bold text-lg">الأمان والإعدادات</h3>
      </div>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <div className="flex items-center gap-3">
            <LockIcon className="text-slate-400" sx={{ fontSize: 24 }} />
            <div>
              <p className="font-bold text-sm">تغيير كلمة المرور</p>
              <p className="text-xs text-slate-500">تحديث كلمة المرور للحفاظ على أمان حسابك</p>
            </div>
          </div>
          <button onClick={onPasswordClick} className="text-primary hover:underline text-sm font-bold">
            تحديث الآن
          </button>
        </div>
      </div>
    </div>
  );
};
export default ProfileSecurityCard;