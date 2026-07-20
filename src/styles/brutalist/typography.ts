/**
 * Brutalist Typography System
 *
 * Anton (display) + Space Grotesk (body) typography configuration
 */

export const brutalistTypography = {
  // Font family utilities
  fontAnton: "font-(family-name:--font-outfit)",
  fontSpace: "font-(family-name:--font-outfit)",

  // Heading classes (Anton - all caps, tight tracking)
  h1: "font-(family-name:--font-outfit) text-[12vw] leading-[0.85] tracking-tighter uppercase",
  h2: "font-(family-name:--font-outfit) text-6xl md:text-7xl lg:text-9xl uppercase tracking-tighter leading-none",
  h3: "font-(family-name:--font-outfit) text-3xl md:text-4xl uppercase tracking-tight leading-tight",
  h4: "font-(family-name:--font-outfit) text-2xl md:text-3xl uppercase tracking-tight",
  h5: "font-(family-name:--font-outfit) text-xl md:text-2xl uppercase tracking-tight",

  // Body classes (Space Grotesk - uppercase, wide tracking)
  body: "font-(family-name:--font-outfit) text-base font-light tracking-wide uppercase",
  bodySmall: "font-(family-name:--font-outfit) text-sm font-light tracking-wide uppercase",
  bodyXs: "font-(family-name:--font-outfit) text-xs font-light tracking-wide uppercase",

  // Label/UI text (Space Grotesk - bold, widest tracking)
  label: "font-(family-name:--font-outfit) text-xs font-bold tracking-widest uppercase",
  labelSmall: "font-(family-name:--font-outfit) text-[10px] font-bold tracking-[0.4em] uppercase",
  labelTiny: "font-(family-name:--font-outfit) text-[9px] font-bold tracking-[0.3em] uppercase",

  // Special effects
  layeredShadow: "layered-shadow", // Multi-layer text shadow (defined in CSS)
} as const;
