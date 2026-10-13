/**
 * Skin compiler driver — DESIGN.md §37.
 *
 * Reads packages/ui/skins/*.ts and writes one generated CSS file per skin to
 * apps/web/public/skins/<id>.css. Only `/skins/system.css` is shipped by
 * default; the rest load on demand (§38.1).
 *
 * Run: bun run build:skins   (root package.json)
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileSkinCss } from '../lib/skin/compile';
import type { Skin } from '../lib/skin/types';
import { bundledSkins } from '../skins/index';

const here = dirname(fileURLToPath(import.meta.url));
// resolve() collapses symlinks so the cwd-clone location can never redirect the
// output outside the repo (§37: exactly one generated file per skin, in the app).
const OUT_DIR = resolve(here, '../../../apps/web/public/skins');

const lookup = (id: string): Skin | undefined => bundledSkins.find((s) => s.id === id);

mkdirSync(OUT_DIR, { recursive: true });

let failures = 0;
for (const skin of bundledSkins) {
  try {
    const css = compileSkinCss(skin, lookup);
    const out = join(OUT_DIR, `${skin.id}.css`);
    writeFileSync(out, css);
    const kb = (Buffer.byteLength(css) / 1024).toFixed(1);
    console.log(`  ✓ ${skin.id}.css (${kb} KB)`);
  } catch (err) {
    failures += 1;
    console.error(`  ✗ ${skin.id}: ${(err as Error).message}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures} skin(s) failed validation (§41) — build aborted.`);
  process.exit(1);
}
console.log(`\nCompiled ${bundledSkins.length} skins → ${OUT_DIR}`);
