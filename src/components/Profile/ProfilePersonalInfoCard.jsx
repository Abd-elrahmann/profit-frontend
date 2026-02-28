import React from 'react';
import { Person as PersonIcon } from '@mui/icons-material';
import { formatProfileDate } from './profileUtils';
const ProfilePersonalInfoCard = ({ userData, userRole, username }) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <PersonIcon className="text-primary" sx={{ fontSize: 24 }} />
        <h3 className="font-bold text-lg">البيانات الشخصية</h3>
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">الاسم الكامل</label>
          <p className="text-slate-800 dark:text-slate-200 font-medium">{userData?.name}</p>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">اسم المستخدم</label>
          <p className="text-slate-800 dark:text-slate-200 font-medium">{username}</p>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">البريد الإلكتروني</label>
          <p className="text-slate-800 dark:text-slate-200 font-medium">{userData?.email}</p>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">رقم الجوال</label>
          <p className="text-slate-800 dark:text-slate-200 font-medium">{userData?.phone || 'غير محدد'}</p>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">تاريخ الانضمام</label>
          <p className="text-slate-800 dark:text-slate-200 font-medium">{formatProfileDate(userData?.createdAt)}</p>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1">الدور</label>
          <p className="text-slate-800 dark:text-slate-200 font-medium">{userRole}</p>
        </div>
      </div>
    </div>
  );
};
export default ProfilePersonalInfoCard;