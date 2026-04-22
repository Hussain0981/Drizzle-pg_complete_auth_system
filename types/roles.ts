// src/types/roles.ts
export const ROLES = {
  ADMIN:   'admin',
  MANAGER: 'manager',
  USER:    'user',
  GUEST:   'guest',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

// Role hierarchy
export const ROLE_HIERARCHY: Record<Role, number> = {
  admin:   100,
  manager: 50,
  user:    10,
  guest:   0,
};