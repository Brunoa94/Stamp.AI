# Design System Guidelines

## Core Principle: Always Use Design System Components

**IMPORTANT:** Always prioritize using components from the design system (`/src/features/ui/`) over creating custom implementations with native HTML elements.

## Why Use Design System Components?

1. **Consistency** - Ensures uniform look and feel across the application
2. **Accessibility** - Built-in ARIA attributes and keyboard navigation
3. **Maintainability** - Single source of truth for styling and behavior
4. **Type Safety** - Full TypeScript support with proper typing
5. **Theme Support** - Automatic dark mode and theme switching
6. **Quality** - Battle-tested components with proper focus states, animations, and interactions

## Available Components

### Buttons
✅ **DO:** Use `<Button>` from `@/features/ui/button`
```tsx
import { Button } from "@/features/ui/button";

<Button variant="outline" onClick={handleClick}>
  Click Me
</Button>
```

❌ **DON'T:** Create custom button elements
```tsx
// BAD - Don't do this
<button className="px-4 py-2 bg-blue-500...">
  Click Me
</button>
```

### Available Button Variants
- `default` - Primary button with solid background
- `destructive` - For destructive actions (delete, remove, etc.)
- `outline` - Outlined button with transparent background
- `secondary` - Secondary actions
- `ghost` - Minimal styling, shows on hover
- `link` - Text-only link style

### Available Button Sizes
- `default` - Standard size (h-9)
- `sm` - Small size (h-8)
- `lg` - Large size (h-10)
- `icon` - Square icon button (size-9)
- `icon-sm` - Small icon button (size-8)
- `icon-lg` - Large icon button (size-10)

## Other Design System Components

Refer to `/src/features/ui/` for the full list of available components:
- `Button` - Interactive buttons with variants
- `Modal` - Dialog/modal overlays
- `ThemeToggle` - Dark/light mode toggle
- `FilterSelect` - Dropdown select for filters
- `PropertyCard` - Display key-value properties
- And more...

## When to Create Custom Components

Only create custom components when:
1. The design system doesn't have a suitable component
2. You need highly specialized behavior that doesn't fit any variant
3. You're building a new design system component to be shared

## Extending Design System Components

If you need custom styling, use the `className` prop to extend, not replace:

```tsx
<Button
  variant="outline"
  className="border-purple-500 hover:bg-purple-50"
>
  Custom Styled Button
</Button>
```

## Contributing to the Design System

When creating new reusable components:
1. Place them in `/src/features/ui/`
2. Use CVA (class-variance-authority) for variants
3. Include TypeScript types
4. Support dark mode
5. Add accessibility features (ARIA attributes)
6. Document usage in this file

## Migration Checklist

When refactoring existing code:
- [ ] Replace `<button>` with `<Button>`
- [ ] Replace custom select elements with `<FilterSelect>`
- [ ] Use design system spacing and color utilities
- [ ] Ensure dark mode support
- [ ] Test keyboard navigation
- [ ] Verify accessibility

## Custom Hooks Best Practices

**IMPORTANT:** Extract complex component logic into custom hooks for better separation of concerns.

### When to Create a Custom Hook

Create a custom hook when your component has:
1. **State Management** - Multiple related state variables
2. **Side Effects** - Multiple useEffect calls
3. **Complex Calculations** - Heavy useMemo or useCallback usage
4. **Reusable Logic** - Logic that could be shared across components

### Example: Extracting Filter Logic

❌ **DON'T:** Keep all logic in the component
```tsx
function FilterComponent({ data, onChange }) {
  const [filter1, setFilter1] = useState("all");
  const [filter2, setFilter2] = useState("all");

  const filtered = useMemo(() => {
    // complex filtering logic
  }, [data, filter1, filter2]);

  useEffect(() => {
    onChange(filtered);
  }, [filtered, onChange]);

  // More logic...
}
```

✅ **DO:** Extract to a custom hook
```tsx
// hooks/useFilters.ts
function useFilters({ data, onChange }) {
  const [filter1, setFilter1] = useState("all");
  const [filter2, setFilter2] = useState("all");

  const filtered = useMemo(() => {
    // complex filtering logic
  }, [data, filter1, filter2]);

  useEffect(() => {
    onChange(filtered);
  }, [filtered, onChange]);

  return { filter1, setFilter1, filter2, setFilter2, filtered };
}

// Component
function FilterComponent({ data, onChange }) {
  const { filter1, setFilter1, filter2, setFilter2 } = useFilters({ data, onChange });

  return (
    // Clean JSX only
  );
}
```

### Hook Organization

Place custom hooks in:
- `/src/hooks/` - Global hooks used across features
- `/src/features/[feature]/hooks/` - Feature-specific hooks

### Hook Naming

- Always prefix with `use` (e.g., `useTshirtFilters`, `useOrderFilters`)
- Use descriptive names that explain what the hook does

## Resources

- Component Source: `/src/features/ui/`
- Theme Configuration: `/src/theme/`
- Utility Functions: `/src/lib/utils.ts` (`cn` helper)
- Custom Hooks: `/src/hooks/` and `/src/features/[feature]/hooks/`
