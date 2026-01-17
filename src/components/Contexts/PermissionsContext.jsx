import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import Api from "../../config/Api";

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPermissions = useCallback(async () => {
    try {
      setLoading(true);

      const modulesRes = await Api.get("/api/auth/modules");

      const permissionPromises = modulesRes.data.map(module =>
        Api.get(`/api/auth/permissions/${module}`).then(res => ({
          module,
          permissions: res.data
        }))
      );

      const permissionResults = await Promise.all(permissionPromises);

      const allPermissions = [];

      permissionResults.forEach(({ module, permissions: perms }) => {
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
      console.error("Error fetching permissions:", err);
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
    const handleAuthFailed = () => {
      setPermissions([]);
      setLoading(false);
    };

    const handleTokenRefreshed = () => {
      fetchPermissions();
    };

    const handleLogin = () => {
      fetchPermissions();
    };

    window.addEventListener('authFailed', handleAuthFailed);
    window.addEventListener('tokenRefreshed', handleTokenRefreshed);
    window.addEventListener('userLoggedIn', handleLogin);

    return () => {
      window.removeEventListener('authFailed', handleAuthFailed);
      window.removeEventListener('tokenRefreshed', handleTokenRefreshed);
      window.removeEventListener('userLoggedIn', handleLogin);
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