# Dashboard Superdesign Implementation Plan

**Project ID:** `abebac07-b231-4c31-8e6b-54f0604e3d07`
**Draft ID:** `5bb0a114-0749-4223-88cd-7bade8b9c7cc`
**Design:** STAMP.AI | Concrete Studio Dashboard
**Worktree:** `imaginary-builderai-dashboard`
**Branch:** `feature/dashboard-superdesign-refactor`
**Date:** 2026-06-14

---

## Executive Summary

This plan outlines the implementation of the Superdesign "Concrete Studio Dashboard" into our dashboard feature. The design features a comprehensive user dashboard with brutalist aesthetics, featuring:

- **User profile card** with avatar and verification badge
- **Credits & billing system** with progress bars
- **Performance metrics** (orders placed, designs created)
- **Recent orders list** with color-coded statuses
- **Quick access links** to account settings
- **Buy credits modal** with multi-step payment flow
- **Animated gradient CTA** for creating new designs

---

## Design Analysis

### 1. Visual Language

**Typography:**
- Display font: **Anton** (all caps, tight tracking)
- Body/UI font: **Space Grotesk** (various weights)
- Extreme scale contrast (text-8xl for hero, text-[8px] for metadata)

**Color Palette:**
```css
--concrete: #f2f2f2;  /* Background */
--ink: #0a0a0a;       /* Text */
--purple: #9333ea;    /* Brand primary */
--cyan: #06b6d4;      /* Brand secondary */
--orange: #fb923c;    /* Warning/alerts */
--red: #dc2626;       /* Destructive */
--green: #10b981;     /* Success */
```

**Visual Effects:**
- Grain overlay (opacity: 0.03)
- Brutalist cards with sharp corners
- Border-left accent bars (4px thick)
- Hover shadows (8px offset with low opacity)
- Animated gradient background (8s ease infinite)

**Design Tokens:**
- Border radius: Sharp (0px) for brutalist cards
- Border: 1px solid rgba(10, 10, 10, 0.1)
- Shadows: Minimal, hover-only
- Letter spacing: Very wide (0.3em to 0.4em for metadata)

### 2. Layout Architecture

**Page Structure:**
```
<body class="bg-concrete">
  <div class="grain-overlay" />

  <header class="fixed h-20" />

  <main class="pt-20">
    <!-- Payment Recovery Banner (conditional) -->
    <div class="bg-orange alert-banner" />

    <!-- Dashboard Content -->
    <div class="container">
      <!-- Dashboard Header -->
      <div class="hero-section" />

      <!-- Dashboard Grid (4-col + 8-col) -->
      <div class="grid lg:grid-cols-12">
        <!-- Left Column (4 cols) -->
        <div class="lg:col-span-4">
          - Profile Summary Card
          - Credits & Coins Card
          - Quick Access Card
        </div>

        <!-- Right Column (8 cols) -->
        <div class="lg:col-span-8">
          - Performance Metrics (2-col grid)
          - Animated CTA Card
          - Recent Orders List
        </div>
      </div>
    </div>
  </main>

  <footer />

  <!-- Buy Credits Modal -->
  <div id="credits-modal">
    <!-- Step 1: Package Selection -->
    <!-- Step 2: Payment Form -->
  </div>
</body>
```

**Header (Fixed, h-20):**
- Left: `STAMP.AI` logo with animated dot
- Center: Gradient-bordered "STAMP IT" CTA button (hidden on mobile)
- Right: User name + settings icon button

**Dashboard Hero:**
- Purple accent bar (h-1.5 w-16)
- Title: "Welcome, ALEX" (font-anton text-8xl)
- Metadata: Last sync time, protocol version
- User privilege tier badge (right side, desktop only)

### 3. Card Components

#### Profile Summary Card
```
┌─ Purple accent (4px left border) ──────┐
│ [Avatar + Badge]  Alex Rivet           │
│                   alex.rivet@email.com │
│                                        │
│ [Edit Profile Protocol Button]         │
└────────────────────────────────────────┘
```

**Specifications:**
- Border-left: 4px solid purple
- Avatar: 80x80px with pixel-art style
- Verification badge: Purple circle with checkmark (absolute positioned)
- Button: Full-width, purple border, hover background fill

