import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

type JsonOutputLine = string | { text?: string };

type JsonTestResult = {
  status: string;
  stdout?: JsonOutputLine[];
  stderr?: JsonOutputLine[];
  error?: { message?: string };
  annotations?: Array<{ type?: string; description?: string }>;
};

type JsonTest = {
  results?: JsonTestResult[];
};

type JsonSpec = {
  title: string;
  file?: string;
  line?: number;
  tests?: JsonTest[];
};

type JsonSuite = {
  title?: string;
  file?: string;
  suites?: JsonSuite[];
  specs?: JsonSpec[];
};

type JsonReport = {
  suites?: JsonSuite[];
};

type SpecRecord = {
  file: string;
  line: number;
  title: string;
  fullTitle: string;
  status: string;
  stdout: string[];
  stderr: string[];
  error: string | undefined;
  annotations: Array<{ type: string; description: string }>;
};

const reportPath = path.resolve(process.cwd(), 'apps/e2e/test-results/results.json');
const outputDir = path.resolve(process.cwd(), 'report/e2e');

const modules = [
  'address',
  'cart',
  'category',
  'health',
  'home',
  'inventory',
  'notifications',
  'order',
  'order-items',
  'order-request',
  'payments',
  'payouts',
  'product',
  'product-variant',
  'promotions',
  'reviews',
  'returns',
  'shipping',
  'stats',
  'user',
  'vendor',
] as const;

type ModuleName = (typeof modules)[number];

const scenarios = [
  'Concurrency testing',
  'Race-condition testing',
  'Transaction testing',
  'Idempotency testing',
  'Boundary testing',
  'Negative testing',
  'Validation testing',
  'Authentication testing',
  'Authorization testing',
  'Rate-limit testing',
  'Data-integrity testing',
  'Error-handling testing',
  'Retry testing',
  'Timeout testing',
  'Cache testing',
  'Recovery testing',
] as const;

const endpointToModule = (endpointPath: string): ModuleName => {
  const segment = endpointPath.split('/')[1] ?? '';
  const mapping: Record<string, ModuleName> = {
    address: 'address',
    cart: 'cart',
    category: 'category',
    health: 'health',
    home: 'home',
    'product-inventory': 'inventory',
    notification: 'notifications',
    order: 'order',
    'order-items': 'order-items',
    'order-request': 'order-request',
    payment: 'payments',
    payout: 'payouts',
    product: 'product',
    'product-variant': 'product-variant',
    promotion: 'promotions',
    review: 'reviews',
    return: 'returns',
    shipping: 'shipping',
    stats: 'stats',
    users: 'user',
    vendor: 'vendor',
  };
  return mapping[segment] ?? 'health';
};

const specToModule = (fileName: string): ModuleName => {
  const name = fileName.split('/').at(-1) ?? '';
  const mapping: Record<string, ModuleName> = {
    '00-health.spec.ts': 'health',
    '01-route-auth-matrix.spec.ts': 'health',
    '02-route-coverage.spec.ts': 'health',
    'catalog.spec.ts': 'product',
    'inventory.spec.ts': 'inventory',
    'money.spec.ts': 'payments',
    'orders.spec.ts': 'order',
  };
  return mapping[name] ?? 'health';
};

const flowToModule = (title: string): ModuleName => {
  if (/oversell|idempotency key|partially invalid|invalid quantity/i.test(title)) return 'order';
  if (/capture/i.test(title)) return 'payments';
  if (/coupon/i.test(title)) return 'promotions';
  if (/payout|ledger/i.test(title)) return 'payouts';
  if (/return/i.test(title)) return 'returns';
  if (/vendor/i.test(title)) return 'vendor';
  if (/rate.limit|malformed json|short timeout|public responses/i.test(title)) return 'health';
  return 'health';
};

