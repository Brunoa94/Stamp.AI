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

  // Wizard upload area styles
  wizardUploadArea: {
    uploadArea: {
      base: "h-full w-full border-2 border-dashed border-white/40 bg-white/20 rounded-xl flex flex-col items-center justify-center p-12 transition-soft hover:bg-white/30 hover:border-white/60 group cursor-pointer relative shadow-inner",
      active: "border-white/60 bg-white/30",
      iconContainer: "w-28 h-28 bg-white rounded-lg flex items-center justify-center mb-8 transition-soft group-hover:scale-110 group-hover:-rotate-3",
      heading: "text-4xl font-normal font-heading text-slate-900 mb-2 tracking-wide",
      subtitle: "text-slate-500 mb-10 text-lg font-accent italic",
      infoText: "mt-12 text-xs font-accent text-slate-400 tracking-wide",
    },
    preview: {
      container: "flex flex-col items-center justify-center h-full",
      imageWrapper: "relative w-full max-w-md mx-auto rounded-xl overflow-hidden border-2",
      imageContainer: "max-h-[400px] overflow-hidden bg-white",
      fileInfo: "text-center",
      fileName: "text-sm font-medium text-slate-700",
      fileSize: "text-xs text-slate-500",
    },
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
    // Basic loading indicators
    spinner: `animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600`,
    shimmer: `${animationClasses.shimmer} bg-linear-to-r from-gray-100 via-slate-100 to-gray-100 rounded-lg`,
    pulse: `${animations.pulse} bg-linear-to-r from-gray-200 to-slate-200 rounded-lg`,

    // Container variants
    container: `max-w-md w-full space-y-8 text-center`,
    section: `h-full flex items-center justify-center`,

    // Progress spinner styles
    spinnerContainer: `relative`,
    mainSpinner: `w-20 h-20 animate-spin`,
    spinnerInnerIcon: `absolute inset-0 flex items-center justify-center`,
    spinnerInnerPackage: `w-10 h-10 animate-pulse`,

    // Text styles
    title: `text-3xl font-heading font-semibold text-slate-900 dark:text-slate-100`,
    subtitle: `text-lg text-slate-600 dark:text-slate-400 font-accent`,
    message: `text-sm text-slate-500 dark:text-slate-400 italic font-accent`,

    // Progress step styles
    stepContainer: `flex items-center gap-3 justify-center text-slate-700 dark:text-slate-300`,
    stepIcon: `w-5 h-5 animate-pulse`,
    stepText: `text-sm font-medium font-accent`,

    // Progress bar styles
    progressBarContainer: `w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden`,
    progressBarFill: `h-full`,
  },

  // Navbar styles
  navbar: {
    container: `bg-white border-b border-[#E8E0F0] sticky top-0 z-50`,
    inner: `max-w-[1440px] mx-auto px-6`,
    content: `flex justify-between h-20 items-center`,
    
    brand: {
      link: `flex items-center gap-3 group cursor-pointer`,
      text: `text-2xl font-retro-heading tracking-widest uppercase`,
      dot: `inline-block mx-0.5 w-2 h-2 rounded-full [background:linear-gradient(45deg,#7C3AED,#06B6D4,#FF8C42)] [background-size:200%_200%] animate-[gradientPulse_3s_ease-in-out_infinite]`,
    },

    navigation: {
      container: `hidden md:flex items-center gap-4`,
      link: {
        base: `px-5 py-2 text-sm font-retro-heading tracking-widest rounded transition-soft`,
        active: `text-slate-900 bg-slate-50`,
        inactive: `text-slate-500 hover:text-slate-900 hover:bg-slate-50`,
      },
      stampButton: `px-6 py-2.5 text-base font-retro-heading tracking-widest text-white bg-[#7C3AED] rounded shadow-[0_4px_14px_rgba(124,58,237,0.3)] transition-soft hover:bg-[#6D28D9] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:-translate-y-0.5`,
    },

    actions: {
      container: `flex items-center gap-3`,
      themeButton: `w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#7C3AED] hover:bg-[#F3ECFF] rounded-md transition-soft`,
      divider: `h-6 w-px bg-slate-200`,
      profileButton: `flex items-center gap-2 pl-2 group`,
      profileIcon: `w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-[#F3ECFF] group-hover:text-[#7C3AED] transition-soft`,
      signOutButton: `ml-2 px-5 py-2 text-sm font-retro-heading tracking-widest text-white bg-[#FF4444] rounded transition-soft hover:bg-[#E03333] hover:shadow-[0_4px_14px_rgba(255,68,68,0.3)] hover:-translate-y-0.5`,
    },
  },

  // Footer styles
  footer: {
    container: `bg-white border-t border-slate-100 pt-16 pb-16 mt-16`,
    inner: `max-w-[1440px] mx-auto px-10`,
    brandWrap: `flex flex-col items-center justify-center mb-16`,
    brandText: `text-3xl font-normal font-heading tracking-widest text-slate-900 uppercase`,
    grid: `grid grid-cols-1 md:grid-cols-4 gap-16 mb-20`,
    missionTitle: `font-normal font-heading text-2xl text-slate-900 mb-8 tracking-wide`,
    missionText: `text-slate-500 text-sm leading-loose max-w-xs font-accent italic`,
    sectionTitle: `font-normal font-heading text-2xl text-slate-900 mb-8 tracking-wide`,
    linkList: `space-y-4 text-sm font-accent`,
    link: `text-slate-500 hover:text-[#7C3AED] transition-soft`,
    bottom: `pt-10 border-t border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8`,
    copyright: `text-slate-400 text-sm font-accent`,
    socialRow: `flex gap-2`,
    socialButton: `text-slate-400 hover:text-[#7C3AED] transition-soft`,
  },

  // Cart page styles
  cart: {
    page: {
      container: `min-h-screen bg-[#F8F8FA]`,
      main: `flex-grow w-full max-w-[1440px] mx-auto px-6 md:px-16 xl:px-24 py-12`,
      grid: `grid grid-cols-1 lg:grid-cols-12 gap-8`,
      itemsColumn: `lg:col-span-8 flex flex-col gap-4`,
      summaryColumn: `lg:col-span-4`,
      sideDivider: `fixed top-0 bottom-0 w-px bg-[#E8E0F0] z-40 hidden xl:block pointer-events-none`,
      sideDividerLeft: `left-12`,
      sideDividerRight: `right-12`,
    },
    header: {
      container: `mb-10`,
      title: `text-5xl md:text-6xl font-retro-heading font-extrabold uppercase tracking-tight text-slate-900`,
      subtitle: `text-sm font-bold uppercase tracking-widest text-slate-400 mt-2`,
    },
    item: {
      card: `glass-card p-6 rounded-lg flex flex-col sm:flex-row items-center gap-6`,
      imageWrap: `w-32 h-32 bg-white rounded-md shrink-0 flex items-center justify-center border border-gray-100 p-2`,
      image: `w-full h-full object-contain`,
      details: `flex-grow text-center sm:text-left`,
      title: `font-retro-heading font-bold text-xl uppercase tracking-tight text-slate-900`,
      subtitle: `text-sm text-slate-500 font-bold uppercase tracking-wider mb-4`,
      chipsRow: `flex flex-wrap justify-center sm:justify-start gap-4 text-sm font-bold`,
      chip: `px-2 py-1 bg-gray-100 rounded text-slate-700`,
      qtyPriceWrap: `flex flex-col items-center sm:items-end gap-3 min-w-[120px]`,
      qtyControl: `flex items-center gap-3`,
      qtyValue: `text-base font-bold w-4 text-center`,
      price: `text-xl font-retro-heading font-bold text-slate-900`,
      remove: `text-xs uppercase font-bold text-red-500 hover:underline tracking-widest`,
      quantityButton: `h-8 w-8 border border-[#E8E0F0] bg-white rounded-md hover:border-[#7C3AED] hover:text-[#7C3AED]`,
    },
    actions: {
      row: `flex flex-col sm:flex-row items-center gap-4 mt-6`,
      continueLink: `w-full sm:w-auto px-8 py-4 border-2 border-gray-200 hover:border-[#7C3AED] hover:text-[#7C3AED] font-bold uppercase tracking-widest text-sm rounded-lg transition-soft inline-flex items-center justify-center gap-2`,
    },
    summary: {
      card: `glass-card p-8 rounded-lg sticky top-32`,
      title: `text-2xl font-retro-heading font-bold uppercase tracking-tight mb-8`,
      rows: `space-y-4 mb-8`,
      row: `flex justify-between text-base`,
      rowLabel: `font-bold text-slate-500 uppercase tracking-wider`,
      rowValue: `font-bold text-slate-900`,
      freeValue: `font-bold text-green-600 uppercase`,
      totalRow: `border-t border-gray-100 pt-4 mt-4 flex justify-between items-end`,
      totalLabel: `font-retro-heading font-extrabold text-xl uppercase tracking-tight`,
      totalValue: `font-retro-heading font-extrabold text-3xl text-[#7C3AED]`,
      checkoutButton: `w-full py-5 bg-linear-to-br from-[#7C3AED] to-[#06B6D4] text-white font-retro-heading font-extrabold uppercase tracking-widest rounded-lg shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all inline-flex items-center justify-center gap-3`,
      secureText: `text-xs text-center text-slate-400 font-bold uppercase tracking-widest leading-relaxed mt-3`,
      arrivalWrap: `mt-10 p-4 bg-white/50 rounded-lg border border-dashed border-gray-200`,
      arrivalHeader: `flex items-center gap-3 mb-2`,
      arrivalLabel: `text-xs font-bold uppercase tracking-widest`,
      arrivalValue: `text-sm font-medium text-slate-600`,
    },
    empty: {
      container: `flex flex-col items-center justify-center min-h-[400px] text-center px-4`,
      iconWrap: `w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6`,
      title: `text-5xl font-retro-heading text-slate-900`,
      description: `text-lg text-slate-600 mt-2 mb-8 max-w-md`,
      action: `px-6 py-3 bg-linear-to-r from-[#7C3AED] to-[#06B6D4] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity`,
    },
  },

  // Orders page styles
  orders: {
    header: {
      container: `mb-10`,
      title: `text-6xl md:text-8xl font-retro-heading text-slate-900 leading-none mb-4`,
      decorativeRow: `flex items-center gap-4`,
      decorativeLine: `h-1.5 w-24 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full`,
      subtitle: `text-slate-400 font-light italic font-accent`,
    },
    filters: {
      container: `glass-card rounded-xl px-8 py-5 mb-8 border border-white/60 flex flex-wrap lg:flex-nowrap items-center gap-x-12 gap-y-4`,
      timeframeLabel: `text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap`,
      selectWrapper: `relative min-w-[160px]`,
      select: `w-full px-4 py-2.5 bg-white/50 border border-slate-200 rounded text-sm font-bold text-slate-700 focus:ring-2 focus:ring-[#7C3AED]/20 outline-none appearance-none cursor-pointer`,
      statusLabel: `text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest mr-2`,
      chipBase: `px-4 py-2 rounded-full text-sm font-bold border border-slate-200 hover:border-[#7C3AED] transition-all`,
      chipActive: `px-4 py-2 rounded-full text-sm font-bold border border-[#7C3AED] bg-[#7C3AED] text-white`,
    },
    table: {
      container: `glass-card rounded-xl overflow-hidden border border-white/60`,
      table: `w-full`,
      thead: `bg-slate-50/50 border-b border-slate-200`,
      th: `px-8 py-5 text-left text-xs font-bold text-slate-500 uppercase tracking-widest`,
      thRight: `px-8 py-5 text-right text-xs font-bold text-slate-500 uppercase tracking-widest`,
      tbody: `divide-y divide-slate-100`,
      row: `order-row transition-colors hover:bg-[#7C3AED]/[0.03]`,
      cell: `px-8 py-8`,
      orderNumber: `text-base font-bold text-slate-900`,
      orderDate: `text-sm text-slate-400 mt-1`,
      itemsStack: `flex -space-x-3 overflow-hidden`,
      itemImage: `inline-block h-10 w-10 rounded-lg ring-2 ring-white object-cover bg-slate-100`,
      itemBadge: `inline-flex items-center justify-center h-10 w-10 rounded-lg bg-slate-800 text-white text-xs font-bold ring-2 ring-white`,
      statusBadge: `badge-status px-2.5 py-1 rounded text-xs font-bold tracking-wide uppercase`,
      statusProcessing: `bg-blue-100 text-blue-600`,
      statusDelivered: `bg-green-100 text-green-600`,
      statusShipped: `bg-orange-100 text-orange-600`,
      statusCancelled: `bg-red-100 text-red-600`,
      total: `text-base font-bold text-slate-900`,
      actions: `flex items-center justify-end gap-3`,
      viewButton: `px-5 py-2.5 bg-[#7C3AED] text-white text-sm font-bold rounded hover:bg-[#6D28D9] transition-all`,
      reorderButton: `px-5 py-2.5 bg-white border border-slate-200 text-slate-600 text-sm font-bold rounded hover:bg-slate-50 transition-all`,
    },
    pagination: {
      container: `px-8 py-6 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between`,
      info: `text-xs text-slate-400 font-medium font-accent italic`,
      controls: `flex items-center gap-2`,
      button: `w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50`,
      pageButton: `w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-xs text-slate-600 hover:border-[#7C3AED] transition-all`,
      pageButtonActive: `w-8 h-8 flex items-center justify-center rounded bg-[#7C3AED] text-white text-xs font-bold`,
    },
    sideBorders: {
      container: `flowing-border-container`,
      left: `side-border-left hidden xl:block`,
      right: `side-border-right hidden xl:block`,
    },
  },
} as const;

// Individual theme exports for better tree-shaking
export const cardTheme = componentThemes.card;
export const buttonTheme = componentThemes.button;
export const inputTheme = componentThemes.input;
export const textTheme = componentThemes.text;
export const containerTheme = componentThemes.container;
export const wizardUploadAreaTheme = componentThemes.wizardUploadArea;
export const statusTheme = componentThemes.status;
export const loadingTheme = componentThemes.loading;
export const navbarTheme = componentThemes.navbar;
export const footerTheme = componentThemes.footer;
export const cartTheme = componentThemes.cart;
export const ordersTheme = componentThemes.orders;

// Utility functions
export const getButtonVariant = (variant: keyof typeof componentThemes.button) =>
  componentThemes.button[variant];

export const getCardVariant = (variant: keyof typeof componentThemes.card) =>
  componentThemes.card[variant];

export const getTextVariant = (variant: keyof typeof componentThemes.text) =>
  componentThemes.text[variant];

export const combineClasses = (...classes: string[]) =>
  classes.filter(Boolean).join(' ');