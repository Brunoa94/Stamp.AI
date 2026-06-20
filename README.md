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
