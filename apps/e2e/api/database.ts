import mongoose from 'mongoose';
import { env } from '../config/env';

/**
 * Read-only database access for exploit evidence. Attacking through HTTP is the
 * point; the database is only consulted to prove what the attack actually wrote
 * (or failed to write). Tests skip when no URI is configured so the suite still
 * runs against a deployment the caller cannot reach directly.
 */
export const databaseConfigured = (): boolean => env.mongoURI !== undefined;

const requireURI = (): string => {
  if (env.mongoURI === undefined) {
    throw new Error('E2E_MONGO_URI (or MONGO_URI) is required for database-backed assertions.');
  }
  return env.mongoURI;
};

export const connectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(requireURI(), { serverSelectionTimeoutMS: 5_000 });
};

export const readDocument = async <T>(
  collection: string,
  filter: Record<string, unknown>,
): Promise<T | null> => {
  await connectDatabase();
  const document = await mongoose.connection.db?.collection(collection).findOne(filter);
  return (document as T | null) ?? null;
};

export const findDocuments = async <T>(
  collection: string,
  filter: Record<string, unknown>,
): Promise<T[]> => {
  await connectDatabase();
  const documents = await mongoose.connection.db
    ?.collection(collection)
    .find(filter)
    .limit(50)
    .toArray();
  return (documents as T[] | undefined) ?? [];
};

export const countDocuments = async (
  collection: string,
  filter: Record<string, unknown>,
): Promise<number> => {
  await connectDatabase();
  return (await mongoose.connection.db?.collection(collection).countDocuments(filter)) ?? 0;
};

export const deleteDocuments = async (
  collection: string,
  filter: Record<string, unknown>,
): Promise<number> => {
  if (!databaseConfigured()) return 0;
  await connectDatabase();
  const result = await mongoose.connection.db?.collection(collection).deleteMany(filter);
  return result?.deletedCount ?? 0;
};

export const disconnectDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.disconnect();
};
