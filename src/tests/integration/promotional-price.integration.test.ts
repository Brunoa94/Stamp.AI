import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { expect, it } from "vitest";

// A disposable empty database is required; the SQL fixture rolls everything back.
const databaseUrl = process.env.PROMOTIONS_TEST_DATABASE_URL;
it.skipIf(!databaseUrl)("enforces promotional price constraints in PostgreSQL", () => {
  const output = execFileSync("psql", [databaseUrl!, "-v", "ON_ERROR_STOP=1", "-f",
    resolve("supabase/tests/promotional_price.sql")], { encoding: "utf8" });
  expect(output).toContain("ALTER TABLE");
  expect(output).toContain("DO");
  expect(output).toContain("ROLLBACK");
});
