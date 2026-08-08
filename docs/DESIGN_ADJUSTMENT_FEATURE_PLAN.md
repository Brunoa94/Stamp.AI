# Design Adjustment Controls with Print Position Selection

> **Feature Request**: Replace the placeholder "Mockup Preview" in CustomizationSection (Step 6) with an interactive Design Adjustment Panel

## Table of Contents

1. [Overview](#overview)
2. [Printify API Parameters](#printify-api-parameters)
3. [Current Architecture](#current-architecture)
4. [Design Decisions](#design-decisions)
5. [Implementation Steps](#implementation-steps)
6. [File Structure](#file-structure)
7. [Testing Strategy](#testing-strategy)
8. [Verification Checklist](#verification-checklist)

---

## Overview

This feature enables users to:

1. **Select print positions** (front, back, sleeves, neck) based on product capabilities
2. **Adjust placement parameters** (position, size, rotation) supported by Printify API
3. **Preview changes in real-time** with a CSS-based visual preview
4. **Apply changes directly** to Printify without re-calling Gemini

### User Flow

```
Step 6: Customize Your Product
│
├─ 1. User selects COLOR and SIZE (existing functionality)
│
├─ 2. User selects PRINT POSITIONS (NEW)
│     └─ Shows available positions based on blueprint
│     └─ Displays additional cost per position
│     └─ Default: "front" pre-selected
│
├─ 3. User adjusts PLACEMENT per position (NEW)
│     └─ Tab/dropdown to switch between positions
│     └─ Live preview shows design on product silhouette
│     └─ Buttons for x, y, scale, angle adjustments
│     └─ Real-time safe zone validation
│
├─ 4. User clicks "Create Product" (existing)
│     └─ Sends all positions with placements to Printify
│
└─ Step 7: Production → Step 8: Final Review
```

---

## Printify API Parameters

### Placement Parameters

| Parameter | Type | Range | Description |
|-----------|------|-------|-------------|
| `x` | float | 0.0 - 1.0 | Horizontal position (0.5 = center) |
| `y` | float | 0.0 - 1.0 | Vertical position (0.5 = center) |
| `scale` | float | 0.1 - 1.0+ | Size relative to print area width |
| `angle` | int | 0 - 360 | Rotation in degrees |

### Available Print Positions by Product

| Blueprint | Product | Available Positions |
|-----------|---------|---------------------|
| 145 | Gildan Softstyle T-Shirt | `front`, `back`, `neck` |
| 5 | Next Level Cotton Tee | `front`, `back`, `neck` |
| 6 | Gildan Heavy Cotton Tee | `front`, `back`, `neck`, `left_sleeve`, `right_sleeve` |
| 77 | Gildan Hoodie | `front`, `back`, `neck`, `left_sleeve`, `right_sleeve` |
| 49 | Crewneck Sweatshirt | `front`, `back`, `neck`, `left_sleeve`, `right_sleeve` |
| 553 | Cotton Tote Bag | `front`, `back` |

### Safe Zones (from existing config)

| Product Type | Top | Bottom | Left | Right | Anchor Y |
|--------------|-----|--------|------|-------|----------|
| T-Shirts | 5% | 3% | 3% | 3% | 0.45 |
| Hoodies | 8% | 5% | 5% | 5% | 0.42 |
| Tote Bags | 3% | 3% | 3% | 3% | 0.50 |

---

## Current Architecture

### Existing Files (for reference)

| File | Purpose |
|------|---------|
| `src/features/stamp/lib/stores/stampFlowStore.ts` | Zustand state management |
| `src/features/stamp/lib/types/stampFlowTypes.ts` | TypeScript types |
| `src/features/stamp/ui/sections/CustomizationSection/` | Step 6 components |
| `src/lib/printPlacement/config.ts` | Product configs & safe zones |
| `src/lib/printPlacement/geometricCheck.ts` | Placement verification |
| `src/services/customProductService.ts` | Image upload & product creation |
| `supabase/functions/create-custom-product/index.ts` | Server-side product creation |

### Current CustomizationSection Structure

```
CustomizationSection (Step 6)
├── CustomizationPreview (Left Panel) ← REPLACE THIS
│   └── Placeholder mockup UI (shirt icon)
└── CustomizationControls (Right Panel)
    ├── ColorSwatches
    ├── SizeSelector
    └── Create Product Button
```

---

## Design Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Preview style | Simple silhouette | Fast CSS-based preview, no API calls, instant feedback |
| MVP scope | Full implementation | All positions (front, back, neck, sleeves) based on product |
| Step size | 10% (0.10) | Quick positioning with fewer clicks |
| Rotation options | Preset buttons | 0°, 90°, 180°, 270° - most common use cases |

---

## Implementation Steps

### Step 1: State Management Extensions

**Files to modify:**
- `src/features/stamp/lib/types/stampFlowTypes.ts`
- `src/features/stamp/lib/stores/stampFlowStore.ts`
- `src/features/stamp/lib/hooks/useStampSelectors.ts`

**New Types:**

```typescript
export interface PlacementParams {
  x: number;      // 0.0-1.0
  y: number;      // 0.0-1.0
  scale: number;  // 0.1-1.0
  angle: number;  // 0, 90, 180, 270
}

export interface PrintPositionConfig {
  position: string;           // 'front', 'back', 'neck', etc.
  enabled: boolean;           // User selected this position
  placement: PlacementParams; // Placement for this position
  additionalCost: number;     // Extra cost in cents
}
```

**New Store State:**

```typescript
// Available positions from blueprint config
availablePrintPositions: string[];
setAvailablePrintPositions: (positions: string[]) => void;

// User selections per position
printPositionConfigs: Record<string, PrintPositionConfig>;
setPrintPositionConfig: (position: string, config: Partial<PrintPositionConfig>) => void;
togglePrintPosition: (position: string) => void;

// Currently editing position
activeEditPosition: string;
setActiveEditPosition: (position: string) => void;

// Reset placement to default
resetPlacementForPosition: (position: string) => void;
```

**Tests:**
- `src/features/stamp/lib/stores/__tests__/stampFlowStore.placement.test.ts`
  - Test initial state values
  - Test setAvailablePrintPositions
  - Test setPrintPositionConfig updates
  - Test togglePrintPosition enables/disables
  - Test resetPlacementForPosition resets to defaults
  - Test multiple positions can be configured independently

---

### Step 2: Print Position Selector Component

**Files to create:**
- `src/features/stamp/ui/components/PrintPositionSelector/PrintPositionSelector.tsx`
- `src/features/stamp/ui/components/PrintPositionSelector/PositionCard.tsx`
- `src/features/stamp/ui/components/PrintPositionSelector/index.ts`

**Component Structure:**

```
PrintPositionSelector
├── Section header ("Print Positions")
├── Grid of PositionCard components
│   ├── Position icon (front/back/sleeve silhouette)
│   ├── Position label
│   ├── Checkbox/toggle state
│   └── Additional cost display
└── Help text
```

**Props Interface:**

```typescript
interface PrintPositionSelectorProps {
  availablePositions: string[];
  selectedPositions: string[];
  onTogglePosition: (position: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

interface PositionCardProps {
  position: string;
  isSelected: boolean;
  additionalCost: number;
  onToggle: () => void;
  disabled?: boolean;
}
```

**Tests:**
- `src/features/stamp/ui/components/PrintPositionSelector/__tests__/PrintPositionSelector.test.tsx`
  - Renders all available positions
  - Shows loading state when isLoading
  - Disables interaction when disabled
  - Calls onTogglePosition when card clicked
  - Shows selected state visually (border/bg change)
  - Displays additional cost per position
  - Handles empty positions array gracefully
  - Keyboard navigation works (Enter/Space to toggle)

---

### Step 3: Placement Adjuster Component

**Files to create:**
- `src/features/stamp/ui/components/PlacementAdjuster/PlacementAdjuster.tsx`
- `src/features/stamp/ui/components/PlacementAdjuster/PositionControls.tsx`
- `src/features/stamp/ui/components/PlacementAdjuster/ScaleSlider.tsx`
- `src/features/stamp/ui/components/PlacementAdjuster/RotationSelector.tsx`
- `src/features/stamp/ui/components/PlacementAdjuster/index.ts`

**Component Structure:**

```
PlacementAdjuster
├── Position dropdown (select which position to edit)
├── PositionControls
│   ├── Arrow buttons (up/down/left/right) - 10% increments
│   ├── Center button
│   └── Fine-tune sliders (x, y)
├── ScaleSlider
│   ├── Decrease/Increase buttons - 10% increments
│   └── Range slider
├── RotationSelector
│   └── Preset buttons (0°, 90°, 180°, 270°)
└── Reset to Default button
```

**Props Interface:**

```typescript
interface PlacementAdjusterProps {
  positions: string[];
  activePosition: string;
  placement: PlacementParams;
  safeZone: SafeZone;
  onPositionChange: (position: string) => void;
  onPlacementChange: (placement: Partial<PlacementParams>) => void;
  onReset: () => void;
  disabled?: boolean;
}
```

**Tests:**
- `src/features/stamp/ui/components/PlacementAdjuster/__tests__/PlacementAdjuster.test.tsx`
  - Renders position dropdown with all positions
  - Arrow buttons adjust x/y by 0.10 increments
  - Center button sets x=0.5, y=anchorY
  - Scale slider updates scale value
  - Scale buttons increment/decrement by 0.10
  - Rotation buttons set correct angle values
  - Reset button calls onReset
  - Prevents adjustments outside safe zone (shows warning)
  - Disabled state prevents all interactions
  - Keyboard shortcuts work (arrow keys when focused)

---

### Step 4: Placement Preview Component

**Files to create:**
- `src/features/stamp/ui/components/PlacementPreview/PlacementPreview.tsx`
- `src/features/stamp/ui/components/PlacementPreview/ProductSilhouette.tsx`
- `src/features/stamp/ui/components/PlacementPreview/DesignOverlay.tsx`
- `src/features/stamp/ui/components/PlacementPreview/index.ts`

**Component Structure:**

```
PlacementPreview
├── Product silhouette (SVG based on category)
├── Print area boundary (dashed rectangle)
├── Safe zone indicator (inner rectangle)
└── DesignOverlay
    └── User's design image with CSS transform
```

**CSS Transform Logic:**

```typescript
const previewStyle = {
  transform: `
    translate(${(placement.x - 0.5) * 100}%, ${(placement.y - 0.5) * 100}%)
    scale(${placement.scale})
    rotate(${placement.angle}deg)
  `,
  transformOrigin: 'center center',
};
```

**Props Interface:**

```typescript
interface PlacementPreviewProps {
  imageUrl: string;
  placement: PlacementParams;
  productCategory: 'apparel' | 'tote' | 'mug';
  position: string;
  safeZone: SafeZone;
}
```

**Tests:**
- `src/features/stamp/ui/components/PlacementPreview/__tests__/PlacementPreview.test.tsx`
  - Renders product silhouette for each category
  - Applies correct CSS transform based on placement
  - Shows safe zone boundary
  - Updates visually when placement changes
  - Handles missing imageUrl gracefully
  - Different silhouettes for front vs back position

---

### Step 5: Design Adjustment Panel (Integration Component)

**Files to create:**
- `src/features/stamp/ui/components/DesignAdjustmentPanel/DesignAdjustmentPanel.tsx`
- `src/features/stamp/ui/components/DesignAdjustmentPanel/index.ts`

**Component Structure:**

```
DesignAdjustmentPanel
├── PrintPositionSelector
├── Divider
├── PlacementPreview (for active position)
├── PlacementAdjuster (for active position)
└── Summary (total additional cost)
```

**Props Interface:**

```typescript
interface DesignAdjustmentPanelProps {
  imageUrl: string;
  blueprintId: number;
  availablePositions: string[];
  printPositionConfigs: Record<string, PrintPositionConfig>;
  activePosition: string;
  productCategory: string;
  onTogglePosition: (position: string) => void;
  onPlacementChange: (position: string, placement: Partial<PlacementParams>) => void;
  onActivePositionChange: (position: string) => void;
  onResetPlacement: (position: string) => void;
  disabled?: boolean;
}
```

**Tests:**
- `src/features/stamp/ui/components/DesignAdjustmentPanel/__tests__/DesignAdjustmentPanel.test.tsx`
  - Integrates all child components correctly
  - Position selection updates active position
  - Placement changes propagate to preview
  - Total cost calculated correctly
  - All interactions work in sequence (select position → adjust → see preview)

---

### Step 6: Customization Section Integration

**Files to modify:**
- `src/features/stamp/ui/sections/CustomizationSection/CustomizationSection.tsx`
- `src/features/stamp/ui/sections/CustomizationSection/CustomizationPreview.tsx` (replace content)
- `src/features/stamp/lib/hooks/useCustomizationData.ts`

**Changes:**
1. Replace `CustomizationPreview` placeholder with `DesignAdjustmentPanel`
2. Add position/placement state to `useCustomizationData`
3. Load available positions from product config
4. Pass placement data to product creation

**Tests:**
- `src/features/stamp/ui/sections/CustomizationSection/__tests__/CustomizationSection.test.tsx`
  - Renders DesignAdjustmentPanel instead of placeholder
  - Color and size selection still works
  - Print positions loaded from config
  - Create product includes placement data
  - Disabled state during finalization

---

### Step 7: API Integration (Product Creation with Placements)

**Files to modify:**
- `src/services/customProductService.ts`
- `src/schemas/customProduct.ts`
- `supabase/functions/create-custom-product/index.ts`

**Schema Changes:**

```typescript
export const CreateCustomProductRequestSchema = z.object({
  // ... existing fields
  print_areas: z.record(z.string(), z.object({
    imageId: z.string(),
    placement: z.object({
      x: z.number().min(0).max(1),
      y: z.number().min(0).max(1),
      scale: z.number().min(0.1).max(2),
      angle: z.number(),
    }).optional(),
  })),
});
```

**Edge Function Changes:**

```typescript
// Build placeholders for each selected position
const placeholders = [];

for (const [position, data] of Object.entries(print_areas)) {
  // Use provided placement or calculate default
  const placement = data.placement ?? calculatePlacement(
    imageWidth, imageHeight,
    printAreaWidth, printAreaHeight,
    blueprintId, position
  );

  placeholders.push({
    position,
    images: [{
      id: data.imageId,
      x: placement.x,
      y: placement.y,
      scale: placement.scale,
      angle: placement.angle,
    }],
  });
}
```

**Tests:**
- `src/services/__tests__/customProductService.placement.test.ts`
  - Single position (front only) creates correctly
  - Multiple positions creates placeholders for each
  - Custom placement overrides auto-calculation
  - Missing placement uses auto-calculation
  - Invalid placement values rejected by schema

---

### Step 8: E2E Tests (Playwright)

**Files to create:**
- `src/features/stamp/__tests__/design-adjustment.e2e.spec.ts`

**Test Scenarios:**

```typescript
import { test, expect } from "@playwright/test";

test.describe("Design Adjustment Panel", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to step 6 with a generated image and selected product
    await page.goto("/stamp");
    // ... setup steps to reach step 6
  });

  test("should display available print positions for selected product", async ({ page }) => {
    // Verify positions shown based on blueprint (t-shirt has front, back, neck)
    await expect(page.getByRole("button", { name: /front/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /back/i })).toBeVisible();
  });

  test("should toggle print positions on/off", async ({ page }) => {
    const backPosition = page.getByRole("button", { name: /back/i });
    await backPosition.click();
    await expect(backPosition).toHaveAttribute("aria-pressed", "true");
    await page.screenshot({ path: "test-results/position-toggle.png" });
  });

  test("should update preview when adjusting placement", async ({ page }) => {
    // Click move up button
    await page.getByRole("button", { name: /move up/i }).click();
    // Verify preview updated (check transform style or visual)
    await page.screenshot({ path: "test-results/placement-adjusted.png" });
  });

  test("should prevent placement outside safe zone", async ({ page }) => {
    // Click move up multiple times to hit boundary
    const moveUp = page.getByRole("button", { name: /move up/i });
    for (let i = 0; i < 10; i++) {
      await moveUp.click();
    }
    // Verify warning shown
    await expect(page.getByText(/safe zone/i)).toBeVisible();
  });

  test("should reset placement to default", async ({ page }) => {
    // Adjust placement
    await page.getByRole("button", { name: /move up/i }).click();
    // Reset
    await page.getByRole("button", { name: /reset/i }).click();
    // Verify values restored (check slider positions or preview)
  });

  test("should create product with custom placements", async ({ page }) => {
    // Select back position
    await page.getByRole("button", { name: /back/i }).click();
    // Adjust placement
    await page.getByRole("button", { name: /move up/i }).click();
    // Create product
    await page.getByRole("button", { name: /create product/i }).click();
    // Wait for production step
    await expect(page.locator("#step-7")).toBeVisible();
    // Wait for final review
    await expect(page.locator("#step-8")).toBeVisible({ timeout: 130000 });
  });

  test("should handle keyboard navigation", async ({ page }) => {
    // Tab to position controls
    await page.keyboard.press("Tab");
    // Use arrow keys
    await page.keyboard.press("ArrowUp");
    // Verify focus and state changes
  });

  test("should be accessible", async ({ page }) => {
    // Check aria labels present
    await expect(page.getByRole("button", { name: /move up/i })).toHaveAttribute("aria-label");
    // Check focus visible on all interactive elements
  });
});
```

---

## File Structure

```
src/features/stamp/
├── ui/
│   ├── components/
│   │   ├── PrintPositionSelector/
│   │   │   ├── PrintPositionSelector.tsx
│   │   │   ├── PositionCard.tsx
│   │   │   ├── index.ts
│   │   │   └── __tests__/
│   │   │       └── PrintPositionSelector.test.tsx
│   │   ├── PlacementAdjuster/
│   │   │   ├── PlacementAdjuster.tsx
│   │   │   ├── PositionControls.tsx
│   │   │   ├── ScaleSlider.tsx
│   │   │   ├── RotationSelector.tsx
│   │   │   ├── index.ts
│   │   │   └── __tests__/
│   │   │       └── PlacementAdjuster.test.tsx
│   │   ├── PlacementPreview/
│   │   │   ├── PlacementPreview.tsx
│   │   │   ├── ProductSilhouette.tsx
│   │   │   ├── DesignOverlay.tsx
│   │   │   ├── index.ts
│   │   │   └── __tests__/
│   │   │       └── PlacementPreview.test.tsx
│   │   └── DesignAdjustmentPanel/
│   │       ├── DesignAdjustmentPanel.tsx
│   │       ├── index.ts
│   │       └── __tests__/
│   │           └── DesignAdjustmentPanel.test.tsx
│   └── sections/
│       └── CustomizationSection/
│           └── __tests__/
│               └── CustomizationSection.test.tsx
├── lib/
│   ├── stores/
│   │   └── __tests__/
│   │       └── stampFlowStore.placement.test.ts
│   └── hooks/
│       └── __tests__/
│           └── useCustomizationData.test.ts
└── __tests__/
    └── design-adjustment.e2e.spec.ts
```

---

## Testing Strategy

### Unit Tests (Vitest)

| Category | Focus |
|----------|-------|
| Store tests | State mutations, selectors, reset logic |
| Component tests | Render, props, events, accessibility |
| Hook tests | Data derivation, memoization, effects |

### Integration Tests (Vitest + Testing Library)

| Category | Focus |
|----------|-------|
| Panel integration | All components work together |
| Data flow | Store → hooks → components → events → store |

### E2E Tests (Playwright)

| Category | Focus |
|----------|-------|
| Full user journey | Navigate, select, adjust, create |
| Visual verification | Screenshots at key states |
| Accessibility | Keyboard navigation, screen reader |
| Error handling | Invalid states, network failures |

### Test Coverage Requirements

- [ ] All user events (click, input, keyboard)
- [ ] All component states (loading, disabled, error, success)
- [ ] All boundary conditions (min/max values, empty arrays)
- [ ] Accessibility (aria labels, focus management)
- [ ] Screenshots captured and reviewed

---

## Verification Checklist

### Automated Tests

```bash
# Run unit tests
npm run test -- --run

# Run E2E tests
npm run test:e2e

# View E2E report
npm run test:e2e:report
```

### Manual Verification

- [ ] Navigate to Step 6 with a generated image
- [ ] Select different print positions
- [ ] Adjust placement using all controls (arrows, sliders, rotation)
- [ ] Verify preview updates in real-time
- [ ] Create product and verify mockups show correct placements
- [ ] Check Step 8 shows all selected positions

### Accessibility Check

- [ ] Tab through all controls
- [ ] Verify focus indicators visible
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Check color contrast ratios

### Screenshot Review

- [ ] UI consistency with design system (Stamp colors, fonts)
- [ ] Responsive behavior (mobile, tablet, desktop)
- [ ] Contrast ratios meet WCAG guidelines

---

## Dependencies

**No new dependencies required.** Using existing:

- Tailwind CSS (styling)
- Radix UI (sliders, dropdowns)
- Zustand (state management)
- TanStack Query (server state)
- Vitest (unit testing)
- Playwright (E2E testing)
- Testing Library (component testing)

---

## Sources

- [Printify API Reference](https://developers.printify.com/)
- [T-shirt Design Placement Guide](https://printify.com/blog/t-shirt-design-placement-guide/)
- [Print Areas Differences](https://help.printify.com/hc/en-us/articles/4483637776401-How-are-the-print-areas-different)
- [Safe Areas and Bleeds](https://help.printify.com/hc/en-us/articles/4483626015889-What-are-safe-areas-and-bleeds)
