import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useMemo } from 'react';
import Api, { handleApiError } from '../../config/Api';
import { usePermissions } from '../../components/Contexts/PermissionsContext';
import { DASHBOARD_MODULES, DASHBOARD_TABS } from './constants';
export function useDashboardPermissions() {
  const { permissions } = usePermissions();
  const queryClient = useQueryClient();
  const prevPermissionsLength = useRef(permissions?.length || 0);
  const { data: dashboardPermissions, isLoading: permissionsLoading } = useQuery({
    queryKey: ['dashboard-permissions', permissions?.length || 0],
    queryFn: async () => {
      try {
        const response = await Api.get('/api/roles/permissions');
        const rolePermissions = response.data.permissions || [];
        return rolePermissions.filter(
          (p) => p.canView && DASHBOARD_MODULES.includes(p.module)
        );
      } catch (error) {
        handleApiError(error);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: !!permissions?.length,
  });
  useEffect(() => {
    const currentLength = permissions?.length || 0;
    if (currentLength !== prevPermissionsLength.current && currentLength > 0) {
      prevPermissionsLength.current = currentLength;
      queryClient.invalidateQueries({ queryKey: ['dashboard-permissions'] });
    }
  }, [permissions, queryClient]);
  const availableTabs = useMemo(() => {
    if (!dashboardPermissions) return [];
    return DASHBOARD_TABS.filter((tab) =>
      dashboardPermissions.some(
        (perm) => perm.module === tab.permission && perm.canView
      )
    );
  }, [dashboardPermissions]);
  return { dashboardPermissions, permissionsLoading, availableTabs };
}