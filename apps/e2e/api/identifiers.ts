export type IdRecord = {
  id?: string;
  _id?: string;
};

export type MessageData = {
  id?: string;
  _id?: string;
  message?: string;
  updatedData?: IdRecord;
};

const UUID_PATTERN = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const idFromMessage = (message: string | undefined, label: string): string | undefined => {
  if (message === undefined) return undefined;
  const match = message.match(new RegExp(`\\b${escapeRegExp(label)} (${UUID_PATTERN})`, 'i'));
  return match?.[1];
};

export const requireIdFromMessage = (message: string | undefined, label: string): string => {
  const id = idFromMessage(message, label);
  if (id === undefined) {
    throw new Error(`Could not extract ${label} id from message: ${message ?? 'missing message'}.`);
  }
  return id;
};

export const idFromRecord = (record: IdRecord | undefined): string | undefined =>
  record?.id ?? record?._id;

export const requireRecordId = (record: IdRecord | undefined, label: string): string => {
  const id = idFromRecord(record);
  if (id === undefined) {
    throw new Error(`Could not extract ${label} id from response.`);
  }
  return id;
};

export const messageOf = (data: MessageData): string | undefined => data.message;

export const uniqueSuffix = (): string =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
