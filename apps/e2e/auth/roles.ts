import { env } from '../config/env';

export const roles = ['buyer', 'vendor', 'admin'] as const;

export type E2ERole = (typeof roles)[number];

export const roleArtifactDir = (role: E2ERole): string => `${env.authDir}/${role}`;
