// Color palette and gradient definitions

export const colors = {
  // Primary gradients
  primaryGradient: "bg-linear-to-r from-purple-500 via-pink-500 to-red-500",
  secondaryGradient: "bg-linear-to-r from-blue-500 via-purple-500 to-pink-500",
  accentGradient: "bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600",

  // Background gradients
  backgroundGradient: "bg-linear-to-br from-purple-50 via-pink-50 to-blue-50",
  cardGradient: "bg-linear-to-br from-white via-purple-50/30 to-pink-50/30",
  darkGradient: "bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900",

  // Button gradients
  buttonPrimary: "bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
  buttonSecondary: "bg-linear-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600",
  buttonSuccess: "bg-linear-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600",
  buttonDanger: "bg-linear-to-r from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600",

  // Text gradients
  textGradient: "bg-linear-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent",
  textSecondary: "bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent",

  // Shadow colors
  purpleShadow: "shadow-lg shadow-purple-500/25",
  pinkShadow: "shadow-lg shadow-pink-500/25",
  blueShadow: "shadow-lg shadow-blue-500/25",
  colorfulShadow: "shadow-xl shadow-purple-500/20",

  // Border gradients
  borderGradient: "border border-transparent bg-linear-to-r from-purple-500 via-pink-500 to-blue-500 bg-clip-border",
  borderAccent: "border-2 border-purple-200 hover:border-purple-400",

  // Upload zone colors
  uploadIdle: "border-purple-300 hover:border-purple-400 hover:bg-purple-50/50",
  uploadActive: "border-pink-400 bg-linear-to-br from-purple-50 to-pink-50",
  uploadSuccess: "border-green-400 bg-linear-to-br from-green-50 to-emerald-50",

  // Upload zone background gradients
  uploadZoneBase: "bg-linear-to-br from-purple-50/50 via-purple-100/40 to-pink-50/50 dark:from-gray-800/80 dark:via-purple-800/30 dark:to-pink-800/30 backdrop-blur-sm",
  uploadZoneActive: "bg-linear-to-br from-purple-50 via-pink-50 to-blue-50",
  uploadZoneHover: "hover:bg-linear-to-br hover:from-purple-50 hover:to-pink-50",

  // Icon gradients
  iconGradientPrimary: "bg-linear-to-r from-purple-500 to-pink-500",
  iconGradientSecondary: "bg-linear-to-r from-blue-500 to-purple-500",

  // Preview gradients
  previewBorder: "bg-linear-to-r from-purple-500 via-pink-500 to-blue-500",
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

export const colorfulBorder = "bg-linear-to-r from-purple-500 via-pink-500 to-blue-500 p-[2px] rounded-lg";

export const hoverGlow = {
  purple: "hover:shadow-lg hover:shadow-purple-500/50 transition-shadow duration-300",
  pink: "hover:shadow-lg hover:shadow-pink-500/50 transition-shadow duration-300",
  blue: "hover:shadow-lg hover:shadow-blue-500/50 transition-shadow duration-300",
  rainbow: "hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300",
} as const;