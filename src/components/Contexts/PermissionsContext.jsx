import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import Api from "../../config/Api";

const defaultPermissionValue = {
  permissions: [],
  loading: false,
  fetchPermissions: () => {},
  refreshPermissions: async () => {},
};

const PermissionContext = createContext(defaultPermissionValue);

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const PERMISSIONS_TIMEOUT = 10000; // 10 seconds - prevents infinite loading

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);

      const permissionsRes = await Promise.race([
        Api.get("/api/auth/permissions"),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Permissions fetch timeout')), PERMISSIONS_TIMEOUT)
        ),
      ]);

      if (!permissionsRes.data || permissionsRes.data.length === 0) {
        console.log('No permissions found - user may have no permissions assigned');
        setPermissions([]);
        return [];
      }

      setPermissions(permissionsRes.data);
      return permissionsRes.data;

    } catch (err) {
      const status = err?.response?.status;
      
      // إذا 401 أو 403 → الجلسة منتهية (authFailed سيتم إطلاقه من Api.js)
      if (status === 401 || status === 403) {
        console.log('Session expired during permission fetch');
        setPermissions([]);
      } 
      // أخطاء شبكة أو سيرفر → نحتفظ بالـ permissions القديمة إن وجدت
      else {
        console.warn('Permission fetch failed (network/server error):', err.message);
        // لا نمسح الـ permissions - نبقيها كما هي
      }
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshPermissions = async () => {
    localStorage.removeItem('cached_permissions');
    localStorage.removeItem('cached_permissions_timestamp');








    await fetchPermissions();
  };

  useEffect(() => {
    // عند انتهاء الجلسة الفعلية (authFailed من Api.js): نمسح الصلاحيات فقط
    // AuthContext هو المسؤول عن تسجيل الخروج
    const handleAuthFailed = () => {
      console.log('PermissionContext: Auth failed - clearing permissions');
      setPermissions([]);
      setLoading(false);
    };

    // عند تحديث التوكن بنجاح: نجلب الصلاحيات من جديد
    const handleTokenRefreshed = () => {
      console.log('PermissionContext: Token refreshed - fetching permissions');
      fetchPermissions();
    };

    window.addEventListener('authFailed', handleAuthFailed);
    window.addEventListener('tokenRefreshed', handleTokenRefreshed);

    return () => {
      window.removeEventListener('authFailed', handleAuthFailed);
      window.removeEventListener('tokenRefreshed', handleTokenRefreshed);
    };
  }, [fetchPermissions]);

  return (
    <PermissionContext.Provider value={{ permissions, loading, fetchPermissions, refreshPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePermissions = () => useContext(PermissionContext);