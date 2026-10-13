import mongoose from 'mongoose';

// ------------------------------------------------------------------
// 1. Configuration
// ------------------------------------------------------------------
mongoose.set('strict', 'throw');

// Ensure MONGO_URI is defined and treat it as a string
const MONGO_URI: string = process.env.MONGO_URI as string;
if (!MONGO_URI) {
  throw new Error('MONGO_URI environment variable is required');
}

// Timeouts – fail fast instead of waiting 30 seconds
const CONNECTION_OPTIONS: mongoose.ConnectOptions = {
  serverSelectionTimeoutMS: 5000, // 5s to find a server
  socketTimeoutMS: 45000, // 45s for socket inactivity
  // Add other options as needed (e.g., retryWrites, etc.)
};

// ------------------------------------------------------------------
// 2. Cache (global, to reuse connection across HMR / hot reload)
// ------------------------------------------------------------------
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Use globalThis to persist across module reloads (important in dev)
const globalWithCache = globalThis as typeof globalThis & {
  mongooseCache?: MongooseCache;
};

const cache: MongooseCache = globalWithCache.mongooseCache ?? {
  conn: null,
  promise: null,
};
globalWithCache.mongooseCache = cache;

// ------------------------------------------------------------------
// 3. Core connection function with retry logic
// ------------------------------------------------------------------
async function connectWithRetry(retries = 5, initialDelay = 1000): Promise<typeof mongoose> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[DB] Connecting to MongoDB (attempt ${attempt}/${retries})...`);
      const connection = await mongoose.connect(MONGO_URI, CONNECTION_OPTIONS);
      console.log('[DB] Successfully connected to MongoDB');
      return connection;
    } catch (err) {
      lastError = err;
      console.error(`[DB] Connection attempt ${attempt} failed:`, err);

      if (attempt === retries) break;

      // Exponential backoff: 1s, 2s, 4s, 8s, ...
      const delay = initialDelay * 2 ** (attempt - 1);
      console.log(`[DB] Waiting ${delay}ms before retrying...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All retries exhausted
  console.error('[DB] All connection retries failed');
  throw lastError;
}

// ------------------------------------------------------------------
// 4. Public connectDB function (with promise caching)
// ------------------------------------------------------------------
export async function connectDB(): Promise<typeof mongoose> {
  // If we already have a live connection, return it
  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  // If there's a pending connection attempt, wait for it
  if (cache.promise) {
    try {
      cache.conn = await cache.promise;
      return cache.conn;
    } catch (err) {
      // The promise failed – clear it so we can retry on next call
      cache.promise = null;
      cache.conn = null;
      // Re-throw so the current request fails; next request will retry
      throw err;
    }
  }

  // No cached connection or promise – start a new one
  cache.promise = connectWithRetry()
    .then((conn) => {
      cache.conn = conn;
      return conn;
    })
    .catch((err) => {
      // On failure, clear the promise so future calls can retry
      cache.promise = null;
      cache.conn = null;
      throw err;
    });

  cache.conn = await cache.promise;
  return cache.conn;
}

// ------------------------------------------------------------------
// 5. Health check – returns true if DB is ready
// ------------------------------------------------------------------
export async function checkDBHealth(): Promise<boolean> {
  try {
    // If we have a cached connection and it's ready, ping it
    if (cache.conn && mongoose.connection.readyState === 1) {
      // Use optional chaining to avoid "db is undefined" error
      const db = mongoose.connection.db;
      if (!db) return false;
      await db.admin().ping();
      return true;
    }
    // Otherwise try a fresh connection (with retries, but we want a quick check)
    // We can attempt to connect with a shorter timeout, but for simplicity,
    // we'll just call connectDB and if it fails, we catch.
    await connectDB();
    return true;
  } catch {
    return false;
  }
}

// ------------------------------------------------------------------
// 6. Event listeners – optional, for logging / recovery
// ------------------------------------------------------------------
mongoose.connection.on('connected', () => {
  console.log('[DB] Mongoose connected');
});

mongoose.connection.on('disconnected', () => {
  console.warn('[DB] Mongoose disconnected – will reconnect on next request');
  // Clear the cache so the next request triggers a fresh connection
  cache.conn = null;
  cache.promise = null;
});

mongoose.connection.on('error', (err) => {
  console.error('[DB] Mongoose connection error:', err);
  // Do not clear cache here – the error might be transient, we let the driver handle it.
  // If the connection is lost, 'disconnected' will fire and clear the cache.
});

mongoose.connection.on('reconnected', () => {
  console.info('[DB] Mongoose reconnected');
});

// ------------------------------------------------------------------
// 7. Graceful shutdown (for production)
// ------------------------------------------------------------------
export async function disconnectDB(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log('[DB] Disconnected from MongoDB');
  }
  cache.conn = null;
  cache.promise = null;
}

// Handle process termination signals
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});
