// Design system box shadow values
// These provide consistent depth and elevation across the application

export const shadows = {
  // Soft, subtle shadow for floating cards
  float: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",

  // Medium elevation shadow
  elevated: "0 20px 40px -10px rgba(0, 0, 0, 0.15), 0 10px 15px -3px rgba(0, 0, 0, 0.1)",

  // Glassmorphism effect with inset border highlight
  glass: "0 25px 50px -12px rgba(0, 0, 0, 0.05), inset 0 0 0 1px rgba(255, 255, 255, 0.25)",

  // Strong shadow for modals and overlays
  overlay: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",

  // Inner shadow for inset elements
  inset: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",

  // Colored shadows for specific states
  primary: "0 10px 25px -5px rgba(59, 130, 246, 0.3)",
  success: "0 10px 25px -5px rgba(34, 197, 94, 0.3)",
  error: "0 10px 25px -5px rgba(239, 68, 68, 0.3)",
  warning: "0 10px 25px -5px rgba(245, 158, 11, 0.3)",
} as const;

// Shadow keys for type safety
export type ShadowKey = keyof typeof shadows;

// Utility function to get shadow value
export const getShadow = (key: ShadowKey): string => shadows[key];
