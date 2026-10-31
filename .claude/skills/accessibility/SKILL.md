---
name: accessibility
description: Designs and reviews accessible components in this Next.js app to WCAG 2.2 AA. Use when building or changing an interactive component (buttons, forms, dialogs, menus, tabs, disclosures, tooltips, carousels, sliders, custom widgets), anything that animates or updates without a page load (toasts, live status, loading, rotating or auto-advancing content), images and icons that carry meaning, color or contrast decisions, focus and keyboard behavior, or when asked to audit or fix accessibility.
---

# Accessibility

## Overview

Accessible means everyone can perceive, operate and understand the UI: keyboard-only users, screen reader users, people zoomed to 200%, people who turn off motion, people with low vision or color blindness. The bar is WCAG 2.2 AA, which the European Accessibility Act makes a legal requirement for this shop.

jsx-a11y's recommended rules run on every `src/**/*.tsx` file and catch static mistakes (missing `alt`, click handlers on `div`s, invalid ARIA). This skill covers what lint can't see: behavior, focus, announcements, naming and structure. General UI guidance is in the `frontend-ui-engineering` skill; this one goes deeper on accessibility.

## When to Use

- Designing a new interactive component, or changing how an existing one behaves
- Content that changes without navigation: validation errors, toasts, loading, cart counts, generation progress
- Motion: transitions, rotating words, carousels, auto-play
- Images, icons and SVGs: deciding whether they are content or decoration
- Reviewing or auditing a page for accessibility

## Start From the Design System

The primitives already solve the hard parts. Reach for them before writing ARIA by hand:

| Need | Use | What it already handles |
| ---- | --- | ----------------------- |
| Action | `Button` (`@/features/ui/button`) | Native button semantics, visible focus ring, `aria-disabled`; `size="icon*"` makes `aria-label` a required prop |
| Navigation | `Anchor` / `next/link` | Link semantics, middle-click, "open in new tab" |
| Modal content | `Modal` or `Dialog*` (`@/features/ui/dialog`, Radix) | Focus trap, Escape to close, focus return to the trigger, `aria-modal`, title/description wiring, translated close label |
| Form field | `FormField` (`@/features/ui/form-field`) | `Label` bound with `htmlFor`, error linked with `aria-describedby`, `aria-invalid`, error with `role="alert"`, decorative `*` hidden |
| Choice | `Select`, `Checkbox` (Radix) | Roles, states, arrow-key navigation, typeahead |
| Heading | `Heading` with `as` | Semantic level independent of the visual `variant` |
| Reduced motion | `useReducedMotion` (`@/shared/hooks/useReducedMotion`) | The OS setting, for animations driven from JS or inline styles |

If you are adding `role=`, `tabIndex` or a `keydown` handler to make something behave like a button, link, dialog, listbox or menu, stop: a primitive already exists, or Radix has one to wrap in `src/features/ui/`.

## Designing a Component: the Checklist

Work through these while designing, not after. Each one is a question the design must answer.

### 1. What is it? (role)

Use the native element or primitive whose semantics match the behavior:

- Does something on this page → `Button`. Goes somewhere → link. Never a clickable `div`/`Span`.
- A toggle that stays on or off → `Button` with `aria-pressed` (see the `stamp-thumbnail` and `option-card` variants, which style `aria-pressed`).
- Shows or hides a region → `Button` with `aria-expanded` and `aria-controls` (see `stamp-disclosure`).
- One choice of several → `Select` or a radio group, not a row of buttons with only a color change.
- Lists of things → `List`; groups of fields → `fieldset` with a `legend`.

### 2. What is it called? (accessible name)

Every interactive element needs a name a screen reader announces, and it must come from `next-intl` like any other copy.

```tsx
// Visible text is the name: nothing to add
<Button>{t("addToCart")}</Button>

// Icon-only: aria-label is required by the Button types
<Button size="icon" aria-label={t("removeItem", { name: item.name })}>
  <Trash2 aria-hidden="true" />
</Button>
```

- Names describe the purpose, and repeated controls say which item they act on ("Remove Blue tee", not five "Remove" buttons).
- The visible label must be part of the accessible name (WCAG 2.5.3): don't `aria-label` a "Buy now" button as "Purchase".
- Don't hardcode English in `aria-label` or `sr-only` text; it has to be translated like the rest.

### 3. Can a keyboard do everything a mouse can?

