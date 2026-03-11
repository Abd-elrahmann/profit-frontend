import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import Api from "../../config/Api";

const FILE_MODULES_MAP = {
  clients: 'files-clients',
  partners: 'files-partners',
  loans: 'files-loans',
  repayments: 'files-repayments',
  expenses: 'files-expenses',
  'partners-withdraw': 'files-partners-withdraw',
  zakat: 'files-zakat',
};

const defaultPermissionValue = {
  permissions: [],
  loading: false,
  fetchPermissions: () => {},
  refreshPermissions: async () => {},
  canViewFiles: () => false,
};
const PermissionContext = createContext(defaultPermissionValue);
export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const PERMISSIONS_TIMEOUT = 10000;
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
        setPermissions([]);
        return [];
      }
      setPermissions(permissionsRes.data);
      return permissionsRes.data;
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401 || status === 403) {
        setPermissions([]);
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

  const canViewFiles = useCallback((module) => {
    const fileModule = FILE_MODULES_MAP[module];
    if (!fileModule) return true;
    const permKey = `${fileModule}_View`;
    return permissions.includes(permKey);
  }, [permissions]);
  useEffect(() => {
    const handleAuthFailed = () => {
      setPermissions([]);
      setLoading(false);
    };
    const handleTokenRefreshed = () => {
      fetchPermissions();
    };
    const handleUserLoggedIn = () => {
      fetchPermissions();
    };
    window.addEventListener('authFailed', handleAuthFailed);
    window.addEventListener('tokenRefreshed', handleTokenRefreshed);
    window.addEventListener('userLoggedIn', handleUserLoggedIn);
    return () => {
      window.removeEventListener('authFailed', handleAuthFailed);
      window.removeEventListener('tokenRefreshed', handleTokenRefreshed);
      window.removeEventListener('userLoggedIn', handleUserLoggedIn);
    };
  }, [fetchPermissions]);
  return (
    <PermissionContext.Provider value={{ permissions, loading, fetchPermissions, refreshPermissions, canViewFiles }}>
      {children}
    </PermissionContext.Provider>
  );
};
// eslint-disable-next-line react-refresh/only-export-components
export const usePermissions = () => useContext(PermissionContext);