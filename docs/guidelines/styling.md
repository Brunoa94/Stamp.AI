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

## Accessibility Considerations for Theming

### **Color Accessibility Requirements**

All theme colors MUST meet WCAG 2.1 AA accessibility standards:

- **Text contrast ratios**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Interactive elements**: Minimum 3:1 contrast for focus states and UI components
- **Color independence**: Information must not rely solely on color

### **Accessible Theme Color Palette**

```typescript
// theme/colors.ts
export const accessibleColors = {
  // High contrast text colors (WCAG AA compliant)
  text: {
    primary: "rgb(17, 24, 39)",      // #111827 - Contrast ratio: 15.77:1 on white
    secondary: "rgb(55, 65, 81)",    // #374151 - Contrast ratio: 10.70:1 on white
    tertiary: "rgb(107, 114, 128)",  // #6B7280 - Contrast ratio: 5.85:1 on white
    inverse: "rgb(255, 255, 255)",   // #FFFFFF - High contrast on dark backgrounds
    error: "rgb(127, 29, 29)",       // #7F1D1D - Contrast ratio: 9.41:1 on white
    success: "rgb(20, 83, 45)",      // #14532D - Contrast ratio: 8.59:1 on white
    warning: "rgb(120, 53, 15)",     // #78350F - Contrast ratio: 6.93:1 on white
  },

  // Background colors with proper contrast
  background: {
    primary: "rgb(255, 255, 255)",   // #FFFFFF
    secondary: "rgb(249, 250, 251)", // #F9FAFB
    tertiary: "rgb(243, 244, 246)",  // #F3F4F6
    inverse: "rgb(17, 24, 39)",      // #111827
    error: "rgb(254, 242, 242)",     // #FEF2F2 - Light error background
    success: "rgb(240, 253, 244)",   // #F0FDF4 - Light success background
    warning: "rgb(255, 251, 235)",   // #FFFBEB - Light warning background
  },

  // Interactive element colors
  interactive: {
    primary: "rgb(37, 99, 235)",     // #2563EB - Contrast ratio: 7.15:1 on white
    primaryHover: "rgb(29, 78, 216)", // #1D4ED8 - Darker shade for hover
    secondary: "rgb(75, 85, 99)",    // #4B5563 - Contrast ratio: 7.59:1 on white
    danger: "rgb(220, 38, 38)",      // #DC2626 - Contrast ratio: 5.04:1 on white
    dangerHover: "rgb(185, 28, 28)", // #B91C1C - Darker shade for hover
  },

  // Border and focus colors
  border: {
    default: "rgb(209, 213, 219)",   // #D1D5DB
    focus: "rgb(59, 130, 246)",      // #3B82F6 - High visibility focus ring
    error: "rgb(239, 68, 68)",       // #EF4444
    success: "rgb(34, 197, 94)",     // #22C55E
  },
};

// Contrast validation utility
export const validateColorContrast = (foreground: string, background: string): boolean => {
  // Implementation to calculate and validate WCAG contrast ratios
  // Returns true if contrast meets AA standards
  return true;
};
```

### **Accessible Focus States**

```typescript
// theme/focusStyles.ts
export const accessibleFocusStyles = {
  // High visibility focus rings
  default: "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",

  // Focus styles for different contexts
  onDark: "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900",

  // Error state focus
  error: "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2",

  // Success state focus
  success: "focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2",

  // Custom focus for specific components
  button: "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:shadow-outline",
  input: "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",

  // Ensure focus is always visible
  visible: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
};
```

### **Accessible Component Themes**

```typescript
// theme/components.ts
import { accessibleColors, accessibleFocusStyles } from './colors';

export const accessibleComponentThemes = {
  button: {
    // Primary button with high contrast
    primary: `
      ${accessibleColors.background.primary}
      ${accessibleColors.text.inverse}
      bg-blue-600 text-white
      hover:bg-blue-700
      disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed
      ${accessibleFocusStyles.default}
      font-medium px-4 py-2 rounded-md
      transition-colors duration-200
    `,

    // Secondary button maintaining contrast
    secondary: `
      ${accessibleColors.background.secondary}
      ${accessibleColors.text.primary}
      bg-gray-100 text-gray-900
      border border-gray-300
      hover:bg-gray-200 hover:border-gray-400
      disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed
      ${accessibleFocusStyles.default}
      font-medium px-4 py-2 rounded-md
      transition-colors duration-200
    `,

    // Danger button with proper contrast
    danger: `
      bg-red-600 text-white
      hover:bg-red-700
      disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed
      ${accessibleFocusStyles.error}
      font-medium px-4 py-2 rounded-md
      transition-colors duration-200
    `,
  },

  input: {
    // Default input with accessible styling
    default: `
      bg-white border border-gray-300 text-gray-900
      placeholder:text-gray-500
      disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
      ${accessibleFocusStyles.input}
      px-3 py-2 rounded-md
      transition-colors duration-200
    `,

    // Error state input
    error: `
      bg-white border-2 border-red-300 text-gray-900
      placeholder:text-gray-500
      ${accessibleFocusStyles.error}
      px-3 py-2 rounded-md
      transition-colors duration-200
    `,

    // Success state input
    success: `
      bg-white border-2 border-green-300 text-gray-900
      placeholder:text-gray-500
      ${accessibleFocusStyles.success}
      px-3 py-2 rounded-md
      transition-colors duration-200
    `,
  },

  alert: {
    // Error alert with proper color contrast
    error: `
      bg-red-50 border border-red-200 text-red-800
      p-4 rounded-md
    `,

    // Success alert
    success: `
      bg-green-50 border border-green-200 text-green-800
      p-4 rounded-md
    `,

    // Warning alert
    warning: `
      bg-yellow-50 border border-yellow-200 text-yellow-800
      p-4 rounded-md
    `,

    // Info alert
    info: `
      bg-blue-50 border border-blue-200 text-blue-800
      p-4 rounded-md
    `,
  },
};
```

