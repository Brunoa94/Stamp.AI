/**
 * Brutalist Typography System
 *
 * Anton (display) + Space Grotesk (body) typography configuration
 */

export const brutalistTypography = {
  // Font family utilities
  fontAnton: "font-heading",
  fontSpace: "font-heading",

  // Heading classes (Anton - all caps, tight tracking)
  h1: "font-heading text-[12vw] leading-[0.85] tracking-tighter uppercase",
  h2: "font-heading text-6xl md:text-7xl lg:text-9xl uppercase tracking-tighter leading-none",
  h3: "font-heading text-3xl md:text-4xl uppercase tracking-tight leading-tight",
  h4: "font-heading text-2xl md:text-3xl uppercase tracking-tight",
  h5: "font-heading text-xl md:text-2xl uppercase tracking-tight",

  // Body classes (Space Grotesk - uppercase, wide tracking)
  body: "font-heading text-base font-light tracking-wide uppercase",
  bodySmall: "font-heading text-sm font-light tracking-wide uppercase",
  bodyXs: "font-heading text-xs font-light tracking-wide uppercase",

  // Label/UI text (Space Grotesk - bold, widest tracking)
  label: "font-heading text-xs font-bold tracking-widest uppercase",
  labelSmall: "font-heading text-[10px] font-bold tracking-[0.4em] uppercase",
  labelTiny: "font-heading text-[9px] font-bold tracking-[0.3em] uppercase",

  // Special effects
  layeredShadow: "layered-shadow", // Multi-layer text shadow (defined in CSS)
} as const;
