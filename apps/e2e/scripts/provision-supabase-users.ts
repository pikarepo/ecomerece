import { randomBytes } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import mongoose from 'mongoose';

type Role = 'buyer' | 'vendor' | 'admin' | 'buyerAlt' | 'vendorAlt' | 'adminAlt';
type MongoRole = 'customer' | 'vendor' | 'admin';

type Manifest = {
  runId: string;
  userIds: Record<Role, string>;
  emails: Record<Role, string>;
};

type UserDocument = {
  _id: string;
  e2eRun?: string;
};

const roles: Role[] = ['buyer', 'vendor', 'admin', 'buyerAlt', 'vendorAlt', 'adminAlt'];
const mongoRoles: Record<Role, MongoRole> = {
  buyer: 'customer',
  vendor: 'vendor',
  admin: 'admin',
  buyerAlt: 'customer',
  vendorAlt: 'vendor',
  adminAlt: 'admin',
};

const root = process.cwd();
const manifestPath =
  process.env.E2E_SUPABASE_MANIFEST ?? path.join('/tmp/opencode', 'e2e-supabase-run.json');

const readEnvFileValue = (file: string, key: string): string | undefined => {
  if (!existsSync(file)) return undefined;
  const source = readFileSync(file, 'utf8');
  const match = source.match(new RegExp(`^${key}\\s*=\\s*(.*)$`, 'm'));
  if (match?.[1] === undefined) return undefined;
  const value = match[1]
    .trim()
    .replace(/^['"]|['"]$/g, '')
    .trim();
  return value === '' ? undefined : value;
};

const config = {
  supabaseURL: process.env.SUPABASE_URL ?? readEnvFileValue('apps/api/.env', 'SUPABASE_URL'),
  supabaseSecretKey:
    process.env.SUPABASE_SECRET_KEY ?? readEnvFileValue('apps/api/.env', 'SUPABASE_SECRET_KEY'),
  supabaseAnonKey:
    process.env.E2E_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    readEnvFileValue('apps/web/.env.local', 'NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  mongoURI:
    process.env.E2E_MONGO_URI ??
    process.env.MONGO_URI ??
    readEnvFileValue('apps/api/.env', 'MONGO_URI'),
  apiURL: process.env.E2E_API_URL ?? 'http://localhost:8000',
};

const requireConfig = (): void => {
  const missing = Object.entries(config)
    .filter(([key, value]) => key !== 'apiURL' && (value === undefined || value === ''))
    .map(([key]) => key);
  if (missing.length > 0) throw new Error(`Missing config: ${missing.join(', ')}.`);
};

const responseMessage = (payload: unknown, status: number): string => {
  if (typeof payload !== 'object' || payload === null) return String(status);
  const record = payload as Record<string, unknown>;
  const message = record.msg ?? record.message ?? record.error_description ?? record.error;
  return message === undefined ? String(status) : String(message);
};

const adminHeaders = (): Record<string, string> => ({
  apikey: config.supabaseSecretKey ?? '',
  Authorization: `Bearer ${config.supabaseSecretKey ?? ''}`,
  'Content-Type': 'application/json',
});

const anonHeaders = (): Record<string, string> => ({
  apikey: config.supabaseAnonKey ?? '',
  Authorization: `Bearer ${config.supabaseAnonKey ?? ''}`,
  'Content-Type': 'application/json',
});

const readManifest = (): Manifest => JSON.parse(readFileSync(manifestPath, 'utf8')) as Manifest;

const writeManifest = (manifest: Manifest): void => {
  mkdirSync(path.dirname(manifestPath), { recursive: true });
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
};

const artifactPaths = (role: Role) => {
  const dir = path.join(root, 'apps/e2e/.auth', role);
  return {
    dir,
    token: path.join(dir, 'token.txt'),
    refreshToken: path.join(dir, 'refresh-token.txt'),
    storageState: path.join(dir, 'user.json'),
  };
};

const deleteSupabaseUser = async (userId: string): Promise<void> => {
  const response = await fetch(
    `${config.supabaseURL}/auth/v1/admin/users/${encodeURIComponent(userId)}`,
    { method: 'DELETE', headers: adminHeaders() },
  );
  if (!response.ok && response.status !== 404) {
    throw new Error(`Supabase user delete failed with status ${response.status}.`);
  }
};

const obtainSession = async (
  email: string,
): Promise<{ accessToken: string; refreshToken: string }> => {
  const linkResponse = await fetch(`${config.supabaseURL}/auth/v1/admin/generate_link`, {
    method: 'POST',
    headers: adminHeaders(),
    body: JSON.stringify({ type: 'magiclink', email }),
  });
  const linkPayload: unknown = await linkResponse.json();
  const link = linkPayload as { action_link?: string; msg?: string };
  if (!linkResponse.ok || link.action_link === undefined) {
    throw new Error(
      `Supabase link generation failed: ${responseMessage(linkPayload, linkResponse.status)}`,
    );
  }

  const action = new URL(link.action_link);
  const token = action.searchParams.get('token');
  const type = action.searchParams.get('type') ?? 'magiclink';
  if (token === null) throw new Error('Supabase link did not include a verification token.');

  const verifyResponse = await fetch(
    `${config.supabaseURL}/auth/v1/verify?token=${encodeURIComponent(token)}&type=${encodeURIComponent(type)}`,
    { headers: anonHeaders(), redirect: 'manual' },
  );
  const location = verifyResponse.headers.get('location');
  if (location === null) {
    throw new Error(`Supabase verification failed with status ${verifyResponse.status}.`);
  }

  const params = new URLSearchParams(new URL(location, config.supabaseURL).hash.replace(/^#/, ''));
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (accessToken === null || refreshToken === null) {
    throw new Error('Supabase verification response did not include a session.');
  }

  return { accessToken, refreshToken };
};

const provision = async (): Promise<void> => {
  requireConfig();
  const runId = `e2e-${Date.now()}-${randomBytes(3).toString('hex')}`;
  const userIds = {} as Record<Role, string>;
  const emails = {} as Record<Role, string>;

  for (const role of roles) {
    const email = `e2e+${runId}+${role}@example.com`;
    const password = `E2e_${randomBytes(18).toString('base64url')}!aA1`;
    emails[role] = email;

    const createResponse = await fetch(`${config.supabaseURL}/auth/v1/admin/users`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: role.charAt(0).toUpperCase() + role.slice(1), e2e_run: runId },
      }),
    });
    const createdPayload: unknown = await createResponse.json();
    const created = createdPayload as { id?: string };
    if (!createResponse.ok || created.id === undefined) {
      await Promise.all(Object.values(userIds).map(deleteSupabaseUser));
      throw new Error(
        `Supabase user create failed for ${role}: ${responseMessage(createdPayload, createResponse.status)}`,
      );
    }
    userIds[role] = created.id;

    let session: { accessToken: string; refreshToken: string };
    try {
      session = await obtainSession(email);
    } catch (error) {
      await Promise.all(Object.values(userIds).map(deleteSupabaseUser));
      throw error;
    }

    const paths = artifactPaths(role);
    mkdirSync(paths.dir, { recursive: true });
    writeFileSync(paths.token, session.accessToken, 'utf8');
    writeFileSync(paths.refreshToken, session.refreshToken, 'utf8');
    writeFileSync(
      paths.storageState,
      JSON.stringify({ cookies: [], origins: [] }, null, 2),
      'utf8',
    );
    console.log(`provisioned ${role}: ${created.id}`);
  }

  writeManifest({ runId, userIds, emails });
  console.log(`provisioned ${roles.length} users for ${runId}`);
};

const waitForApi = async (): Promise<void> => {
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      const response = await fetch(`${config.apiURL}/health`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`API did not become healthy at ${config.apiURL}.`);
};

const assignRoles = async (): Promise<void> => {
  requireConfig();
  const manifest = readManifest();
  await waitForApi();

  for (const role of roles) {
    const paths = artifactPaths(role);
    const token = readFileSync(paths.token, 'utf8').trim();
    const response = await fetch(`${config.apiURL}/users/init`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      throw new Error(`User init failed for ${role}: ${response.status} ${await response.text()}`);
    }
  }

  await mongoose.connect(config.mongoURI ?? '', { serverSelectionTimeoutMS: 5_000 });
  try {
    for (const role of roles) {
      await mongoose.connection.db
        ?.collection<UserDocument>('users')
        .updateOne(
          { _id: manifest.userIds[role] },
          { $set: { 'role.role': mongoRoles[role], e2eRun: manifest.runId } },
        );
    }
  } finally {
    await mongoose.disconnect();
  }

  console.log(`initialized ${roles.length} users and assigned roles for ${manifest.runId}`);
};

const resetFixtures = async (): Promise<void> => {
  requireConfig();
  const manifest = readManifest();

  await mongoose.connect(config.mongoURI ?? '', { serverSelectionTimeoutMS: 5_000 });
  try {
    for (const role of ['vendor', 'vendorAlt'] as const) {
      await mongoose.connection.db?.collection('vendors').deleteMany({
        ownerId: manifest.userIds[role],
      });
    }
  } finally {
    await mongoose.disconnect();
  }

  console.log(`reset vendor fixtures for ${manifest.runId}`);
};

const cleanup = async (): Promise<void> => {
  requireConfig();
  const manifest = readManifest();

  await Promise.all(Object.values(manifest.userIds).map(deleteSupabaseUser));
  for (const role of roles) rmSync(artifactPaths(role).dir, { recursive: true, force: true });

  await mongoose.connect(config.mongoURI ?? '', { serverSelectionTimeoutMS: 5_000 });
  try {
    const ids = Object.values(manifest.userIds);
    await mongoose.connection.db?.collection<UserDocument>('users').deleteMany({
      $or: [{ _id: { $in: ids } }, { e2eRun: manifest.runId }],
    });
    await mongoose.connection.db?.collection('vendors').deleteMany({ ownerId: { $in: ids } });
  } finally {
    await mongoose.disconnect();
  }

  rmSync(manifestPath, { force: true });
  console.log(`cleaned up ${manifest.runId}`);
};

const command = process.argv[2];
if (command === 'provision') await provision();
else if (command === 'assign-roles') await assignRoles();
else if (command === 'reset-fixtures') await resetFixtures();
else if (command === 'cleanup') await cleanup();
else throw new Error('Usage: provision | assign-roles | reset-fixtures | cleanup');