- Tab reaches every interactive element, in reading order. Never use a positive `tabIndex`.
- Enter activates buttons and links; Space activates buttons; Escape closes overlays; arrow keys move within composite widgets (Radix does this).
- Anything that opens on hover must also open on focus, and stay open while the pointer moves onto it (WCAG 1.4.13). A hover-only tooltip fails.
- No keyboard traps outside of modals.

### 4. Where does focus go?

Focus must always be visible and always somewhere sensible:

| Event | Focus goes to |
| ----- | ------------- |
| Dialog opens | Inside it (Radix does this) |
| Dialog closes | Back to the trigger (Radix does this, unless the trigger unmounted; then send it somewhere meaningful) |
| Form submit fails | The first invalid field (react-hook-form: `shouldFocusError`, on by default) |
| Item deleted from a list | The next item, or the list heading if it was the last |
| Step changes in a multi-step flow | The new step's heading (`tabIndex={-1}` on the heading, then `.focus()`) |
| Client-side route change | Next.js moves focus; don't fight it |

- Use the `focus-visible:ring-*` pattern from `buttonVariants`. Never `outline-none` without a visible replacement.
- Focused elements must not be hidden behind sticky headers, cookie banners or the mobile bottom bar (WCAG 2.4.11).

### 5. Does it change without a page load?

A sighted user sees the change; a screen reader user hears nothing unless you announce it.

| Change | Announce with |
| ------ | ------------- |
| Field validation error | `role="alert"` on the error (`FormField` does this) |
| Form-level error | `handleError` toast (sonner announces it) or `role="alert"` |
| Status that isn't urgent: "Added to cart", "3 results", "Saved" | `role="status"` (polite) |
| Loading a region | `aria-busy="true"` on the region, plus a `role="status"` message for long waits |
| Long-running progress (AI generation) | `role="status"` with step text, not a percentage every 100 ms |

- The live region must be in the DOM before its text changes; mount it empty, then fill it. A region mounted together with its message is often not read.
- Announce once per change. Don't put `aria-live` on content that updates continuously.

### 6. Does it move?

- Respect reduced motion. CSS animations go in a `@media (prefers-reduced-motion: reduce)` block (or `motion-reduce:` classes); animations driven from JS or inline styles check `useReducedMotion`.
- Anything that moves, blinks or auto-advances for more than 5 seconds needs a pause control, or must stop under reduced motion.
- Content that rotates should be read once, not on every tick: `HeroRotatingWord` renders the first word in `sr-only` and hides the animated copies with `aria-hidden`. Copy that pattern.
- Nothing flashes more than three times a second.

### 7. Can it be seen?

- Contrast: 4.5:1 for normal text, 3:1 for large text (≥24px, or ≥18.66px bold), icons, input borders and focus indicators. Gold on cream fails for body text; use the contrast-safe gold variants in `frontend-ui-engineering/references/color-palette.md`.
- Never use color alone for state: a selected, invalid or out-of-stock item also gets an icon, text, border or `aria-*` state.
- Placeholder text is not a label, and placeholders at `/50` opacity are decoration only.
- Text must survive 200% zoom and 320px width without being clipped or needing horizontal scroll. Don't fix heights on boxes that contain text.
- Touch targets are at least 24×24px (WCAG 2.5.8); aim for 44×44px on mobile for primary actions. `size="icon-sm"` (32px) is the smallest acceptable icon button.

### 8. Images and icons: content or decoration?

- Content image (a product, a generated design) → `alt` that says what matters in context: "Generated stamp: a fox in a top hat", not "image" or the file name.
- Decorative image or a lucide icon next to text → `alt=""` / `aria-hidden="true"`.
- Icon-only control → the name goes on the control (`aria-label`), the icon gets `aria-hidden`.
- Images of text: avoid; if unavoidable, the `alt` repeats the text.

### 9. Is the structure readable?

- One `h1` per page, then `h2`/`h3` in order. A section without a visible heading may get an `sr-only` one if it helps navigation.
- Landmarks: `header`, `nav`, `main`, `footer` come from the layouts; a page section with its own heading can be a `section` with `aria-labelledby`.
- Tables of data use real table markup with header cells; layout never uses tables.
- Reading order in the DOM matches the visual order. Reordering with `order-*` or `flex-row-reverse` must not scramble the tab order.

## Patterns

### Disclosure

