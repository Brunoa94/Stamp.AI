# Styling Guidelines

## Styling Strategy

- **Tailwind CSS** for component-scoped styles
- **CSS variables** for fonts (Geist Sans, Geist Mono)
- **Mobile-first** responsive design
- **Reusable Styling**: Styling that is shared between more than one component should be included in the `theme/` folder
- **Theme Folder**: Create a folder `theme/` that contains reusable component themes and styling utilities
- **Style Reusage**: Enforce reuse of common styling patterns through utility classes and theme components

## Conditional Styling with clsx

### **Required Usage**
- **Always use `clsx`** for conditional styling instead of template literals
- **Import clsx** in every component that uses conditional classes
- **Separate base classes** from conditional classes for better readability

### **Preferred Patterns**

```typescript
import clsx from "clsx";
import { componentThemes } from "@/theme/components";

// ✅ Good: Using clsx for conditional styling with theme variants
const Button = ({ isActive, disabled, variant }) => {
  return (
    <button
      className={clsx(
        // Use theme variant as base
        componentThemes.button[variant] || componentThemes.button.primary,

        // Conditional classes as object
        {
          "ring-2 ring-blue-400": isActive,
          "opacity-50 cursor-not-allowed hover:scale-100": disabled,
        }
      )}
    >
      Click me
    </button>
  );
};
```

### **Anti-Patterns to Avoid**

```typescript
// ❌ Bad: Template literals for conditional styling
<div className={`base-class ${condition ? 'conditional-class' : ''} ${anotherCondition ? 'another-class' : 'default-class'}`}>

// ❌ Bad: Inline ternary operators in className
<div className={condition ? 'class-a' : 'class-b'}>

// ❌ Bad: Complex string concatenation
<div className={"base " + (isActive ? "active " : "") + (isDisabled ? "disabled" : "")}>
```

## Using Theme Components

### **Required Usage**
- **Always use theme variants** from `@/theme/components` for component styling
- **Import componentThemes** for consistent styling across the application
- **Fallback to default variants** when the specified variant doesn't exist

```typescript
import { componentThemes } from "@/theme/components";

// ✅ Good: Using theme components
const Card = ({ variant = "base", children }) => {
  return (
    <div className={componentThemes.card[variant]}>
      {children}
    </div>
  );
};

const Button = ({ variant = "primary", children, ...props }) => {
  return (
    <button
      className={componentThemes.button[variant]}
      {...props}
    >
      {children}
    </button>
  );
};
```

### **Theme vs Component-Specific Styling**

**Rule: Only add styling to the theme if it's used in multiple components**

- **Theme styling**: Use `@/theme/components` for styles shared across 2+ components
- **Component-specific styling**: Keep styles within the component if used only once
- **Regular audits**: Periodically review theme styles to ensure they're still being reused

```typescript
// ✅ Better: Direct styling for single-use, simple cases
const ImagePreview = () => {
  return (
    <div className="space-y-6 animate-[fadeInScale_0.5s_ease-out]">
      <img className="w-full max-w-md mx-auto rounded-xl shadow-2xl" />
    </div>
  );
};

// ✅ Good: Local styles object for complex conditional styling
const ImageUploader = () => {
  const uploadStyles = {
    base: "border-3 border-dashed rounded-2xl p-8 text-center cursor-pointer",
    active: "border-pink-400 bg-pink-50 shadow-xl",
    idle: "border-purple-300 hover:border-purple-400",
  };

  return (
    <div className={clsx(uploadStyles.base, {
      [uploadStyles.active]: isDragActive,
      [uploadStyles.idle]: !isDragActive,
    })}>
      {/* Component content */}
    </div>
  );
};

// ❌ Bad: Theme styles for single-use patterns
// Don't add to theme/components.ts if only used in one place
```

### **Best Practices**

1. **Use theme variants first**: Always check if a variant exists in the theme before creating custom classes
2. **Keep single-use styles local**: Don't add to theme unless used in 2+ components
3. **Prefer direct styling**: For simple, single-use styles, put them directly on HTML elements
4. **Use local style objects**: Only when you have complex conditional styling within a component
5. **Organize class groups**: Theme variants, conditional classes, modifier classes
6. **Use object syntax** for boolean conditionals: `{ "class-name": condition }`
7. **Use logical AND** for simple conditionals: `condition && "class-name"`
8. **Extract complex logic** into variables when needed:

```typescript
const buttonStyles = {
  "bg-linear-to-r from-blue-500 to-purple-500": variant === "gradient",
  "scale-110 animate-pulse": isLoading,
  "opacity-50 cursor-not-allowed": disabled,
};

<button className={clsx("base-classes", buttonStyles)}>
```

### **Static Style Constants**

**Rule: Static styling constants must be defined outside the component**

- **Static constants**: Define outside component for styles that don't change between renders
- **Dynamic styles**: Keep inside component only when dependent on props/state
- **Performance**: Prevents unnecessary re-creation of style objects on every render

