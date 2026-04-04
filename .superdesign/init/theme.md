# Theme & Design Tokens

Includes full token sources and theme configuration.

---

## globals.css

- Path: `src/app/globals.css`

```css
@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: var(--font-poppins);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-heading);
  --font-accent: "Zodiak", serif;
  --color-sidebar-ring: var(--sidebar-ring);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar: var(--sidebar);
  --color-chart-5: var(--chart-5);
  --color-chart-4: var(--chart-4);
  --color-chart-3: var(--chart-3);
  --color-chart-2: var(--chart-2);
  --color-chart-1: var(--chart-1);
  --color-ring: var(--ring);
  --color-input: var(--input);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
  --color-accent-foreground: var(--accent-foreground);
  --color-accent: var(--accent);
  --color-muted-foreground: var(--muted-foreground);
  --color-muted: var(--muted);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-secondary: var(--secondary);
  --color-primary-foreground: var(--primary-foreground);
  --color-primary: var(--primary);
  --color-popover-foreground: var(--popover-foreground);
  --color-popover: var(--popover);
  --color-card-foreground: var(--card-foreground);
  --color-card: var(--card);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);
}

:root {
  --radius: 0.625rem;
  --background: #f8f8fa;
  --foreground: oklch(0.141 0.005 285.823);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.141 0.005 285.823);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.141 0.005 285.823);
  --primary: oklch(0.21 0.006 285.885);
  --primary-foreground: oklch(0.985 0 0);
  --secondary: oklch(0.967 0.001 286.375);
  --secondary-foreground: oklch(0.21 0.006 285.885);
  --muted: oklch(0.967 0.001 286.375);
  --muted-foreground: oklch(0.552 0.016 285.938);
  --accent: oklch(0.967 0.001 286.375);
  --accent-foreground: oklch(0.21 0.006 285.885);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.92 0.004 286.32);
  --input: oklch(0.92 0.004 286.32);
  --ring: oklch(0.705 0.015 286.067);
  --chart-1: oklch(0.646 0.222 41.116);
  --chart-2: oklch(0.6 0.118 184.704);
  --chart-3: oklch(0.398 0.07 227.392);
  --chart-4: oklch(0.828 0.189 84.429);
  --chart-5: oklch(0.769 0.188 70.08);
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.141 0.005 285.823);
  --sidebar-primary: oklch(0.21 0.006 285.885);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.967 0.001 286.375);
  --sidebar-accent-foreground: oklch(0.21 0.006 285.885);
  --sidebar-border: oklch(0.92 0.004 286.32);
  --sidebar-ring: oklch(0.705 0.015 286.067);
}

.dark {
  --background: oklch(0.141 0.005 285.823);
  --foreground: oklch(0.985 0 0);
  --card: oklch(0.21 0.006 285.885);
  --card-foreground: oklch(0.985 0 0);
  --popover: oklch(0.21 0.006 285.885);
  --popover-foreground: oklch(0.985 0 0);
  --primary: oklch(0.92 0.004 286.32);
  --primary-foreground: oklch(0.21 0.006 285.885);
  --secondary: oklch(0.274 0.006 286.033);
  --secondary-foreground: oklch(0.985 0 0);
  --muted: oklch(0.274 0.006 286.033);
  --muted-foreground: oklch(0.705 0.015 286.067);
  --accent: oklch(0.274 0.006 286.033);
  --accent-foreground: oklch(0.985 0 0);
  --destructive: oklch(0.704 0.191 22.216);
  --border: oklch(1 0 0 / 10%);
  --input: oklch(1 0 0 / 15%);
  --ring: oklch(0.552 0.016 285.938);
  --chart-1: oklch(0.488 0.243 264.376);
  --chart-2: oklch(0.696 0.17 162.48);
  --chart-3: oklch(0.769 0.188 70.08);
  --chart-4: oklch(0.627 0.265 303.9);
  --chart-5: oklch(0.645 0.246 16.439);
  --sidebar: oklch(0.21 0.006 285.885);
  --sidebar-foreground: oklch(0.985 0 0);
  --sidebar-primary: oklch(0.488 0.243 264.376);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.274 0.006 286.033);
  --sidebar-accent-foreground: oklch(0.985 0 0);
  --sidebar-border: oklch(1 0 0 / 10%);
  --sidebar-ring: oklch(0.552 0.016 285.938);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground font-sans;
  }
}

/* Retro Design System Utilities */
@layer utilities {
  .font-heading {
    font-family: var(--font-heading);
    letter-spacing: 0.05em;
  }

  .font-accent {
    font-family: "Zodiak", serif;
  }

  /* Transition utility matching HTML design */
  .transition-soft {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Glass card effect */
  .glass-card {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow:
      0 25px 50px -12px rgba(0, 0, 0, 0.05),
      inset 0 0 0 1px rgba(255, 255, 255, 0.25);
  }

  /* Flowing border container with decorative side borders */
  .flowing-border-container {
    position: relative;
  }

  .flowing-border-container::before {
    left: 0;
  }

  .flowing-border-container::after {
    right: 0;
    transform: scaleX(-1);
  }
}

/* Custom Animations */
@keyframes bounceIn {
  0% {
    opacity: 0;
    transform: scale(0.3) rotate(-10deg);
  }
  50% {
    opacity: 1;
    transform: scale(1.05) rotate(5deg);
  }
  70% {
    transform: scale(0.9) rotate(-2deg);
  }
  100% {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes glow {
  from {
    box-shadow: 0 0 20px rgba(168, 85, 247, 0.4);
  }
  to {
    box-shadow:
      0 0 40px rgba(168, 85, 247, 0.8),
      0 0 60px rgba(236, 72, 153, 0.3);
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  10%,
  30%,
  50%,
  70%,
  90% {
    transform: translateX(-5px);
  }
  20%,
  40%,
  60%,
  80% {
    transform: translateX(5px);
  }
}

@keyframes wiggle {
  0%,
  100% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(-3deg);
  }
  75% {
    transform: rotate(3deg);
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0) rotate(180deg);
  }
  to {
    transform: scale(1) rotate(0deg);
  }
}

@keyframes scaleHover {
  from {
    transform: scale(1);
  }
  to {
    transform: scale(1.05);
  }
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes rainbow {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

@keyframes pulse-rainbow {
  0%,
  100% {
    background-size: 200% 200%;
    background-position: left center;
  }
  50% {
    background-size: 200% 200%;
    background-position: right center;
  }
}

/* Checkout Progress Animations */
@keyframes checkout-shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes checkout-checkmark {
  0% {
    stroke-dasharray: 0, 100;
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    stroke-dasharray: 100, 0;
    opacity: 1;
  }
}

@keyframes checkout-pulse-ring {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

@keyframes checkout-spinner {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes checkout-step-complete {
  0% {
    transform: scale(0.8);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1.1);
  }
}

@keyframes checkout-step-active {
  0%,
  100% {
    transform: scale(1.05);
  }
  50% {
    transform: scale(1.08);
  }
}

/* Checkout Header Animations */
@keyframes checkout-gradient-shift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

/* Stamp It Continuous Animation */
@keyframes stamp-gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

@keyframes stamp-sparkle {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
  }
  25% {
    transform: rotate(-10deg) scale(1.1);
  }
  50% {
    transform: rotate(10deg) scale(1.05);
  }
  75% {
    transform: rotate(-5deg) scale(1.15);
  }
}
```

