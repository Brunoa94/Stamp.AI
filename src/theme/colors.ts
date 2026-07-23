// Color palette and gradient definitions

export const colors = {
  // Purple gradients (new wizard theme)
  purplePrimary: "bg-gradient-to-r from-purple-600 via-violet-600 to-purple-700",
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
  buttonPrimary: "bg-linear-to-r from-slate-600 to-gray-700 hover:from-slate-700 hover:to-gray-800",
  buttonSecondary: "bg-linear-to-r from-slate-500 to-gray-600 hover:from-slate-600 hover:to-gray-700",
  buttonSuccess: "bg-linear-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600",
  buttonDanger: "bg-linear-to-r from-red-400 to-red-600 hover:from-red-500 hover:to-red-700",

  // Text gradients
  textGradient: "bg-linear-to-r from-slate-600 via-gray-600 to-slate-700 bg-clip-text text-transparent",
  textSecondary: "bg-linear-to-r from-slate-600 via-gray-600 to-slate-700 bg-clip-text text-transparent",

  // Shadow colors
  slateShadow: "shadow-lg shadow-slate-500/25",
  grayShadow: "shadow-lg shadow-gray-500/25",
  neutralShadow: "shadow-lg shadow-slate-500/25",
  subtleShadow: "shadow-xl shadow-slate-500/20",
  purpleShadow: "shadow-2xl shadow-purple-500/50",

  // Border gradients
  borderGradient: "border border-transparent bg-linear-to-r from-slate-500 via-gray-500 to-slate-600 bg-clip-border",
  borderAccent: "border-2 border-gray-200 hover:border-gray-400",

  // Upload zone colors
  uploadIdle: "border-gray-300 hover:border-slate-400 hover:bg-slate-50/50",
  uploadActive: "border-slate-400 bg-linear-to-br from-slate-50 to-gray-50",
  uploadSuccess: "border-green-400 bg-linear-to-br from-green-50 to-emerald-50",

  // Upload zone background gradients
  uploadZoneBase: "bg-linear-to-br from-slate-50/50 via-gray-100/40 to-slate-50/50 dark:from-gray-800/80 dark:via-slate-800/30 dark:to-gray-800/30 backdrop-blur-sm",
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

