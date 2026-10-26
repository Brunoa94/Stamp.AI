# Claude Code Instructions

## Project Patterns

Core patterns, types, components, architecture and guardrails (imported, so it is always loaded):

@docs/README.md

Task-specific guidance is in skills under `.claude/skills/` (listed in `docs/README.md` → Skills). Before editing code under `src/`, load `test-driven-development` and write the failing test first.

## Pre-Commit Validation

Before committing any code, verify it follows the patterns documented in `docs/`. If code violates these patterns, refactor it before committing.

The git pre-commit hook and the Claude Code hooks enforce these rules; `docs/README.md` → Guardrails lists every one. Fix the code when a check fails. Never bypass the hook with `--no-verify`.
