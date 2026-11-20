import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { BrowserContext } from '@playwright/test';
import { roleArtifactDir, type E2ERole } from '../auth/roles';

type StorageState = Awaited<ReturnType<BrowserContext['storageState']>>;

type RoleArtifacts = {
  storageStatePath: string;
  tokenPath: string;
  refreshTokenPath: string;
};

const pathsFor = (role: E2ERole): RoleArtifacts => {
  const dir = roleArtifactDir(role);
  return {
    storageStatePath: join(dir, 'user.json'),
    tokenPath: join(dir, 'token.txt'),
    refreshTokenPath: join(dir, 'refresh-token.txt'),
  };
};

export const roleArtifacts = pathsFor;

export const writeRoleArtifacts = async (
  role: E2ERole,
  storageState: StorageState,
  accessToken: string,
  refreshToken: string,
): Promise<void> => {
  const paths = pathsFor(role);
  await mkdir(roleArtifactDir(role), { recursive: true });
  await Promise.all([
    writeFile(paths.storageStatePath, JSON.stringify(storageState, null, 2), 'utf8'),
    writeFile(paths.tokenPath, accessToken, 'utf8'),
    writeFile(paths.refreshTokenPath, refreshToken, 'utf8'),
  ]);
};

const readTrimmedFile = async (path: string): Promise<string | undefined> => {
  try {
    const value = await readFile(path, 'utf8');
    return value.trim() === '' ? undefined : value.trim();
  } catch (error) {
    const code =
      typeof error === 'object' && error !== null && 'code' in error
        ? (error as { code?: unknown }).code
        : undefined;
    if (code === 'ENOENT') return undefined;
    throw error;
  }
};

export const readStoredRefreshToken = async (role: E2ERole): Promise<string | undefined> =>
  await readTrimmedFile(pathsFor(role).refreshTokenPath);

export const readStoredAccessToken = async (role: E2ERole): Promise<string | undefined> =>
  await readTrimmedFile(pathsFor(role).tokenPath);

export const hasRoleAccessToken = async (role: E2ERole): Promise<boolean> =>
  (await readStoredAccessToken(role)) !== undefined;
