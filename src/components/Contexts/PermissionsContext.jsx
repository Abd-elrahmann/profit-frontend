import React, { createContext, useContext, useEffect, useState } from "react";
import Api from "../../config/Api";
import { useLocation } from "react-router-dom";
import routes from "../../routes";

// Create the context
const PermissionsContext = createContext();

// Provider component
export const PermissionsProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Helper: find the module for the current path dynamically
  const findCurrentModule = (pathname) => {
    const matchedRoute = routes.find(
      (route) => route.path && pathname.startsWith(route.path)
    );
    return matchedRoute?.module || null;
  };

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const currentModule = findCurrentModule(location.pathname);
        if (!currentModule) {
          setPermissions([]);
          setLoading(false);
          return;
        }

        const response = await Api.get(`/api/auth/permissions/${currentModule}`);
        setPermissions(response.data || []);
      } catch (error) {
        console.error("Error fetching permissions:", error);
        setPermissions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [location.pathname]);

  return (
    <PermissionsContext.Provider value={{ permissions, loading }}>
      {children}
    </PermissionsContext.Provider>
  );
};

// Hook to use permissions easily
// eslint-disable-next-line react-refresh/only-export-components
export const usePermissions = () => useContext(PermissionsContext);
