/**
 * Task 03 — UI test-gate, enforced mechanically.
 *
 * Runs the validator order from AGENTS.md and exits non-zero on the FIRST
 * failing step, so "green" is a property of the repo, not a habit:
 *
 *   lint  biome check packages/ui   (read-only; use `bun run lint:fix` to write)
 *   types bun run typecheck         (tsc --noEmit, every workspace)
 *   test  bun test                  (behavior + perf + snapshot)
 *   build next build                (the app the UI ships into)
 *
 * Lint scope is the UI surface the workflow owns (`packages/ui`); apps/api and
 * apps/web are not yet biome-clean, so they are deliberately out of scope here.
 *
 * Usage:
 *   bun run gate              full gate (lint → types → test → build)
 *   bun run gate --no-build   skip the (slow) build step for local iteration
 */
import { spawnSync } from 'node:child_process';

interface Step {
  label: string;
  cmd: string[];
}

const withBuild = !process.argv.includes('--no-build');

const steps: Step[] = [
  { label: 'lint  biome check packages/ui', cmd: ['biome', 'check', 'packages/ui'] },
  { label: 'types bun run typecheck', cmd: ['bun', 'run', 'typecheck'] },
  { label: 'test  bun test', cmd: ['bun', 'test'] },
];
if (withBuild) {
  steps.push({
    label: 'build bun run --filter web build',
    cmd: ['bun', 'run', '--filter', 'web', 'build'],
  });
}

const results: { label: string; ms: number; code: number }[] = [];
let failed = false;

for (const step of steps) {
  const started = performance.now();
  process.stdout.write(`\n\x1b[1m▸ ${step.label}\x1b[0m\n`);
  const { status } = spawnSync(step.cmd[0], step.cmd.slice(1), { stdio: 'inherit' });
  const code = status ?? 1;
  const ms = performance.now() - started;
  results.push({ label: step.label, ms, code });
  if (code !== 0) {
    failed = true;
    break;
  }
}

const secs = (ms: number) => `${(ms / 1000).toFixed(1)}s`;
process.stdout.write('\n\x1b[1m── gate summary ──\x1b[0m\n');
for (const r of results) {
  const mark = r.code === 0 ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m';
  process.stdout.write(`  ${mark} ${r.label}  \x1b[2m(${secs(r.ms)})\x1b[0m\n`);
}
if (failed) {
  const skipped = steps.length - results.length;
  process.stdout.write(`\x1b[31m\nGATE FAILED\x1b[0m — ${skipped} step(s) skipped.\n`);
} else {
  process.stdout.write('\x1b[32m\nGATE PASSED\x1b[0m\n');
}
process.exit(failed ? 1 : 0);
