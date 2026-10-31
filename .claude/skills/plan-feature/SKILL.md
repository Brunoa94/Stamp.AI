---
name: plan-feature
description: Interviews the user about a new feature and writes an implementation plan to docs/plans/. Run manually with /plan-feature.
argument-hint: "[short feature description]"
disable-model-invocation: true
---

# Plan Feature

Turns a feature idea into a plan file a fresh session can implement without re-asking anything. This skill only plans: it never edits `src/`, tests or config.

## 1. Get the idea

Take the feature description from `$ARGUMENTS`. If it is empty, ask in plain text: "What feature do you want to plan? One or two sentences is enough." Wait for the answer.

## 2. Read the code before asking

Answer from the code everything the code can answer, so the interview only covers decisions that are the user's. Look for:

- The slice it belongs to: `ls src/features`, and the slice's `ui/sections/` and `lib/` if it exists.
- The closest existing feature, to see how this kind of thing is already built here.
- Routes in `src/app/` it touches or sits next to.
- Data: Supabase tables in `supabase/types/` and `supabase/migrations/`, queries in `src/shared/queries/`, services, edge functions in `supabase/functions/`.
- Whether it touches payments, orders, AI generation or Printify/Stripe/PayPal/Mollie.
- Existing tests near it, including `tests/acceptance/`.
- Copy that would go in `src/i18n/messages/en.json`.

Read `.claude/rules/architecture.md`, `components.md` and `types.md` if they aren't loaded yet; the plan's file layout must follow them.

For a feature spanning several slices or a lot of unfamiliar code, launch one `Plan` agent with the description and the questions above instead of reading everything in the main session.

## 3. Interview

Use AskUserQuestion, **at most 3 rounds of up to 4 questions**. Every question gets 2–4 concrete options built from what step 2 found (real slice names, real routes, real tables), with the recommended one first and marked "(Recommended)". Skip any question the code already answered, and say in one line what you assumed instead.

Pick from these, in this order:

**Round 1: scope**
- Who is it for and what can they do afterwards (guest, signed-in user, admin)?
- Which slice: an existing one (name it) or a new one?
- Does it add a route, change one, or live inside an existing page?
- What is out of scope for this first version?

**Round 2: data and risk**
- Where does the data come from: existing table/query, new table or migration, an external API, static constants?
- Does it touch payments, orders, credits or AI generation?
- Should the new route be indexed by search engines?
- Analytics events to track?

**Round 3: done**
- Acceptance criteria: propose 3–5 from the answers so far and ask the user to pick or correct them (multiSelect).
- Should the plan include new acceptance tests under `tests/acceptance/`? (They are the protected spec; adding them needs the user's approval when implemented.)

Stop after round 3 even if something is still unclear. Unresolved points go into the plan's **Open questions**.

## 4. Write the plan

Write `docs/plans/<YYYY-MM-DD>-<feature-slug>.md` (today's date, kebab-case slug of 2–5 words) following [references/plan-template.md](references/plan-template.md). If the file exists, ask before overwriting.

Rules for the content:

- **Say what each test proves.** Each step names its test file and the behavior it checks. The TDD skill and hooks handle the red-green loop, so the plan doesn't describe it.
- **Real paths only.** Every file to create or change has its full path, laid out by the FSD rules. Mark new files `(new)`.
- **Small steps.** Each step is one red-green-refactor cycle a session can finish and verify on its own. Order them so the app builds after each one: types and helpers, then services and hooks, then UI, then the route.
- **Only what's specific to this feature.** Leave out anything the skills, rules and hooks already cover while implementing: which skill to load, loading/error/empty states, accessibility, SEO, the TDD loop, the pre-commit checks. Write down a convention only when this feature departs from it, or when the interview settled something it leaves open (for example a specific error message or an empty-state design).
- **No code.** Signatures and type shapes are fine when they remove ambiguity; implementations are not.

## 5. Hand off

Show the path to the plan, the step count and the open questions. Then ask: "Start implementing step 1?" Do nothing more until the user answers.

When the feature is merged, delete its plan file in the same PR or the next one. Plans are working documents, not docs.
