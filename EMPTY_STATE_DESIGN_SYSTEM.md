# Empty State Design System

Extracted from the Orders Empty State component - A comprehensive guide for creating consistent empty states and similar pages.

## 🎨 Color Palette

### Primary Colors
- **Ink (Dark)**: `#0a0a0a` - Used for icons, text, and primary buttons
- **Cyan (Accent)**: `#22d3ee` / `rgba(34, 211, 238)` - Primary accent color with glow effects
- **Purple (Brand)**: `#7C3AED` - Secondary brand color for CTAs and highlights

### Text Colors
- **Heading**: `#1e293b` (slate-900) - Dark headings
- **Body**: `#6b7280` (gray-500) - Paragraph text
- **Muted**: `#94a3b8` (slate-400) - Meta information

### Background & Surfaces
- **Glass Card**: `bg-white/40 backdrop-blur-md` - Main card background
- **White Overlay**: `bg-white/50` - Secondary surfaces
- **Border**: `border-white/60` - Card borders

## 📐 Layout & Structure

### Container
```tsx
<div className="flex items-center justify-center min-h-screen">
  <div className="w-full max-w-xl bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/60 p-16 flex flex-col items-center text-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] relative">
    {/* Content */}
  </div>
</div>
```

**Key Properties:**
- Max width: `max-w-xl` (576px)
- Padding: `p-16` (64px)
- Border radius: `rounded-[3rem]` (48px)
- Shadow: `shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)]`

## 🎯 Icon Container

### Circular Icon with Glow Effect
```tsx
<div className="w-24 h-24 sm:w-32 sm:h-32 bg-ink rounded-full flex items-center justify-center mb-10 shadow-xl relative group">
  <div className="absolute inset-0 rounded-full bg-cyan/10 scale-125 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
  <ShoppingBag
    className="w-12 h-12 sm:w-16 sm:h-16 text-cyan relative z-10"
    style={{ filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 0.6))" }}
  />
</div>
```

**Specifications:**
- Size:
  - Mobile: `w-24 h-24` (96px)
  - Desktop: `w-32 h-32` (128px)
- Icon size:
  - Mobile: `w-12 h-12` (48px)
  - Desktop: `w-16 h-16` (64px)
- Background: Dark circle with cyan icon
- Glow: `drop-shadow(0 0 8px rgba(34, 211, 238, 0.6))`
- Hover effect: Cyan glow expands on hover

## 📝 Typography

### Heading (card variant)
```tsx
<Heading as="h2" variant="card" className="mb-4">
  NO ORDERS YET
</Heading>
```

**Component Props:**
- Variant: `card`
- Margin bottom: `mb-4` (16px)

### Paragraph (sm variant)
```tsx
<Paragraph variant="sm" className="text-[#6b7280] max-w-sm mb-12">
  YOU HAVEN'T PLACED ANY ORDERS YET...
</Paragraph>
```

**Specifications:**
- Variant: `sm`
- Color: `#6b7280` (gray-500)
- Max width: `max-w-sm` (384px)
- Margin bottom: `mb-12` (48px)
- Style: All caps for consistency

## 🔘 Buttons

### Brutalist Primary Button
```tsx
<Button
  variant="brutalist-primary"
  size="lg"
  onClick={handleClick}
  className="group"
>
  START CREATING
  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
</Button>
```

**Button Variant Styles:**
```css
.brutalist-primary {
  height: auto;
  border-radius: 0; /* Sharp corners */
  background: #0a0a0a; /* Ink */
  padding: 6px 24px; /* Mobile: py-1.5 px-6 */
  padding: 8px 32px; /* Desktop: py-2 px-8 */
  font-family: Anton;
  font-size: 14px; /* Mobile */
  font-size: 16px; /* Desktop */
  letter-spacing: 0.1em; /* tracking-widest */
  text-transform: uppercase;
  border: 2px solid #22d3ee; /* Cyan border */
  color: white;
  box-shadow: 4px 4px 0px rgba(10,10,10,0.1);
  transition: colors 300ms;
}

.brutalist-primary:hover {
  background: #22d3ee; /* Cyan */
  color: #0a0a0a; /* Ink text */
}
```

**Icon Animation:**
```tsx
<ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
```

## 🎭 Additional Button Variants

### Brutalist Checkout (Large CTA)
```css
.brutalist-checkout {
  height: auto;
  border-radius: 0;
  background: #0a0a0a;
  padding: 24px 32px; /* Mobile: py-6 px-8 */
  padding: 32px 32px; /* Desktop: py-8 px-8 */
  font-family: Anton;
  font-size: 20px; /* Mobile */
  font-size: 24px; /* Desktop */
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 2px solid #22d3ee;
  color: white;
  box-shadow: 4px 4px 0px rgba(10,10,10,0.1);
}
```

### Brutalist Ghost
```css
.brutalist-ghost {
  height: auto;
  border-radius: 0;
  border: 1px solid rgba(10,10,10,0.1);
  padding: 8px 16px;
  background: transparent;
  transition: colors 300ms;
}

.brutalist-ghost:hover {
  border-color: #22d3ee;
  background: transparent;
}
```

