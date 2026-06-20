export type AccentColorT = "purple" | "cyan" | "orange" | "green" | "white";

export const accentColors: Record<AccentColorT, string> = {
  purple: "border-l-brandPurple",
  cyan: "border-l-brandCyan",
  orange: "border-l-brandOrange",
  green: "border-l-brandGreen",
  white: "border-l-white",
} as const;