#### Credits & Coins Card
```
┌─ Cyan accent (4px left border) ────────┐
│ Available Credits        [Info Icon]   │
│ [Database Icon]  1,240                 │
│                                        │
│ Usage Capacity           62% Spent     │
│ [━━━━━━━━━░░░░░░░] 62%               │
│                                        │
│ [Buy More Credits] (Gradient button)   │
└────────────────────────────────────────┘
```

**Specifications:**
- Border-left: 4px solid cyan
- Credit amount: Anton font text-5xl
- Progress bar: 2px height, cyan fill
- CTA button: Gradient background (purple → cyan)

#### Quick Access Card
```
┌─ Orange accent (4px left border) ──────┐
│ Quick Access Links                      │
│                                        │
│ ┌─────────┐  ┌─────────┐              │
│ │ ⚙       │  │ 💳      │              │
│ │ Account │  │ Billing │              │
│ └─────────┘  └─────────┘              │
└────────────────────────────────────────┘
```

**Specifications:**
- Border-left: 4px solid orange
- 2-column grid for links
- Icons: 2xl size, 40% opacity → 100% on hover
- Hover: Background tint + border color change

#### Performance Metric Cards (2-col grid)
```
┌─ Purple accent ─────┐  ┌─ Cyan accent ─────┐
│ Synthesis Metrics   │  │ Archive Storage   │
│ [Trending Up Icon]  │  │ [Box Icon]        │
│                     │  │                   │
│ 24                  │  │ 142               │
│ Orders Placed       │  │ Designs Created   │
│                     │  │                   │
│ [━━━━━━━░░] 75%   │  │ [━━░░░░░░] 48%   │
│ Target 30           │  │ Archive Limit 300 │
└─────────────────────┘  └───────────────────┘
```

**Specifications:**
- Border-left: 4px solid (purple/cyan)
- Metric value: Anton font text-5xl
- Progress bar: 1.5px height with glow shadow
- Target text: 8px uppercase, 30% opacity

#### Animated CTA Card
```
┌───────────────────────────────────────────┐
│ [Animated gradient background]            │
│                                           │
│ Ready for your next                       │
│ masterpiece?                              │
│                                           │
│ Access high-fidelity production tools...  │
│                                           │
│ [Stamp It!] (White button)                │
│                                           │
│         [Fingerprint watermark] (opacity) │
└───────────────────────────────────────────┘
```

**Specifications:**
- Background: Animated gradient (purple → cyan → orange)
- Animation: `gradientShift 8s ease infinite`
- Border-left: 4px solid white
- Text: White color
- Button: White background, ink text, hover invert
- Watermark: Fingerprint icon at 10% opacity, positioned bottom-right

#### Recent Orders List
```
┌─ Green accent ──────────────────────────────┐
│ Recent Orders  [5 Logs]  [View Archive Log] │
├─────────────────────────────────────────────┤
│ [Icon] ORD-2024-00142  Delivered    $48.00 │
│        Jan 15 • Essential Box Tee         → │
├─────────────────────────────────────────────┤
│ [Icon] ORD-2024-00141  Shipped     $170.00 │
│        Jan 12 • Archival Hoodie           → │
├─────────────────────────────────────────────┤
│ [Icon] ORD-2024-00140  Processing   $28.00 │
│        Jan 08 • Canvas Tote               → │
└─────────────────────────────────────────────┘
```

**Specifications:**
- Border-left: 4px solid green (header)
- Each row: Hover border-left (4px) + background tint
- Status colors:
  - Delivered: Green background/border
  - Shipped: Cyan background/border
  - Processing: Orange background/border
- Icon: 64x64px, concrete background
- Price: Anton font text-xl
- Chevron: Opacity 20% → color on hover

### 4. Buy Credits Modal

**Two-Step Flow:**

**Step 1: Package Selection**
```
┌─────────────────────────────────────────┐
│ [Cyan accent bar]                       │
│ Synthesis Credits                       │
│ Protocol: Credit Allocation / Step 01   │
│                                         │
│ ┌─────────┐  ┌─────────┐              │
│ │ 100     │  │ 250     │ ← Popular    │
│ │ $9.99   │  │ $19.99  │              │
│ └─────────┘  └─────────┘              │
│ ┌─────────┐  ┌─────────┐              │
│ │ 500     │  │ 1000    │              │
│ │ $34.99  │  │ $59.99  │              │
│ └─────────┘  └─────────┘              │
│                                         │
│ Custom Input (Min 10)                   │
│ [________________]                      │
│                                         │
│ [Proceed to Payment]                    │
└─────────────────────────────────────────┘
```

