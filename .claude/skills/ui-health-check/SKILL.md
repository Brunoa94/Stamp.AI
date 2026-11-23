---
name: ui-health-check
description: Opens every page of the app in a real browser (Chrome DevTools MCP) at phone, tablet and desktop sizes, scrolls through each one, opens its popups, selects, menus, tooltips and accordions, and reports what looks broken or breaks design good practice. Does not test feature flows. Run manually with /ui-health-check; the qa-reviewer agent also runs it on every page during /review-frontend.
argument-hint: "[all | <route> ...] [--url <base-url>] [--quick] [--no-auth]"
disable-model-invocation: true
---

# UI Health Check

Opens the app in a browser and looks at it the way a visitor would: on several screen sizes, scrolling from top to bottom, opening every popup, select and menu on the way. It reports what is broken (errors, failed requests, broken images, layout overflow) and what breaks design good practice (spacing, hierarchy, contrast, tap targets, the stamp design system).

It checks **how pages look and how their UI controls behave**. It does **not** test feature flows. Never submit a form, generate an image, add to the cart, pay, cancel an order, buy credits, delete, upload, or sign out. The only flow step allowed is signing in with the test account, so the protected pages can be seen (step 3).

This skill only reports. It never edits code. Once the report is out, ask which findings to fix and make the fixes in the main session, where the TDD hooks apply.

The `qa-reviewer` agent runs this skill on every page as part of `/review-frontend`. Its instructions say what changes in that case (no questions, its own browser page, findings returned in its output).

The design standard is the `frontend-ui-engineering` skill and its `references/color-palette.md`, plus the `accessibility` skill for focus, names and popups. Read their checklists before judging screenshots.

## 1. Arguments

| Argument | Effect |
| -------- | ------ |
| none or `all` | Every route (step 2) |
| `<route> ...` | Only those URL paths, e.g. `/catalog /faq` |
| `--url <base>` | Use a server that is already running instead of starting one |
| `--quick` | Viewports `mobile-s`, `tablet` and `desktop` only, no locale pass, Lighthouse only on mobile |
| `--no-auth` | Skip sign-in. Protected routes are reported as skipped |

## 2. Build the route list

Derive it from the code each run, so new pages are included: `find src/app -name page.tsx`, then map each file to its URL (`src/app/page.tsx` → `/`, `src/app/catalog/page.tsx` → `/catalog`; drop route groups `(x)`; a dynamic segment `[id]` needs a real value, so list it under **Skipped** unless one is visible on a page you already opened).

Then look each route up in this table. A route that isn't in the table gets the default treatment (guest, no special state), and the report says "route not in the skill's notes" so the table gets updated.

