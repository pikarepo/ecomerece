import type { Context, Next } from 'hono';
import { connectDB } from '../lib/mongo';

export const dbMiddleware = async (c: Context, next: Next) => {
  await connectDB();
  await next();
};
