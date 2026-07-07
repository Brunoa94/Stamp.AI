# Color Palette Organization Guidelines

This document provides the rules and guidelines for organizing colors in the Imaginary Builder AI project. All developers must follow these guidelines when working with colors.

---

## Table of Contents

1. [Color System Overview](#color-system-overview)
2. [Color Categories](#color-categories)
3. [Naming Conventions](#naming-conventions)
4. [Tag System](#tag-system)
5. [How to Add New Colors](#how-to-add-new-colors)
6. [How to Use Colors](#how-to-use-colors)
7. [Color Documentation Template](#color-documentation-template)
8. [Best Practices](#best-practices)

---

## Color System Overview

Our color system is organized into a hierarchical structure:

```
Color System
├── Design System Colors (Semantic tokens)
│   ├── Light Mode
│   └── Dark Mode
├── Brand Colors (Identity)
├── Product Colors (T-shirts/Fabrics)
├── Utility Colors (Special purposes)
│   ├── Gradients
│   ├── Shadows/Effects
│   └── Glass Effects
└── Component-Specific Colors
```

---

## Color Categories

### 1. Design System Colors

**Purpose**: Semantic color tokens that adapt to theme changes

**Location**: `src/app/globals.css`

**Format**: CSS custom properties using OKLCH color space

**Examples**:
- `--color-primary` - Primary brand color
- `--color-background` - Page background
- `--color-foreground` - Main text color
- `--color-border` - Element borders

**When to use**: For all standard UI elements (buttons, text, backgrounds, borders)

**Tag prefix**: `ds-`

---

### 2. Brand Colors

**Purpose**: Core brand identity colors used for marketing and branding

**Location**: `src/app/globals.css` (custom properties section)

**Format**: Hex values or RGB

**Examples**:
- `--color-purple: #9333ea` (Primary brand)
- `--color-cyan: #06b6d4` (Secondary brand)
- `--color-orange: #fb923c` (Tertiary brand)

**When to use**: For brand-specific elements, gradients, special effects

**Tag prefix**: `brand-`

---

### 3. Product Colors

**Purpose**: T-shirt and fabric colors for product customization

**Location**: `src/features/homepage-brutalist/lib/constants/colorSwatches.ts`

**Format**: Hex values mapped to color names

**Examples**:
- `Black: #000000`
- `Navy: #000080`
- `Sport Grey: #8B8B8B`

**When to use**: Only for product/fabric color selection and swatches

**Tag prefix**: `product-`

---

### 4. Utility Colors

**Purpose**: Special-purpose colors for specific effects

**Subcategories**:
- **Gradients**: Multi-color gradients for animations and backgrounds
- **Shadows**: Colors used in box-shadow and glow effects
- **Glass Effects**: Translucent colors for glassmorphism
- **Brutalist**: High-contrast colors for brutalist design elements

**When to use**: For specific visual effects and design patterns

**Tag prefix**: Context-specific (e.g., `gradient-`, `shadow-`, `glass-`, `brutalist-`)

---

## Naming Conventions

### CSS Custom Properties

```css
/* Format: --color-{semantic-name} */
--color-primary
--color-background
--color-card-foreground

/* Format: --color-{brand-name} */
--color-purple
--color-cyan
--color-ink
```

### Tag Names

```
{category}-{subcategory}-{descriptor}

Examples:
- ds-primary (design system primary)
- ds-dark-background (design system dark mode background)
- brand-purple (brand purple color)
- product-navy (product navy fabric)
- gradient-logo (logo gradient)
- shadow-purple (purple shadow effect)
```

### TypeScript Constants

```typescript
// Uppercase with underscores for constant values
const COLOR_HEX_MAP: Record<string, string> = {
  Black: "#000000",
  "Sport Grey": "#8B8B8B",
};

// Camelcase for variables
const defaultColor = "#CCCCCC";
```

---

## Tag System

Every color must have a unique tag for easy reference and documentation.

### Tag Structure

```
{category}-{descriptor}[-{variant}]

Examples:
- ds-primary
- ds-dark-primary
- brand-purple
- product-black
- gradient-auth-btn
- shadow-cyan
```

### Tag Rules

1. **Unique**: Each tag must be unique across the entire project
2. **Descriptive**: Tag should clearly indicate the color's purpose
3. **Consistent**: Follow established naming patterns
4. **Searchable**: Use tags that are easy to grep/search
5. **Hierarchical**: Use prefixes to group related colors

---

## How to Add New Colors

### Step 1: Determine the Category

Ask yourself:
- Is this a semantic UI color? → **Design System Color**
- Is this a core brand color? → **Brand Color**
- Is this for product customization? → **Product Color**
- Is this for a special effect? → **Utility Color**

### Step 2: Choose the Right Location

| Category | Location | Format |
|----------|----------|--------|
| Design System | `src/app/globals.css` | CSS custom property (OKLCH) |
| Brand | `src/app/globals.css` | CSS custom property (Hex/RGB) |
| Product | `colorSwatches.ts` | TypeScript constant |
| Utility | Context-specific file or `globals.css` | Varies |

### Step 3: Assign a Tag

Create a unique, descriptive tag following the naming conventions:

```
{category}-{descriptor}[-{variant}]
```

### Step 4: Add the Color

**For Design System Colors (globals.css):**

```css
:root {
  --color-{name}: oklch(...);
}

.dark {
  --color-{name}: oklch(...);
}
```

**For Product Colors (colorSwatches.ts):**

```typescript
const COLOR_HEX_MAP: Record<string, string> = {
  "New Color Name": "#HEX_VALUE",
};
```

### Step 5: Document the Color

Create an entry in your color documentation:

```markdown
| Tag | Color Name | Value | Usage |
|-----|------------|-------|-------|
| {tag} | {name} | {value} | {description} |
```

### Step 6: Test

- [ ] Test in light mode
- [ ] Test in dark mode
- [ ] Verify accessibility contrast
- [ ] Check on different screen sizes

---

## How to Use Colors

### In CSS/Tailwind

**Preferred (Design System):**
```css
/* Use Tailwind utilities */
.element {
  @apply bg-primary text-primary-foreground;
}

/* Or CSS custom properties */
.element {
  background: var(--color-primary);
  color: var(--color-foreground);
}
```

**Brand Colors:**
```css
.element {
  background: var(--color-purple);
  background: linear-gradient(135deg, var(--color-purple), var(--color-cyan));
}
```

**Avoid:**
```css
/* ❌ DON'T: Hardcoded hex values */
.element {
  background: #9333ea;
}
```

### In TypeScript/TSX

**Product Colors:**
```tsx
import { getColorHex } from '@/features/homepage-brutalist/lib/constants/colorSwatches';

const bgColor = getColorHex('Navy');

<div style={{ backgroundColor: bgColor }} />
```

**Design System Colors:**
```tsx
// Use Tailwind classes
<div className="bg-primary text-primary-foreground">
  Content
</div>

// Or inline CSS variables
<div style={{ color: 'var(--color-cyan)' }}>
  Content
</div>
```

**Avoid:**
```tsx
/* ❌ DON'T: Hardcoded values */
<div style={{ backgroundColor: '#9333ea' }}>
```

---

## Color Documentation Template

When documenting colors, use this markdown table format:

### For Standard Colors

```markdown
| Tag | Color Name | Value | Usage |
|-----|------------|-------|-------|
| tag-name | Color Name | #HEX or oklch(...) | Description of usage |
```

### For Gradients

```markdown
| Tag | Colors | Usage |
|-----|--------|-------|
| gradient-name | #color1 → #color2 → #color3 | Description of gradient usage |
```

### For Effects

```markdown
| Tag | Effect Type | Values | Usage |
|-----|-------------|--------|-------|
| shadow-name | Box Shadow | rgba(...) - rgba(...) | Description of effect |
```

---

## Best Practices

### DO ✅

1. **Use semantic design system colors** for standard UI elements
2. **Reference colors via CSS custom properties** (`var(--color-name)`)
3. **Use OKLCH format** for design system colors (better color manipulation)
4. **Document all new colors** with proper tags
5. **Test both light and dark modes**
6. **Maintain WCAG AA contrast ratios** (4.5:1 for text)
7. **Group related colors** using tag prefixes
8. **Use TypeScript constants** for product colors
9. **Keep gradients in CSS** for better performance
10. **Add comments** explaining color usage in code

### DON'T ❌

1. **Don't hardcode hex values** directly in components
2. **Don't create duplicate colors** with different names
3. **Don't skip documentation** when adding colors
4. **Don't use arbitrary color values** without approval
5. **Don't forget dark mode** variants
6. **Don't ignore accessibility** contrast requirements
7. **Don't mix color formats** inconsistently
8. **Don't create colors** outside the established system
9. **Don't use inline styles** when Tailwind classes exist
10. **Don't forget to tag** new colors

### Examples

**Good ✅:**
```tsx
// Using design system
<Button className="bg-primary text-primary-foreground">
  Click me
</Button>

// Using brand color
<div className="text-[var(--color-purple)]">
  Brand element
</div>

// Using product color utility
const fabricColor = getColorHex(selectedFabric.color);
```

**Bad ❌:**
```tsx
// Hardcoded hex
<Button className="bg-[#9333ea]">
  Click me
</Button>

// Arbitrary color
<div style={{ color: '#ff0000' }}>
  Random red
</div>

// Undocumented color
<span className="text-[#abc123]">
  Mystery color
</span>
```

---

## Color Accessibility Guidelines

### Contrast Ratios (WCAG 2.1)

| Level | Normal Text | Large Text | UI Components |
|-------|-------------|------------|---------------|
| AA | 4.5:1 | 3:1 | 3:1 |
| AAA | 7:1 | 4.5:1 | Not specified |

**Our target**: WCAG AA minimum, AAA where possible

### Testing Tools

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Coolors Contrast Checker](https://coolors.co/contrast-checker)
- Browser DevTools Accessibility Panel

### Color Blindness Considerations

Test your color combinations for:
- Protanopia (red-blind)
- Deuteranopia (green-blind)
- Tritanopia (blue-blind)
- Achromatopsia (total color blindness)

**Tools**: [Coblis Color Blindness Simulator](https://www.color-blindness.com/coblis-color-blindness-simulator/)

---

## Quick Reference Checklist

Before committing color changes:

- [ ] Category determined (Design System, Brand, Product, Utility)
- [ ] Correct location used for color definition
- [ ] Unique tag assigned following naming conventions
- [ ] Color added to appropriate file
- [ ] Both light and dark mode variants created (if applicable)
- [ ] Color documented in project documentation
- [ ] Accessibility contrast ratios verified (4.5:1 minimum)
- [ ] Tested on different screen sizes
- [ ] Color blindness accessibility checked
- [ ] Code reviewed for hardcoded values
- [ ] Tailwind classes used where possible
- [ ] No duplicate colors created

---

## Related Files

- [README.md](../README.md) - Main project documentation with color rules
- [globals.css](../src/app/globals.css) - Design system and brand color definitions
- [colorSwatches.ts](../src/features/homepage-brutalist/lib/constants/colorSwatches.ts) - Product color utilities

---

## Questions or Issues?

If you're unsure about:
- Which category a color belongs to
- How to name a color tag
- Where to add a new color
- Whether a color already exists

**Check with the team lead or design system maintainer before adding new colors.**
