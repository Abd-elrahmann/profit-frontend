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

      const modulesRes = await Promise.race([
        Api.get("/api/auth/modules"),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Modules fetch timeout')), PERMISSIONS_TIMEOUT)
        ),
      ]);

      if (!modulesRes.data || modulesRes.data.length === 0) {
        console.log('No modules found - user may have no permissions assigned');
        setPermissions([]);
        return;
      }

      const permissionPromises = modulesRes.data.map(module =>
        Promise.race([
          Api.get(`/api/auth/permissions/${module}`).then(res => ({
            module,
            permissions: res.data
          })),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error(`Permission fetch timeout for ${module}`)), PERMISSIONS_TIMEOUT)
          ),
        ]).catch(err => {
          console.warn(`Failed to fetch permissions for module ${module}:`, err.message);
          return { module, permissions: [] };
        })
      );

      const permissionResults = await Promise.all(permissionPromises);

      const allPermissions = [];

      permissionResults.forEach(({ module, permissions: perms }) => {
        if (!perms || perms.length === 0) return;
        
        perms.forEach((perm) => {
          const cleanName = perm.replace("can", "");

          let moduleKey = module;
          switch (module) {
            case "messages-templates":
              moduleKey = "messagesTemplates";
              break;
            case "journal-entries":
              moduleKey = "journalEntries";
              break;
            case "contract-templates":
              moduleKey = "contractTemplates";
              break;
            default:
              moduleKey = module;
          }

          allPermissions.push(`${moduleKey}_${cleanName}`);
        });
      });

      setPermissions(allPermissions);

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