# Guardrails

These patterns are enforced by tools, so neither people nor agents can drift from them. When a check fails, fix the code. Never bypass the pre-commit hook with `--no-verify`.

## ESLint (`eslint.config.mjs`)

- Design-system components instead of raw HTML elements; no inline `<svg>`; styling in cva variants or inline JSX ([components](../.claude/rules/components.md))
- Design tokens only: no arbitrary color classes (`bg-[#7C3AED]`), no hex literals in components, no arbitrary spacing (`p-[13px]`)
- Accessibility: jsx-a11y recommended rules
- No data fetching in UI components ([architecture → Layers](../.claude/rules/architecture.md#layers))
- No direct `toast.error`: errors reach the user through `useErrorHandler`
- [Slice boundaries](../.claude/rules/architecture.md#slice-boundaries)
- No barrel exports

## Git pre-commit hook

`.githooks/pre-commit`, installed by `npm install`: ESLint on the staged files, `tsc --noEmit`, then `vitest related` on the staged `src/` files. A commit that breaks a rule, the types or a related unit test is rejected.

## Claude Code hooks

In `.claude/hooks/`, registered in `.claude/settings.json`, tested by `npm run test:hooks`.

- `protect-acceptance-tests.mjs`: editing acceptance tests needs approval (also from the shell)
- `guard-dangerous-commands.mjs`: `rm -rf`, `git push --force`, `git reset --hard`, installing new dependencies, changes to the remote Supabase project (`db push`, `db reset --linked`, `functions deploy|delete`, `secrets set|unset`, `migration repair`) and `psql` against a non-local host need approval. Looks inside `bash -c` and `npx`.
- `enforce-slice-boundaries.mjs`: edits that add a slice-boundary violation are rejected (existing violations in a file don't block unrelated edits)
- `block-shell-source-writes.mjs`: shell commands that write `src/` source code (`sed -i`, heredocs, `tee`, `cp`, `mv` from outside `src/`) are rejected; source is edited with Edit/Write/MultiEdit so the hooks above and below see it. Renames inside `src/` and shell writes to tests, styles and docs are fine.
- `enforce-test-first.mjs`: an Edit/Write that changes the behavior of gated source code is rejected until a **covering** test has been written or changed in the same session (also from the shell), and Claude is sent to the `test-driven-development` skill
- `remove-new-tests-before-commit.mjs`: unit tests written during a feature's TDD loop are not committed. A `git commit` whose index adds a unit test under `src/`, or a `git push` whose unpushed commits add one, is rejected with the tests to delete. Changes to existing tests, hook tests and acceptance specs are allowed.

### What the TDD hooks gate

- **Gated**: logic under `src/`: hooks, helpers, services, queries, mappers, API routes, middleware, providers.
- **Not gated**: tests; presentational code (`ui/` folders, the design system `src/features/ui` and `src/shared/ui`, `src/app` pages and layouts, `.tsx` components elsewhere in a slice outside `lib/`); `lib/variants/` (styling); `constants/` (static data); types. Acceptance tests, lint and `tsc` cover these.
- **Not a behavior change**: edits that only touch import/re-export statements, comments or formatting (moving a module and updating its imports, documenting, reformatting).

A test **covers** a source file when it imports it, directly or through other modules (including a module that doesn't exist yet: the red step for a new file), or has the same base name (`total.ts` ↔ `total.test.ts`), or sits in the source's folder, a `__tests__` folder there, or an ancestor folder at slice/module depth or deeper (`src/features/<slice>/__tests__/` covers the whole slice; `src/__tests__/` covers nothing). See `isBehaviorFile` and `isRelatedTest` in `.claude/hooks/tdd-files.mjs`, `test-imports.mjs` and `behavior-change.mjs`.

## Cleanup

Run before verifying: `npm run knip` for unused files, exports and dependencies; `npm run fallow` for duplicated code. Both run in CI (`.github/workflows/ci.yml`) on every pull request and on pushes to `main`:

- **Fallow** blocks: it fails once duplication passes the ratchet in `.fallowrc.jsonc` (6.9%). Lower the threshold as clones get removed.
- **Knip** is advisory (`continue-on-error`) until its backlog of findings is cleared; then it becomes blocking too.
