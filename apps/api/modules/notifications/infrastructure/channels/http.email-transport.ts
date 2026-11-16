import type { EmailMessage, IEmailTransport } from './email-transport';

export interface HttpEmailTransportConfig {
  url: string;
  /** Sent as `Authorization: Bearer <token>` when set. */
  token?: string;
  timeoutMs?: number;
}

const DEFAULT_TIMEOUT_MS = 5000;

/**
 * Provider-agnostic transport: POSTs the message as JSON, so any email API or
 * relay that accepts `{ from, to, subject, text }` works without adding an SDK.
 */
export class HttpEmailTransport implements IEmailTransport {
  constructor(private readonly config: HttpEmailTransportConfig) {}

  async send(message: EmailMessage): Promise<void> {
    const response = await fetch(this.config.url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        ...(this.config.token ? { authorization: `Bearer ${this.config.token}` } : {}),
      },
      body: JSON.stringify(message),
      signal: AbortSignal.timeout(this.config.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`Email provider answered ${response.status} ${response.statusText}`);
    }
  }
}