| Route | Access | What to check / what not to touch |
| ----- | ------ | --------------------------------- |
| `/` | guest | Hero, sections, FAQ accordion, header menus, language switcher, auth dialog (open/close only) |
| `/catalog` | guest | Group and sort selects (choosing an option only filters or sorts the view, so it's allowed), product dialog (open/close; never press add-to-cart) |
| `/stamp` | guest | Header, product grid, size selector, preservation slider, info tooltips. **Never** press Generate / "Stamp it!" (it calls the paid AI API and spends credits). Don't upload files. Later steps that need a generated design: check the empty or locked state only |
| `/cart` | guest | Empty state as it is. Don't add items to fill the cart |
| `/checkout` | guest | Whatever an empty cart shows. Don't fill the address form, don't open a payment provider |
| `/checkout/stripe-return`, `/checkout/paypal-return`, `/checkout/mollie-return` | guest | Open without query params: there must be a clear, styled "missing or unknown payment" state, not a crash or a blank page |
| `/orders` | signed in | Filter controls (they filter the view, so allowed), order details modal (open/close). **Never** open the cancel modal's confirm action. Opening the cancel modal and closing it is fine |
| `/profile` | signed in | Layout of every section. Don't save, change the password, export or delete the account |
| `/dashboard` | signed in | Layout, cards, any selectors. The buy-credits dialog: open, look at the packages, close. Never continue to payment |
| `/faq` | guest | Every accordion item: open, check content, close |
| `/privacy`, `/terms`, `/cookies`, `/returns`, `/shipping`, `/security` | guest | Long-form reading: line length, heading hierarchy, lists, tables at 320px |
| `/reset-password` | guest | Opened without a token: the error or empty state must be styled and explain what to do |
| `/auth/check-email`, `/auth/auth-code-error` | guest | Static states |
| `/auth/google-sign-in` | — | Skip: it redirects to Google |

## 3. Start the app and the browser

1. **Server.** With `--url`, use it. Otherwise pick a free port (never 3107, the acceptance tests use it):
   `PORT=$(node -e 'const s=require("net").createServer().listen(0,()=>{console.log(s.address().port);s.close()})')`
   and start the dev server against the **test** Supabase project in the background, from the directory being checked (the repo root, or a review worktree):
   `MAIN=$(git worktree list | head -1 | awk '{print $1}')` then `npx env-cmd -f "$MAIN/.env.test.local" next dev -p $PORT`.
   The env file is gitignored, so it only exists in the main checkout; the absolute path makes the same command work in a worktree. Keep the server's PID. Poll `curl -s -o /dev/null -w '%{http_code}' http://localhost:$PORT/` until it answers (give up after 90 s and report the server log). The dev server is used on purpose: the Next.js dev overlay and React warnings show hydration and runtime errors a production build hides. The first visit of each route compiles it, so wait for the page to settle before measuring.
2. **Output folder.** `OUT="$MAIN/.claude/ui-health/$(date +%Y%m%d-%H%M-%S)"`, `mkdir -p "$OUT"`. It goes in the main checkout, so it outlives a review worktree that gets removed afterwards. It must be inside the repo: the Chrome DevTools server refuses to write files outside the workspace. `.claude/ui-health/` is gitignored, so nothing from a run gets committed. Pass absolute paths to `filePath`, `sourcePath` and `outputDirPath`.
3. **Browser.** Load the chrome-devtools tools with ToolSearch (`select:` the ones used below), then `new_page` on the base URL. Use that page id for every call.
4. **Cookie banner.** On a fresh browser the consent banner opens on the first page, 2–3 s after load: `wait_for` its title ("Cookies & analytics") before the first screenshot. Audit it as a popup (step 6, at each viewport, before dismissing it): at 320px it covers about half the screen, so check it doesn't hide the page's primary action. Then press **Essential only** so it stops covering the rest of the run, and say so in the report. Until it's dismissed, `target-covered` items pointing at `section.fixed` are the banner.
5. **Dev-only overlays.** The Next.js dev-tools button ("N", bottom left) and the TanStack Query devtools button (bottom right) only exist in development. The scripts ignore them. When reading screenshots, don't report them as covering content.
6. **Sign-in** (unless `--no-auth`). Read `TEST_USER_EMAIL` and `TEST_USER_PASSWORD` from `$MAIN/.env.test.local` without printing them (e.g. `grep -E '^TEST_USER_(EMAIL|PASSWORD)=' "$MAIN/.env.test.local" | cut -d= -f2-`). Run the guest pass for all guest routes first, then open the header's Login dialog (on phones it's under "Open menu" → Sign in), fill the two fields, submit, and wait until the header shows the signed-in state. Sign in **once** per run and per browser context, and reuse the session: the auth routes are rate-limited, and repeated attempts get a 429. If you do get a 429, wait 60 s and try exactly once more. Never write the credentials into the report, and never open the login request with `get_network_request`: it echoes the request body, password included. If the variables are missing or sign-in fails, mark the protected routes as skipped and say why.

## 4. Viewports

Set each one with `emulate` (`viewport` string: `WxHxDPR[,mobile][,touch]`). `emulate` replaces every setting, so pass the whole string each time.

