// Reusable component themes and styling patterns

import { colors } from "./colors";
import { animations, animationClasses } from "./animations";

export const componentThemes = {
  // Card variants
  card: {
    base: `${colors.cardGradient} backdrop-blur-sm border border-purple-100 rounded-2xl ${colors.colorfulShadow} ${animationClasses.cardHover}`,
    elevated: `${colors.cardGradient} backdrop-blur-sm border border-purple-200 rounded-2xl shadow-2xl shadow-purple-500/30 ${animationClasses.cardHover}`,
    floating: `${colors.cardGradient} backdrop-blur-sm border border-purple-100 rounded-2xl ${colors.colorfulShadow} ${animations.float}`,
  },

  // Button variants
  button: {
    primary: `${colors.buttonPrimary} text-white font-semibold py-3 px-6 rounded-xl ${animationClasses.buttonHover} ${colors.purpleShadow}`,
    secondary: `${colors.buttonSecondary} text-white font-semibold py-3 px-6 rounded-xl ${animationClasses.buttonHover} ${colors.blueShadow}`,
    success: `${colors.buttonSuccess} text-white font-semibold py-3 px-6 rounded-xl ${animationClasses.buttonHover}`,
    outline: `border-2 border-purple-300 text-purple-600 hover:bg-purple-50 font-semibold py-3 px-6 rounded-xl ${animationClasses.buttonHover}`,
    ghost: `text-purple-600 hover:bg-purple-50 font-semibold py-2 px-4 rounded-lg ${animationClasses.buttonHover}`,
  },

  // Input variants
  input: {
    base: `w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 bg-white/50 backdrop-blur-sm`,
    textarea: `w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/20 transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none`,
    error: `border-red-400 focus:border-red-500 focus:ring-red-500/20`,
    success: `border-green-400 focus:border-green-500 focus:ring-green-500/20`,
  },

  // Upload zone variants
  uploadZone: {
    base: `border-3 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 transform hover:scale-105 ${colors.uploadZoneBase}`,
    idle: `border-purple-300 hover:border-purple-400 ${colors.uploadZoneHover} hover:shadow-lg hover:shadow-purple-500/20`,
    active: `border-pink-400 ${colors.uploadZoneActive} shadow-xl shadow-pink-500/25 ${animations.pulse}`,
    icon: `p-4 rounded-full ${colors.iconGradientPrimary}`,
  },

  // Image preview variants
  imagePreview: {
    container: "space-y-6 animate-[fadeInScale_0.5s_ease-out]",
    wrapper: "relative group",
    border: `${colors.previewBorder} p-1 rounded-2xl`,
    image: "w-full max-w-md mx-auto rounded-xl shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]",
    successBadge: `absolute -top-3 -right-3 w-8 h-8 ${colors.previewSuccess} rounded-full flex items-center justify-center shadow-lg animate-[bounceIn_0.6s_ease-out]`,
    removeButton: "absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-all duration-200 hover:scale-110 active:scale-95",
    info: `text-center p-4 rounded-xl ${colors.previewInfo} border border-green-200`,
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
    section: `${colors.cardGradient} rounded-2xl p-8 ${colors.colorfulShadow}`,
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
    spinner: `animate-spin rounded-full h-12 w-12 border-4 border-purple-200 border-t-purple-600`,
    shimmer: `${animationClasses.shimmer} bg-gradient-to-r from-purple-100 via-pink-100 to-purple-100 rounded-lg`,
    pulse: `${animations.pulse} bg-gradient-to-r from-purple-200 to-pink-200 rounded-lg`,
  },
} as const;

// Utility functions
export const getButtonVariant = (variant: keyof typeof componentThemes.button) =>
  componentThemes.button[variant];

export const getCardVariant = (variant: keyof typeof componentThemes.card) =>
  componentThemes.card[variant];

export const getTextVariant = (variant: keyof typeof componentThemes.text) =>
  componentThemes.text[variant];

export const combineClasses = (...classes: string[]) =>
  classes.filter(Boolean).join(' ');