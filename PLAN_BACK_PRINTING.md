# Plan: Implement Back Printing Support

## Overview
Add the ability for users to print designs on the back of clothing items (t-shirts, hoodies). The backend already supports multi-position printing, but the UI currently only shows the front position.

## Design Decisions
- **Pricing**: Same price regardless of front or back (no additional fee)
- **Position Selection**: User chooses either front OR back (not both simultaneously)
- **Design**: Same design, user just picks which side to print on

## Current State Analysis

### What Already Works
- **Backend**: Full multi-position support exists in `create-custom-product` edge function
- **Config**: Products already define `positions: ['front', 'back', 'neck', 'left_sleeve', 'right_sleeve']` in `src/lib/printPlacement/config.ts`
- **State Management**: `stampFlowStore.ts` already tracks `printPositionConfigs` with per-position placement
- **Components**: `PrintPositionSelector` and `PositionCard` exist for selecting positions
- **Resolution**: `resolvePrintAreas.ts` already handles mapping positions to print areas

### What Needs to be Implemented
The UI currently doesn't expose back printing to users. Changes needed:

---

## Implementation Plan

### Phase 1: UI - Enable Position Selection

**1.1 Update PrintPositionSelector for front/back toggle**
- File: `src/features/stamp/ui/components/PrintPositionSelector/PrintPositionSelector.tsx`
- Change from multi-select to single-select (radio-style) for front/back
- Show "Front" and "Back" options for apparel products

**1.2 Update PositionCard for back option**
- File: `src/features/stamp/ui/components/PrintPositionSelector/PositionCard.tsx`
- Add appropriate icon/visual for "back" position
- Change toggle behavior to radio-style (selecting one deselects the other)

### Phase 2: Preview - Show Back View

**2.1 Add back silhouette to ProductSilhouette**
- File: `src/features/stamp/ui/components/PlacementPreview/ProductSilhouette.tsx`
- Create SVG silhouette showing product from behind
- Support category: apparel (t-shirt, hoodie back views)

**2.2 Update PlacementPreview for back position**
- File: `src/features/stamp/ui/components/PlacementPreview/PlacementPreview.tsx`
- Show back silhouette when editing back position
- Print area config for back position

**2.3 Add back print area configuration**
- File: `src/features/stamp/lib/config/printAreaConfig.ts`
- Define print area rectangle for back position (similar to front)

### Phase 3: State Management

**3.1 Update stampFlowStore for single position selection**
- File: `src/features/stamp/lib/stores/stampFlowStore.ts`
- Track which position is selected (front or back)
- Only one position enabled at a time

**3.2 Update useDesignAdjustment hook**
- File: `src/features/stamp/lib/hooks/useDesignAdjustment.ts`
- Handle position change (front ↔ back)
- Reset or preserve placement when switching positions

### Phase 4: Product Creation

**4.1 Update CustomProductService**
- File: `src/services/customProductService.ts`
- Send all enabled positions with their placements to edge function
- Already mostly implemented, verify it works with back position

**4.2 Verify edge function handles back position**
- File: `supabase/functions/create-custom-product/index.ts`
- Already supports multi-position, verify back works correctly

### Phase 5: Translations & Polish

**5.1 Add translations for back position**
- File: `src/i18n/messages/en.json`
- Add labels: "Front", "Back", "Print Position" etc.

**5.2 Polish UI**
- Ensure smooth transitions when switching positions
- Clear visual indication of selected position

---

## Critical Files to Modify

| File | Changes |
|------|---------|
| `src/features/stamp/ui/components/PrintPositionSelector/PrintPositionSelector.tsx` | Show back option |
| `src/features/stamp/ui/components/PlacementPreview/ProductSilhouette.tsx` | Add back SVG |
| `src/features/stamp/ui/components/PlacementPreview/PlacementPreview.tsx` | Support back preview |
| `src/features/stamp/lib/config/printAreaConfig.ts` | Add back print area |
| `src/features/stamp/lib/stores/stampFlowStore.ts` | Initialize back position |
| `src/features/stamp/lib/hooks/useDesignAdjustment.ts` | Handle back editing |
| `src/services/customProductService.ts` | Verify single position works |
| `src/i18n/messages/en.json` | Add back position labels |
| `src/lib/printPlacement/config.ts` | Verify back position config |

---

## Verification Plan

1. **Unit Tests**: Update existing tests in `useCustomizationHandlers.test.tsx` and `customProductService.printAreas.test.ts`
2. **Manual Testing**:
   - Select a t-shirt product
   - Toggle between front and back positions
   - Adjust placement on back position
   - Preview should show back silhouette when back is selected
   - Create product and verify Printify receives the selected position
3. **Edge Cases**:
   - Products without back support (mugs, socks) should not show back option
   - Switching between front/back should work smoothly

---

## Implementation Order

1. **Phase 1 & 2**: UI and Preview (enable selection + show back view)
2. **Phase 3**: State Management (track selected position)
3. **Phase 4**: Product Creation (verify backend works)
4. **Phase 5**: Translations & Polish

## Estimated Scope
- ~7-8 files to modify
- Main work is in UI/preview components
- Backend already supports this feature
- No pricing changes needed
