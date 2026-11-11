#!/usr/bin/env bun
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dir, '..');
const SCAN_ROOTS = ['apps/api', 'packages'];
const IGNORED_DIRS = new Set(['node_modules', 'dist', '.next', '.turbo', 'coverage']);

const ALIASES: Record<string, string> = {
  '@ecomerece/domain': 'packages/domain',
  '@ecomerece/contracts': 'packages/contracts',
  '@ecomerece/shared': 'packages/shared',
  '@ecomerece/frontend': 'packages/frontend',
};

interface Violation {
  rule: string;
  file: string;
  specifier: string;
  target: string;
}

interface Dependency {
  specifier: string;
  typeOnly: boolean;
}

/**
 * Collect static imports, dynamic imports, requires, and re-exports so a
 * cross-module dependency cannot hide behind an `export … from` barrel file.
 */
function collectDependencies(contents: string): Dependency[] {
  const dependencies: Dependency[] = [];

  const importRe =
    /import\s+([\s\S]*?)\s+from\s+['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]\s*\)|require\s*\(\s*['"]([^'"]+)['"]\s*\)|import\s+['"]([^'"]+)['"]/g;
  for (let match = importRe.exec(contents); match; match = importRe.exec(contents)) {
    const clause = match[1];
    const specifier = match[2] ?? match[3] ?? match[4] ?? match[5];
    if (!specifier) continue;
    dependencies.push({
      specifier,
      typeOnly: clause !== undefined && /^type\b/.test(clause.trim()),
    });
  }

  const reexportRe = /export\s+(type\s+)?(?:\*|\{[^}]*\})\s+from\s+['"]([^'"]+)['"]/g;
  for (let match = reexportRe.exec(contents); match; match = reexportRe.exec(contents)) {
    dependencies.push({
      specifier: match[2],
      typeOnly: match[1] !== undefined,
    });
  }

  return dependencies;
}

function toPosix(value: string): string {
  return value.split(path.sep).join('/');
}

function relativeToRoot(absolute: string): string {
  return toPosix(path.relative(ROOT, absolute));
}

async function isFile(candidate: string): Promise<boolean> {
  try {
    return (await stat(candidate)).isFile();
  } catch {
    return false;
  }
}

async function resolveRelative(fromFile: string, specifier: string): Promise<string> {
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    `${base}.js`,
    `${base}.jsx`,
    path.join(base, 'index.ts'),
    path.join(base, 'index.tsx'),
  ];

  for (const candidate of candidates) {
    if (await isFile(candidate)) return candidate;
  }

  return base;
}

async function* walk(dir: string): AsyncGenerator<string> {
  let entries: Awaited<ReturnType<typeof readdir>>;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (process.env.ARCH_DEBUG === 'true') console.error('readdir failed', dir, error);
    return;
  }
  if (process.env.ARCH_DEBUG === 'true') console.error('walk', dir, entries.length);

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name)) continue;
      yield* walk(path.join(dir, entry.name));
      continue;
    }
    if (!/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) continue;
    yield path.join(dir, entry.name);
  }
}

function moduleOf(target: string): string | null {
  const match = target.match(/^apps\/api\/modules\/([^/]+)\//);
  return match ? match[1] : null;
}

function checkPackageRules(
  source: string,
  specifier: string,
  target: string,
  typeOnly: boolean,
): Violation | null {
  if (!source.startsWith('packages/')) return null;

  if (target.startsWith('apps/')) {
    return { rule: 'packages-must-not-import-apps', file: source, specifier, target };
  }

  if (source.startsWith('packages/domain/')) {
    if (specifier.startsWith('@ecomerece/contracts') || target.startsWith('packages/contracts/')) {
      return { rule: 'domain-must-not-import-contracts', file: source, specifier, target };
    }
    // Type-only imports are erased at compile time and are the established way
    // the domain shares DTO vocabulary with packages/shared.
    if (
      !typeOnly &&
      (specifier.startsWith('@ecomerece/shared') || target.startsWith('packages/shared/'))
    ) {
      return { rule: 'domain-must-not-import-shared', file: source, specifier, target };
    }
  }

  return null;
}

function checkModuleRules(source: string, specifier: string, target: string): Violation | null {
  const sourceModule = moduleOf(source);
  const targetModule = moduleOf(target);
  if (!sourceModule || !targetModule) return null;
  if (sourceModule === targetModule) return null;

  return { rule: 'no-cross-module-internals', file: source, specifier, target };
}

function checkMiddlewareRules(source: string, specifier: string, target: string): Violation | null {
  if (!source.startsWith('apps/api/middleware/')) return null;
  if (!/^apps\/api\/modules\/[^/]+\/infrastructure\//.test(target)) return null;

  return {
    rule: 'middleware-must-not-import-module-infrastructure',
    file: source,
    specifier,
    target,
  };
}

function checkCommandBus(source: string, specifier: string, target: string): Violation | null {
  if (!/command-bus/i.test(specifier) && !/command-bus/i.test(target)) return null;

  return { rule: 'command-bus-removed', file: source, specifier, target };
}

async function main(): Promise<void> {
  const violations: Violation[] = [];
  const files: string[] = [];

  for (const root of SCAN_ROOTS) {
    for await (const file of walk(path.join(ROOT, root))) files.push(file);
  }

  if (process.env.ARCH_DEBUG === 'true') {
    console.error(`root=${ROOT} files=${files.length}`);
  }

  for (const file of files) {
    const source = relativeToRoot(file);
    const contents = await readFile(file, 'utf8');

    for (const { specifier, typeOnly } of collectDependencies(contents)) {
      let target: string;
      if (specifier.startsWith('.')) {
        target = relativeToRoot(await resolveRelative(file, specifier));
      } else {
        const alias = Object.keys(ALIASES).find(
          (key) => specifier === key || specifier.startsWith(`${key}/`),
        );
        if (!alias) continue;
        const suffix = specifier === alias ? '' : specifier.slice(alias.length + 1);
        target = suffix ? `${ALIASES[alias]}/${suffix}` : ALIASES[alias];
      }

      const violation =
        checkPackageRules(source, specifier, target, typeOnly) ??
        checkModuleRules(source, specifier, target) ??
        checkMiddlewareRules(source, specifier, target) ??
        checkCommandBus(source, specifier, target);

      if (violation) violations.push(violation);
    }
  }

  const unique = new Map<string, Violation>();
  for (const violation of violations) {
    const key = `${violation.rule}|${violation.file}|${violation.specifier}`;
    if (!unique.has(key)) unique.set(key, violation);
  }

  const result = [...unique.values()].sort(
    (a, b) => a.file.localeCompare(b.file) || a.rule.localeCompare(b.rule),
  );

  if (result.length === 0) {
    console.log(`✔ architecture check passed (${files.length} files)`);
    return;
  }

  for (const violation of result) {
    console.error(
      `${violation.file}: [${violation.rule}] ${violation.specifier} -> ${violation.target}`,
    );
  }
  console.error(`\n✖ ${result.length} architecture violation(s)`);
  process.exit(1);
}

await main();
