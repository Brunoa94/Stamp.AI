import { test } from "node:test";
import assert from "node:assert/strict";
import { decide } from "../guard-dangerous-commands.mjs";

const bash = (command) => ({ tool_name: "Bash", tool_input: { command } });
const flagged = (command) => decide(bash(command)) !== null;

test("flags destructive git and file commands", () => {
  for (const command of ["rm -rf node_modules", "rm -fr x", "rm --recursive --force x", "git push --force", "git push -f origin main", "git push origin +main", "git reset --hard HEAD~1"]) {
    assert.ok(flagged(command), command);
  }
});

test("flags installing new dependencies but not a plain install", () => {
  assert.ok(flagged("npm install zod"));
  assert.ok(flagged("npm i -D vitest"));
  assert.ok(flagged("pnpm add zod"));
  assert.ok(!flagged("npm install"));
  assert.ok(!flagged("npm ci"));
});

test("flags changes to the remote Supabase project", () => {
  for (const command of [
    "supabase db push",
    "SUPABASE_DB_PASSWORD=x supabase db push",
    "npx supabase db push",
    "supabase db reset --linked",
    "supabase functions deploy mollie-webhook",
    "supabase functions delete old-fn",
    "supabase secrets set KEY=value",
    "supabase secrets unset KEY",
    "supabase migration repair --status applied 2026",
  ]) {
    assert.ok(flagged(command), command);
  }
});

test("leaves local and read-only Supabase commands alone", () => {
  for (const command of ["supabase db reset", "supabase start", "supabase status", "supabase functions list", "supabase secrets list", "supabase gen types typescript --local"]) {
    assert.ok(!flagged(command), command);
  }
});

test("flags psql against a remote database, not a local one", () => {
  assert.ok(flagged('PGPASSWORD=x psql "postgresql://postgres:x@db.abc.supabase.co:5432/postgres" -c "select 1"'));
  assert.ok(flagged("psql -h db.abc.supabase.co -U postgres"));
  assert.ok(!flagged("psql postgresql://postgres:postgres@127.0.0.1:54322/postgres"));
  assert.ok(!flagged("psql -h localhost -U postgres"));
});

test("looks inside bash -c and sh -c", () => {
  assert.ok(flagged('bash -c "rm -rf src"'));
  assert.ok(flagged("sh -c 'git push --force'"));
});

test("finds the command in any segment of a chain", () => {
  assert.ok(flagged("npm test && git push --force"));
});

test("leaves ordinary commands alone", () => {
  for (const command of ["git status", "git push", "rm file.txt", "npm run test:unit", "ls -la"]) {
    assert.ok(!flagged(command), command);
  }
});

test("ignores tools other than Bash", () => {
  assert.equal(decide({ tool_name: "Write", tool_input: { file_path: "rm -rf" } }), null);
});
