import { readFileSync, readdirSync, statSync } from 'node:fs';
import { extname, join, relative, resolve, sep } from 'node:path';

const ROOT = resolve(import.meta.dir, '..');
const IGNORED_DIRS = new Set([
  '.git',
  '.next',
  '.turbo',
  '.cache',
  '.bun',
  '.vercel',
  'node_modules',
  'dist',
  'build',
  'out',
  'coverage',
]);

const CODE_EXTENSIONS = new Set([
  'c',
  'cc',
  'cpp',
  'cjs',
  'css',
  'cs',
  'go',
  'gradle',
  'html',
  'java',
  'js',
  'jsx',
  'kt',
  'less',
  'mjs',
  'php',
  'py',
  'rb',
  'rs',
  'scss',
  'sh',
  'sql',
  'svelte',
  'swift',
  'ts',
  'tsx',
  'vue',
]);

const TEXT_EXTENSIONS = new Set([
  'env',
  'gitattributes',
  'gitignore',
  'json',
  'lock',
  'md',
  'npmrc',
  'properties',
  'scss',
  'toml',
  'txt',
  'yaml',
  'yml',
]);

const DOTFILE_NAMES = new Set(['.env', '.env.example', '.gitattributes', '.gitignore', '.npmrc']);
const SPECIAL_NAMES = new Set(['Dockerfile', 'Makefile']);
const MODULE_ROOTS = new Map([
  ['apps/api/modules/', 'api'],
  ['packages/domain/modules/', 'domain'],
]);
const COMPACT_UNITS = [
  { value: 1e15, suffix: 'P' },
  { value: 1e12, suffix: 'T' },
  { value: 1e9, suffix: 'B' },
  { value: 1e6, suffix: 'M' },
  { value: 1e3, suffix: 'k' },
];

type Category = 'code' | 'text' | 'binary';

type FileReport = {
  path: string;
  ext: string;
  category: Category;
  bytes: number;
  lines: number;
  nonBlankLines: number;
  blankLines: number;
  words: number;
};

type Totals = {
  files: number;
  bytes: number;
  lines: number;
  nonBlankLines: number;
  blankLines: number;
  words: number;
};

const emptyTotals = (): Totals => ({
  files: 0,
  bytes: 0,
  lines: 0,
  nonBlankLines: 0,
  blankLines: 0,
  words: 0,
});

function addTo(totals: Totals, file: FileReport): void {
  totals.files += 1;
  totals.bytes += file.bytes;
  totals.lines += file.lines;
  totals.nonBlankLines += file.nonBlankLines;
  totals.blankLines += file.blankLines;
  totals.words += file.words;
}

function walk(dir: string, files: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (IGNORED_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, files);
    else files.push(full);
  }
  return files;
}

function toRepoPath(absolute: string): string {
  return relative(ROOT, absolute).split(sep).join('/');
}

function extOf(path: string): string {
  const name = path.split('/').at(-1) ?? '';
  if (DOTFILE_NAMES.has(name) || SPECIAL_NAMES.has(name)) return name.toLowerCase();
  const ext = extname(name).slice(1).toLowerCase();
  return ext === '' ? 'none' : ext;
}

function categoryOf(ext: string): Category {
  if (CODE_EXTENSIONS.has(ext) || ext.startsWith('dockerfile') || ext === 'makefile') return 'code';
  if (TEXT_EXTENSIONS.has(ext) || ext.startsWith('env') || ext.endsWith('ignore')) return 'text';
  return 'binary';
}

function countText(source: string) {
  if (source.length === 0) {
    return { lines: 0, nonBlankLines: 0, blankLines: 0, words: 0 };
  }
  const normalized = source.replace(/\r\n?/g, '\n');
  const lines = normalized.endsWith('\n')
    ? normalized.slice(0, -1).split('\n')
    : normalized.split('\n');
  const blankLines = lines.filter((line) => line.trim().length === 0).length;
  return {
    lines: lines.length,
    nonBlankLines: lines.length - blankLines,
    blankLines,
    words: (normalized.match(/\S+/g) ?? []).length,
  };
}

function inspectFile(absolute: string): FileReport {
  const path = toRepoPath(absolute);
  const ext = extOf(path);
  const category = categoryOf(ext);
  const bytes = statSync(absolute).size;
  const base = { path, ext, category, bytes };
  if (category === 'binary') {
    return { ...base, lines: 0, nonBlankLines: 0, blankLines: 0, words: 0 };
  }
  return { ...base, ...countText(readFileSync(absolute, 'utf8')) };
}