```typescript
// ✅ Good: Static constants outside component
const textareaStyles = {
  disabled: "bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed",
  overLimit: "border-2 border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 bg-red-50/50",
  normal: "border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 bg-linear-to-br from-white via-blue-50/30 to-purple-50/30 backdrop-blur-sm"
};

const buttonStyles = {
  enabled: "bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl hover:shadow-purple-500/30 hover:scale-105 active:scale-95",
  disabled: "bg-gray-200 text-gray-400 cursor-not-allowed"
};

const PromptInput = ({ disabled, isOverLimit, canSubmit }) => {
  return (
    <div className={clsx({
      [textareaStyles.disabled]: disabled,
      [textareaStyles.overLimit]: !disabled && isOverLimit,
      [textareaStyles.normal]: !disabled && !isOverLimit,
    })}>
      <button className={clsx({
        [buttonStyles.enabled]: canSubmit,
        [buttonStyles.disabled]: !canSubmit,
      })}>
        Submit
      </button>
    </div>
  );
};

// ❌ Bad: Static constants inside component (recreated on every render)
const PromptInput = ({ disabled, isOverLimit, canSubmit }) => {
  const textareaStyles = {
    disabled: "bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed",
    overLimit: "border-2 border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 bg-red-50/50",
    normal: "border-2 border-blue-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20"
  };

  // Component content...
};
```

### **Complex Example with Theme Components**

```typescript
import { componentThemes } from "@/theme/components";
import clsx from "clsx";

const Card = ({ isSelected, hasError, size, variant = "base" }) => {
  const conditionalStyles = {
    // State-based classes
    "ring-2 ring-blue-500": isSelected,
    "ring-2 ring-red-500": hasError,
    "hover:shadow-lg": !hasError && !isSelected,

    // Size variants
    "p-4": size === "small",
    "p-6": size === "medium",
    "p-8": size === "large",
  };

  return (
    <article className={clsx(
      // Use theme variant as base
      componentThemes.card[variant],

      // Conditional styles
      conditionalStyles
    )}>
      {/* Content */}
    </article>
  );
};
```

## HTML Semantic Standards

### **Semantic Elements Usage**
- **Always use semantic HTML elements** instead of generic `<div>` and `<span>` elements
- Use proper document structure with semantic landmarks
- Implement ARIA attributes for enhanced accessibility

### **Document Structure Pattern**
```typescript
// Root Layout Structure
<html lang="en">
  <body>
    <header>
      <nav>
        {/* Navigation content */}
      </nav>
    </header>
    <main>
      {/* Page content */}
    </main>
  </body>
</html>
```

### **Semantic Element Guidelines**
| Element | Usage | Example |
|---------|-------|---------|
| `<header>` | Page/section headers | Navigation, page titles |
| `<main>` | Primary content area | Main page content (one per page) |
| `<nav>` | Navigation sections | Primary navigation, breadcrumbs |
| `<section>` | Distinct content sections | Feature sections, content blocks |
| `<article>` | Self-contained content | Blog posts, product cards, forms |
| `<aside>` | Sidebar content | Related content, advertisements |
| `<footer>` | Page/section footers | Copyright, links, contact info |

### **Component Semantic Patterns**
```typescript
// Dashboard Component Example
const DashboardContent = () => {
  return (
    <section className="dashboard-container" aria-label="AI Magic Studio">
      <header className="dashboard-header">
        <h1>AI Magic Studio</h1>
        <p>Transform your images with AI creativity</p>
      </header>

      <section className="content-grid" aria-label="Upload and prompt sections">
        <article className="upload-section">
          <h2>Upload Your Canvas</h2>
          {/* Upload component */}
        </article>

        <article className="prompt-section">
          <h2>Describe Your Vision</h2>
          {/* Prompt component */}
        </article>
      </section>
    </section>
  );
};
```

### **Accessibility Requirements**
- **ARIA Labels**: Use `aria-label` for sections without visible headings
- **ARIA Live Regions**: Use `aria-live="polite"` for dynamic content updates
- **Heading Hierarchy**: Maintain proper h1-h6 heading structure
- **Language Attribute**: Always include `lang` attribute on `<html>`

### **Semantic Validation Rules**
- **One `<main>` per page**: Each page should have exactly one main element
- **Proper nesting**: Don't nest interactive elements (buttons, links, form controls)
- **Meaningful structure**: Use semantic elements for their intended purpose, not styling
- **Progressive enhancement**: Ensure content is accessible without JavaScript

### **Anti-Patterns to Avoid**
```typescript
// ❌ Bad: Generic divs without semantic meaning
<div className="header">
  <div className="navigation">...</div>
</div>
<div className="content">...</div>

// ✅ Good: Semantic elements with proper structure
<header>
  <nav>...</nav>
</header>
<main>...</main>
```