| Name | Viewport | Why |
| ---- | -------- | --- |
| `mobile-s` | `320x568x2,mobile,touch` | Smallest supported width; most overflow bugs show here |
| `mobile` | `390x844x3,mobile,touch` | Typical modern phone |
| `tablet` | `768x1024x2,mobile,touch` | `md` breakpoint, touch without hover |
| `laptop` | `1024x768x1` | `lg` breakpoint, where nav layouts switch |
| `desktop` | `1440x900x1` | Main desktop design |
| `wide` | `1920x1080x1` | Max-width containers, stretched images, lonely content |

Run every route at every viewport (or the `--quick` three). Navigate after setting the viewport, so the server-rendered layout matches.

**Coverage is the contract.** Never shorten the run on your own: no dropped viewports, no "first screen only", no sampling pages. If you can't finish (context, time, a dead server), stop and list exactly which route × viewport cells and which controls are left, so the run can be resumed or split. A partial run must say it's partial at the top of the report. For `all`, split the routes across parallel agents (section 11) rather than having one agent do everything.

## 5. Per route, per viewport

Do these in order. Save every screenshot as `$OUT/<route-slug>__<viewport>__<NN or state>.jpeg` (`/` → `home`; `NN` is the screen number) with `format: "jpeg"`, `quality: 70`. Screenshots are only ever written by the chrome-devtools tools: a repo hook blocks Bash from writing images, so don't crop or stitch them.