function groupTotals(
  items: FileReport[],
  keyOf: (item: FileReport) => string,
): Map<string, Totals> {
  const groups = new Map<string, Totals>();
  for (const item of items) {
    const key = keyOf(item);
    let group = groups.get(key);
    if (!group) {
      group = emptyTotals();
      groups.set(key, group);
    }
    addTo(group, item);
  }
  return groups;
}

function workspaceOf(path: string): string {
  const [first, second] = path.split('/');
  if (first === 'apps' || first === 'packages') return `${first}/${second}`;
  return 'root';
}

function moduleOf(path: string): string | undefined {
  for (const [prefix, label] of MODULE_ROOTS) {
    if (!path.startsWith(prefix)) continue;
    const remainder = path.slice(prefix.length);
    if (!remainder.includes('/')) continue;
    const module = remainder.split('/')[0];
    if (module) return `${label}/${module}`;
  }
  return undefined;
}

function pad(value: string | number, width: number): string {
  return String(value).padEnd(width);
}

function padStart(value: string | number, width: number): string {
  return String(value).padStart(width);
}

function compact(value: number): string {
  for (const unit of COMPACT_UNITS) {
    if (value < unit.value) continue;
    const scaled = value / unit.value;
    const rounded = scaled >= 100 ? Math.round(scaled) : Math.round(scaled * 10) / 10;
    return `${rounded}${unit.suffix}`;
  }
  return String(value);
}

function printTotals(label: string, totals: Totals): void {
  console.log(
    `${pad(label, 28)} ${padStart(compact(totals.files), 6)} ${padStart(
      compact(totals.lines),
      10,
    )} ${padStart(compact(totals.nonBlankLines), 10)} ${padStart(
      compact(totals.words),
      10,
    )} ${padStart(compact(totals.bytes), 12)}`,
  );
}

function printTable(title: string, groups: Map<string, Totals>): void {
  console.log(`\n${title}`);
  console.log(
    `${pad('GROUP', 28)} ${padStart('FILES', 6)} ${padStart('LINES', 10)} ${padStart('NONBLANK', 10)} ${padStart('WORDS', 10)} ${padStart('BYTES', 12)}`,
  );
  const sorted = [...groups.entries()].sort((a, b) => b[1].lines - a[1].lines);
  for (const [key, totals] of sorted) printTotals(key, totals);
}

function printModuleMatrix(files: FileReport[]): void {
  const modules = new Map<string, Totals>();
  for (const file of files) {
    const module = moduleOf(file.path);
    if (!module) continue;
    let totals = modules.get(module);
    if (!totals) {
      totals = emptyTotals();
      modules.set(module, totals);
    }
    addTo(totals, file);
  }
  printTable('MODULE CODE MATRIX', modules);
}

const files = walk(ROOT).map(inspectFile);
const codeFiles = files.filter((file) => file.category === 'code');
const totals = emptyTotals();
const byCategory = groupTotals(files, (file) => file.category);
const codeByWorkspace = groupTotals(codeFiles, (file) => workspaceOf(file.path));
const byExtension = groupTotals(files, (file) => file.ext);
for (const file of files) addTo(totals, file);

console.log('REPOSITORY COUNT REPORT');
console.log(`Root: ${toRepoPath(ROOT) || '.'}`);
console.log(`Ignored dirs: ${[...IGNORED_DIRS].sort().join(', ')}`);
console.log('\nTOTALS');
console.log(`${pad('FILES', 28)} ${padStart(compact(totals.files), 6)}`);
console.log(`${pad('LINES', 28)} ${padStart(compact(totals.lines), 10)}`);
console.log(`${pad('NONBLANK LINES', 28)} ${padStart(compact(totals.nonBlankLines), 10)}`);
console.log(`${pad('BLANK LINES', 28)} ${padStart(compact(totals.blankLines), 10)}`);
console.log(`${pad('WORDS', 28)} ${padStart(compact(totals.words), 10)}`);
console.log(`${pad('BYTES', 28)} ${padStart(compact(totals.bytes), 12)}`);

printTable('FULL APP CODE MATRIX', codeByWorkspace);
printModuleMatrix(codeFiles);
printTable('BY CATEGORY', byCategory);
printTable('BY EXTENSION', byExtension);
