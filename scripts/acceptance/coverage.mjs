import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
const scenarios = [...readFileSync('docs/TEST_SCENARIOS.md', 'utf8').matchAll(/^\| ([A-Z]+-\d+) \|/gm)].map(m => m[1]);
const directories = ['tests/acceptance/specs', 'tests/acceptance/contracts'];
const files = directories.flatMap(dir => readdirSync(dir).filter(f => /\.(spec|test)\.mjs$/.test(f)).map(f => `${dir}/${f}`));
const sources = files.map(file => [file, readFileSync(file, 'utf8')]);
const rows = scenarios.map(id => {
  const matches = sources.filter(([, text]) => new RegExp(`\\b${id}\\b`).test(text)).map(([file]) => `[${file.split('/').pop()}](../../${file})`);
  return `| ${id} | ${matches.length ? matches.join(', ') : '**Not automated**'} |`;
});
writeFileSync('tests/acceptance/COVERAGE.md', `# Scenario traceability\n\nGenerated with \`npm run test:acceptance:coverage\`. A reference means one or more assertions exist; it does **not** prove every subcase in the scenario is implemented or passing. See [execution status and remaining work](README.md).\n\n${scenarios.length} scenario IDs; ${rows.filter(r => !r.includes('Not automated')).length} referenced by automated specifications.\n\n| Scenario | Specification references |\n| --- | --- |\n${rows.join('\n')}\n`);
console.log(`Generated traceability for ${scenarios.length} scenarios (${rows.filter(r => !r.includes('Not automated')).length} referenced).`);