---

## Theme exports

- Path: `src/theme/index.ts`

```ts
// Main theme export file

export * from "./animations";
export * from "./colors";
export * from "./components";
export * from "./icons";

// Pre-built theme combinations with dark mode support
export const theme = {
  page: {
    background:
      "bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100 dark:from-gray-900 dark:via-slate-900/20 dark:to-gray-900/20 min-h-screen transition-colors duration-300",
    container: "container mx-auto px-4 py-8",
  },

  dashboard: {
    header: "text-center mb-12",
    title:
      "h-14 text-5xl font-bold bg-gradient-to-r from-slate-700 via-gray-700 to-slate-800 dark:from-slate-400 dark:via-gray-400 dark:to-slate-400 bg-clip-text text-transparent animate-[fadeInUp_0.8s_ease-out]",
    subtitle:
      "text-xl text-gray-600 dark:text-gray-300 animate-[fadeInUp_0.8s_ease-out_0.2s_both]",
    grid: "grid md:grid-cols-2 gap-12",
  },

  upload: {
    section: "space-y-6",
    card: "bg-gradient-to-br from-gray-50/50 via-slate-100/40 to-gray-100/50 dark:from-gray-800/80 dark:via-slate-800/30 dark:to-gray-800/30 backdrop-blur-sm border border-gray-200 dark:border-slate-800/30 rounded-2xl p-8 shadow-xl shadow-slate-500/20 dark:shadow-slate-500/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-gray-500/30 dark:hover:shadow-gray-500/20",
    title:
      "text-2xl font-bold bg-gradient-to-r from-slate-700 to-gray-700 dark:from-slate-400 dark:to-gray-400 bg-clip-text text-transparent mb-6",
  },

  prompt: {
    section: "space-y-6",
    card: "relative bg-transparent backdrop-blur-md rounded-2xl p-8 shadow-xl shadow-slate-500/20 dark:shadow-slate-500/10 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-gray-500/30 dark:hover:shadow-gray-500/20 before:content-[''] before:absolute before:inset-0 before:rounded-2xl before:p-[2px] before:bg-gradient-to-r before:from-slate-400 before:via-gray-400 before:to-slate-500 dark:before:from-slate-500 dark:before:via-gray-500 dark:before:to-slate-600 before:-z-10 after:content-[''] after:absolute after:inset-[2px] after:rounded-2xl after:bg-white/5 dark:after:bg-gray-900/80 after:-z-10",
    title:
      "text-2xl font-bold bg-gradient-to-r from-slate-700 to-gray-700 dark:from-slate-400 dark:to-gray-400 bg-clip-text text-transparent",
  },

  button: {
    submit: {
      base: "w-full py-4 text-lg font-semibold rounded-2xl transition-all duration-300",
      enabled:
        "bg-gradient-to-r from-slate-600 via-gray-600 to-slate-700 hover:from-slate-700 hover:via-gray-700 hover:to-slate-800 dark:from-slate-600 dark:via-gray-600 dark:to-slate-700 dark:hover:from-slate-700 dark:hover:via-gray-700 dark:hover:to-slate-800 text-white shadow-lg hover:shadow-xl hover:shadow-slate-500/30 dark:hover:shadow-slate-500/40 hover:scale-105 active:scale-95",
      disabled:
        "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed",
    },
  },

  animations: {
    slideInLeft: "animate-[slideInLeft_0.6s_ease-out]",
    slideInRight: "animate-[slideInRight_0.6s_ease-out]",
    bounceIn: "animate-[bounceIn_0.6s_ease-out]",
    fadeIn: "animate-[fadeIn_0.6s_ease-out]",
    float: "animate-[float_3s_ease-in-out_infinite]",
  },
} as const;
```

