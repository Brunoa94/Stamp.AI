/**
 * Brutalist Visual Effects
 *
 * Hard shadows, grain overlays, and brutalist hover effects
 */

export const brutalistEffects = {
  // Grain overlay (applied globally)
  grainOverlay: "grain-overlay",

  // Hard offset shadows
  shadowHard: "shadow-[8px_8px_0px_rgba(10,10,10,0.05)]",
  shadowHardDark: "shadow-[8px_8px_0px_rgba(10,10,10,0.1)]",
  shadowHardInk: "shadow-[8px_8px_0px_rgba(10,10,10,1)]",

  // Hover effects
  grayscaleHover: "grayscale-hover", // Grayscale → color + scale
  navLinkHover: "nav-link", // Line-through on hover

  // Animated elements
  animatedDot: "animated-dot", // Rotating gradient dot
  ctaGradientBorder: "cta-gradient-border", // Animated gradient border

  // Gradient backgrounds (for dark sections)
  conicGradient: "bg-[conic-gradient(from_0deg,#9333ea,#06b6d4,#fb923c,#9333ea)]",
  conicGradient120: "bg-[conic-gradient(from_120deg,#06b6d4,#fb923c,#9333ea,#06b6d4)]",
  conicGradient240: "bg-[conic-gradient(from_240deg,#fb923c,#9333ea,#06b6d4,#fb923c)]",

  // Animations
  animateGradientRotate8s: "animate-[gradientRotate_8s_linear_infinite]",
  animateGradientRotate12s: "animate-[gradientRotate_12s_linear_infinite_reverse]",
  animateGradientRotate16s: "animate-[gradientRotate_16s_linear_infinite]",
  animateFloat40s: "animate-[float_40s_ease-in-out_infinite]",
  animateFloatReverse45s: "animate-[floatReverse_45s_ease-in-out_infinite]",
  animateFloat50s: "animate-[float_50s_ease-in-out_infinite_reverse]",
  animatePulseSlow20s: "animate-[pulseSlow_20s_ease-in-out_infinite]",
} as const;
