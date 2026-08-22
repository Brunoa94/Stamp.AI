/**
 * Component theme definitions
 *
 * This file contains only the themes that are actively used in the codebase.
 * Each theme is exported individually for better tree-shaking.
 *
 * Usage:
 *   import { containerTheme } from "@/theme/components";
 *   // NOT: import { componentThemes } from "@/theme/components";
 */

// =============================================================================
// CONTAINER THEME
// Used by: PageContainer.tsx
// =============================================================================

export const containerTheme = {
  pageContent: "w-full relative z-10",
} as const;

// =============================================================================
// CHECKOUT THEME
// Used by: PaymentMethodSelector.tsx
// =============================================================================

export const checkoutTheme = {
  paymentMethodSelector: {
    container: "flex gap-3 mb-6",
    button:
      "flex-1 flex items-center gap-3 py-4 px-4 rounded-xl border-2 transition-all duration-200",
    buttonActive: "border-[#7C3AED] bg-[#7C3AED]/5 shadow-sm",
    buttonInactive:
      "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
    icon: "w-6 h-6 shrink-0",
    labelWrap: "flex flex-col text-left",
    label: "font-heading text-sm tracking-wider text-slate-900",
    description: "text-xs text-slate-500",
    checkmark:
      "ml-auto w-5 h-5 rounded-full bg-[#7C3AED] text-white text-xs flex items-center justify-center",
  },
} as const;

// =============================================================================
// PAYMENT ERROR THEME
// Used by: AlternativePaymentMethods.tsx
// =============================================================================

export const paymentErrorTheme = {
  altMethodsBlock: "pt-4",
  altMethodsLabel:
    "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4",
  altMethodsGrid: "grid grid-cols-3 gap-3",
  altMethodBtn:
    "alt-payment-pill flex items-center justify-center gap-1 py-3 bg-white/50 text-xs font-heading tracking-wide uppercase",
} as const;

// =============================================================================
// NOT FOUND THEME
// Used by: not-found.tsx
// =============================================================================

export const notFoundTheme = {
  page: "pt-32 relative flex items-center justify-center px-12 md:px-24",
  wrapper:
    "w-full max-w-4xl text-center space-y-0 animate-in fade-in slide-in-from-bottom-12 duration-1000",
  titleRow: "mb-12",
  titleIconWrap: "lost-icon-404 text-[#7C3AED] mb-6 inline-block",
  titleIcon: "w-16 h-16 md:w-20 md:h-20",
  title:
    "text-4xl md:text-6xl font-heading tracking-[0.25em] uppercase bg-linear-to-r from-[#7C3AED] via-[#4F46E5] to-[#06B6D4] bg-clip-text text-transparent",
  numberWrap: "relative inline-block mb-0",
  numberGlow:
    "text-8xl sm:text-[180px] md:text-[240px] font-heading text-slate-900 leading-none block opacity-10 blur-xl absolute inset-0 select-none",
  numberMain:
    "text-8xl sm:text-[180px] md:text-[240px] font-heading text-slate-900 leading-none block glitch-text-404 relative z-10",
} as const;

// =============================================================================
// BUY CREDITS THEME
// Used by: CreditPackageCard.tsx, CreditPackageSelector.tsx, CreditSelectionStep.tsx,
//          CreditPaymentStep.tsx, CreditSummary.tsx, CustomCreditInput.tsx, StripeCardForm.tsx
// =============================================================================

// =============================================================================
// BUY CREDITS THEME
// Used by: CreditPackageCard.tsx, CreditPackageSelector.tsx, CreditSelectionStep.tsx,
//          CreditPaymentStep.tsx, CreditSummary.tsx, CustomCreditInput.tsx, StripeCardForm.tsx
// =============================================================================

export const buyCreditsTheme = {
  // Package card
  packageCard: {
    base: "relative w-full h-auto min-h-26 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200",
    selected: "border-[#7C3AED] bg-[#7C3AED]/5 shadow-md",
    unselected: "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
    creditsRow: "flex items-center gap-1.5 mb-1",
    creditsIcon: "w-5 h-5",
    creditsIconSelected: "text-[#FF8C42]",
    creditsIconUnselected: "text-slate-400",
    creditsValue: "text-2xl font-heading font-bold",
    creditsValueSelected: "text-slate-900",
    creditsValueUnselected: "text-slate-700",
    price: "text-sm font-medium text-slate-500",
  },
  popularBadge:
    "absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-linear-to-r from-[#7C3AED] to-[#06B6D4] text-white text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1",
  selectedCheckmark:
    "absolute top-2 right-2 w-5 h-5 rounded-full bg-[#7C3AED] text-white flex items-center justify-center",
  // Package selector
  packageSelector: {
    grid: "grid grid-cols-2 gap-3",
  },
  // Custom input
  customInput: {
    container:
      "w-full h-auto min-h-18 p-4 rounded-xl border-2 transition-all duration-200 text-left",
    containerSelected: "border-[#7C3AED] bg-[#7C3AED]/5",
    containerUnselected: "border-slate-200 hover:border-slate-300",
    row: "flex items-center gap-3",
    iconBox: "w-10 h-10 rounded-lg flex items-center justify-center",
    iconBoxSelected: "bg-[#7C3AED]/10",
    iconBoxUnselected: "bg-slate-100",
    price: "text-sm font-medium text-slate-600",
    error: "text-xs text-red-500 mt-2",
  },
  // Summary
  summary: {
    container: "p-4 rounded-xl bg-slate-50 border border-slate-200",
    row: "flex justify-between items-center",
    creditsWrap: "flex items-center gap-2",
    creditsIcon: "w-5 h-5 text-[#FF8C42]",
    creditsLabel: "font-heading font-bold text-slate-900",
    priceValue: "text-xl font-heading font-bold text-slate-900",
  },
  // Payment step
  paymentStep: {
    backButton:
      "text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1",
  },
  // Selection step
  selectionStep: {
    container: "space-y-6",
    submitButton:
      "w-full h-12 bg-linear-to-r from-[#7C3AED] to-[#06B6D4] text-white font-heading font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50",
  },
  // Section label
  sectionLabel:
    "text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 block",
} as const;
