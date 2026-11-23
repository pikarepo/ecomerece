import { expect } from 'bun:test';
import { Id } from '@ecomerece/domain/value-objects/id.vo';
import {
  createApiIntegrationHarness,
  integrationEnabled,
  registerIntegrationIdentity,
  runId,
  type ApiIntegrationHarness,
  type ApiResult,
  type RequestOptions,
} from './api-integration-harness';

/**
 * Attack-oriented companion to the integration harness.
 *
 * The harness answers "does the happy path work". This kit answers "what
 * happens when I abuse it": it adds attack assertions that never throw on a
 * successful exploit, concurrency primitives, evidence logging, and the extra
 * tenants a cross-tenant test needs. Module exploit cases should read like
 * cases, not like bootstrap code.
 */

export type Tenant = 'buyer' | 'buyerAlt' | 'vendor' | 'vendorAlt' | 'admin';

export type AttackResult = {
  /** HTTP status the attack received. */
  status: number;
  /** Parsed envelope, or the raw text when the body was not JSON. */
  body: unknown;
  /** Raw body text, for leak assertions. */
  text: string;
  /** True when the attacker succeeded (2xx). */
  accepted: boolean;
};

export type SecurityKit = {
  harness: ApiIntegrationHarness;
  runId: string;
  /** Sends a request as a tenant with no assertions. */
  send: (tenant: Tenant, path: string, options?: RequestOptions) => Promise<AttackResult>;
  /** Sends a request anonymously, the way an unauthenticated attacker starts. */
  sendAnonymously: (path: string, options?: RequestOptions) => Promise<AttackResult>;
  /** Fires `count` copies at the same time, which is how races are exploited. */
  race: (count: number, fire: (index: number) => Promise<AttackResult>) => Promise<AttackResult[]>;
  /** Unique vendor profile owned by the tenant, created and verified. */
  vendorProfileFor: (tenant: 'vendor' | 'vendorAlt') => Promise<string>;
  /** Prints one reproducible evidence line; copied into report/PROGRESS.md. */
  evidence: (tag: string, data: Record<string, unknown>) => void;
  statuses: (results: readonly AttackResult[]) => number[];
  accepted: (results: readonly AttackResult[]) => AttackResult[];
  dispose: () => Promise<void>;
};

const altTenants: Record<'buyerAlt' | 'vendorAlt' | 'adminAlt', string> = {
  buyerAlt: `sec-buyer-alt-${runId}@example.com`,
  vendorAlt: `sec-vendor-alt-${runId}@example.com`,
  adminAlt: `sec-admin-alt-${runId}@example.com`,
};

let identitiesRegistered = false;

const toAttackResult = async (result: ApiResult<unknown>): Promise<AttackResult> => ({
  status: result.response.status,
  body: result.body,
  text: JSON.stringify(result.body),
  accepted: result.response.ok,
});

