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

## Open questions

- <Anything the interview didn't settle, and who decides it>