const moduleFor = (record: SpecRecord): ModuleName => {
  const file = record.file.split('/').at(-1) ?? '';
  if (file === '10-all-endpoints-exploit-matrix.spec.ts') {
    const key = record.title.split(' :: ')[0] ?? '';
    const endpointPath = key.split(' ')[1] ?? '/health';
    return endpointToModule(endpointPath);
  }
  if (
    file === '11-concurrency-race-idempotency.spec.ts' ||
    file === '12-transaction-integrity.spec.ts'
  ) {
    return flowToModule(record.title);
  }
  if (file === '13-rate-limit-timeout-cache.spec.ts') return 'health';
  return specToModule(file);
};

const scenariosFor = (record: SpecRecord): string[] => {
  const title = record.fullTitle.toLowerCase();
  const matched: string[] = [];
  if (/concurrent|oversell|race/.test(title)) {
    matched.push('Concurrency testing', 'Race-condition testing');
  }
  if (
    /transaction|partially invalid|invalid quantity|over-limit|over-return|foreign vendor/.test(
      title,
    )
  ) {
    matched.push('Transaction testing', 'Data-integrity testing');
  }
  if (/idempot/.test(title)) matched.push('Idempotency testing');
  if (/boundary/.test(title)) matched.push('Boundary testing');
  if (/negative|hostile|malformed|traversal/.test(title)) matched.push('Negative testing');
  if (/validation|boundary|negative/.test(title)) matched.push('Validation testing');
  if (/anonymous|forged|bearer/.test(title)) matched.push('Authentication testing');
  if (/authorization|buyer authorization|foreign|scope/.test(title))
    matched.push('Authorization testing');
  if (/rate.limit|spoof/.test(title)) matched.push('Rate-limit testing');
  if (/error handling|malformed|rejected/.test(title)) matched.push('Error-handling testing');
  if (/retry|replay/.test(title)) matched.push('Retry testing');
  if (/timeout/.test(title)) matched.push('Timeout testing');
  if (/cache/.test(title)) matched.push('Cache testing');
  if (/recovery|retry|recovers/.test(title)) matched.push('Recovery testing');
  return [...new Set(matched)];
};

const collectRecords = (suites: JsonSuite[], parentTitle = ''): SpecRecord[] => {
  const records: SpecRecord[] = [];
  for (const suite of suites) {
    const suiteTitle = [parentTitle, suite.title ?? ''].filter(Boolean).join(' › ');
    for (const spec of suite.specs ?? []) {
      const fullTitle = [suiteTitle, spec.title].filter(Boolean).join(' › ');
      for (const test of spec.tests ?? []) {
        for (const result of test.results ?? []) {
          records.push({
            file: spec.file ?? suite.file ?? '',
            line: spec.line ?? 0,
            title: spec.title,
            fullTitle,
            status: result.status,
            stdout: (result.stdout ?? []).flatMap((line) =>
              (typeof line === 'string' ? line : (line.text ?? '')).split('\n'),
            ),
            stderr: (result.stderr ?? []).flatMap((line) =>
              (typeof line === 'string' ? line : (line.text ?? '')).split('\n'),
            ),
            error: result.error?.message,
            annotations: (result.annotations ?? [])
              .filter((annotation) => annotation.type !== undefined)
              .map((annotation) => ({
                type: annotation.type ?? '',
                description: annotation.description ?? '',
              })),
          });
        }
      }
    }
    records.push(...collectRecords(suite.suites ?? [], suiteTitle));
  }
  return records;
};

const loadRecords = async (): Promise<SpecRecord[] | undefined> => {
  try {
    const report = JSON.parse(await readFile(reportPath, 'utf8')) as JsonReport;
    return collectRecords(report.suites ?? []);
  } catch (error) {
    console.log(`Failed to load e2e results: ${String(error)}`);
    return undefined;
  }
};

