---
paths:
  - "src/**/*.tsx"
---

# Components

## Core principles

Every component follows these three:

1. **Single Responsibility Principle (SRP)**: each component has one clear purpose.
2. **DRY (Don't Repeat Yourself)**: extract repeated markup and logic instead of copying it.
3. **Atomicity**: keep components as small and focused as possible.

## One file, one component

**Every `.tsx` file exports exactly one component.**

1. When a component grows helper components, move each one to its own file.
2. Group related components in a folder, one file each. The file name matches the component name.

```tsx
// ❌ BAD: ProcessStickyCarousel.tsx with two components
function ProcessStepper({ activeStepIndex, totalSteps }) {
  return <div>...</div>;
}

export function ProcessStickyCarousel() {
  return <ProcessStepper activeStepIndex={0} totalSteps={5} />;
}
```

```
// ✅ GOOD: one file per component
src/features/homepage/ui/sections/HomeProcessSection/
├── HomeProcessSection.tsx       # Section entry point
├── ProcessStickyCarousel.tsx    # Main carousel component
├── ProcessStepper.tsx           # Stepper dots component
├── ProcessStepCard.tsx          # Individual step card
└── ProcessStepImage.tsx         # Step image component
```

## No complex logic in JSX loops

The `.map()` stays in the JSX, but the callback only does property access and helper calls. Move computations into a helper in `lib/helpers/` that returns the computed values.

```tsx
// ❌ BAD: computation inside .map()
{items.map((item, index) => {
  const isActive = index === activeIndex;
  let opacity = 0;
  if (isActive) opacity = 1 - progress;
  else if (index === activeIndex + 1) opacity = progress;
  if (Math.abs(index - activeIndex) > 1) return null;
  return <div style={{ opacity }}>...</div>;
})}

// ✅ GOOD: lib/helpers/processAnimationHelpers.ts exports computeAnimation()
{items.map((item, index) => {
  const animation = computeAnimation(index, activeIndex, progress);
  if (!animation.isVisible) return null;
  return <StepCard key={item.id} item={item} {...animation} />;
})}
```

## Use the design system

Use components from `@/features/ui/` instead of raw HTML elements. Enforced by ESLint.

| HTML Element                       | Design System Component | Import                   |
| ---------------------------------- | ----------------------- | ------------------------ |
| `<h1>` to `<h5>`                   | `<Heading>`             | `@/features/ui/heading`  |
| `<p>`                              | `<Paragraph>`           | `@/features/ui/paragraph`|
| `<span>` (labels, badges, meta)    | `<Span>`                | `@/features/ui/span`     |
| `<button>`                         | `<Button>`              | `@/features/ui/button`   |
| `<input>`                          | `<Input>`               | `@/features/ui/input`    |
| `<textarea>`                       | `<Textarea>`            | `@/features/ui/textarea` |
| `<select>`                         | `<Select>`              | `@/features/ui/select`   |
| `<label>`                          | `<Label>`               | `@/features/ui/label`    |
| `<input type="checkbox">`          | `<Checkbox>`            | `@/features/ui/checkbox` |
| `<ul>`, `<ol>`                     | `<List>`                | `@/features/ui/list`     |
| `<hr>`                             | `<Separator>`           | `@/features/ui/separator`|
| `<img>`                            | `<Image>`               | `next/image`             |

Raw HTML is fine only when building a design-system component, when the design system has no suitable component (rare), or for external/dynamic image URLs that can't be optimized.

## SVGs are assets

Never write inline `<svg>` markup. Save the SVG under `public/assets/<feature>/` and render it with `<Image>` from `next/image`. Enforced by ESLint (`no-restricted-syntax`).

```tsx
// ❌ Bad
<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21..." /></svg>

// ✅ Good
<Image src="/assets/platforms/trustpilot.svg" alt="" aria-hidden width={16} height={16} />
```

Inline `<svg>` is allowed only when the markup must react at runtime (animated paths, `currentColor`/theme-token strokes, shapes generated from props). Add `// eslint-disable-next-line no-restricted-syntax -- <reason>`.

## Styling

- Prefer design-system `variants` over custom classes: `<Button variant="primary" size="lg">`, not `<Button className="...">`.
- **No styling outside the returned JSX.** Class-string constants, tone/size maps and class-returning helpers go in a `cva` file under the feature's `lib/variants/`; one-off classes stay inline in `className`. Enforced by ESLint; `src/features/ui/**` is exempt.

  ```tsx
  // ❌ Bad: class map in the component file
  const toneClasses = { dark: "bg-(--color-stamp-chocolate)", gold: "bg-(--color-stamp-gold)" };

  // ✅ Good: cva in lib/variants/, called from the JSX
  <Span className={cn(flowMockButtonVariants({ tone }), className)} />
  ```

- Design tokens only: no arbitrary colors (`bg-[#7C3AED]`), hex literals or arbitrary spacing (`p-[13px]`). Enforced by ESLint.
- No inline `style` except for dynamic values Tailwind can't express (animation delays, widths from state).

## Props

- Define interfaces in the component file. An interface used by a single component is named `PropsI`.
- Errors reach the user through `useErrorHandler`, never `toast.error` directly. Enforced by ESLint.

## Sharing state

- **Prop drilling limit**: when a prop passes through more than 3 component levels, move it out of props instead of drilling further.
- **Context is for reading state, never for setting it.** A provider's `value` exposes state only, no setters, dispatchers or `set*` callbacks (see `SupabaseAuthProvider`, `CheckoutFormContext`). The provider owns the updates internally.
- **Children that need to change shared state use a Zustand store** in the feature's `lib/stores/` (see `stamp/lib/stores/stampFlowStore.ts`), when the shared state justifies a store. If it doesn't, restructure the tree (composition, `children`, lifting the consumer up) instead.
- **Always ask before applying this.** Introducing a context or a Zustand store, or moving existing props into one, changes the component's structure: propose it (what moves, context or store, and why) and wait for approval before refactoring.

## Memoization

Use `useCallback`, `useMemo` and `React.memo` only for expensive computations, large lists or a re-render problem you measured. Measuring first is the `performance-optimization` skill.
