export interface PaymentsConfig {
  /** Registered provider names; allows future multi-adapter setup. */
  providers: string[];
  /** Provider used when a request does not specify one. */
  defaultProvider: string;
}

const SUPPORTED = ['manual'] as const;

function parseProviders(raw: string | undefined): string[] {
  const requested = (raw ?? 'manual')
    .split(',')
    .map((n) => n.trim().toLowerCase())
    .filter((n) => n.length > 0);
  const unique = [...new Set(requested)];
  const unknown = unique.filter((n) => !(SUPPORTED as readonly string[]).includes(n));
  if (unknown.length > 0) {
    throw new Error(
      `Unsupported PAYMENT_PROVIDERS value(s): ${unknown.join(', ')}. Supported: ${SUPPORTED.join(', ')}.`,
    );
  }
  return unique.length ? unique : ['manual'];
}

export function loadPaymentsConfig(): PaymentsConfig {
  const providers = parseProviders(process.env.PAYMENT_PROVIDERS);
  const def = (process.env.PAYMENT_DEFAULT_PROVIDER ?? providers[0] ?? 'manual')
    .trim()
    .toLowerCase();
  if (!providers.includes(def)) {
    throw new Error(
      `PAYMENT_DEFAULT_PROVIDER "${def}" is not in PAYMENT_PROVIDERS (${providers.join(', ')}).`,
    );
  }
  return { providers, defaultProvider: def };
}
