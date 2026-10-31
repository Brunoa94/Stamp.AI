# Imaginary Builder AI - Documentation

The architectural patterns, coding standards and guardrails for this project. Each topic lives in one file, read by both people and Claude Code.

## Conventions

| Topic | File | What it covers |
| ----- | ---- | -------------- |
| Entry point | [CLAUDE.md](../CLAUDE.md) | Map of `.claude/` (rules, skills, hooks), TDD workflow, pre-commit steps |
| Components | [.claude/rules/components.md](../.claude/rules/components.md) | SRP, DRY, atomicity, one component per file, no logic in JSX loops, design system, SVGs, styling |
| Architecture | [.claude/rules/architecture.md](../.claude/rules/architecture.md) | Feature-Sliced Design, `ui/` vs `lib/`, layers, slice boundaries, no barrels |
| Types | [.claude/rules/types.md](../.claude/rules/types.md) | Typing, database-derived types, `T`/`PropsI` naming |
| Guardrails | [guardrails.md](guardrails.md) | Every ESLint rule, pre-commit check and Claude Code hook, and what the TDD hooks gate |

The files under `.claude/rules/` have a `paths:` header, so Claude Code loads each one only when it works on matching files. Write them as normal docs; the header doesn't affect reading them.

## Skills

Task-specific guidance lives in Claude Code skills under `.claude/skills/`. Claude loads a skill when the task matches its description; people can read the `SKILL.md` files directly.

| Skill                      | Use it for                                                                                   |
| -------------------------- | -------------------------------------------------------------------------------------------- |
| `frontend-ui-engineering`  | Components, layouts, state, accessibility, responsive design, loading/error/empty states. Its `references/color-palette.md` is the color system. |
| `accessibility`            | Designing or reviewing interactive components to WCAG 2.2 AA: roles, names, keyboard, focus, live announcements, motion, contrast, a11y tests |
| `performance-optimization` | Measuring and fixing slow pages, interactions and API routes; Core Web Vitals                |
| `test-driven-development`  | Implementing logic, fixing bugs or changing behavior: red-green-refactor, reproduce bugs with a failing test first |
| `error-handling`           | Anything that can fail, from a component's async action to an API route: user-facing messages, pending states, error boundaries, logging. Its `references/payments.md` covers payments, orders and refunds: return states, idempotency, timeouts, recovery. |
| `seo`                      | Routes, page metadata, canonical/noindex, sitemap and robots, JSON-LD, heading structure: how the `src/features/seo` slice is used |
| `review-frontend`          | `/review-frontend [changes \| pr <n> \| feature <slice>]`: runs the reviewer agents below on one scope and merges their findings |

Rules that must always hold are not left to docs or skills: they are lint rules or hooks (see [guardrails.md](guardrails.md)).

## Agents

Read-only reviewer subagents live in `.claude/agents/`. Each one preloads the skills it reviews against, so the standard has a single source. They report findings and never edit code. `/review-frontend` launches them in parallel and merges their reports; fixes happen in the main session, where the TDD hooks apply.

| Agent | Reviews against | Checks |
| ----- | --------------- | ------ |
| `qa-reviewer` | `test-driven-development`, `error-handling`, `accessibility`, `frontend-ui-engineering` | Runs eslint, related unit tests, knip and fallow on the scope; missing tests, unhandled states, error handling, a11y gaps lint can't see |
| `seo-reviewer` | `seo` | Route registration, metadata, noindex, sitemap/robots, one `h1`, alt text, JSON-LD |
| `perf-reviewer` | `performance-optimization` | Client boundaries, heavy imports, images/LCP, query bounds and waterfalls, memoization; `next build` route sizes when the scope touches a render path |

When a reviewer keeps reporting the same mechanical issue, turn it into a lint rule or hook instead.

## Contributing

- Follow the established patterns in existing features and keep features consistent with Feature-Sliced Design.
- Update the topic file a change affects instead of adding a new markdown file per change. A new topic gets its own file in `.claude/rules/` (with a `paths:` header) or `docs/`, plus a row in the table above.
- Document significant architectural decisions.