---

## Colors

- Path: `src/theme/colors.ts`

```ts
// Color palette and gradient definitions

export const colors = {
  // Purple gradients (new wizard theme)
  purplePrimary:
    "bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700",
  purpleLight: "bg-gradient-to-br from-purple-50 via-violet-50 to-white",
  purpleAccent: "bg-gradient-to-r from-purple-500 to-indigo-600",
  purpleBorder: "border-purple-500",
  purpleText: "text-purple-600",
  purpleBg: "bg-purple-50",

  // Primary gradients
  primaryGradient: "bg-linear-to-r from-slate-500 via-gray-500 to-slate-600",
  secondaryGradient: "bg-linear-to-r from-slate-500 via-gray-500 to-slate-600",
  accentGradient: "bg-linear-to-r from-slate-400 via-gray-500 to-slate-600",

  // Background gradients
  backgroundGradient: "bg-linear-to-br from-gray-50 via-slate-50 to-gray-100",
  cardGradient: "bg-linear-to-br from-white via-slate-50/30 to-gray-50/30",
  darkGradient: "bg-linear-to-br from-slate-900 via-gray-900 to-slate-900",

  // Button gradients
  buttonPrimary:
    "bg-linear-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800",
  buttonSecondary:
    "bg-linear-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700",
  buttonSuccess:
    "bg-linear-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600",
  buttonDanger:
    "bg-linear-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700",

  // Text gradients
  textGradient:
    "bg-linear-to-r from-slate-600 via-gray-600 to-slate-700 bg-clip-text text-transparent",
  textSecondary:
    "bg-linear-to-r from-slate-600 via-gray-600 to-slate-700 bg-clip-text text-transparent",

  // Shadow colors
  slateShadow: "shadow-lg shadow-slate-500/25",
  grayShadow: "shadow-lg shadow-gray-500/25",
  neutralShadow: "shadow-lg shadow-slate-500/25",
  subtleShadow: "shadow-xl shadow-slate-500/20",

  // Border gradients
  borderGradient:
    "border border-transparent bg-linear-to-r from-slate-500 via-gray-500 to-slate-600 bg-clip-border",
  borderAccent: "border-2 border-gray-200 hover:border-gray-400",

  // Upload zone colors
  uploadIdle: "border-gray-300 hover:border-slate-400 hover:bg-slate-50/50",
  uploadActive: "border-slate-400 bg-linear-to-br from-slate-50 to-gray-50",
  uploadSuccess: "border-green-400 bg-linear-to-br from-green-50 to-emerald-50",

  // Upload zone background gradients
  uploadZoneBase:
    "bg-linear-to-br from-slate-50/50 via-gray-100/40 to-slate-50/50 dark:from-gray-800/80 dark:via-slate-800/30 dark:to-gray-800/30 backdrop-blur-sm",
  uploadZoneActive: "bg-linear-to-br from-slate-50 via-gray-50 to-slate-100",
  uploadZoneHover: "hover:bg-linear-to-br hover:from-slate-50 hover:to-gray-50",

  // Icon gradients
  iconGradientPrimary: "bg-linear-to-r from-slate-500 to-gray-600",
  iconGradientSecondary: "bg-linear-to-r from-slate-500 to-gray-600",

  // Preview gradients
  previewBorder: "bg-linear-to-r from-slate-500 via-gray-500 to-slate-600",
  previewSuccess: "bg-linear-to-r from-green-400 to-emerald-500",
  previewInfo: "bg-linear-to-r from-green-50 to-emerald-50",

  // Status colors
  success: "text-green-600 bg-green-50 border-green-200",
  warning: "text-yellow-600 bg-yellow-50 border-yellow-200",
  error: "text-red-600 bg-red-50 border-red-200",
  info: "text-blue-600 bg-blue-50 border-blue-200",
} as const;

export const gradientText = (gradient: string) =>
  `${gradient} bg-clip-text text-transparent bg-[length:200%_200%]`;

export const glowEffect = (color: string) =>
  `drop-shadow-[0_0_10px_${color}] filter`;

export const colorfulBorder =
  "bg-linear-to-r from-slate-500 via-gray-500 to-slate-600 p-[2px] rounded-lg";

export const hoverGlow = {
  slate:
    "hover:shadow-lg hover:shadow-slate-500/50 transition-shadow duration-300",
  gray: "hover:shadow-lg hover:shadow-gray-500/50 transition-shadow duration-300",
  neutral:
    "hover:shadow-lg hover:shadow-slate-500/50 transition-shadow duration-300",
  subtle:
    "hover:shadow-xl hover:shadow-gray-500/30 transition-all duration-300",
} as const;
```

