import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import app from './app';
import { createApplication } from './composition-root';
import { registerErrorHandler } from './errors/error-handler';
import { dbMiddleware } from './middleware/db.middleware';
import { rateLimiter } from './middleware/rateLimiter';
import { requestGuards } from './middleware/requestguard.middleware';
import { statsBufferService } from './modules/stats/application/StatsBufferService';
import { createRoutes } from './routes';

const application = createApplication();
const { productStatsSyncScheduler } = application.modules.stats;

const corsOrigins = (process.env.CORS_ORIGIN ?? '').split(',').filter((o) => o).map((o) => o.trim());
app.use(logger());
//  middleware
app.use(
  '*',
  secureHeaders({
    contentSecurityPolicy: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
    },
    xFrameOptions: 'DENY',
    xContentTypeOptions: 'nosniff',
    referrerPolicy: 'no-referrer',
  }),
);
app.use(
  '*',
  cors({
    origin: corsOrigins,
    credentials: true,
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(
  '*',
  ...requestGuards({
    maxUrlLength: 200,
    maxQueryLength: 200,
    maxParamLength: 50,
    maxBodyBytes: 7_000_000,
    maxJsonDepth: 5,
    maxJsonNodes: 50,
  }),
);

app.use('*', rateLimiter);
app.use('*', dbMiddleware);

app.options('*', (c) => {
  return c.text('');
});

app.route('/', createRoutes(application));

registerErrorHandler(app);

statsBufferService.startBackgroundFlushing(5000);
productStatsSyncScheduler.start(60_000);
for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.once(signal, () => {
    void statsBufferService.shutdown();
    productStatsSyncScheduler.stop();
    process.exit(0);
  });
}

export default {
  port: 8000,
  fetch: app.fetch,
  reusePort: true,
};
