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
export const getButtonVariant = (variant: keyof typeof componentThemes.button) =>
  componentThemes.button[variant];

export const getCardVariant = (variant: keyof typeof componentThemes.card) =>
  componentThemes.card[variant];

export const getTextVariant = (variant: keyof typeof componentThemes.text) =>
  componentThemes.text[variant];

export const combineClasses = (...classes: string[]) =>
  classes.filter(Boolean).join(' ');