```tsx
<Button
  variant="stamp-disclosure"
  aria-expanded={isOpen}
  aria-controls={panelId}
  onClick={() => setIsOpen((open) => !open)}
>
  {t("shippingDetails")}
  <ChevronDown aria-hidden="true" className={chevronVariants({ isOpen })} />
</Button>
<div id={panelId} hidden={!isOpen}>…</div>
```

### Toggle group (choosing a product color)

```tsx
<div role="group" aria-label={t("colorPicker")}>
  {colors.map((color) => (
    <Button
      key={color.id}
      variant="option-card"
      aria-pressed={color.id === selectedId}
      onClick={() => onSelect(color.id)}
    >
      {color.name}
    </Button>
  ))}
</div>
```

When only one option can be selected and the group behaves like a form field, prefer a radio group (Radix `RadioGroup` wrapped in `src/features/ui/`) for arrow-key navigation.

### Live status message

```tsx
// Mounted once, empty; text set when the cart changes
<Span unstyled role="status" className="sr-only">
  {lastAddedName ? t("addedToCart", { name: lastAddedName }) : ""}
</Span>
```

### Tooltip

A tooltip holds supplementary text only; anything the user needs to complete a task goes in visible text. The trigger is a `Button` with a translated `aria-label`, the tooltip opens on hover and on focus, closes on Escape, and is linked with `aria-describedby`. `InfoTooltip` doesn't meet this yet (hover/click only, hardcoded English label); fix it rather than copy it.

## Testing

Write the tests with the `test-driven-development` skill. Query by role and name, the way assistive technology finds things; a test that can't find an element by role has found an accessibility bug.

```tsx
const user = userEvent.setup();
render(<CartItemRow item={item} onRemove={onRemove} />);

await user.tab();
expect(screen.getByRole("button", { name: "Remove Blue tee" })).toHaveFocus();

await user.keyboard("{Enter}");
expect(onRemove).toHaveBeenCalledWith(item.id);
```

- Prefer `getByRole(…, { name })`, `getByLabelText`; avoid `getByTestId` for anything a user interacts with.
- Test keyboard paths with `userEvent` (`tab`, `{Enter}`, `{Space}`, `{Escape}`), and assert where focus lands.
- Assert states through ARIA: `toHaveAttribute("aria-expanded", "true")`, `toBeInvalid()`, `toHaveAccessibleDescription(…)`.

Then check manually in the browser:

- [ ] Unplug the mouse: complete the flow with Tab, Shift+Tab, Enter, Space, Escape and arrows; focus is always visible
- [ ] Screen reader pass (VoiceOver: Cmd+F5): headings list makes sense, every control is named, changes are announced
- [ ] axe DevTools or Lighthouse accessibility audit: no violations
- [ ] Zoom to 200% and view at 320px: nothing clipped or overlapping
- [ ] Turn on reduced motion (macOS: Accessibility → Display → Reduce motion): nothing slides, rotates or auto-advances

## Common Rationalizations

| Rationalization | Reality |
| --------------- | ------- |
| "Lint passes, so it's accessible" | jsx-a11y checks markup, not behavior. Focus order, announcements, names in context and contrast are invisible to it. |
| "I'll add `aria-label` everywhere to be safe" | Wrong or redundant labels are worse than none; they override visible text and confuse voice control users. Use native semantics first. |
| "Screen reader users are a tiny audience" | Keyboard users, zoom users, people with tremors, people in bright sunlight and people with reduced motion all depend on the same work. |
| "The design shows it on hover only" | Then the design doesn't work on touch or keyboard. Raise it and add a focus/tap path. |
| "We'll do an accessibility pass at the end" | Retrofitting focus management and semantics means rewriting the component. Decide them while designing. |

## Red Flags

- `onClick` on anything that isn't a `Button`, link or Radix trigger
- `outline-none` / `focus:outline-none` with no `focus-visible` ring
- `aria-label` with hardcoded English, or one that contradicts the visible label
- `aria-hidden="true"` on something focusable, or on content not repeated elsewhere
- A positive `tabIndex`, or `tabIndex={0}` on a non-interactive element
- State shown only by color (a gold border, a red price)
- Animation with no `prefers-reduced-motion` handling
- A message that appears after an action with no `role="status"`/`role="alert"` or toast
- A custom dropdown, modal or tooltip built from scratch instead of a Radix primitive