**Specifications:**
- 2x2 grid of package cards
- Popular package: Cyan border (2px) + background tint + label
- Hover: Border color change + shadow
- Custom input: Concrete background, Anton font
- Proceed button: Full-width, ink background, purple hover

**Step 2: Payment Form**
```
┌─────────────────────────────────────────┐
│ [Purple accent bar]                     │
│ Payment Secure                          │
│ Protocol: Encrypted Gateway / Step 02   │
│                                         │
│ ┌──────────────┐  ┌──────────────┐    │
│ │ Selection    │  │ [Stripe]     │    │
│ │ Summary      │  │ [PayPal]     │    │
│ │              │  │              │    │
│ │ 250 Credits  │  │ Card Number  │    │
│ │ $19.99       │  │ MM/YY  CVC   │    │
│ │              │  │              │    │
│ │ [← Adjust]   │  │ [Pay & Auth] │    │
│ └──────────────┘  └──────────────┘    │
│                                         │
│         🔒 256-Bit SSL Encryption       │
└─────────────────────────────────────────┘
```

**Specifications:**
- 2-column grid (summary + payment)
- Summary: Concrete background, purple accent
- Payment methods: Stripe active, PayPal disabled
- Input fields: White background, cyan focus ring
- Pay button: Cyan background, white text
- SSL badge: Center bottom, 30% opacity

### 5. Payment Recovery Banner

```
┌──────────────────────────────────────────────────┐
│ ⚠ Pending Payment Detected: Order #9901-NYC ... │
│                              [Resolve Now →]     │
└──────────────────────────────────────────────────┘
```

