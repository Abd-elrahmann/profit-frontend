import React from 'react';
import { Person as PersonIcon, Edit as EditIcon, PhotoCamera as PhotoCameraIcon, CalendarMonth as CalendarMonthIcon } from '@mui/icons-material';
import { formatProfileDate } from './profileUtils';
const ProfileHeader = ({
  userData,
  userRole,
  getRootProps,
  getInputProps,
  uploading,
  onEditClick,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="relative" {...getRootProps()}>
          <input {...getInputProps()} />
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 p-1 bg-slate-100 dark:bg-slate-800 cursor-pointer">
            {userData?.profileImage ? (
              <img src={userData.profileImage} alt={userData?.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <PersonIcon className="w-16 h-16 text-primary" />
              </div>
            )}
          </div>
          <div className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center pointer-events-none">
            {uploading ? (
              <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            ) : (
              <PhotoCameraIcon className="text-sm" sx={{ fontSize: 20 }} />
            )}
          </div>
        </div>
        <div className="text-center md:text-right">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{userData?.name || 'مستخدم'}</h2>
            <span
              className={`flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full ${
                userData?.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${userData?.isActive ? 'bg-green-500' : 'bg-slate-500'}`} />
              {userData?.isActive ? 'نشط' : 'غير نشط'}
            </span>
          </div>
          <p className="text-slate-500 mt-1">{userRole}</p>
          <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm text-slate-400">
            <span className="flex items-center gap-1">
              <CalendarMonthIcon sx={{ fontSize: 18 }} />
              انضم منذ {formatProfileDate(userData?.createdAt)}
            </span>
          </div>
        </div>
      </div>
      <button
        onClick={onEditClick}
        className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md shadow-primary/20"
      >
        <EditIcon sx={{ fontSize: 20 }} />
        تعديل الملف الشخصي
      </button>
    </div>
  );
};
export default ProfileHeader;