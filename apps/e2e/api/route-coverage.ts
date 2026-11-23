import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

export type HttpMethod = 'get' | 'post' | 'patch' | 'delete' | 'put';
export type ApiEndpoint = {
  method: Uppercase<HttpMethod>;
  path: string;
  key: string;
};

const root = process.cwd();
const apiRoot = path.join(root, 'apps/api/routes');
const e2eRoot = path.join(root, 'apps/e2e');
const methods = ['get', 'post', 'patch', 'delete', 'put'] as const;

const endpointKey = (method: string, endpointPath: string): string =>
  `${method.toUpperCase()} ${endpointPath}`;

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const pathPattern = (endpointPath: string): string =>
  endpointPath
    .split('/')
    .map((part) => (part.startsWith(':') ? '[^/`\'"]+' : escapeRegExp(part)))
    .join('/');

const collectSourceFiles = async (dir: string): Promise<string[]> => {
  const files: string[] = [];
  for (const entry of await readdir(dir, { recursive: true })) {
    if (typeof entry === 'string' && entry.endsWith('.ts')) files.push(path.join(dir, entry));
  }
  return files;
};

export const collectRegisteredEndpoints = async (): Promise<ApiEndpoint[]> => {
  const index = await readFile(path.join(apiRoot, 'index.ts'), 'utf8');
  const imports = [...index.matchAll(/import\s*\{\s*(\w+)\s*\}\s*from\s*['"]([^'"]+)['"]/g)].map(
    (match) => ({ name: match[1], spec: match[2] }),
  );
  const mounted = [...index.matchAll(/routes\.route\(['"]([^'"]+)['"],\s*(\w+)/g)].map((match) => ({
    prefix: match[1],
    factory: match[2],
  }));

  const endpoints: ApiEndpoint[] = [];
  for (const { prefix, factory } of mounted) {
    const imported = imports.find((candidate) => candidate.name === factory);
    if (imported === undefined) continue;

    const routeFile = imported.spec.startsWith('.')
      ? path.resolve(apiRoot, `${imported.spec}.ts`)
      : path.resolve(root, `${imported.spec}.ts`);
    const source = await readFile(routeFile, 'utf8');
    const routes = [...source.matchAll(/\.(get|post|patch|delete|put)\(\s*['"]([^'"]+)['"]/g)].map(
      (match) => ({ method: match[1], path: match[2] }),
    );

    for (const route of routes) {
      const fullPath = `${prefix}${route.path === '/' ? '' : route.path}`;
      endpoints.push({
        method: route.method.toUpperCase() as Uppercase<HttpMethod>,
        path: fullPath,
        key: endpointKey(route.method, fullPath),
      });
    }
  }

  return endpoints;
};

const normalizeE2ESource = async (): Promise<string> => {
  const routeConstants = Object.fromEntries(
    [
      ...(await readFile(path.join(e2eRoot, 'routes/api.routes.ts'), 'utf8')).matchAll(
        /^\s{2}(\w+):\s*'([^']+)'/gm,
      ),
    ].map((match) => [`apiRoutes.${match[1]}`, match[2]]),
  );

  const files = await collectSourceFiles(e2eRoot);
  const sources = await Promise.all(files.map((file) => readFile(file, 'utf8')));
  let source = sources.join('\n');

  for (const [token, value] of Object.entries(routeConstants)) {
    source = source.replaceAll(`\${${token}}`, value);
  }

  source = source.replace(
    /\.addRequest\([^,]+,\s*\w+,\s*'(get|post|patch|delete|put)',\s*(`[^`]+`|'[^']+'|"[^"]+")/g,
    (_match, method: string, endpointPath: string) => `.${method}(${endpointPath}`,
  );

  return source;
};

export const collectMissingEndpoints = async (): Promise<ApiEndpoint[]> => {
  const endpoints = await collectRegisteredEndpoints();
  const source = await normalizeE2ESource();
  const covered = new Set<string>();

  const declared = new Set(
    [...source.matchAll(/['"`]((?:GET|POST|PATCH|DELETE|PUT) [^'"`]+)['"`]/g)].map(
      (match) => match[1],
    ),
  );

  for (const endpoint of endpoints) {
    const pattern = new RegExp(
      `\\.${endpoint.method.toLowerCase()}\\(\\s*['\`"]${pathPattern(endpoint.path)}[^'\`"]*['\`"]`,
    );
    if (pattern.test(source) || declared.has(endpoint.key)) covered.add(endpoint.key);
  }

  const homeSections = ['categories', 'slides', 'promos', 'features', 'containers'];
  const usesHomeHelper = source.includes('`/home/admin/${path}`');
  if (usesHomeHelper) {
    for (const section of homeSections) {
      covered.add(endpointKey('post', `/home/admin/${section}`));
      covered.add(endpointKey('delete', `/home/admin/${section}`));
    }
  }

  return endpoints.filter((endpoint) => !covered.has(endpoint.key));
};
