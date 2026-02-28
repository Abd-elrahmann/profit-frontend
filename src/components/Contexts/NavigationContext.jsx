import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const NavigationContext = createContext(null);

export const useNavigationLoader = () => {
  const ctx = useContext(NavigationContext);
  if (!ctx) return { isNavigating: false, startNavigation: () => {} };
  return ctx;
};

export const NavigationProvider = ({ children }) => {
  const [isNavigating, setIsNavigating] = useState(false);

  const startNavigation = useCallback(() => {
    setIsNavigating(true);
  }, []);

  const stopNavigation = useCallback(() => {
    setIsNavigating(false);
  }, []);

  useEffect(() => {
    const handleMouseDown = (e) => {
      const link = e.target.closest('a[href^="/"]');
      if (link && !link.target && !e.ctrlKey && !e.metaKey) {
        startNavigation();
      }
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [startNavigation]);

  const value = {
    isNavigating,
    startNavigation,
    stopNavigation,
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};
