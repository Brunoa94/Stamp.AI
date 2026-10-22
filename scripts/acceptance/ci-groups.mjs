import { spawnSync } from 'node:child_process';
import { appendFileSync, readdirSync } from 'node:fs';

// CI runs each group × project as its own job on its own runner: separate port 3107,
// .acceptance ledgers and final cleanup. Tests never share rows (each creates and
// removes its own account), so groups only share the deployed test project, which
// the workflow deploys once before any group starts.
// Balanced by measured desktop minutes (CI run 38232090113); mobile is similar.
const GROUPS = {
  catalog: ['catalog-products'], // 7.5
  orders: ['orders-page', 'payments', 'webhook-integrity'], // 6.5
  studio: ['recovery-quality', 'placement-cart-actions', 'customization', 'auth-lifecycle'], // 6.3
  checkout: ['price-integrity', 'settlement', 'cart-checkout', 'printify-orders', 'promotions-address', 'security'], // 6.1
  browse: ['navigation-auth', 'history-catalog', 'analytics', 'stamp'], // 5.7
};
const SPECS = 'tests/acceptance/specs';

// Every spec must belong to exactly one group, or CI would silently skip it.
const onDisk = readdirSync(SPECS).filter(f => f.endsWith('.spec.mjs')).map(f => f.slice(0, -'.spec.mjs'.length));
const assigned = Object.values(GROUPS).flat();
const problems = [
  ...onDisk.filter(spec => !assigned.includes(spec)).map(spec => `${spec}.spec.mjs is in no group`),
  ...assigned.filter((spec, i) => assigned.indexOf(spec) !== i).map(spec => `${spec}.spec.mjs is in more than one group`),
  ...assigned.filter(spec => !onDisk.includes(spec)).map(spec => `${spec}.spec.mjs does not exist`),
];
if (problems.length) {
  console.error(`Update GROUPS in scripts/acceptance/ci-groups.mjs:\n${problems.join('\n')}`);
  process.exit(1);
}

// List what the run will execute (arguments such as --grep-invert pass through), so a
// project/group pair without runnable tests gets no job instead of a "No tests found" failure.
const list = spawnSync(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', '--config=playwright.acceptance.config.mjs', '--list', '--reporter=json', ...process.argv.slice(2)], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
if (list.status !== 0) {
  console.error(list.stderr || list.stdout);
  process.exit(1);
}
const report = JSON.parse(list.stdout);
const runnable = new Set();
const walk = suite => {
  for (const spec of suite.specs ?? []) for (const test of spec.tests) runnable.add(`${test.projectName} ${spec.file}`);
  (suite.suites ?? []).forEach(walk);
};
report.suites.forEach(walk);

const include = report.config.projects.flatMap(({ name: project }) => Object.entries(GROUPS).flatMap(([group, specs]) => {
  const files = specs.filter(spec => runnable.has(`${project} ${spec}.spec.mjs`)).map(spec => `${SPECS}/${spec}.spec.mjs`);
  return files.length ? [{ project, group, specs: files.join(' ') }] : [];
}));
for (const job of include) console.log(`${job.project} · ${job.group}: ${job.specs}`);
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `matrix=${JSON.stringify({ include })}\n`);
