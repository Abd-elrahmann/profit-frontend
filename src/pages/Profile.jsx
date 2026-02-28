import React, { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Helmet } from 'react-helmet-async';
import { notifySuccess, notifyError } from '../utilities/toastify';
import Api from '../config/Api';
import { useAuth } from '../components/Contexts/AuthContext';
import { useTheme } from '../theme/ThemeContext';
import {
  ProfileHeader,
  ProfilePersonalInfoCard,
  ProfileSecurityCard,
  ProfilePreferencesCard,
  ProfileEditModal,
  ProfilePasswordModal,
} from '../components/Profile';
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
  const handleProfileImageDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profileImage', acceptedFiles[0]);
      const response = await Api.patch('/api/auth/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setUserData((prev) => ({ ...prev, ...response.data?.user }));
      updateUser(response.data?.user);
      window.dispatchEvent(new Event('profileUpdated'));
      notifySuccess('تم تحديث صورة الملف الشخصي بنجاح');
      fetchProfile();
    } catch (error) {
      notifyError(error.response?.data?.message || 'حدث خطأ أثناء رفع الصورة');
    } finally {
      setUploading(false);
    }
  }, [updateUser, fetchProfile]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    onDrop: handleProfileImageDrop,
    multiple: false,
    disabled: uploading,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f6f8f6] dark:bg-[#141e16] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8f6] dark:bg-[#141e16] p-4 md:p-6">
      <Helmet>
        <title>الملف الشخصي</title>
      </Helmet>
      <div className="max-w-4xl mx-auto space-y-6">
        <ProfileHeader
          userData={userData}
          userRole={userRole}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          uploading={uploading}
          onEditClick={() => setEditModalOpen(true)}
        />
        <ProfilePersonalInfoCard userData={userData} userRole={userRole} username={username} />
        <ProfileSecurityCard onPasswordClick={() => setPasswordModalOpen(true)} />
        <ProfilePreferencesCard isDarkMode={isDarkMode} onToggleTheme={toggleTheme} />
      </div>
      <ProfileEditModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        editForm={editForm}
        onFormChange={setEditForm}
        onSubmit={handleEditSubmit}
        updating={updating}
      />
      <ProfilePasswordModal
        open={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
        passwordForm={passwordForm}
        onFormChange={setPasswordForm}
        onSubmit={handlePasswordSubmit}
        updating={updating}
      />
    </div>
  );
};

export default Profile;