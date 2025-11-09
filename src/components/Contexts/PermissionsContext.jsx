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

      const modulesRes = await Api.get("/api/auth/modules");

      const allPermissions = [];

      for (const module of modulesRes.data) {
        const res = await Api.get(`/api/auth/permissions/${module}`);
        res.data.forEach((perm) => {
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
      }

      setPermissions(allPermissions);
    } catch (err) {
      console.error("Error fetching permissions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh permissions manually
  const refreshPermissions = async () => {
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