export const createSecurityKit = async (options: { dispatchEvents?: boolean } = {}) => {
  if (!integrationEnabled) {
    throw new Error('Security kit requires INTEGRATION_TESTS=1.');
  }

  // Registration must happen before the harness boots so the Supabase mock
  // knows the tokens. Emails carry the run id: a fixed address collides with
  // the record a previous run left behind.
  if (!identitiesRegistered) {
    registerIntegrationIdentity({
      token: 'sec-buyer-alt-token',
      id: Id.create().value,
      email: altTenants.buyerAlt,
      fullName: 'Security Buyer Alt',
    });
    registerIntegrationIdentity({
      token: 'sec-vendor-alt-token',
      id: Id.create().value,
      email: altTenants.vendorAlt,
      fullName: 'Security Vendor Alt',
      role: 'vendor',
    });
    identitiesRegistered = true;
  }

  const harness = await createApiIntegrationHarness({
    dispatchEvents: options.dispatchEvents ?? true,
  });

  const tokens: Record<Tenant, string> = {
    buyer: harness.tokens.buyer,
    buyerAlt: 'sec-buyer-alt-token',
    vendor: harness.tokens.vendor,
    vendorAlt: 'sec-vendor-alt-token',
    admin: harness.tokens.admin,
  };

  const vendorProfiles = new Map<string, string>();

  const kit: SecurityKit = {
    harness,
    runId,
    async send(tenant, path, requestOptions = {}) {
      return await toAttackResult(
        await harness.requestWithToken<unknown>(tokens[tenant], path, requestOptions),
      );
    },
    async sendAnonymously(path, requestOptions = {}) {
      const response = await harness.app.request(path, {
        method: requestOptions.method ?? 'GET',
        headers: { 'content-type': 'application/json', ...requestOptions.headers },
        body:
          requestOptions.body === undefined ? undefined : JSON.stringify(requestOptions.body),
      });
      const body: unknown = await response.json().catch(() => null);
      return {
        status: response.status,
        body,
        text: JSON.stringify(body),
        accepted: response.ok,
      };
    },
    async race(count, fire) {
      return await Promise.all(Array.from({ length: count }, async (_, index) => await fire(index)));
    },
    async vendorProfileFor(tenant) {
      const cached = vendorProfiles.get(tenant);
      if (cached !== undefined) return cached;

      const suffix = `${tenant}-${runId}`.toLowerCase();
      const created = await harness.requestWithToken<{ message?: string }>(
        tokens[tenant],
        '/vendor/me',
        {
          method: 'POST',
          body: {
            title: `Security ${suffix}`,
            description: 'Vendor created by the exploitation suite.',
            slug: `security-${suffix}`,
            contacts: {
              phone: '+10000000000',
              email: `${suffix}@example.com`,
              address: {
                streetAddress: '1 Security Street',
                city: 'Lahore',
                state: 'Punjab',
                postalCode: '54000',
                country: 'Pakistan',
              },
            },
            image: {
              logo: 'https://example.com/security-logo.png',
              banner: 'https://example.com/security-banner.png',
            },
          },
        },
      );
      if (!created.response.ok || !created.body.success) {
        throw new Error(`Could not create ${tenant} vendor profile: ${JSON.stringify(created.body)}`);
      }
      const vendorId = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/.exec(
        created.body.data.message ?? '',
      )?.[0];
      if (vendorId === undefined) throw new Error('Vendor creation did not report an id.');

      const verified = await harness.requestAs('admin', '/vendor/admin/verify', {
        method: 'PATCH',
        body: { vendorId },
      });
      if (!verified.response.ok) {
        throw new Error(`Could not verify ${tenant} vendor: ${JSON.stringify(verified.body)}`);
      }
      vendorProfiles.set(tenant, vendorId);
      return vendorId;
    },
    evidence(tag, data) {
      const rendered = Object.entries(data)
        .map(([key, value]) => `${key}=${String(value)}`)
        .join(' ');
      console.log(`[${tag}] ${rendered}`);
    },
    statuses(results) {
      return results.map((result) => result.status);
    },
    accepted(results) {
      return results.filter((result) => result.accepted);
    },
    async dispose() {
      await harness.close();
    },
  };

  return kit;
};

/** The attack failed closed: a client rejection, never a 5xx. */
export const expectRejected = (result: AttackResult, label: string): void => {
  expect(result.accepted, `${label} must not succeed (status ${result.status}). ${result.text.slice(0, 300)}`).toBe(
    false,
  );
  expect(result.status, `${label} must fail as a client error, not a server error.`).toBeLessThan(500);
};

/** The attacker was stopped at the door, not by a business rule. */
export const expectUnauthorized = (result: AttackResult, label: string): void => {
  expectRejected(result, label);
  expect([401, 403], `${label} must be rejected by auth, received ${result.status}.`).toContain(
    result.status,
  );
};

export const expectNoLeak = (result: AttackResult, secrets: readonly string[], label: string): void => {
  for (const secret of secrets) {
    expect(result.text, `${label} leaked ${secret}.`).not.toContain(secret);
  }
};
