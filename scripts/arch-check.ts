/**
 * Module and package boundary check.
 *
 * `bun run arch` must fail when a layer or module reaches into another module's
 * internals. Rules:
 *  - domain never imports apps, contracts, frontend, or runtime code from shared
 *  - a domain module never imports another domain module (use the shared kernel)
 *  - an API module never imports another API module's internals (use contracts)
 *  - application never imports presentation; infrastructure never imports presentation
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

const ROOT = resolve(import.meta.dir, '..');
const IGNORED_DIRS = new Set(['node_modules', '.next', 'dist', 'coverage', '.git']);

const ALIASES: Record<string, string> = {
  '@ecomerece/domain': 'packages/domain',
  '@ecomerece/contracts': 'packages/contracts',
  '@ecomerece/shared': 'packages/shared',
  '@ecomerece/frontend': 'packages/frontend',
};

type Violation = { file: string; rule: string; specifier: string };

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (IGNORED_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else if (entry.endsWith('.ts') && !entry.endsWith('.test.ts')) files.push(full);
  }
  return files;
}

function toRepoPath(absolute: string): string {
  return relative(ROOT, absolute).split(sep).join('/');
}

function resolveSpecifier(file: string, specifier: string): string | null {
  if (specifier.startsWith('.')) {
    return toRepoPath(resolve(dirname(file), specifier)).replace(/\.(ts|tsx|js)$/, '');
  }

  for (const [alias, target] of Object.entries(ALIASES)) {
    if (specifier === alias) return target;
    if (specifier.startsWith(`${alias}/`)) {
      return `${target}/${specifier.slice(alias.length + 1)}`.replace(/\.(ts|tsx|js)$/, '');
    }
  }

  return null;
}

function importsOf(source: string): { specifier: string; typeOnly: boolean }[] {
  const imports: { specifier: string; typeOnly: boolean }[] = [];
  // Multi-line import/export clauses are common, so match up to `from '...'`.
  const fromPattern =
    /(?:^|\n)\s*(?:import|export)\s+(type\s+)?([\s\S]*?)\bfrom\s+['"]([^'"]+)['"]/g;
  const sideEffectPattern = /(?:^|\n)\s*import\s+['"]([^'"]+)['"]/g;
  const dynamicPattern = /import\(\s*['"]([^'"]+)['"]\s*\)/g;

  for (const match of source.matchAll(fromPattern)) {
    imports.push({ specifier: match[3], typeOnly: Boolean(match[1]) });
  }
  for (const match of source.matchAll(sideEffectPattern)) {
    imports.push({ specifier: match[1], typeOnly: false });
  }
  for (const match of source.matchAll(dynamicPattern)) {
    imports.push({ specifier: match[1], typeOnly: false });
  }

  return imports;
}

function moduleName(path: string, base: string): string | null {
  const prefix = `${base}/`;
  if (!path.startsWith(prefix)) return null;
  const rest = path.slice(prefix.length);
  const slash = rest.indexOf('/');
  if (slash !== -1) return rest.slice(0, slash);
  // A bare name is either the modules barrel (`index.ts`) or a module folder.
  return rest.includes('.') ? null : rest;
}

function checkApiModule(file: string, target: string): string | null {
  const source = moduleName(file, 'apps/api/modules');
  const destination = moduleName(target, 'apps/api/modules');
  if (!source || !destination || source === destination) return null;

  // Cross-module reads/writes go through packages/contracts, never internals.
  return `API module "${source}" imports module "${destination}" internals`;
}

function checkApiLayers(file: string, target: string): string | null {
  const source = moduleName(file, 'apps/api/modules');
  const destination = moduleName(target, 'apps/api/modules');
  if (!source || !destination || source !== destination) return null;

  const sourceLayer = file.split('/')[4];
  const destinationLayer = target.split('/')[4];

  // Known convention: message/template helpers live in presentation but are
  // pure value builders used by application services. Controllers are not.
  if (
    sourceLayer === 'application' &&
    destinationLayer === 'presentation' &&
    !target.endsWith('.messages')
  ) {
    return 'application layer imports presentation';
  }
  if (sourceLayer === 'infrastructure' && destinationLayer === 'presentation') {
    return 'infrastructure layer imports presentation';
  }
  if (sourceLayer === 'presentation' && destinationLayer === 'infrastructure') {
    return 'presentation imports infrastructure directly (inject a port instead)';
  }
  return null;
}

function checkDomainModule(file: string, target: string): string | null {
  const source = moduleName(file, 'packages/domain/modules');
  const destination = moduleName(target, 'packages/domain/modules');
  if (!source || !destination || source === destination) return null;

  return `domain module "${source}" imports module "${destination}" (use the shared kernel)`;
}

function check(file: string, specifier: string, typeOnly: boolean): Violation[] {
  const target = resolveSpecifier(file, specifier);
  if (!target) return [];

  const repoFile = toRepoPath(file);
  const violations: Violation[] = [];
  const add = (rule: string) => violations.push({ file: repoFile, rule, specifier });

  if (repoFile.startsWith('packages/domain/')) {
    if (target.startsWith('apps/') || target.startsWith('packages/contracts')) {
      add('domain must not import apps or contracts');
    }
    if (target.startsWith('packages/frontend')) {
      add('domain must not import frontend code');
    }
    if (target === 'packages/shared' || target.startsWith('packages/shared/')) {
      if (!typeOnly) add('domain must not runtime-import shared (type-only imports are allowed)');
    }
    const moduleRule = checkDomainModule(repoFile, target);
    if (moduleRule) add(moduleRule);
  }

  if (repoFile.startsWith('packages/contracts/') && target.startsWith('apps/')) {
    add('contracts must not import apps');
  }

  if (repoFile.startsWith('apps/api/modules/')) {
    const moduleRule = checkApiModule(repoFile, target);
    if (moduleRule) add(moduleRule);
    const layerRule = checkApiLayers(repoFile, target);
    if (layerRule) add(layerRule);
  }

  return violations;
}

const files = [
  ...walk(join(ROOT, 'apps/api')),
  ...walk(join(ROOT, 'packages/domain')),
  ...walk(join(ROOT, 'packages/contracts')),
  ...walk(join(ROOT, 'packages/shared')),
];

const violations: Violation[] = [];
for (const file of files) {
  const source = readFileSync(file, 'utf8');
  for (const { specifier, typeOnly } of importsOf(source)) {
    violations.push(...check(file, specifier, typeOnly));
  }
}

if (violations.length === 0) {
  console.log(`arch: OK (${files.length} files checked)`);
  process.exit(0);
}

console.error(`arch: ${violations.length} boundary violation(s):`);
for (const violation of violations.slice(0, 100)) {
  console.error(`  ${violation.file} -> ${violation.specifier}: ${violation.rule}`);
}
if (violations.length > 100) console.error(`  ... and ${violations.length - 100} more`);
process.exit(1);