**Specifications:**
- Background: Orange (#fb923c)
- Text: Ink color
- Alert icon: 20px
- Link: Underline, hover white
- Full-width, below header
- Border-bottom: Orange/20

---

## Gap Analysis

### Current Implementation

**Dashboard Status:**
Let me check what currently exists...

### Visual Gaps

1. **Layout Structure:**
   - Need 12-column grid (4-col + 8-col split)
   - Current layout may be different

2. **Card Components:**
   - Need brutalist card styling with border-left accents
   - Missing credits/billing card
   - Missing performance metrics cards
   - Missing quick access card

3. **Recent Orders:**
   - Need list view with hover effects
   - Color-coded status badges
   - Icon placeholders for products

4. **Modal System:**
   - Multi-step credits purchase flow
   - Package selection cards
   - Payment form integration

5. **Animated Elements:**
   - Gradient CTA card with animation
   - Animated dot logo
   - Progress bars with glow effects

6. **Header:**
   - Fixed positioning with backdrop blur
   - User name display
   - Settings icon button

---

## Implementation Strategy

### Approach: Clean Refactor in Separate Worktree

We're implementing this in a dedicated worktree (`imaginary-builderai-dashboard`) to:
1. Avoid conflicts with ongoing orders implementation
2. Allow parallel development
3. Enable clean testing before merge
4. Preserve main branch stability

**Key Principles:**
1. Build dashboard from scratch following Superdesign spec
2. Integrate with existing auth/data systems
3. Maintain type safety throughout
4. Ensure mobile responsiveness
5. Add proper loading/error states

---

## Execution Plan

### Phase 1: Foundation & Setup
**Duration:** 1-2 hours
**Risk:** Low

#### Tasks:

1. **Set up dashboard route structure**
   - Create/verify dashboard page component
   - Set up routing if needed

2. **Add Superdesign utilities to globals**
   - Brutalist card styles
   - Grain overlay
   - Animated gradient utility
   - Modal backdrop

3. **Create design tokens**
   - Dashboard-specific color palette
   - Typography scales
   - Spacing tokens
   - Animation configurations

**Acceptance Criteria:**
- [ ] Dashboard route accessible
- [ ] Design tokens defined
- [ ] Base styles applied

---

### Phase 2: Header & Layout Shell
**Duration:** 2-3 hours
**Risk:** Low-Medium

#### Tasks:

1. **Implement fixed header**
   - Logo with animated dot
   - Center CTA button (desktop)
   - User name + settings button
   - Backdrop blur styling

2. **Create dashboard container**
   - Hero section with welcome message
   - User privilege badge
   - Metadata (last sync, protocol version)
   - 12-column grid layout

3. **Add payment recovery banner (conditional)**
   - Orange alert styling
   - Conditional rendering based on pending payments
   - Resolve link integration

**Acceptance Criteria:**
- [ ] Header fixed at top with blur
- [ ] Dashboard grid layout correct
- [ ] Hero section matches design
- [ ] Alert banner shows conditionally

---

### Phase 3: Left Column Cards
**Duration:** 3-4 hours
**Risk:** Medium

#### Tasks:

1. **Create Profile Summary Card**
   - Avatar with verification badge
   - User name and email
   - Edit profile button
   - Purple accent border

2. **Create Credits & Billing Card**
   - Credit amount display
   - Usage progress bar
   - Buy credits CTA (opens modal)
   - Cyan accent border

3. **Create Quick Access Card**
   - 2-column grid for links
   - Account settings link
   - Billing link
   - Icon hover effects
   - Orange accent border

4. **Create BrutalistCard base component**
   - Reusable card wrapper
   - Border-left accent prop
   - Hover shadow effects
   - Sharp corners

**Acceptance Criteria:**
- [ ] Profile card displays user data
- [ ] Credits card shows balance and usage
- [ ] Quick access links functional
- [ ] All cards have brutalist styling

---

### Phase 4: Right Column - Metrics & CTA
**Duration:** 3-4 hours
**Risk:** Medium

#### Tasks:

1. **Create Performance Metric Cards**
   - 2-column grid component
   - Synthesis metrics card (purple)
   - Archive storage card (cyan)
   - Progress bars with glow
   - Dynamic value calculation

2. **Create Animated CTA Card**
   - Gradient background animation
   - CTA copy and button
   - Fingerprint watermark
   - White accent border
   - Link to stamp/create page

**Acceptance Criteria:**
- [ ] Metrics display real data
- [ ] Progress bars animate correctly
- [ ] Gradient animation smooth
- [ ] CTA links to create page

---

### Phase 5: Recent Orders List
**Duration:** 3-4 hours
**Risk:** Medium-High

#### Tasks:

1. **Create Recent Orders Card**
   - Card header with badge count
   - "View Archive Log" link
   - Green accent border

2. **Create Order List Item Component**
   - Product icon placeholder
   - Order ID and metadata
   - Price display
   - Status badge (color-coded)
   - Chevron indicator
   - Hover effects (border + background)

3. **Integrate with orders API**
   - Fetch recent orders (limit 5)
   - Map order statuses to colors
   - Handle click to view details

4. **Add empty state**
   - Ghost icon illustration
   - "No Records Found" message
   - Conditional rendering

**Acceptance Criteria:**
- [ ] Recent orders display correctly
- [ ] Status colors match design
- [ ] Hover effects work
- [ ] Click opens order details
- [ ] Empty state shows when needed

---

### Phase 6: Buy Credits Modal
**Duration:** 4-5 hours
**Risk:** Medium-High

#### Tasks:

1. **Create Modal Shell**
   - Fixed positioning with backdrop
   - Close on ESC key
   - Click outside to close
   - Blur backdrop effect

2. **Create Step 1: Package Selection**
   - 2x2 grid of packages
   - Package cards (100, 250, 500, 1000)
   - Popular badge for 250 package
   - Custom amount input
   - Proceed button

3. **Create Step 2: Payment Form**
   - 2-column layout (summary + payment)
   - Selection summary card
   - Payment method buttons (Stripe/PayPal)
   - Card input fields
   - Pay & Authorize button
   - SSL encryption badge
   - Back to selection button

4. **Add step transition logic**
   - State management for current step
   - Package selection handler
   - Navigation between steps

5. **Style according to design**
   - Accent bars (cyan for step 1, purple for step 2)
   - Input field styling
   - Button hover effects
   - Shadow effects

**Acceptance Criteria:**
- [ ] Modal opens/closes correctly
- [ ] Package selection works
- [ ] Step navigation smooth
- [ ] Form fields styled correctly
- [ ] Payment integration ready

---

### Phase 7: Footer
**Duration:** 1-2 hours
**Risk:** Low

#### Tasks:

1. **Create dashboard footer**
   - Multi-column link grid
   - Logo with animated dot
   - Description text
   - Purple blob background effect
   - Border-top separator

**Acceptance Criteria:**
- [ ] Footer matches design
- [ ] Links organized in columns
- [ ] Background effect visible

---

### Phase 8: Data Integration
**Duration:** 3-4 hours
**Risk:** Medium-High

#### Tasks:

1. **Connect user profile data**
   - Fetch user info
   - Display avatar, name, email
   - Handle loading states

2. **Integrate credits system**
   - Fetch credit balance
   - Calculate usage percentage
   - Update on purchase

3. **Fetch dashboard metrics**
   - Total orders count
   - Designs created count
   - Calculate progress percentages

4. **Recent orders integration**
   - Query recent 5 orders
   - Map to display format
   - Handle empty state

5. **Add loading skeletons**
   - Card-level loading states
   - Shimmer effects
   - Progressive loading

**Acceptance Criteria:**
- [ ] All data fetches work
- [ ] Loading states display
- [ ] Error handling in place
- [ ] Real data populates correctly

---

### Phase 9: Mobile Responsiveness
**Duration:** 3-4 hours
**Risk:** Medium

#### Tasks:

1. **Responsive layout adjustments**
   - Stack columns on mobile
   - Hide desktop-only elements
   - Adjust typography scales
   - Touch-friendly buttons

2. **Mobile header**
   - Hide center CTA
   - Compact user display
   - Burger menu if needed

3. **Mobile cards**
   - Full-width on small screens
   - Stack grid items
   - Reduce padding

4. **Mobile modal**
   - Full-screen on small devices
   - Stack payment columns
   - Adjust input sizes

**Acceptance Criteria:**
- [ ] All layouts responsive
- [ ] No horizontal scroll
- [ ] Touch targets 44px minimum
- [ ] Text readable on mobile

---

### Phase 10: Animations & Polish
**Duration:** 2-3 hours
**Risk:** Low

#### Tasks:

1. **Add micro-interactions**
   - Button hover states
   - Card hover effects
   - Progress bar animations
   - Icon transitions

2. **Gradient animation**
   - Implement keyframe animation
   - Apply to CTA card
   - Optimize performance

3. **Animated dot logo**
   - Pulse animation
   - Gradient fill
   - Sync across instances

4. **Accessibility**
   - ARIA labels
   - Keyboard navigation
   - Focus states
   - Screen reader support

5. **Performance**
   - Optimize animations
   - Lazy load components
   - Image optimization

**Acceptance Criteria:**
- [ ] All animations smooth
- [ ] No jank or stuttering
- [ ] Keyboard accessible
- [ ] Screen reader friendly
- [ ] Reduced motion respected

---

### Phase 11: Testing & QA
**Duration:** 2-3 hours
**Risk:** Low

#### Tasks:

1. **Functional testing**
   - All buttons/links work
   - Modal flow complete
   - Data displays correctly
   - Forms validate

2. **Visual regression testing**
   - Compare to Superdesign mockup
   - Check all breakpoints
   - Verify colors/typography
   - Test hover states

3. **Cross-browser testing**
   - Chrome, Firefox, Safari
   - Mobile browsers
   - Handle browser quirks

4. **Performance testing**
   - Lighthouse audit
   - Bundle size check
   - Animation performance

**Acceptance Criteria:**
- [ ] All features functional
- [ ] Visual match to design
- [ ] Cross-browser compatible
- [ ] Performance acceptable

---

## File Structure

### New Files

```
src/app/dashboard/
  page.tsx                          - Dashboard page component
  layout.tsx                        - Dashboard-specific layout

src/features/dashboard/
  ui/
    DashboardHeader.tsx             - Hero section
    DashboardGrid.tsx               - Main grid container
    BrutalistCard.tsx               - Reusable card component

    cards/
      ProfileSummaryCard.tsx        - User profile card
      CreditsCard.tsx               - Credits & billing card
      QuickAccessCard.tsx           - Quick links card
      PerformanceMetricsCard.tsx    - Metrics display
      AnimatedCTACard.tsx           - Gradient CTA
      RecentOrdersCard.tsx          - Orders list

    modals/
      BuyCreditsModal.tsx           - Credits purchase modal
      PackageSelection.tsx          - Step 1 component
      PaymentForm.tsx               - Step 2 component

  lib/
    hooks/
      useDashboardData.ts           - Data fetching hook
      useCredits.ts                 - Credits management

    constants/
      dashboardDesignTokens.ts      - Design tokens
      creditPackages.ts             - Package configurations

    types/
      dashboard.ts                  - TypeScript types
```

---

## Design Tokens

### Typography

```typescript
export const dashboardTypography = {
  hero: {
    title: 'font-anton text-6xl md:text-8xl uppercase tracking-tighter leading-none',
    meta: 'text-[10px] font-bold tracking-[0.3em] uppercase opacity-40',
  },
  card: {
    title: 'font-anton text-2xl uppercase tracking-tight',
    label: 'text-[9px] font-bold uppercase tracking-[0.4em] opacity-30',
    metric: 'font-anton text-5xl tracking-tight',
    price: 'font-anton text-xl',
  },
  cta: {
    headline: 'font-anton text-4xl md:text-5xl uppercase tracking-tighter',
    description: 'text-sm uppercase tracking-widest opacity-80 font-bold',
  },
};
```

### Colors

```typescript
export const dashboardColors = {
  concrete: '#f2f2f2',
  ink: '#0a0a0a',
  purple: '#9333ea',
  cyan: '#06b6d4',
  orange: '#fb923c',
  red: '#dc2626',
  green: '#10b981',

  accents: {
    profile: 'border-l-brandPurple',
    credits: 'border-l-brandCyan',
    quickAccess: 'border-l-brandOrange',
    metrics1: 'border-l-brandPurple',
    metrics2: 'border-l-brandCyan',
    cta: 'border-l-white',
    orders: 'border-l-brandGreen',
  },
};
```

### Spacing

```typescript
export const dashboardSpacing = {
  cardPadding: 'p-8 lg:p-10',
  cardGap: 'gap-6',
  gridCols: 'lg:grid-cols-12',
  leftCol: 'lg:col-span-4',
  rightCol: 'lg:col-span-8',
};
```

### Animations

```typescript
export const dashboardAnimations = {
  gradientShift: `
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `,
  dotPulse: `
    @keyframes dotPulse {
      0%, 100% { transform: scale(0.85); opacity: 0.8; }
      50% { transform: scale(1.15); opacity: 1; }
    }
  `,
};
```

---

## Success Metrics

### Visual Fidelity
- [ ] Header matches design
- [ ] Hero section matches design
- [ ] All cards match design
- [ ] Modal matches design
- [ ] Footer matches design
- [ ] Animations smooth

### Functionality
- [ ] Data fetches correctly
- [ ] Credits system works
- [ ] Modal flow complete
- [ ] Orders display correctly
- [ ] All links functional
- [ ] Mobile responsive

### Code Quality
- [ ] TypeScript: 0 errors
- [ ] Build: Successful
- [ ] Tests: Passing
- [ ] Performance: Good
- [ ] Accessibility: AA compliant

---

## Timeline Estimate

- **Phase 1:** 1-2 hours
- **Phase 2:** 2-3 hours
- **Phase 3:** 3-4 hours
- **Phase 4:** 3-4 hours
- **Phase 5:** 3-4 hours
- **Phase 6:** 4-5 hours
- **Phase 7:** 1-2 hours
- **Phase 8:** 3-4 hours
- **Phase 9:** 3-4 hours
- **Phase 10:** 2-3 hours
- **Phase 11:** 2-3 hours

**Total Estimated Time:** 28-38 hours (4-5 working days)

---

## Next Steps

1. **Review this plan** with team/stakeholders
2. **Begin Phase 1** in the dashboard worktree
3. **Implement incrementally**, testing after each phase
4. **Conduct visual QA** against Superdesign mockup
5. **Merge to main** once complete and tested

---

## References

- **Superdesign Project:** `abebac07-b231-4c31-8e6b-54f0604e3d07`
- **Design Draft:** `5bb0a114-0749-4223-88cd-7bade8b9c7cc`
- **Design Title:** STAMP.AI | Concrete Studio Dashboard
- **Worktree:** `../imaginary-builderai-dashboard`
- **Branch:** `feature/dashboard-superdesign-refactor`

---

## Notes

- This implementation runs in parallel with the orders terminal refactor
- Worktree allows isolated development without conflicts
- Can be merged independently once complete
- Shares design system with orders (Anton + Space Grotesk, same color palette)
- Modal system can be extracted into shared components
