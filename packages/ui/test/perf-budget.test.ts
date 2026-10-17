import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const COMPONENT_ROOT = join(import.meta.dir, '../components');
const LIB_ROOT = join(import.meta.dir, '../lib');

const GET_CONTEXT_ALLOW = [
  join(LIB_ROOT, 'skin', 'capabilities.ts'),
  join(LIB_ROOT, 'depth', 'blurGovernor.ts'),
];

function walkTs(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walkTs(full, out);
    else if (/\.(t|j)sx?$/.test(name)) out.push(full);
  }
  return out;
}

function hasScrollListenerWithoutPassive(src: string): boolean {
  const re = /addEventListener\s*\(\s*['"]scroll['"]/g;
  for (const m of src.matchAll(re)) {
    const idx = m.index ?? 0;
    const after = src.slice(idx, idx + 120);
    if (!/passive\s*:\s*true/.test(after)) return true;
  }
  return false;
}

describe('engine perf enforcement (DESIGN.md §39 / todo/14)', () => {
  test('scroll listeners must be passive', () => {
    const files = walkTs(COMPONENT_ROOT).concat(walkTs(LIB_ROOT));
    const violations: string[] = [];
    for (const f of files) {
      const src = readFileSync(f, 'utf8');
      if (hasScrollListenerWithoutPassive(src)) violations.push(f);
    }
    expect(violations).toEqual([]);
  });

  test('setInterval requires clearInterval in the same component file', () => {
    const files = walkTs(COMPONENT_ROOT);
    const violations: string[] = [];
    for (const f of files) {
      const src = readFileSync(f, 'utf8');
      if (src.includes('setInterval(') && !src.includes('clearInterval(')) {
        violations.push(f);
      }
    }
    expect(violations).toEqual([]);
  });

  test('requestAnimationFrame requires cancelAnimationFrame in the same file', () => {
    const files = walkTs(COMPONENT_ROOT);
    const violations: string[] = [];
    for (const f of files) {
      const src = readFileSync(f, 'utf8');
      if (src.includes('requestAnimationFrame(') && !src.includes('cancelAnimationFrame(')) {
        violations.push(f);
      }
    }
    expect(violations).toEqual([]);
  });

  test('getContext may only live in allowed probe files', () => {
    const allowSet = new Set(GET_CONTEXT_ALLOW.map((p) => p.replace(/\\/g, '/')));
    const files = walkTs(COMPONENT_ROOT).concat(walkTs(LIB_ROOT));
    const violations: string[] = [];
    for (const f of files) {
      const norm = f.replace(/\\/g, '/');
      if (allowSet.has(norm)) continue;
      const src = readFileSync(f, 'utf8');
      if (src.includes('getContext(')) {
        violations.push(norm);
      }
    }
    expect(violations).toEqual([]);
  });
});
