import { expect, test as base, type APIRequestContext } from '@playwright/test';
import { CleanupRegistry } from '../api/cleanup';
import { hasRoleAccessToken } from '../auth/artifacts';
import type { E2ERole } from '../auth/roles';
import { env } from '../config/env';
import { apiRoutes } from '../routes/api.routes';
import { webRoutes } from '../routes/web.routes';
import {
  createDefaultApiContext,
  createRoleApiContext,
  createRoleSession,
  type ApiContextFactory,
  type RoleSession,
} from './session';

type E2EFixtures = {
  api: APIRequestContext;
  admin: APIRequestContext;
  buyer: APIRequestContext;
  vendor: APIRequestContext;
  /** No Authorization header at all: the attacker's starting point. */
  anonymous: APIRequestContext;
  apiAs: (role: E2ERole) => Promise<APIRequestContext>;
  canAuthenticateAs: (role: E2ERole) => Promise<boolean>;
  cleanup: CleanupRegistry;
  webRoutes: typeof webRoutes;
  apiRoutes: typeof apiRoutes;
  loginAs: (role: E2ERole) => Promise<RoleSession>;
};

export const test = base.extend<E2EFixtures>({
  api: async ({ playwright }, use) => {
    const createContext: ApiContextFactory = (options) => playwright.request.newContext(options);
    const context = await createDefaultApiContext(createContext);
    await use(context);
    await context.dispose();
  },
  admin: async ({ playwright }, use) => {
    const createContext: ApiContextFactory = (options) => playwright.request.newContext(options);
    const context = await createRoleApiContext(createContext, 'admin');
    await use(context);
    await context.dispose();
  },
  buyer: async ({ playwright }, use) => {
    const createContext: ApiContextFactory = (options) => playwright.request.newContext(options);
    const context = await createRoleApiContext(createContext, 'buyer');
    await use(context);
    await context.dispose();
  },
  vendor: async ({ playwright }, use) => {
    const createContext: ApiContextFactory = (options) => playwright.request.newContext(options);
    const context = await createRoleApiContext(createContext, 'vendor');
    await use(context);
    await context.dispose();
  },
  anonymous: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({ baseURL: env.apiURL });
    await use(context);
    await context.dispose();
  },
  apiAs: async ({ playwright }, use) => {
    const createContext: ApiContextFactory = (options) => playwright.request.newContext(options);
    const contexts: APIRequestContext[] = [];
    await use(async (role: E2ERole) => {
      const context = await createRoleApiContext(createContext, role);
      contexts.push(context);
      return context;
    });
    await Promise.all(contexts.map(async (context) => await context.dispose()));
  },
  canAuthenticateAs: async ({}, use) => {
    await use(
      async (role: E2ERole) =>
        env.apiTokens[role] !== undefined || (await hasRoleAccessToken(role)),
    );
  },
  cleanup: async ({ api, admin, buyer, vendor, apiAs }, use) => {
    void api;
    void admin;
    void buyer;
    void vendor;
    void apiAs;
    const registry = new CleanupRegistry();
    await use(registry);
    await registry.dispose();
  },
  webRoutes: async ({}, use) => {
    await use(webRoutes);
  },
  apiRoutes: async ({}, use) => {
    await use(apiRoutes);
  },
  loginAs: async ({ browser, playwright }, use) => {
    const createContext: ApiContextFactory = (options) => playwright.request.newContext(options);
    const sessions: RoleSession[] = [];
    await use(async (role: E2ERole) => {
      const session = await createRoleSession(browser, createContext, role);
      sessions.push(session);
      return session;
    });
    await Promise.all(
      sessions.map(async (session) => {
        await session.api.dispose();
        await session.context.close();
      }),
    );
  },
});

export { expect };