1. **Load.** `navigate_page` to the route, then `wait_for` a piece of text the page always shows (its h1 or a header label). A 404, a 500, the error boundary's fallback or a blank `main` is a **critical** finding; record it and move to the next route.
2. **Health.** `list_console_messages` with `types: ["error", "warn", "issue"]`, and `list_network_requests` for failed or 4xx/5xx responses (ignore analytics blocked by the isolated browser, and the expected 401 of a guest's session probe; say which ones you ignored). Hydration mismatches, React key warnings and uncaught errors are **high**.
3. **Scroll through.** `evaluate_script` with `sourcePath: .claude/skills/ui-health-check/scripts/scroll-through.js` (absolute path). It scrolls to the bottom in steps and returns to the top. Report: `cls` over 0.1, `scrollLocked`, `!reachedBottom`, `coveredAtBottom` (a fixed bar hiding the last controls), `fixedCoverPct` over 30 on a phone (sticky chrome eating the screen), and large `heightGrowth` (content that keeps loading or jumps).
4. **Layout audit.** `evaluate_script` with `sourcePath: .../scripts/layout-audit.js`. It returns findings grouped by check, each with the element, its text and its page rect. Then run console and network again: scrolling can trigger lazy content that fails. `low-contrast` only covers text inside the current viewport (it hit-tests what is painted under the text) and skips text over images. Lighthouse covers the rest. `img-failed-then-loaded` means the dev image optimizer failed on its first, cold request: reload and re-run once before reporting it as broken.
5. **Look at every screen.** Never use `fullPage: true`: long pages pass Chrome's 16,384px capture limit and come back corrupted, and a page-long image is shrunk too far to judge anyway. Instead run `.../scripts/screen-positions.js`, then for each offset in `positions`: `evaluate_script` with `() => window.scrollTo({ top: <offset>, behavior: "instant" })`, wait about 300 ms (`wait_for` is not needed; the next call is enough on a settled page, but give lazy images on a new screen a moment), `take_screenshot` (viewport), and **read the image**. Every screen of every page at every viewport gets looked at, top to bottom. Judge each against the design checklist below: the scripts catch what is measurable, the screenshots catch the rest (broken compositions, overlapping or misaligned blocks, awkward wrapping, cramped or empty areas, things that look wrong next to the same section at the other widths). Name the screen file in each finding.
6. **Popups and controls** (step 6).
7. **Keyboard focus**, at `mobile` and `desktop` only: press `Tab` about 8 times from the top. After each press run
   `() => { const el = document.activeElement; const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return { el: el.tagName + ' ' + (el.getAttribute('aria-label') || el.innerText || '').trim().slice(0, 40), outline: s.outlineStyle + ' ' + s.outlineWidth, boxShadow: s.boxShadow, inView: r.top >= 0 && r.bottom <= innerHeight }; }`.
   No visible indicator (outline `none` and no box-shadow), focus landing on something hidden or off-screen, or a focus order that jumps around is a finding. Take one viewport screenshot with focus on a header control to check the ring is visible against the background.
8. **Lighthouse**, at `mobile` and `desktop` only: `lighthouse_audit` (`device` to match, `mode: "navigation"`, `outputDirPath: $OUT/lighthouse`). Use its accessibility and best-practices failures, especially contrast, to confirm or overrule the layout audit's approximate `low-contrast` items.

## 6. Popups, selects and other controls

Take a `take_snapshot` and list every control that opens or reveals something: buttons with `aria-haspopup` or `aria-expanded`, comboboxes (Radix `Select` triggers), the language switcher, header menus and the mobile nav, accordion triggers (`<summary>`, FAQ items), info tooltips, dialog triggers (auth, product details, order details, buy credits, cancel order), carousels and sliders.

**Allowed:** opening, closing, hovering, scrolling inside, moving with arrow keys, and choosing an option in a control that only changes the view (sort, filter, group, language, size preview, slider position, carousel slide). **Never:** a control inside the popup that saves, pays, generates, confirms, deletes, adds to the cart or submits. If you can't tell whether a button does one of those, don't press it, and say so in the report.

For each control, at `mobile-s`, `tablet` and `desktop` (all six viewports for the header and the language switcher):

1. **Open it with the pointer** (`click`; `hover` for tooltips; tooltips at touch viewports must also open on tap or focus).
2. Run `evaluate_script` with `sourcePath: .../scripts/popup-audit.js` and take a viewport screenshot (`__<control>-open`). Every item in `layers[].issues` is a finding. Also check in the screenshot: the backdrop covers the page, the popup is aligned with its trigger, nothing in it is clipped, long option labels and the other locales fit, the close button is reachable.
3. **Close it**: press `Escape`, then check it's gone and focus went back to the trigger (`document.activeElement`). For non-modal popups also click outside once. For dialogs also use the close button. A popup that won't close, leaves a backdrop or scroll lock behind (scroll-through's `scrollLocked` on the next run), or drops focus on `body` is **high**.
4. **Open it with the keyboard**: focus the trigger, press `Enter` (or `Space`/`ArrowDown` for selects). It must open, focus must move in, arrow keys must move between options, and `Escape` must close it. For a select, choose a different option with the keyboard and check the trigger shows it, then restore the original option.
5. **Accordions**: open each item, check the content is fully visible and that opening it doesn't shift unrelated content oddly; then close it.
6. **Language switcher**: switch to each locale, check the header and the page re-render in that language without untranslated keys (layout audit's `untranslated-key`), then switch back to English.

## 7. Locale pass

Unless `--quick`: for every route, at `mobile-s` and `desktop`, switch to `pt` and `nl` (set the cookie with `evaluate_script`: `() => { document.cookie = 'NEXT_LOCALE=pt; path=/; max-age=31536000'; }`, then reload) and run steps 5.1, 5.3, 5.4 and 5.5. Longer Portuguese and Dutch strings are where buttons wrap, labels clip and headings overflow. Restore `en` at the end.

## Design checklist (for the screenshots)

The measurable checks are in the scripts; these need eyes. Each comes from `frontend-ui-engineering`.

- **Brand**: the stamp palette (chocolate, gold, cream) and mostly square, brutalist corners. Flag purple/indigo defaults, stray gradients, `rounded-2xl` cards, heavy shadows, colors that aren't in `color-palette.md`.
- **Hierarchy**: one clear h1, a heading size that matches its importance, a primary action that stands out from the secondary ones, no wall of equal-weight cards.
- **Spacing**: consistent rhythm between sections and inside cards at the same level, nothing jammed against the screen edge (≥16px gutter on phones), no huge empty bands, aligned left edges.
- **Typography**: body lines about 45–80 characters on desktop, no single-word orphan lines in headings, no all-caps paragraphs, readable size on phones.
- **Responsive**: the layout reflows on purpose at each breakpoint (not just shrinking), no desktop grid squeezed onto a phone, no content stranded in the middle of a 1920px screen, images keep their crop.
- **Images and icons**: sharp, not stretched or pixelated, consistent icon size and stroke, placeholders where an image is missing.
- **States**: empty, error and locked states are designed (message, next step) rather than blank or raw text.
- **Chrome**: header and footer look the same on every page at a given viewport; sticky header doesn't cover anchored headings; the active nav item is marked.

## 8. Severity

| Severity | Examples |
| -------- | -------- |
| critical | Page 404/500, error boundary, blank page, popup that can't be closed, the page can't be scrolled |
| high | Console errors or hydration warnings, failed requests, horizontal page scroll, broken images, clipped text that hides information, control covered or unreachable, focus lost or invisible, untranslated keys, CLS > 0.25 |
| medium | Element outside the viewport, popup cut off, text overflowing its box, targets under 24px, contrast confirmed by Lighthouse, CLS 0.1–0.25, design-system breaks (wrong colors, radii, shadows) |
| low | Targets under 44px on touch, upscaled images, tiny text, spacing or alignment inconsistencies, orphans, truncation without a way to read the full text |

The same problem on many routes (usually the header, footer or a shared component) is **one** finding that lists the routes and viewports, not one per page.

## 9. Report

Write `$OUT/report.md` and show the user the same content in chat (an agent that may not write report files, such as `qa-reviewer`, returns it in its output instead):

1. **Health matrix**: one row per route, one column per viewport, each cell `ok`, `⚠ n` (medium/low count) or `✗ n` (critical/high count), plus a final row for the locale pass.
2. **Findings**, ranked critical → low:

   | # | Severity | Route(s) | Viewport(s) | Finding | Evidence | Likely source |
   | - | -------- | -------- | ----------- | ------- | -------- | ------------- |

   *Evidence* is the screenshot file and the element and rect from the script. *Likely source* is the component, found by grepping `src/` for the element's text or class. Say "unknown" rather than guessing.
3. **Controls exercised**: every popup, select, menu, tooltip and accordion you opened, per route, with ok/finding, and every control you deliberately didn't press and why.
4. **Skipped**: routes, viewports or controls that weren't checked, with the reason (needs auth, dynamic segment, redirects away, unsafe to press).
5. **Ignored noise**: console or network messages left out on purpose.

Finish with: "Which of these should I fix?" Apply nothing until the user answers.

## 10. Clean up

Close the browser page (`close_page`), kill the dev server you started (its PID; don't touch a server passed with `--url`), and leave `$OUT` in place so the screenshots stay viewable. Tell the user the folder path.

## 11. Splitting a full run across agents

A full run is about 20 routes × 6 viewports, each with several screenshots to read. That is more than one agent's context holds, which is how an earlier run ended up quietly cut down. When running `all` from the main session:

1. Start **one** server (step 3.1) and create `$OUT` yourself.
2. Launch `general-purpose` agents in parallel (one message), each with a share of the routes, aiming for similar total page length per agent. Long pages (`/`, `/stamp`, `/faq`, the legal pages) should get an agent each or share with short ones. Protected routes (`/orders`, `/profile`, `/dashboard`) go to **one** agent, which signs in once.
3. Tell each agent: the base URL (`--url`), its routes, `$OUT`, all six viewports, that it must follow this skill's sections 4–8 for its routes (step 5 in full, every screen), that it opens its own page with `new_page` and a unique `isolatedContext` (e.g. `uih-<n>`) and passes its `pageId` on every call, that it handles the cookie banner in its own context, and that it returns its findings table, its matrix rows, its controls list and anything it couldn't cover. The agents return text; they don't write the report.
4. Merge their results into one report (section 9): deduplicate findings shared across routes (header, footer), then clean up (section 10).

`qa-reviewer` can't launch agents. Inside `/review-frontend` it runs the pass itself and must still keep to the coverage rule: report what's left rather than trimming silently.
