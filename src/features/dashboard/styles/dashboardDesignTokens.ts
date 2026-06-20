/**
 * Dashboard Superdesign Design Tokens
 * STAMP.AI | Concrete Studio Dashboard
 * Draft ID: 5bb0a114-0749-4223-88cd-7bade8b9c7cc
 */

export const dashboardDesignTokens = {
  // Color Palette
  colors: {
    concrete: "#f2f2f2",
    ink: "#0a0a0a",
    purple: "#9333ea",
    cyan: "#06b6d4",
    orange: "#fb923c",
    red: "#dc2626",
    green: "#10b981",
    yellow: "#fbbf24",
  },

  // Typography Scale
  typography: {
    // Hero / Page Title
    hero: {
      title:
        "font-anton text-6xl md:text-8xl uppercase tracking-tighter leading-none",
      subtitle:
        "text-[10px] md:text-xs font-bold tracking-[0.4em] uppercase opacity-30",
    },

    // Card Titles
    card: {
      title: "font-anton text-3xl md:text-4xl uppercase tracking-tighter",
      subtitle: "text-[8px] font-bold tracking-[0.3em] uppercase opacity-30",
      label: "text-[9px] font-bold tracking-[0.25em] uppercase opacity-40",
      value: "font-anton text-5xl md:text-6xl uppercase tracking-tighter",
      smallValue: "font-anton text-2xl md:text-3xl uppercase tracking-tight",
      meta: "text-[10px] tracking-[0.2em] uppercase opacity-30",
    },

    // Button / CTA
    button: {
      primary: "font-anton text-xs md:text-sm tracking-widest uppercase",
      secondary: "text-[10px] font-bold tracking-[0.2em] uppercase",
    },

    // List / Table
    list: {
      header: "text-[8px] font-bold tracking-[0.3em] uppercase opacity-30",
      item: "text-sm font-space",
      badge: "text-[9px] font-bold tracking-widest uppercase",
    },

    // Modal
    modal: {
      title: "font-anton text-5xl md:text-6xl uppercase tracking-tighter",
      subtitle: "text-sm tracking-wide uppercase opacity-60",
      stepTitle: "font-anton text-3xl uppercase tracking-tight",
      label: "text-[10px] font-bold tracking-[0.2em] uppercase opacity-40",
    },
  },

  // Spacing & Layout
  spacing: {
    card: {
      padding: "p-8 md:p-10",
      gap: "gap-6 md:gap-8",
      minHeight: "min-h-[280px]",
    },
    section: {
      padding: "py-12 md:py-16",
      gap: "gap-8 md:gap-12",
    },
    page: {
      padding: "px-6 md:px-12 py-8 md:py-12",
      maxWidth: "max-w-7xl",
    },
  },

  // Border & Effects
  effects: {
    card: {
      border: "border border-ink/10",
      borderLeft: "border-l-4",
      shadow: "shadow-[0_2px_8px_rgba(0,0,0,0.02)]",
      hoverShadow: "hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]",
    },
    accentBar: {
      purple: "h-1 w-20 bg-purple",
      cyan: "h-1 w-20 bg-cyan",
      orange: "h-1 w-20 bg-orange",
    },
  },

  // Animations
  animations: {
    transition: "transition-all duration-300",
    transitionFast: "transition-all duration-150",
    transitionSlow: "transition-all duration-500",
  },
} as const;

/**
 * Helper function to get status badge color classes
 */
export function getDashboardStatusColor(status: string): {
  bg: string;
  border: string;
  text: string;
} {
  const statusMap: Record<
    string,
    { bg: string; border: string; text: string }
  > = {
    delivered: {
      bg: "bg-green/5",
      border: "border-green/20",
      text: "text-green",
    },
    shipped: {
      bg: "bg-cyan/5",
      border: "border-cyan/20",
      text: "text-cyan",
    },
    processing: {
      bg: "bg-orange/5",
      border: "border-orange/20",
      text: "text-orange",
    },
    pending: {
      bg: "bg-purple/5",
      border: "border-purple/20",
      text: "text-purple",
    },
    cancelled: {
      bg: "bg-red/5",
      border: "border-red/20",
      text: "text-red",
    },
  };

  return statusMap[status.toLowerCase()] || statusMap.pending;
}

/**
 * Helper function to get card accent color
 */
export function getCardAccentColor(
  variant: "purple" | "cyan" | "orange" | "green" | "red",
): string {
  const colorMap = {
    purple: "border-l-purple",
    cyan: "border-l-cyan",
    orange: "border-l-orange",
    green: "border-l-green",
    red: "border-l-red",
  };

  return colorMap[variant];
}
