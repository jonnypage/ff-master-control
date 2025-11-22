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

type PermissionResource = keyof typeof PERMISSIONS;
type PermissionAction = 'edit' | 'adjust';

/**
 * Check if a user has permission to perform an action on a resource
 */
export function hasPermission(
  userRole: UserRole | null | undefined,
  resource: PermissionResource,
  action: PermissionAction,
): boolean {
  if (!userRole) return false;
  
  const resourcePermissions = PERMISSIONS[resource];
  if (!resourcePermissions) return false;
  
  const allowedRoles = (resourcePermissions as Record<PermissionAction, UserRole[]>)[action];
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