---

## Component Themes

- Path: `src/theme/components.ts`

```ts
// Reusable component themes and styling patterns

import { colors } from "./colors";
import { animations, animationClasses } from "./animations";

export const componentThemes = {
  // Card variants
  card: {
    base: `${colors.cardGradient} backdrop-blur-sm border border-gray-200 rounded-2xl ${colors.subtleShadow} ${animationClasses.cardHover}`,
    elevated: `${colors.cardGradient} backdrop-blur-sm border border-gray-300 rounded-2xl shadow-2xl shadow-slate-500/30 ${animationClasses.cardHover}`,
    floating: `${colors.cardGradient} backdrop-blur-sm border border-gray-200 rounded-2xl ${colors.subtleShadow} ${animations.float}`,
  },

  // Button variants
  button: {
    primary: `${colors.buttonPrimary} text-white font-semibold py-3 px-6 rounded-xl ${animationClasses.buttonHover} ${colors.slateShadow}`,
    secondary: `${colors.buttonSecondary} text-white font-semibold py-3 px-6 rounded-xl ${animationClasses.buttonHover} ${colors.grayShadow}`,
    success: `${colors.buttonSuccess} text-white font-semibold py-3 px-6 rounded-xl ${animationClasses.buttonHover}`,
    outline: `border-2 border-gray-300 text-slate-700 hover:bg-gray-50 font-semibold py-3 px-6 rounded-xl ${animationClasses.buttonHover}`,
    ghost: `text-slate-700 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg ${animationClasses.buttonHover}`,
  },

  // Input variants
  input: {
    base: `w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-slate-500 focus:ring-4 focus:ring-slate-500/20 transition-all duration-300 bg-white/50 backdrop-blur-sm`,
    textarea: `w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-slate-500 focus:ring-4 focus:ring-slate-500/20 transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none`,
    error: `border-red-400 focus:border-red-500 focus:ring-red-500/20`,
    success: `border-green-400 focus:border-green-500 focus:ring-green-500/20`,
  },

  // Text variants
  text: {
    heading: `font-bold ${colors.textGradient} text-4xl mb-4`,
    subheading: `font-semibold ${colors.textSecondary} text-2xl mb-3`,
    body: `text-gray-700 leading-relaxed`,
    caption: `text-sm text-gray-600`,
    label: `text-sm font-medium text-gray-700 mb-2`,
  },

  // Container variants
  container: {
    page: `${colors.backgroundGradient} min-h-screen`,
    section: `${colors.cardGradient} rounded-2xl p-8 ${colors.subtleShadow}`,
    grid: `grid gap-8 md:grid-cols-2`,
  },

  // Status indicators
  status: {
    success: `${colors.success} px-4 py-2 rounded-full text-sm font-medium ${animations.fadeIn}`,
    warning: `${colors.warning} px-4 py-2 rounded-full text-sm font-medium ${animations.fadeIn}`,
    error: `${colors.error} px-4 py-2 rounded-full text-sm font-medium ${animations.shake}`,
    info: `${colors.info} px-4 py-2 rounded-full text-sm font-medium ${animations.fadeIn}`,
  },

  // Loading states
  loading: {
    spinner: `animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600`,
    shimmer: `${animationClasses.shimmer} bg-linear-to-r from-gray-100 via-slate-100 to-gray-100 rounded-lg`,
    pulse: `${animations.pulse} bg-linear-to-r from-gray-200 to-slate-200 rounded-lg`,
  },
} as const;

// Utility functions
export const getButtonVariant = (
  variant: keyof typeof componentThemes.button,
) => componentThemes.button[variant];

export const getCardVariant = (variant: keyof typeof componentThemes.card) =>
  componentThemes.card[variant];

export const getTextVariant = (variant: keyof typeof componentThemes.text) =>
  componentThemes.text[variant];

export const combineClasses = (...classes: string[]) =>
  classes.filter(Boolean).join(" ");
```