const renderReport = (module: ModuleName, records: SpecRecord[]): string => {
  const passed = records.filter((record) => record.status === 'passed').length;
  const failed = records.filter((record) => record.status === 'failed').length;
  const skipped = records.filter((record) => record.status === 'skipped').length;
  const covered = new Set(records.flatMap((record) => scenariosFor(record)));
  const evidence = records
    .flatMap((record) => record.stdout.filter((line) => line.startsWith('[E2E-')))
    .filter((line, index, lines) => lines.indexOf(line) === index);
  const findings = records.flatMap((record) =>
    record.annotations
      .filter((annotation) => annotation.type.startsWith('finding:'))
      .map((annotation) => `- ${annotation.type}: ${annotation.description} (${record.fullTitle})`),
  );
  const failures = records
    .filter((record) => record.status === 'failed')
    .map(
      (record) =>
        `- ${record.fullTitle} — \`${record.file}:${record.line}\`${
          record.error === undefined ? '' : `\n  - ${record.error.split('\n')[0]}`
        }`,
    );

  const rows = scenarios
    .map((scenario) => `| ${scenario} | ${covered.has(scenario) ? 'Yes' : 'No'} |`)
    .join('\n');

  return `# E2E Findings — ${module}

Command: \`bun run test:e2e:report\`
Result: **${passed} pass / ${failed} fail / ${skipped} skipped** (${records.length} results).

## Scenario coverage

| Scenario | Covered |
|---|---|
${rows}

## Failures

${failures.length === 0 ? 'None.' : failures.join('\n')}

## Findings

${findings.length === 0 ? 'No finding annotations.' : findings.join('\n')}

## Evidence

${evidence.length === 0 ? 'No evidence emitted.' : evidence.map((line) => `\`${line}\``).join('\n')}
`;
};

type FailureCategory =
  | 'Hostile input returns HTTP 500'
  | 'Authentication/authorization bypass'
  | 'Fixture setup rejected with HTTP 400'
  | 'Cache/replay mismatch'
  | 'Rate-limit enforcement gap'
  | 'Public scope security decision'
  | 'Fixture cleanup failed'
  | 'Other';

const categoryMeanings: Record<FailureCategory, string> = {
  'Hostile input returns HTTP 500':
    'Malformed queries/payloads reach an unhandled path. Treat as a real error-handling finding.',
  'Authentication/authorization bypass':
    'Anonymous, forged-token, buyer-scope or foreign-id probes succeeded. Triage public-route allowlist first, then treat remaining cases as authz defects.',
  'Fixture setup rejected with HTTP 400':
    'Preconditions were rejected before the exploit assertion ran. Not evidence of the tested defect.',
  'Cache/replay mismatch':
    'Repeated public responses differ or carry private state. Needs response-policy review.',
  'Rate-limit enforcement gap':
    'The limiter did not return 429 or a spoofed forwarding header changed the bucket.',
  'Public scope security decision':
    'A vendor/admin scoped route is declared public. Needs an explicit security decision.',
  'Fixture cleanup failed':
    'Test teardown failed after the scenario ran. Separate harness issue from product behavior.',
  Other: 'Unclassified failure; inspect the listed error and evidence.',
};

const failureCategory = (record: SpecRecord): FailureCategory => {
  const message = record.error ?? '';
  if (/crashed on a hostile payload|produced server errors/i.test(message)) {
    return 'Hostile input returns HTTP 500';
  }
  if (
    /allowed an anonymous caller|accepted a forged bearer token|allowed a buyer into|foreign\/absent id/i.test(
      message,
    )
  ) {
    return 'Authentication/authorization bypass';
  }
  if (/Expected a successful response, received 400/i.test(message)) {
    return 'Fixture setup rejected with HTTP 400';
  }
  if (/Cleanup failed/i.test(message)) return 'Fixture cleanup failed';
  if (/declared public/i.test(message)) return 'Public scope security decision';
  if (/limiter never returned 429|bypassed the .* bucket/i.test(message)) {
    return 'Rate-limit enforcement gap';
  }
  if (/cache|replay/i.test(record.title)) return 'Cache/replay mismatch';
  return 'Other';
};

const endpointFor = (record: SpecRecord): string => {
  const marker = ' :: ';
  const separator = record.fullTitle.lastIndexOf(marker);
  if (separator >= 0) return record.fullTitle.slice(separator + marker.length);
  const sections = record.fullTitle.split(' › ');
  return sections.at(-1) ?? record.title;
};

const shortError = (record: SpecRecord): string =>
  (record.error ?? 'No error message.').split('\n')[0]?.replace(/\s+/g, ' ').trim() ??
  'No error message.';

const failureSignature = (record: SpecRecord): string =>
  (record.error ?? 'No error message.')
    .split('\n')[0]
    ?.replace(new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g'), '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^Error:\s*(GET|POST|PUT|PATCH|DELETE)\s+\S+\s+/, '')
    .replace(/^Error:\s*/, '') ?? 'No error message.';

const signatureCounts = (records: SpecRecord[]): Map<string, number> => {
  const counts = new Map<string, number>();
  for (const record of records) {
    const signature = failureSignature(record);
    counts.set(signature, (counts.get(signature) ?? 0) + 1);
  }
  return new Map([...counts.entries()].sort((left, right) => right[1] - left[1]));
};

const renderFullFailureReport = (records: SpecRecord[]): string => {
  const failures = records.filter((record) => record.status === 'failed');
  const byCategory = new Map<FailureCategory, SpecRecord[]>();
  for (const failure of failures) {
    const category = failureCategory(failure);
    byCategory.set(category, [...(byCategory.get(category) ?? []), failure]);
  }

  const byFile = new Map<string, number>();
  for (const failure of failures) {
    byFile.set(failure.file, (byFile.get(failure.file) ?? 0) + 1);
  }

  const categoryRows = [...byCategory.entries()]
    .sort((left, right) => right[1].length - left[1].length)
    .map(([category, rows]) => `| ${category} | ${rows.length} | ${categoryMeanings[category]} |`)
    .join('\n');

  const fileRows = [...byFile.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([file, count]) => `| ${file} | ${count} |`)
    .join('\n');

  const signatureRows =
    [...signatureCounts(failures).entries()]
      .map(([signature, count]) => `| ${count} | ${signature} |`)
      .join('\n') || '| 0 | none |';

  const details = [...byCategory.entries()]
    .sort((left, right) => right[1].length - left[1].length)
    .map(([category, rows]) => {
      const items = rows
        .map((record) => {
          const evidence = record.stdout.find((line) => line.startsWith('[E2E-')) ?? 'No evidence.';
          return `- \`${record.file}:${record.line}\` **${endpointFor(record)}** — ${shortError(record)}\n  - ${evidence}`;
        })
        .join('\n');
      return `## ${category} (${rows.length})\n\n${categoryMeanings[category]}\n\n${items}`;
    })
    .join('\n\n');

  return `# E2E Full Failure Report

Total: **${failures.length} failures** from the Playwright JSON run at
\`apps/e2e/test-results/results.json\`.

## Categories

| Category | Count | Meaning |
|---|---:|---|
${categoryRows}

## Failures by file

| File | Count |
|---|---:|
${fileRows}

## Failure signatures

| Count | Signature |
|---:|---|
${signatureRows}

${details}
`;
};

