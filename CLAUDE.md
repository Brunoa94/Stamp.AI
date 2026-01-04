# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentation Structure

This project's documentation is organized into focused, modular files:

### **Development**
- [`docs/development/commands.md`](./docs/development/commands.md) - Development commands and environment setup
- [`docs/development/tech-stack.md`](./docs/development/tech-stack.md) - Technology stack and performance optimizations

### **Architecture**
- [`docs/architecture/overview.md`](./docs/architecture/overview.md) - High-level architecture patterns and principles
- [`docs/architecture/file-organization.md`](./docs/architecture/file-organization.md) - File structure, naming conventions, and organizational patterns

### **Guidelines**
- [`docs/guidelines/components.md`](./docs/guidelines/components.md) - Component creation patterns, React Query integration, and form handling
- [`docs/guidelines/styling.md`](./docs/guidelines/styling.md) - Styling standards, HTML semantics, and accessibility requirements

### **Standards**
- [`docs/standards/typescript.md`](./docs/standards/typescript.md) - TypeScript conventions and best practices
- [`docs/standards/zod-validation.md`](./docs/standards/zod-validation.md) - Zod schema integration and validation patterns

## Quick Reference

### **Most Important Guidelines**

1. **Always use semantic HTML** (`<header>`, `<main>`, `<nav>`, `<section>`, `<article>`)
2. **Components must include loading and error states** when fetching data
3. **Use React Query** for server state management
4. **Follow feature-based component organization**
5. **Use Next.js Link component** instead of programmatic navigation
6. **Implement proper TypeScript interfaces** with `I` suffix
7. **Add ARIA labels** for accessibility

### **Component Requirements**
```typescript
// ✅ Required pattern for data-fetching components
const ComponentList = () => {
  const { data, isLoading, error } = useQuery(/* ... */);

  if (isLoading) return <ComponentSkeleton />;
  if (error) return <ComponentError error={error} />;

  return <main>{/* content */}</main>;
};
```

## Important Instructions

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.