### **Responsive Accessibility Considerations**

```typescript
// theme/responsive.ts
export const accessibleResponsiveStyles = {
  // Ensure touch targets are minimum 44px on mobile
  touchTarget: `
    min-h-[44px] min-w-[44px]
    touch-manipulation
    select-none
  `,

  // Readable text sizes across devices
  text: {
    xs: "text-xs leading-4",          // 12px - Use sparingly
    sm: "text-sm leading-5",          // 14px - Minimum for body text
    base: "text-base leading-6",      // 16px - Recommended base size
    lg: "text-lg leading-7",          // 18px - Good for readability
    xl: "text-xl leading-8",          // 20px - Headings
    "2xl": "text-2xl leading-9",      // 24px - Large headings
  },

  // Spacing that works with zoom levels up to 200%
  spacing: {
    clickable: "p-3 m-1",            // Adequate spacing for interactive elements
    content: "px-4 py-6 md:px-6 md:py-8", // Content padding that scales
    section: "mb-8 md:mb-12",        // Section spacing
  },
};
```

### **Dark Theme Accessibility**

```typescript
// theme/darkTheme.ts
export const accessibleDarkTheme = {
  colors: {
    // Ensure sufficient contrast in dark mode
    text: {
      primary: "rgb(243, 244, 246)",    // #F3F4F6 - High contrast on dark
      secondary: "rgb(209, 213, 219)",  // #D1D5DB - Good contrast on dark
      tertiary: "rgb(156, 163, 175)",   // #9CA3AF - Minimum contrast on dark
      inverse: "rgb(17, 24, 39)",       // #111827 - Dark text for light elements
    },
    background: {
      primary: "rgb(17, 24, 39)",       // #111827 - Dark background
      secondary: "rgb(31, 41, 55)",     // #1F2937 - Slightly lighter
      tertiary: "rgb(55, 65, 81)",      // #374151 - Card backgrounds
    },
    interactive: {
      primary: "rgb(59, 130, 246)",     // #3B82F6 - Bright blue for dark mode
      primaryHover: "rgb(96, 165, 250)", // #60A5FA - Lighter on hover
    },
  },

  // Focus styles adjusted for dark backgrounds
  focus: {
    default: "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-gray-900",
    light: "focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-900",
  },
};
```

### **Color Blind Accessibility**

```typescript
// theme/colorBlindFriendly.ts
export const colorBlindFriendlyPatterns = {
  // Use patterns and icons, not just colors, for status
  status: {
    error: {
      color: "text-red-700",
      pattern: "border-l-4 border-red-500",
      icon: "❌", // Always include icons for status
    },
    success: {
      color: "text-green-700",
      pattern: "border-l-4 border-green-500",
      icon: "✅",
    },
    warning: {
      color: "text-yellow-700",
      pattern: "border-l-4 border-yellow-500",
      icon: "⚠️",
    },
    info: {
      color: "text-blue-700",
      pattern: "border-l-4 border-blue-500",
      icon: "ℹ️",
    },
  },

  // Distinguish links with underlines, not just color
  links: {
    default: "text-blue-700 underline hover:no-underline focus:no-underline",
    visited: "text-purple-700 underline hover:no-underline focus:no-underline",
    external: "text-blue-700 underline decoration-dotted hover:decoration-solid",
  },
};
```

### **Theme Accessibility Testing**

```typescript
// theme/testing.ts
export const themeAccessibilityTests = {
  // Automated contrast ratio checking
  validateThemeContrast: () => {
    const combinations = [
      { fg: accessibleColors.text.primary, bg: accessibleColors.background.primary },
      { fg: accessibleColors.text.secondary, bg: accessibleColors.background.primary },
      { fg: accessibleColors.interactive.primary, bg: accessibleColors.background.primary },
      // Add all critical color combinations
    ];

    combinations.forEach(({ fg, bg }) => {
      const ratio = calculateContrastRatio(fg, bg);
      if (ratio < 4.5) {
        console.warn(`Low contrast detected: ${fg} on ${bg} (${ratio}:1)`);
      }
    });
  },

  // Test theme in high contrast mode
  highContrastSupport: `
    @media (prefers-contrast: high) {
      /* Enhance contrast further for users who need it */
      .theme-text { color: #000000 !important; }
      .theme-bg { background-color: #ffffff !important; }
      .theme-border { border-color: #000000 !important; }
    }
  `,

  // Test theme with reduced motion
  reducedMotionSupport: `
    @media (prefers-reduced-motion: reduce) {
      /* Disable animations for users who prefer it */
      * { animation-duration: 0.001ms !important; }
      * { transition-duration: 0.001ms !important; }
    }
  `,
};
```

### **Theme Implementation Guidelines**

**Required Accessibility Checks:**
1. **Color Contrast**: All text must meet 4.5:1 ratio (3:1 for large text)
2. **Focus Visibility**: Focus indicators must be clearly visible and have 3:1 contrast
3. **Color Independence**: Information must be conveyed without relying solely on color
4. **Touch Targets**: Interactive elements must be at least 44px on mobile
5. **High Contrast Mode**: Theme must work with OS high contrast settings
6. **Reduced Motion**: Respect user preferences for reduced animations

**Testing Checklist:**
- [ ] Test with screen readers (VoiceOver, NVDA, JAWS)
- [ ] Verify keyboard navigation works with theme
- [ ] Check color contrast ratios with tools like WebAIM
- [ ] Test with color blind simulation tools
- [ ] Validate with browser accessibility extensions
- [ ] Test at 200% zoom level
- [ ] Verify high contrast mode compatibility

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