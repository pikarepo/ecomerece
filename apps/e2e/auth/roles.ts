import { env } from '../config/env';

/**
 * Primary roles are the three accounts the suite has always used. Secondary
 * roles exist so cross-tenant tests can prove that buyer A cannot read or
 * mutate buyer B's data: reusing one token for both sides would make those
 * assertions meaningless.
 */
export const primaryRoles = ['buyer', 'vendor', 'admin'] as const;
export const secondaryRoles = ['buyerAlt', 'vendorAlt', 'adminAlt'] as const;
export const roles = [...primaryRoles, ...secondaryRoles] as const;

export type PrimaryRole = (typeof primaryRoles)[number];
export type SecondaryRole = (typeof secondaryRoles)[number];
export type E2ERole = (typeof roles)[number];

const primaryRoleSet = new Set<string>(primaryRoles);

export const isPrimaryRole = (role: E2ERole): role is PrimaryRole => primaryRoleSet.has(role);

export const roleArtifactDir = (role: E2ERole): string => `${env.authDir}/${role}`;