---

## Animations

- Path: `src/theme/animations.ts`

```ts
// Animation utilities and keyframe definitions

export const animations = {
  // Bounce animations
  bounce: "animate-bounce",
  bounceIn: "animate-[bounceIn_0.6s_ease-out]",

  // Fade animations
  fadeIn: "animate-[fadeIn_0.6s_ease-out]",
  fadeInUp: "animate-[fadeInUp_0.8s_ease-out]",
  fadeInScale: "animate-[fadeInScale_0.5s_ease-out]",

  // Pulse and glow
  pulse: "animate-pulse",
  glow: "animate-[glow_2s_ease-in-out_infinite_alternate]",

  // Shake and wiggle
  shake: "animate-[shake_0.5s_ease-in-out]",
  wiggle: "animate-[wiggle_0.8s_ease-in-out_infinite]",

  // Floating
  float: "animate-[float_3s_ease-in-out_infinite]",

  // Scale animations
  scaleIn: "animate-[scaleIn_0.3s_ease-out]",
  scaleHover: "hover:animate-[scaleHover_0.2s_ease-out]",

  // Slide animations
  slideInLeft: "animate-[slideInLeft_0.6s_ease-out]",
  slideInRight: "animate-[slideInRight_0.6s_ease-out]",

  // Rainbow animations
  rainbow: "animate-[rainbow_3s_linear_infinite]",
  rainbowText:
    "bg-linear-to-r from-slate-400 via-gray-500 to-slate-600 bg-clip-text text-transparent animate-[rainbow_3s_linear_infinite]",
} as const;

export const animationClasses = {
  // Container animations
  cardHover:
    "transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-slate-500/25",
  buttonHover:
    "transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95",

  // Loading states
  shimmer:
    "relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-linear-to-r before:from-transparent before:via-white/60 before:to-transparent",

  // Interactive elements
  clickable:
    "cursor-pointer transition-transform duration-150 hover:scale-105 active:scale-95",

  // Borders and outlines
  glowBorder:
    "border border-transparent bg-linear-to-r from-slate-500 via-gray-500 to-slate-600 bg-clip-border",
} as const;

// CSS keyframes to be added to globals.css
export const keyframes = `
  @keyframes bounceIn {
    0% { opacity: 0; transform: scale(0.3) rotate(-10deg); }
    50% { opacity: 1; transform: scale(1.05) rotate(5deg); }
    70% { transform: scale(0.9) rotate(-2deg); }
    100% { opacity: 1; transform: scale(1) rotate(0deg); }
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes fadeInScale {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }

  @keyframes glow {
    from { box-shadow: 0 0 20px rgba(100, 116, 139, 0.4); }
    to { box-shadow: 0 0 40px rgba(100, 116, 139, 0.8), 0 0 60px rgba(148, 163, 184, 0.3); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
  }

  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(-3deg); }
    75% { transform: rotate(3deg); }
  }

  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }

  @keyframes scaleIn {
    from { transform: scale(0) rotate(180deg); }
    to { transform: scale(1) rotate(0deg); }
  }

  @keyframes scaleHover {
    from { transform: scale(1); }
    to { transform: scale(1.05); }
  }

  @keyframes slideInLeft {
    from { opacity: 0; transform: translateX(-100%); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes slideInRight {
    from { opacity: 0; transform: translateX(100%); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes rainbow {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }

  @keyframes shimmer {
    100% { transform: translateX(100%); }
  }
`;
```

---

## Icons

- Paths: `src/theme/icons/*.tsx`

```tsx
interface AlertTriangleIconProps {
  className?: string;
}

export const AlertTriangleIcon = ({
  className = "w-12 h-12",
}: AlertTriangleIconProps) => {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  );
};
```

```tsx
interface ArrowRightIconProps {
  className?: string;
}

export const ArrowRightIcon = ({
  className = "w-5 h-5",
}: ArrowRightIconProps) => {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 7l5 5m0 0l-5 5m5-5H6"
      />
    </svg>
  );
};
```

```tsx
interface CheckCircleIconProps {
  className?: string;
}

export const CheckCircleIcon = ({
  className = "w-6 h-6",
}: CheckCircleIconProps) => {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
};
```

```tsx
interface CreditCardIconProps {
  className?: string;
}

export const CreditCardIcon = ({
  className = "w-5 h-5",
}: CreditCardIconProps) => {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
      />
    </svg>
  );
};
```

```tsx
interface SpinnerIconProps {
  className?: string;
}

export const SpinnerIcon = ({ className = "w-8 h-8" }: SpinnerIconProps) => {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
};
```
