# Claude Code Instructions

Docs index: `docs/README.md`. Every enforced rule: `docs/guardrails.md`.

## Where things live

- `.claude/rules/`: conventions, loaded when you read a matching file: `components.md` (`src/**/*.tsx`), `architecture.md` (`src/**`), `types.md` (`src/**/*.{ts,tsx}`). Read the relevant one before planning a change you haven't opened files for yet.
- `.claude/skills/`: task workflows, loaded by their descriptions.
- `.claude/hooks/`: guardrails registered in `.claude/settings.json`. Change a hook together with its test in `hooks/tests/` and run `npm run test:hooks`.

## Workflow

Before editing code under `src/`, load the `test-driven-development` skill and write the failing test first (the hooks reject edits otherwise). Update the existing doc a change affects instead of adding a markdown file per change. Before opening a PR, run `/review-frontend changes`.

## Pre-Commit Validation

Run `npm run knip` and `npm run fallow`, then check the change against `.claude/rules/`. ESLint, the pre-commit hook and the Claude Code hooks enforce the rest. Fix the code when a check fails; never use `--no-verify`.
