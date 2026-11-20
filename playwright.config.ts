import { defineConfig, devices } from '@playwright/test';
import { env } from './apps/e2e/config/env';

type PlaywrightConfig = Parameters<typeof defineConfig>[0];
type Reporters = NonNullable<PlaywrightConfig['reporter']>;

const reporters: Reporters = env.isCI
  ? [['github'], ['html', { open: 'never' }]]
  : [['list'], ['html', { open: 'on-failure' }]];

const webServers = [
  {
    command: 'bun run dev:api',
    url: `${env.apiURL}/health`,
    reuseExistingServer: !env.isCI,
    timeout: 120_000,
  },
  {
    command: 'bun run --filter @ecomerece/web dev',
    url: env.baseURL,
    reuseExistingServer: !env.isCI,
    timeout: 120_000,
  },
];

export default defineConfig({
  testDir: './apps/e2e/specs',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: env.isCI,
  retries: env.isCI ? 2 : 0,
  workers: env.isCI ? 1 : undefined,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: reporters,
  globalSetup: env.authMode === 'refresh' ? './apps/e2e/global-setup.ts' : undefined,
  outputDir: './test-results',
  use: {
    baseURL: env.baseURL,
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    ...(env.authMode === 'refresh' ? { storageState: `${env.authDir}/buyer/user.json` } : {}),
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: env.target === 'local' ? webServers : undefined,
});
