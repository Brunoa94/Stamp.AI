# <Feature name>

- **Status**: Planned <!-- Planned | In progress | Done -->
- **Date**: <YYYY-MM-DD>
- **Slice**: `src/features/<slice>` <!-- (new) if it doesn't exist yet -->
- **Routes**: `/<path>` (`src/app/<...>/page.tsx`) <!-- or "none" -->

## Goal

<Two or three sentences: who it is for, what they can do afterwards, and why it matters.>

## Acceptance criteria

- [ ] <Observable behavior, written from the user's side>
- [ ] <...>

## Out of scope

- <What this version deliberately leaves out>

## Decisions

<!-- What the interview settled and what was assumed from the code, so nobody re-asks. -->

| Question | Decision | Source |
| -------- | -------- | ------ |
| <Data source> | <Existing `orders` table via `src/shared/queries/orderQueries.ts`> | Code |
| <Indexed by search engines?> | <No, noindex> | User |

## Files

| File | Change |
| ---- | ------ |
| `src/features/<slice>/lib/types/<name>.ts` (new) | <What it holds> |
| `src/features/<slice>/ui/sections/<Section>/<Section>.tsx` (new) | <...> |
| `src/i18n/messages/en.json` | <New keys under `<namespace>`> |

## Start

Work in a separate worktree branched from `dev`, never on the branch checked out in the main checkout:

```bash
git fetch origin
git worktree add .claude/worktrees/<feature-slug> -b feat/<feature-slug> origin/dev
cp <the gitignored .env* files in the repo root> .claude/worktrees/<feature-slug>/
cd .claude/worktrees/<feature-slug> && npm install
```

## Steps

### 1. <Short name>

- **Test first**: `<test file path>`: <behavior it checks, including the failing case>
- **Then**: <what to implement, in which files>
- **Done when**: <what to verify beyond the test passing, if anything>

### 2. <Short name>

- **Test first**: <...>
- **Then**: <...>
- **Done when**: <...>

## Acceptance tests

<!-- New files under tests/acceptance/ proposed by this plan, or "None". They are the protected spec: creating them needs the user's approval. -->

## Finish

After the last step and the acceptance tests pass, run `/review-frontend changes` and fix what it reports, then push `feat/<feature-slug>` and open a pull request against `dev` (not `main`). Delete this plan file in that pull request. After it merges, remove the worktree from the main checkout with `git worktree remove .claude/worktrees/<feature-slug>`.

## Open questions

- <Anything the interview didn't settle, and who decides it>
