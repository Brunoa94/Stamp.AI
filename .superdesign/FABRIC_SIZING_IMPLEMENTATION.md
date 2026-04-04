# Fabric & Sizing Redesign Implementation

**Date:** March 6, 2026  
**SuperDesign Draft ID:** ff2db9e8-e771-4b82-b84e-5a3473943ea3

## Overview

Implemented a new Fabric & Sizing section for the product creation wizard, matching the SuperDesign draft specifications. The redesign replaces the traditional grid-based tshirt selection with elegant fabric cards and transforms the color/size selectors into more visually appealing swatch/tile layouts.

## Changes Made

### 1. New Components Created

#### **FabricSizingSection** (`src/features/dashboard/createProduct/FabricSizingSection/FabricSizingSection.tsx`)

- Main orchestrator for the fabric & sizing step
- Integrates FabricCardSelector, ColorSwatchSelector, SizeTileSelector
- Wired to CreateProduct context for state management
- Includes StampItButton for product creation
- Uses `useProductCustomizerSection` hook for color/size variants
- Handles product creation with `useCreateProductAndAddToCart` hook

#### **FabricCardSelector** (`src/features/dashboard/createProduct/FabricSizingSection/FabricCardSelector.tsx`)

- Displays fabric options as large cards with:
  - Fabric image (aspect-4/3 ratio)
  - Fabric type (e.g., "Premium Cotton" - 3xl font-heading)
  - Price badge with gradient background
  - Description in italic font-accent
  - CheckCircle2 icon for selected state
- Maps first two tshirt products to Premium/Organic fabric types
- Glass card styling with hover effects (scale, translate-y, shadow)
- Selected state: purple ring-2, purple border, purple background tint
- Responsive grid: 1 column mobile, 2 columns desktop

#### **ColorSwatchSelector** (`src/features/dashboard/createProduct/FabricSizingSection/ColorSwatchSelector.tsx`)

