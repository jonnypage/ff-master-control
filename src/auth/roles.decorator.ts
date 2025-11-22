import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  ADMIN = 'admin',
  MISSION_LEADER = 'mission-leader',
  QUEST_GIVER = 'quest-giver',
  STORE = 'store',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

