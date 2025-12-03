import React, { createContext, useContext, useEffect, useState } from "react";
import Api from "../../config/Api";

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPermissions = async () => {
    try {
      // Check if user is logged in before fetching
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found, skipping permissions fetch');
        setLoading(false);
        return;
      }

      setLoading(true);

      // Check if permissions are cached and not expired (24 hours)
      const cachedPermissions = localStorage.getItem('cached_permissions');
      const cachedTimestamp = localStorage.getItem('cached_permissions_timestamp');
      const now = Date.now();

      if (cachedPermissions && cachedTimestamp && (now - parseInt(cachedTimestamp)) < 24 * 60 * 60 * 1000) {
        setPermissions(JSON.parse(cachedPermissions));
        setLoading(false);
        return;
      }

      const modulesRes = await Api.get("/api/auth/modules");

      // Use Promise.all to fetch all permissions in parallel instead of sequentially
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

          // Handle special module names
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

      // Cache permissions for 24 hours
      localStorage.setItem('cached_permissions', JSON.stringify(allPermissions));
      localStorage.setItem('cached_permissions_timestamp', now.toString());

    } catch (err) {
      console.error("Error fetching permissions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh permissions manually
  const refreshPermissions = async () => {
    // Clear cache before refreshing
    localStorage.removeItem('cached_permissions');
    localStorage.removeItem('cached_permissions_timestamp');
    await fetchPermissions();
  };

  useEffect(() => {
    // Only fetch permissions if user is logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetchPermissions();
    } else {
      setLoading(false); // Stop loading if no token
    }
  }, []);

  return (
    <PermissionContext.Provider value={{ permissions, loading, fetchPermissions, refreshPermissions }}>
      {children}
    </PermissionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const usePermissions = () => useContext(PermissionContext);