- Horizontal row of circular color swatches
- Each swatch: 16×16 (w-16 h-16), rounded-full
- Border: 4px white border with shadow-xl
- Selected state: ring-4 ring-[#7C3AED], scale-110
- Hover effects: scale-110, shadow-2xl
- Uses `getColorClass` helper for color mapping
- Loading state: 5 animated pulse circles
- Accessibility: role="radiogroup", aria-checked

#### **SizeTileSelector** (`src/features/dashboard/createProduct/FabricSizingSection/SizeTileSelector.tsx`)

- Horizontal row of square glass tiles
- Each tile: 20×20 (w-20 h-20), rounded-lg
- Glass card styling with backdrop blur
- Selected state: purple border, purple ring-2, purple text, white/gray-800 background
- Font: lg font-heading uppercase
- Hover effects: scale-105, shadow-xl
- Loading state: 7 animated pulse tiles
- Accessibility: role="radiogroup", aria-checked

### 2. Updated Components

#### **WizardProductForm.tsx**

- Added dynamic import for `FabricSizingSection`
- Updated step logic to differentiate between fabric/sizing and customizing steps
- Added `showFabricSizingSection` flag for fabric/sizing steps
- Modified footer visibility to hide on fabric/sizing steps (StampItButton handles CTA)
- Updated `getContinueText()` to return "Finalize Order" for fabric/sizing steps
- Added selector for `selectedTshirt` at component level

#### **actions.ts** (CreateProductContextSubscriber)

- Updated `handleUseImage` to transition to "fabric" step instead of "customizing"
- This ensures the new fabric selection flow is triggered after design review

### 3. File Structure

```
src/features/dashboard/createProduct/FabricSizingSection/
├── FabricSizingSection.tsx       # Main section orchestrator
├── FabricCardSelector.tsx         # Fabric card layout
├── ColorSwatchSelector.tsx        # Horizontal color swatches
├── SizeTileSelector.tsx           # Glass tile size grid
└── index.ts                       # Module exports
```

## Design System Alignment

### Color Palette

- Primary purple: `#7C3AED` (ring, border, background tint)
- Secondary purple: `#6D28D9` (gradient end)
- Gradient: `bg-linear-to-r from-[#7C3AED] to-[#6D28D9]`

### Typography

- Headings: `font-heading` (Bebas Neue) - uppercase, tracking-wide
- Body/descriptions: `font-accent` (Zodiak) - italic for descriptions
- Sizes: 3xl for fabric titles, 2xl for section headers, 2xl for prices

### Spacing

- Section spacing: `space-y-12` (main), `space-y-8` (color/size subsections), `space-y-4` (within sections)
- Card spacing: `p-6` for fabric cards, `gap-6` for card grid, `gap-4` for swatches/tiles

### Effects

- Glass cards: `glass-card` utility (backdrop-blur, transparent background, white/40 border)
- Shadows: `shadow-xl` default, `shadow-2xl` on hover
- Transitions: `transition-all duration-300`
- Animations: `animate-[slideInUp_1s_ease-out]` for section entrance, `animate-[scaleIn_0.3s_ease-out]` for check icon

### Interactive States

- Hover: `scale-[1.02]`, `-translate-y-1`, increased shadow
- Selected: purple ring, purple border, purple background tint, increased shadow
- Disabled: `opacity-40`, `cursor-not-allowed`

## Wizard Flow

### Updated Step Sequence

1. **Step 01 - Upload:** Upload artwork image
2. **Step 02 - Synthesis:** AI generates design variations
3. **Step 03 - Review:** Review final design mockup
4. **Step 04 - Fabric:** ✨ **NEW** - Choose fabric type with card selector
5. **Step 04 - Fabric (continued):** ✨ **NEW** - Choose color (horizontal swatches) and size (glass tiles)
6. **Step 05 - Created:** Product added to cart

### Navigation Behavior

- From **Review** → Click "Use this image" → **Fabric selection** (NEW)
- In **Fabric step** → Select fabric → Color/size selectors appear below
- Complete fabric/color/size → Click **"Stamp It"** button → Product created → Cart

### CTA Buttons

- **Upload → Synthesis:** "Continue" button in footer
- **Synthesis:** "Generate" button in footer (with Sparkles icon)
- **Fabric/Sizing:** "Stamp It" button inline (footer hidden)
- **Created:** "Go to Cart" / "Continue Shopping" buttons

## Technical Notes

### State Management

- FabricSizingSection uses the same state management as ProductCustomizerSection:
  - `CreateProductSelectors.selectedTshirt()` for fabric selection
  - `useProductCustomizerSection` hook for color/size options and state
  - `useCreateProductAndAddToCart` hook for product creation mutation

### Reusability

- Color mapping: Uses existing `getColorClass` helper from `@/helpers/colors/colorMapping`
- Glass styling: Uses existing `glass-card` utility from globals.css
- Animations: Uses existing keyframes (slideInUp, scaleIn)
- Product creation: Reuses `useCreateProductAndAddToCart` and `StampItButton`

### Data Mapping

- **Fabric Cards:** Maps first two tshirt products from `useTshirtProducts()` to:
  - Product 1 → "Premium Cotton" ($29.99)
  - Product 2 → "Organic Cotton" ($34.99)
- **Colors:** From blueprint variants API (via `useBlueprintVariants`)
- **Sizes:** From blueprint variants API (via `useBlueprintVariants`)

## Testing Checklist

- [ ] Navigate through wizard from upload to fabric step
- [ ] Verify fabric card selection updates context state
- [ ] Verify color swatch selection works (horizontal layout)
- [ ] Verify size tile selection works (glass tile layout)
- [ ] Verify "Stamp It" button appears when all selections are made
- [ ] Verify "Stamp It" creates product and adds to cart
- [ ] Verify transition animations (slideInUp, scaleIn)
- [ ] Verify responsive layout on mobile/tablet
- [ ] Verify dark mode styling
- [ ] Verify accessibility (keyboard navigation, screen reader labels)

## Design Fidelity

### Matched Elements from SuperDesign Draft

- ✅ Two-column fabric card grid
- ✅ Fabric card structure (image, title, price, description)
- ✅ Glass card styling with backdrop blur
- ✅ Selected card state (purple ring-2, purple border, purple tint)
- ✅ Horizontal color swatch row
- ✅ Circular swatches with ring indicator for selected state
- ✅ Glass tile size grid
- ✅ Size tiles with selected state (purple ring-2)
- ✅ Typography (Bebas Neue headings, Zodiak accents)
- ✅ Purple color scheme (#7C3AED, #6D28D9)
- ✅ Section spacing and layout
- ✅ Stamp It CTA integration

### Deviations/Adaptations

- **Footer:** Draft showed "Cancel / Back / Finalize Order" in footer, but we use the inline "Stamp It" button for consistency with the existing ProductCustomizerSection pattern
- **Step indicator:** Draft showed "Step 04" inline, but we use the existing WizardStepHeader component which already displays step numbers
- **Fabric data:** Draft had hardcoded Premium/Organic Cotton, we map from actual tshirt products for flexibility

## Future Enhancements

1. **Add fabric detail modal:** Click fabric card to see full specs (material composition, care instructions, sustainability)
2. **Add fabric filters:** Filter by price, eco-friendly, material type
3. **Add quantity selector:** Allow users to select multiple quantities per size
4. **Add fabric hover preview:** Show different angles or texture close-ups on hover
5. **Add size guide modal:** Link from size selector to sizing chart
6. **Persist fabric selection:** Save user's preferred fabric for future orders
7. **A/B test fabric card layouts:** Test single column vs two column for conversion

## Related Files

### New Files

- `src/features/dashboard/createProduct/FabricSizingSection/FabricSizingSection.tsx`
- `src/features/dashboard/createProduct/FabricSizingSection/FabricCardSelector.tsx`
- `src/features/dashboard/createProduct/FabricSizingSection/ColorSwatchSelector.tsx`
- `src/features/dashboard/createProduct/FabricSizingSection/SizeTileSelector.tsx`
- `src/features/dashboard/createProduct/FabricSizingSection/index.ts`

### Modified Files

- `src/features/dashboard/createProduct/WizardProductForm.tsx`
- `src/features/dashboard/createProduct/context/CreateProductContextSubscriber/actions.ts`

### Referenced Files (unchanged)

- `src/features/dashboard/createProduct/ProductCustomizer/hooks/useProductCustomizerSection.ts`
- `src/features/dashboard/createProduct/ProductCreateForm/hooks/useCreateCustomProduct.ts`
- `src/features/dashboard/createProduct/components/StampItButton.tsx`
- `src/queries/productQueries.ts` (useTshirtProducts)
- `src/helpers/colors/colorMapping.ts` (getColorClass)
- `src/app/globals.css` (glass-card, font-heading, font-accent utilities)
