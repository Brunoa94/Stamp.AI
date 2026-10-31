---
name: review-frontend
description: Runs the QA, SEO and performance reviewer agents in parallel on the current changes, a GitHub PR, or a whole feature slice, and merges their findings into one ranked report. Use when the user asks to review frontend work, to run QA/SEO/performance checks, or before opening a PR.
argument-hint: "[changes | pr <number> | feature <slice>] [--no-measure]"
---

# Review Frontend

Runs the read-only reviewers in `.claude/agents/` — `qa-reviewer`, `seo-reviewer` and `perf-reviewer` — on one scope and merges what they find. The reviewers never edit code. The user picks which findings to fix, and the fixes are made in the main session, where the TDD hooks apply.

## 1. Pick the mode

Read the mode from the arguments (`$ARGUMENTS`):

| Argument | Mode |
| -------- | ---- |
| `changes` | Current changes on this branch |
| `pr <number>` | A GitHub pull request |
| `feature <slice>` | Every file of one feature slice |

If there are no arguments or they don't match, ask with AskUserQuestion: "What should I review?" with options "Current changes", "A pull request" and "A feature", then ask for the PR number or slice name. `--no-measure` turns off the perf build (see step 3).

## 2. Resolve the scope

The scope is what every reviewer receives: **working directory**, **base ref**, **files**, **routes**.

**Current changes**
- Working directory: the repo root. Base ref: `main`.
- Files: the union of `git diff --name-only main...HEAD`, `git diff --name-only HEAD` and `git ls-files --others --exclude-standard`, keeping files that still exist.

**Pull request `<n>`**
- `gh pr view <n> --json number,title,baseRefName,headRefName,files` gives the base ref and the file list.
- Check out the PR head without touching the user's working tree:
  ```sh
  git fetch origin pull/<n>/head
  git worktree add --detach .claude/worktrees/review-pr-<n> FETCH_HEAD
  ln -s "$PWD/node_modules" .claude/worktrees/review-pr-<n>/node_modules
  ```
  If that worktree already exists, remove it first with `git worktree remove --force`.
- Working directory: `.claude/worktrees/review-pr-<n>`. Base ref: `origin/<baseRefName>`.

**Feature `<slice>`**
- The slice must exist as `src/features/<slice>/`. If it doesn't, list the slices and ask.
- Working directory: the repo root. Base ref: `main`.
- Files: everything under `src/features/<slice>/`, plus the `src/app/**` files that import `@/features/<slice>/` (`grep -rl "@/features/<slice>/" src/app`).

Then, for every mode:
- Keep only reviewable files: `src/**`, `supabase/functions/**`, `src/i18n/messages/**`. If nothing is left, say so and stop.
- **Routes**: map each `src/app/**/page.tsx` in scope to its URL path. For components in scope, find the pages that render them by grepping `src/app` for their imports.

## 3. Choose the reviewers

| Reviewer | Runs when the scope has |
| -------- | ----------------------- |
| `qa-reviewer` | any file (always) |
| `seo-reviewer` | `src/app/**`, `src/features/seo/**`, `src/i18n/messages/**`, or any `.tsx` under a `ui/` folder (headings and alt text live in components) |
| `perf-reviewer` | any `.tsx`, or anything under `lib/hooks/`, `src/shared/queries/` or `src/app/**` |

Perf **measures** (runs `next build`) when the scope includes a `page.tsx`, a `layout.tsx` or a `"use client"` file, unless `--no-measure` was passed.

Tell the user in one line which reviewers you're launching and why any were skipped.

## 4. Launch them in parallel

Launch every chosen reviewer in **one message** with the Agent tool (`subagent_type` = the agent name, `run_in_background: false`). Give each the same scope block:

```
Mode: <changes | pr #n "title" | feature <slice>>
Working directory: <absolute path>
Base ref: <ref>
Files in scope:
- <path>
Routes in scope:
- <url path> (<page file>)
Measure: yes | no        # perf-reviewer only
```

## 5. Merge and report

- Combine the findings tables into one table with a **Reviewer** column, ranked high → low.
- Merge duplicates (same location, same problem): keep the higher severity and list both reviewers.
- Keep each reviewer's extra sections (QA checks, pre-existing failures, routes reviewed, measurement) below the table.
- Don't add findings of your own and don't soften theirs. If a reviewer failed or returned nothing usable, say so.

Finish with: "Which of these should I fix?" Apply nothing until the user answers.

## 6. Clean up

In PR mode, remove the worktree once the report is out: `git worktree remove --force .claude/worktrees/review-pr-<n>`.
