# Imaginary Builder AI

> AI-powered custom product creation platform

---

## 🚨 CRITICAL DEVELOPMENT RULE 🚨

### **ALWAYS USE COMPONENTS FROM THE DESIGN SYSTEM FOR HTML TAG ELEMENTS**

**DO NOT use raw HTML tags directly in your components.**

Instead of writing:
```tsx
❌ <h1>My Title</h1>
❌ <p>Some text</p>
❌ <button>Click me</button>
❌ <span>Label</span>
```

**ALWAYS use design system components:**
```tsx
✅ <Heading variant="h1">My Title</Heading>
✅ <Text>Some text</Text>
✅ <Button>Click me</Button>
✅ <Span variant="default">Label</Span>
```

### Design System Components Location

All design system components are located in:
- **`src/features/ui/`** - Core UI components (Button, Heading, Text, Span, etc.)
- **`src/shared/ui/`** - Shared components (PageHeader, etc.)

### Available Typography Components

| Component | Purpose | Location |
|-----------|---------|----------|
| `Heading` | Headings (h1-h6) | `@/features/ui/heading` |
| `Text` | Body text, paragraphs | `@/features/ui/text` |
| `Span` | Labels, meta text, small uppercase text | `@/features/ui/span` |

### Before Writing Code

1. ✅ Check if a design system component exists for your use case
2. ✅ Use the component with appropriate variants
3. ✅ Add custom styling via `className` prop, not by creating new elements
4. ❌ Never use raw HTML tags like `<h1>`, `<p>`, `<span>`, `<div>` for semantic content

### Why This Matters

- **Consistency**: Ensures visual and functional consistency across the app
- **Maintenance**: Changes to design tokens propagate automatically
- **Type Safety**: TypeScript ensures you use valid variants
- **Accessibility**: Design system components include proper ARIA attributes
- **Performance**: Shared components are optimized and memoized

---

## 🎨 Color Palette Rules

### **ALWAYS FOLLOW THE COLOR ORGANIZATION GUIDELINES**

All colors in this project must be properly organized and documented according to our color system guidelines.

**Before adding or using colors:**

1. ✅ Check if a color already exists in the design system
2. ✅ Use semantic color tokens from CSS variables (e.g., `var(--color-primary)`)
3. ✅ Document new colors with proper tags in `globals_v2.css`
4. ✅ Follow the established naming conventions
5. ❌ Never use arbitrary hex values directly in components
6. ❌ Never create duplicate colors with different names

### Color Organization

All colors are organized in [src/app/globals_v2.css](./src/app/globals_v2.css) by category:

- **Brand Colors** `[tag: brand-*]` - Core brand identity colors
- **Design System Colors** `[tag: ds-*]` - Semantic UI tokens (light/dark mode)
- **Product Colors** `[tag: product-*]` - T-shirt/fabric customization colors
- **Utility Colors** `[tag: gradient-*, shadow-*, glass-*, brutalist-*]` - Special purpose colors

### Color Naming Convention

```
{category}-{descriptor}[-{variant}]

Examples:
- brand-purple          (brand purple color)
- ds-primary            (design system primary)
- ds-dark-background    (dark mode background)
- product-navy          (product navy fabric)
- gradient-logo         (logo gradient)
- shadow-cyan           (cyan shadow effect)
```

See [docs/COLOR_PALETTE_GUIDELINES.md](./docs/COLOR_PALETTE_GUIDELINES.md) for complete color organization rules and examples.

---

## 📁 File Naming and Organization Rules

### **NEVER USE `index.tsx` FILES**

**DO NOT create `index.tsx` files for components.** Always use explicit component names.

#### ❌ Bad Pattern (Anti-pattern)
```
components/
  Button/
    index.tsx          ← NEVER DO THIS
    ButtonIcon.tsx
    ButtonGroup.tsx
```

#### ✅ Good Pattern (Explicit Names)
```
components/
  Button/
    Button.tsx         ← Component name matches folder
    ButtonIcon.tsx
    ButtonGroup.tsx
```

### Why This Matters

1. **Better IDE Navigation**: Explicit names show up in tabs and search results
2. **Easier Debugging**: Stack traces show actual component names, not just "index"
3. **Better Git History**: File changes are clearly identifiable
4. **Import Clarity**: Imports are explicit: `from './Button/Button'` not `from './Button'`
5. **Reduces Confusion**: Multiple `index.tsx` files in different folders are hard to distinguish

### Import Pattern

```tsx
// ✅ Explicit imports with full path
import { Button } from "@/components/Button/Button";
import { HeroSection } from "@/features/stamp/ui/sections/HeroSection/HeroSection";

// ❌ Avoid barrel exports and index files
import { Button } from "@/components/Button";  // relies on index.tsx
```

### When Creating New Components

1. Create a folder with the component name
2. Create a file with the same name as the folder: `ComponentName.tsx`
3. Add sub-components in the same folder with descriptive names
4. Import using explicit file paths

### Example: Section Component Structure

```
sections/
  HeroSection/
    HeroSection.tsx       ← Main component
    HeroImage.tsx         ← Sub-component
    HeroContent.tsx       ← Sub-component
  UploadSection/
    UploadSection.tsx     ← Main component
    UploadDropzone.tsx    ← Sub-component
    UploadPreview.tsx     ← Sub-component
```

---

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Testing

```bash
npm run test
```

### Build

```bash
npm run build
```

---

## Project Structure

```
src/
├── features/           # Feature-based modules (FSD architecture)
│   ├── ui/            # Design system components
│   ├── checkout/      # Checkout feature
│   ├── stamp-brutalist/ # Stamp product creation flow
│   └── ...
├── shared/            # Shared utilities and components
│   └── ui/           # Shared UI components
├── lib/              # Core utilities
└── types/            # TypeScript type definitions
```

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Testing**: Vitest + Testing Library
- **API**: Supabase

---

## Architecture

This project follows **Feature-Sliced Design (FSD)** principles:

- **features/**: Feature modules with isolated logic
- **shared/**: Cross-cutting concerns and utilities
- **ui/**: Design system and reusable UI components

---

## Contributing

1. Always use design system components (see rule above)
2. Follow the existing code style and architecture
3. Write tests for new features
4. Update documentation as needed

---

## Documentation

- [Empty State Design System](./EMPTY_STATE_DESIGN_SYSTEM.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)
- [Legacy Cleanup Checklist](./LEGACY_CLEANUP_CHECKLIST.md)
