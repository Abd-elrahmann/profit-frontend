import React, { useState, useEffect, useCallback } from 'react';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Security as SecurityIcon,
  Lock as LockIcon,
  Settings as SettingsIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  PhotoCamera as PhotoCameraIcon,
  CalendarMonth as CalendarMonthIcon,
} from '@mui/icons-material';
import { useDropzone } from 'react-dropzone';
import { Helmet } from 'react-helmet-async';
import { notifySuccess, notifyError } from '../utilities/toastify';
import Api from '../config/Api';
import { useAuth } from '../components/Contexts/AuthContext';
import { useTheme } from '../theme/ThemeContext';

const Profile = () => {
  const { updateUser } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await Api.get('/api/auth/profile');
      setUserData(response.data);
      updateUser(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      notifyError('حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [updateUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (userData) {
      setEditForm({ name: userData.name || '', phone: userData.phone || '' });
    }
  }, [userData]);

  const formatDate = (dateString) => {
    if (!dateString) return 'غير محدد';
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const userRole = userData?.role?.name || (userData?.roleId === 1 ? 'مدير النظام' : 'مستخدم');
  const username = userData?.email?.split('@')[0] || 'غير محدد';

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setUpdating(true);
      const response = await Api.patch('/api/auth/update-profile', editForm);
      setUserData((prev) => ({ ...prev, ...response.data.user }));
      updateUser(response.data.user);
      window.dispatchEvent(new Event('profileUpdated'));
      notifySuccess('تم تحديث الملف الشخصي بنجاح');
      setEditModalOpen(false);
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء التحديث');
    } finally {
      setUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      notifyError('كلمة المرور الجديدة غير متطابقة');
      return;
    }
    try {
      setUpdating(true);
      await Api.patch('/api/auth/update-password', passwordForm);
      notifySuccess('تم تغيير كلمة المرور بنجاح');
      setPasswordModalOpen(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    } finally {
      setUpdating(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];
      const formData = new FormData();
      formData.append('profileImage', file);
      try {
        setUploading(true);
        const response = await Api.patch('/api/auth/upload-profile-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setUserData((prev) => ({ ...prev, profileImage: response.data.profileImage }));
        updateUser({ profileImage: response.data.profileImage });
        window.dispatchEvent(new Event('profileUpdated'));
        notifySuccess('تم تحديث الصورة الشخصية بنجاح');
      } catch (error) {
        notifyError(error.response?.data?.message || 'حدث خطأ أثناء رفع الصورة');
      } finally {
        setUploading(false);
      }
    },
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] w-full">
        <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <Helmet>
        <title>الملف الشخصي - نظام إدارة السلف والقروض</title>
        <meta name="description" content="الملف الشخصي للمستخدم" />
      </Helmet>

      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative" {...getRootProps()}>
              <input {...getInputProps()} />
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 p-1 bg-slate-100 dark:bg-slate-800 cursor-pointer">
                {userData?.profileImage ? (
                  <img
                    src={userData.profileImage}
                    alt={userData?.name}
                    className="w-full h-full object-cover"
                  />
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
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {userData?.name || 'مستخدم'}
                </h2>
                <span
                  className={`flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full ${
                    userData?.isActive
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      userData?.isActive ? 'bg-green-500' : 'bg-slate-500'
                    }`}
                  />
                  {userData?.isActive ? 'نشط' : 'غير نشط'}
                </span>
              </div>
              <p className="text-slate-500 mt-1">{userRole}</p>
              <div className="flex items-center justify-center md:justify-start gap-4 mt-3 text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <CalendarMonthIcon sx={{ fontSize: 18 }} />
                  انضم منذ {formatDate(userData?.createdAt)}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setEditModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md shadow-primary/20"
          >
            <EditIcon sx={{ fontSize: 20 }} />
            تعديل الملف الشخصي
          </button>
        </div>

        {/* Personal Info Card */}
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
              <p className="text-slate-800 dark:text-slate-200 font-medium">
                {userData?.phone || 'غير محدد'}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">تاريخ الانضمام</label>
              <p className="text-slate-800 dark:text-slate-200 font-medium">
                {formatDate(userData?.createdAt)}
              </p>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-1">الدور</label>
              <p className="text-slate-800 dark:text-slate-200 font-medium">{userRole}</p>
            </div>
          </div>
        </div>

        {/* Security & General Preferences */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Security */}
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
                <button
                  onClick={() => setPasswordModalOpen(true)}
                  className="text-primary hover:underline text-sm font-bold"
                >
                  تحديث الآن
                </button>
              </div>
            </div>
          </div>

          {/* General Preferences */}
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <SettingsIcon className="text-primary" sx={{ fontSize: 24 }} />
              <h3 className="font-bold text-lg">التفضيلات العامة</h3>
            </div>
            <div className="p-6 space-y-8">
              <div>
                <label className="font-bold text-sm block mb-4">وضع العرض (الثيم)</label>
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                  <button
                    type="button"
                    onClick={() => isDarkMode && toggleTheme()}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
                      !isDarkMode
                        ? 'bg-white dark:bg-slate-700 shadow-sm text-primary font-bold'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    <LightModeIcon sx={{ fontSize: 20 }} />
                    فاتح
                  </button>
                  <button
                    type="button"
                    onClick={() => !isDarkMode && toggleTheme()}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
                      isDarkMode
                        ? 'bg-white dark:bg-slate-700 shadow-sm text-primary font-bold'
                        : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'
                    }`}
                  >
                    <DarkModeIcon sx={{ fontSize: 20 }} />
                    داكن
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  الوضع الحالي هو {isDarkMode ? 'الداكن' : 'الفاتح'}، سيتم تطبيق الوضع تلقائياً بناءً على
                  اختيارك.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-6">تعديل الملف الشخصي</h3>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  الاسم الكامل
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  رقم الجوال
                </label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  dir="ltr"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-70"
                >
                  {updating ? 'جاري الحفظ...' : 'حفظ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-6">تغيير كلمة المرور</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  كلمة المرور الحالية
                </label>
                <input
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({ ...p, oldPassword: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  تأكيد كلمة المرور الجديدة
                </label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  required
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setPasswordModalOpen(false);
                    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                  className="flex-1 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 py-2.5 rounded-lg bg-primary text-white font-bold hover:bg-primary/90 disabled:opacity-70"
                >
                  {updating ? 'جاري التحديث...' : 'تحديث'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