### Brutalist Danger
```css
.brutalist-danger {
  height: auto;
  width: 100%;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #22d3ee;
  font-weight: bold;
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  border: 1px solid rgba(34,211,238,0.2);
  padding: 8px;
  font-family: 'Space Grotesk';
  transition: colors 300ms;
}

.brutalist-danger:hover {
  color: #ef4444; /* Red */
  background: transparent;
}
```

## 🎨 Glass Card Theme

### Glass Card Component
```tsx
className="glass-card rounded-xl p-8 border border-white/60"
```

**CSS Definition:**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.4);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}
```

## 📊 Status Badges

### Status Colors & Styles
```tsx
// Base badge style
className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase"

// Status variants:
// Pending
className="bg-slate-100 text-slate-600 ring-1 ring-slate-200"

// Processing
className="bg-amber-50 text-amber-700 ring-1 ring-amber-200"

// Shipped
className="bg-sky-50 text-sky-700 ring-1 ring-sky-200"

// Delivered
className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"

// Cancelled
className="bg-red-50 text-red-600 ring-1 ring-red-200"

// Failed
className="bg-rose-50 text-rose-700 ring-1 ring-rose-200"
```

## 🎯 Design Principles

### 1. Brutalist Aesthetic
- **Sharp corners**: No border radius on buttons
- **Bold typography**: Anton font for headings, uppercase text
- **High contrast**: Dark ink vs bright cyan
- **Hard shadows**: `shadow-[4px_4px_0px_rgba(10,10,10,0.1)]`

### 2. Glass Morphism
- **Translucent backgrounds**: `bg-white/40`
- **Backdrop blur**: `backdrop-blur-md`
- **Soft borders**: `border-white/60`
- **Layered shadows**: Multiple shadow layers for depth

### 3. Motion & Interactivity
- **Hover glows**: Icon containers glow on hover
- **Icon slides**: Arrow icons translate on button hover
- **Smooth transitions**: `transition-all duration-300`
- **Scale effects**: Subtle scale transformations

### 4. Spacing System
- Icon margin bottom: `mb-10` (40px)
- Heading margin: `mb-4` (16px)
- Paragraph margin: `mb-12` (48px)
- Container padding: `p-16` (64px)

## 📱 Responsive Design

### Breakpoints
- Mobile first approach
- `sm:` - 640px and up
- `md:` - 768px and up
- `lg:` - 1024px and up

### Responsive Adjustments
```tsx
// Icon size
className="w-24 h-24 sm:w-32 sm:h-32"

// Button padding
className="px-6 md:px-8 py-1.5 md:py-2"

// Font size
className="text-sm md:text-base"
```

## 🎨 Complete Example Template

```tsx
export function EmptyStatePage() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-xl bg-white/40 backdrop-blur-md rounded-[3rem] border border-white/60 p-16 flex flex-col items-center text-center shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] relative">

        {/* Icon Container */}
        <div className="w-24 h-24 sm:w-32 sm:h-32 bg-ink rounded-full flex items-center justify-center mb-10 shadow-xl relative group">
          <div className="absolute inset-0 rounded-full bg-cyan/10 scale-125 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <YourIcon
            className="w-12 h-12 sm:w-16 sm:h-16 text-cyan relative z-10"
            style={{ filter: "drop-shadow(0 0 8px rgba(34, 211, 238, 0.6))" }}
          />
        </div>

        {/* Heading */}
        <Heading as="h2" variant="card" className="mb-4">
          YOUR HEADING TEXT
        </Heading>

        {/* Description */}
        <Paragraph variant="sm" className="text-[#6b7280] max-w-sm mb-12">
          YOUR DESCRIPTION TEXT GOES HERE
        </Paragraph>

        {/* CTA Button */}
        <Button
          variant="brutalist-primary"
          size="lg"
          onClick={handleAction}
          className="group"
        >
          BUTTON TEXT
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
```

## 🎨 Tailwind Config Requirements

Ensure these colors are in your `tailwind.config.js`:

```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        ink: '#0a0a0a',
        cyan: '#22d3ee',
        brandCyan: '#22d3ee',
        brandPurple: '#7C3AED',
        brandRed: '#ef4444',
        concrete: '#f5f5f5',
      },
      fontFamily: {
        anton: ['Anton', 'sans-serif'],
        space: ['Space Grotesk', 'sans-serif'],
        heading: ['Bebas Neue', 'sans-serif'],
        accent: ['Satoshi', 'sans-serif'],
      },
    },
  },
}
```

## ✨ Usage Tips

1. **Always use uppercase text** for headings and buttons to maintain brutalist aesthetic
2. **Maintain consistent spacing** using the mb-4, mb-10, mb-12 pattern
3. **Add icon animations** for interactive elements using group-hover
4. **Use glass morphism** for card backgrounds to create depth
5. **Keep sharp corners** on buttons - no border-radius
6. **Add glow effects** to icons for premium feel
7. **Use cyan accents** sparingly for maximum impact

---

This design system provides a cohesive, modern brutalist aesthetic perfect for empty states, error pages, and informational screens.
