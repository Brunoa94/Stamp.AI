// Mirrors the production catalog snapshot into the test project.
//   node scripts/acceptance/sync-catalog.mjs           dry run: print differences
//   node scripts/acceptance/sync-catalog.mjs --apply   upsert snapshot rows
//   add --prune                                         also delete rows absent from production
//                                                       (catalog deletes cascade to product_seo)
import { createClient } from '@supabase/supabase-js';
import { loadEnvironment, required } from '../../tests/acceptance/support/environment.mjs';
import { loadCatalogSnapshot } from '../../tests/acceptance/support/catalog.mjs';

const env = loadEnvironment();
const apply = process.argv.includes('--apply');
const prune = process.argv.includes('--prune');
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, required(env, 'SUPABASE_SERVICE_ROLE_KEY'), { auth: { persistSession: false, autoRefreshToken: false } });
const snapshot = loadCatalogSnapshot();
const TABLES = [
  { name: 'catalog_products', key: ['blueprint_id'] },
  { name: 'product_variants', key: ['blueprint_id', 'printify_variant_id'] },
];
const id = (table, row) => table.key.map(key => row[key]).join(':');
const same = (key, a, b) => key.endsWith('_at') && a && b ? Date.parse(a) === Date.parse(b) : a === b;

async function readAll(table) {
  const rows = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from(table.name).select('*').range(from, from + 999);
    if (error) throw new Error(`${table.name}: ${error.message}`);
    rows.push(...data);
    if (data.length < 1000) return rows;
  }
}
async function diff(table) {
  const current = new Map((await readAll(table)).map(row => [id(table, row), row]));
  const wanted = snapshot[table.name];
  const changes = [];
  for (const want of wanted) {
    const got = current.get(id(table, want));
    if (!got) changes.push(`+ ${table.name} ${id(table, want)}`);
    else for (const [key, value] of Object.entries(want)) if (!same(key, value, got[key])) changes.push(`~ ${table.name} ${id(table, want)} ${key}: ${JSON.stringify(got[key])} -> ${JSON.stringify(value)}`);
  }
  const wantedIds = new Set(wanted.map(row => id(table, row)));
  const extra = [...current.values()].filter(row => !wantedIds.has(id(table, row)));
  for (const row of extra) changes.push(`- ${table.name} ${id(table, row)}${prune ? '' : ' (kept without --prune)'}`);
  return { changes, extra };
}
async function summarize() {
  const result = {};
  for (const table of TABLES) result[table.name] = await diff(table);
  return result;
}

const before = await summarize();
for (const table of TABLES) {
  const { changes } = before[table.name];
  const counts = ['+', '~', '-'].map(sign => changes.filter(change => change.startsWith(sign)).length);
  console.log(`${table.name}: ${counts[0]} to add, ${counts[1]} field changes, ${counts[2]} absent from production`);
  if (!apply) for (const change of changes) console.log(`  ${change}`);
}
if (!apply) process.exit(0);
// idx_catalog_products_product_of_month allows a single flagged row, so release
// the flag from rows production does not flag before the upsert moves it.
const flagged = snapshot.catalog_products.filter(row => row.is_product_of_month).map(row => row.blueprint_id);
const release = await db.from('catalog_products').update({ is_product_of_month: false }).eq('is_product_of_month', true).not('blueprint_id', 'in', `(${flagged.join(',')})`);
if (release.error) throw new Error(`catalog_products: ${release.error.message}`);
// Parents before children on upsert; children before parents on prune.
for (const table of TABLES) {
  const rows = snapshot[table.name];
  for (let i = 0; i < rows.length; i += 500) {
    const { error } = await db.from(table.name).upsert(rows.slice(i, i + 500), { onConflict: table.key.join(',') });
    if (error) throw new Error(`${table.name}: ${error.message}`);
  }
}
if (prune) {
  for (const table of [...TABLES].reverse()) {
    for (const row of before[table.name].extra) {
      let query = db.from(table.name).delete();
      for (const key of table.key) query = query.eq(key, row[key]);
      const { error } = await query;
      if (error) throw new Error(`${table.name}: ${error.message}`);
    }
  }
}
const after = await summarize();
const remaining = TABLES.flatMap(table => after[table.name].changes.filter(change => prune || !change.startsWith('-')));
if (remaining.length) { console.error(`Sync incomplete:\n${remaining.join('\n')}`); process.exitCode = 1; }
else console.log('Test catalog matches the production snapshot.');
