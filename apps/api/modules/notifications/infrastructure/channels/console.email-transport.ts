import type { EmailMessage, IEmailTransport } from './email-transport';

/** Local/dev transport: prints the message instead of calling a provider. */
export class ConsoleEmailTransport implements IEmailTransport {
  async send(message: EmailMessage): Promise<void> {
    console.info('[notifications] email delivered to console', {
      to: message.to,
      subject: message.subject,
      text: message.text,
    });
  }
}