const renderPending = (module: ModuleName): string => `# E2E Findings — ${module}

Status: **PENDING**. No Playwright JSON results were found at \`apps/e2e/test-results/results.json\`.

Run with a disposable test database and role tokens:

\`\`\`bash
bun run test:e2e:report
\`\`\`

This report is regenerated by \`scripts/generate-e2e-reports.ts\`.
`;

const records = await loadRecords();
await mkdir(outputDir, { recursive: true });

for (const module of modules) {
  const moduleRecords = records?.filter((record) => moduleFor(record) === module) ?? [];
  const content =
    records === undefined ? renderPending(module) : renderReport(module, moduleRecords);
  await writeFile(path.join(outputDir, `${module}.md`), content);
}

const indexRows = modules
  .map((module) => `| ${module} | [FINDINGS-e2e/${module}.md](./${module}.md) |`)
  .join('\n');
await writeFile(
  path.join(outputDir, 'README.md'),
  `# E2E Module Reports\n\n| Module | Report |\n|---|---|\n${indexRows}\n| all failures | [FAILURES-all.md](./FAILURES-all.md) |\n`,
);

if (records !== undefined) {
  await writeFile(
    path.join(outputDir, 'FAILURES-all.md'),
    renderFullFailureReport(records),
    'utf8',
  );
}

console.log(`Generated ${modules.length + 1} e2e reports in ${outputDir}.`);
