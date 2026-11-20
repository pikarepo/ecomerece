import { expect, test as base, type APIRequestContext } from '@playwright/test';
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
  apiAs: (role: E2ERole) => Promise<APIRequestContext>;
  canAuthenticateAs: (role: E2ERole) => Promise<boolean>;
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
      async (role: E2ERole) => env.apiToken !== undefined || (await hasRoleAccessToken(role)),
    );
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
