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
      const user = localStorage.getItem('user');

      if (!token || !user) {
        console.warn('No token or user found, skipping permissions fetch');
        setLoading(false);
        return;
      }

      const currentUser = JSON.parse(user);
      const userId = currentUser.id;
      setLoading(true);

      // Check if permissions are cached for this user and not expired (24 hours)
      const userCacheKey = `cached_permissions_${userId}`;
      const userTimestampKey = `cached_permissions_timestamp_${userId}`;
      const cachedPermissions = localStorage.getItem(userCacheKey);
      const cachedTimestamp = localStorage.getItem(userTimestampKey);
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

      // Cache permissions for this user for 24 hours
      const saveCacheKey = `cached_permissions_${userId}`;
      const saveTimestampKey = `cached_permissions_timestamp_${userId}`;
      localStorage.setItem(saveCacheKey, JSON.stringify(allPermissions));
      localStorage.setItem(saveTimestampKey, now.toString());

    } catch (err) {
      console.error("Error fetching permissions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh permissions manually
  const refreshPermissions = async () => {
    const user = localStorage.getItem('user');
    if (user) {
      const currentUser = JSON.parse(user);
      const userId = currentUser.id;

      // Clear cache for current user before refreshing
      const refreshCacheKey = `cached_permissions_${userId}`;
      const refreshTimestampKey = `cached_permissions_timestamp_${userId}`;
      localStorage.removeItem(refreshCacheKey);
      localStorage.removeItem(refreshTimestampKey);
    }
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
