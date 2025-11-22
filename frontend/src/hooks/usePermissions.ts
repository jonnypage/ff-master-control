import { useAuth } from '@/features/auth/lib/auth-context';
import {
  canEditTeams,
  canEditMissions,
  canAdjustCredits,
  hasPermission,
} from '@/lib/permissions';

/**
 * Hook to check user permissions
 */
export function usePermissions() {
  const { user } = useAuth();
  const userRole = user?.role;

  return {
    canEditTeams: canEditTeams(userRole),
    canEditMissions: canEditMissions(userRole),
    canAdjustCredits: canAdjustCredits(userRole),
    hasPermission: (resource: 'teams' | 'missions' | 'credits', action: 'edit' | 'adjust') =>
      hasPermission(userRole, resource, action),
    userRole,
  };
}

