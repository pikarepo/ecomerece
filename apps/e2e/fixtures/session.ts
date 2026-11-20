import type { APIRequestContext, Browser, BrowserContext, Page } from '@playwright/test';
import { readStoredAccessToken, roleArtifacts } from '../auth/artifacts';
import type { E2ERole } from '../auth/roles';
import { env } from '../config/env';

export type ApiContextFactory = (options: {
  baseURL?: string;
  extraHTTPHeaders?: Record<string, string>;
}) => Promise<APIRequestContext>;

export type RoleSession = {
  context: BrowserContext;
  page: Page;
  api: APIRequestContext;
};

const buildApiContext = async (
  create: ApiContextFactory,
  token: string | undefined,
  baseURL: string,
): Promise<APIRequestContext> =>
  await create({
    baseURL,
    extraHTTPHeaders: token === undefined ? {} : { Authorization: `Bearer ${token}` },
  });

export const createRoleSession = async (
  browser: Browser,
  createContext: ApiContextFactory,
  role: E2ERole,
): Promise<RoleSession> => {
  const paths = roleArtifacts(role);
  const token = env.apiToken ?? (await readStoredAccessToken(role));
  const context = await browser.newContext({
    ...(env.authMode === 'refresh' ? { storageState: paths.storageStatePath } : {}),
    baseURL: env.baseURL,
  });

  return {
    context,
    page: await context.newPage(),
    api: await buildApiContext(createContext, token, env.apiURL),
  };
};

export const createRoleApiContext = async (
  create: ApiContextFactory,
  role: E2ERole,
): Promise<APIRequestContext> => {
  const token = env.apiToken ?? (await readStoredAccessToken(role));
  return await buildApiContext(create, token, env.apiURL);
};

export const createDefaultApiContext = async (
  create: ApiContextFactory,
): Promise<APIRequestContext> => await createRoleApiContext(create, 'buyer');
