/**
 * Narrow outbound port the email channel sends through. Providers differ only in
 * how a message leaves the process, so a new provider is a new transport rather
 * than a change to the notification module.
 */
export interface EmailMessage {
  from: string;
  to: string;
  subject: string;
  text: string;
}

export interface IEmailTransport {
  send(message: EmailMessage): Promise<void>;
}
