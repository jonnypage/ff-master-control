import type { UserRole } from '@/lib/graphql/generated';

/**
 * Permission configuration for different resources
 * This makes it easy to add new roles or change permissions in the future
 */
export const PERMISSIONS = {
  teams: {
    edit: ['ADMIN'] as UserRole[],
    // Future: could add ['ADMIN', 'MISSION_LEADER'] to allow mission leaders to edit
  },
  missions: {
    edit: ['ADMIN'] as UserRole[],
    // Future: could add ['ADMIN', 'MISSION_LEADER'] to allow mission leaders to edit
  },
  credits: {
    adjust: ['ADMIN', 'STORE'] as UserRole[],
  },
} as const;

/**
 * Check if a user has permission to perform an action on a resource
 */
export function hasPermission(
  userRole: UserRole | null | undefined,
  resource: keyof typeof PERMISSIONS,
  action: 'edit' | 'adjust',
): boolean {
  if (!userRole) return false;
  
  const allowedRoles = PERMISSIONS[resource]?.[action];
  if (!allowedRoles) return false;
  
  return allowedRoles.includes(userRole);
}

/**
 * Check if user can edit teams
 */
export function canEditTeams(userRole: UserRole | null | undefined): boolean {
  return hasPermission(userRole, 'teams', 'edit');
}

/**
 * Check if user can edit missions
 */
export function canEditMissions(userRole: UserRole | null | undefined): boolean {
  return hasPermission(userRole, 'missions', 'edit');
}

/**
 * Check if user can adjust credits
 */
export function canAdjustCredits(userRole: UserRole | null | undefined): boolean {
  return hasPermission(userRole, 'credits', 'adjust');
}

