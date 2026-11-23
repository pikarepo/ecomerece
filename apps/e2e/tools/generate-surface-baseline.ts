import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { collectRegisteredEndpoints } from '../api/route-coverage';
import { endpointKey } from '../api/surface';

/**
 * Regenerates the route surface baseline. Run after an intentional route
 * addition: `bun apps/e2e/tools/generate-surface-baseline.ts`.
 */
const target = path.join(process.cwd(), 'apps/e2e/api/surface-baseline.ts');

const content = async (): Promise<string> => {
  const endpoints = await collectRegisteredEndpoints();
  const keys = endpoints.map((endpoint) => endpointKey(endpoint.method, endpoint.path)).sort();
  const body = keys.map((key) => `  '${key}',`).join('\n');
  return `/**
 * Generated from the mounted route source by apps/e2e/tools/generate-surface-baseline.ts.
 * A diff here means the HTTP surface changed: review it, then regenerate.
 */
export const surfaceBaseline: readonly string[] = [
${body}
];
`;
};

await writeFile(target, await content(), 'utf8');
console.log(`Wrote ${target}.`);
