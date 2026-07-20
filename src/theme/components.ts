// Reusable component themes and styling patterns

import { colors } from "./colors";
import { animationClasses, animations } from "./animations";
import { navbarDesignSystem } from "./navbarDesignSystem";

export const componentThemes = {
  // Card variants
  card: {
    base:
      `${colors.cardGradient} backdrop-blur-sm border border-gray-200 rounded-2xl ${colors.subtleShadow} ${animationClasses.cardHover}`,
    elevated:
      `${colors.cardGradient} backdrop-blur-sm border border-gray-300 rounded-2xl shadow-2xl shadow-slate-500/30 ${animationClasses.cardHover}`,
    floating:
      `${colors.cardGradient} backdrop-blur-sm border border-gray-200 rounded-2xl ${colors.subtleShadow} ${animations.float}`,
  },

  // Button variants
  button: {
    primary:
      `${colors.buttonPrimary} text-white font-semibold py-3 px-6 rounded-xl ${colors.purpleShadow} hover:-translate-y-1.5 hover:shadow-3xl transition-all duration-300 active:scale-95`,
    secondary:
      `${colors.buttonSecondary} text-white font-semibold py-3 px-6 rounded-xl ${animationClasses.buttonHover} ${colors.grayShadow}`,
    success:
      `${colors.buttonSuccess} text-white font-semibold py-3 px-6 rounded-xl ${animationClasses.buttonHover}`,
    outline:
      `border-2 border-gray-300 text-slate-700 hover:bg-gray-50 font-semibold py-3 px-6 rounded-xl ${animationClasses.buttonHover}`,
    ghost:
      `text-slate-700 hover:bg-gray-50 font-semibold py-2 px-4 rounded-lg ${animationClasses.buttonHover}`,
    // Primary action button - use with Button component variant="default" size="lg"
    actionPrimary:
      `font-heading tracking-widest shadow-2xl shadow-purple-500/50 hover:-translate-y-1.5 hover:shadow-3xl transition-all duration-300`,
  },

  // Input variants
  input: {
    base:
      `w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-slate-500 focus:ring-4 focus:ring-slate-500/20 transition-all duration-300 bg-white/50 backdrop-blur-sm`,
    textarea:
      `w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-slate-500 focus:ring-4 focus:ring-slate-500/20 transition-all duration-300 bg-white/50 backdrop-blur-sm resize-none`,
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
    // Shared page content container - use across all pages for consistency
    // Using w-full to take full width, with right padding accounting for the navigation
    pageContent: `w-full relative z-10`,
  },

  // Wizard upload area styles
  wizardUploadArea: {
    uploadArea: {
      base:
        "h-full w-full rounded-xl flex flex-col items-center justify-center p-12 transition-soft hover:bg-white/30 hover:border-white/60 group cursor-pointer relative",
      active: "border-white/60 bg-white/30",
      iconContainer:
        "w-28 h-28 bg-white rounded-lg flex items-center justify-center mb-8 transition-soft group-hover:scale-110 group-hover:-rotate-3",
      heading:
        "text-4xl font-heading mb-2 tracking-widest uppercase bg-linear-to-r from-[#1A2340] via-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent",
      subtitle: "text-slate-500 mb-10 text-lg font-accent italic",
      infoText: "mt-12 text-xs font-sans text-slate-400 tracking-wide",
    },
    preview: {
      container: "flex flex-col items-center justify-center h-full",
      imageWrapper:
        "relative w-full max-w-md mx-auto rounded-xl overflow-hidden border-2",
      imageContainer: "max-h-[400px] overflow-hidden bg-white",
      fileInfo: "text-center",
      fileName: "text-sm font-medium text-slate-700",
      fileSize: "text-xs text-slate-500",
    },
  },

  // Status indicators
  status: {
    success:
      `${colors.success} px-4 py-2 rounded-full text-sm font-medium ${animations.fadeIn}`,
    warning:
      `${colors.warning} px-4 py-2 rounded-full text-sm font-medium ${animations.fadeIn}`,
    error:
      `${colors.error} px-4 py-2 rounded-full text-sm font-medium ${animations.shake}`,
    info:
      `${colors.info} px-4 py-2 rounded-full text-sm font-medium ${animations.fadeIn}`,
  },

  // Loading states
  loading: {
    // Basic loading indicators
    spinner:
      `animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600`,
    shimmer:
      `${animationClasses.shimmer} bg-linear-to-r from-gray-100 via-slate-100 to-gray-100 rounded-lg`,
    pulse:
      `${animations.pulse} bg-linear-to-r from-gray-200 to-slate-200 rounded-lg`,

    // Container variants
    container: `max-w-md w-full space-y-8 text-center`,
    section: `h-full flex items-center justify-center`,

    // Progress spinner styles
    spinnerContainer: `relative`,
    mainSpinner: `w-20 h-20 animate-spin`,
    spinnerInnerIcon: `absolute inset-0 flex items-center justify-center`,
    spinnerInnerPackage: `w-10 h-10 animate-pulse`,

    // Text styles
    title:
      `text-3xl font-heading font-semibold text-slate-900 dark:text-slate-100`,
    subtitle: `text-lg text-slate-600 dark:text-slate-400 font-accent`,
    message: `text-sm text-slate-500 dark:text-slate-400 italic font-accent`,

    // Progress step styles
    stepContainer:
      `flex items-center gap-3 justify-center text-slate-700 dark:text-slate-300`,
    stepIcon: `w-5 h-5 animate-pulse`,
    stepText: `text-sm font-medium font-accent`,

    // Progress bar styles
    progressBarContainer:
      `w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden`,
    progressBarFill: `h-full`,
  },

  // Navbar styles
  navbar: navbarDesignSystem,

  // Dashboard styles (Brutalist Superdesign)
  dashboard: {
    page: {
      wrapper: `min-h-screen flex flex-col relative bg-concrete`,
      container:
        `flex-grow w-full max-w-7xl mx-auto px-6 md:px-12 py-8 md:py-12 relative z-10`,
      grid: `grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8`,
      leftColumn: `lg:col-span-4 flex flex-col gap-6`,
      rightColumn: `lg:col-span-8 flex flex-col gap-6`,
    },
    header: {
      container: `mb-10 md:mb-12`,
      accentBar: `h-1 w-20 md:w-24 bg-purple mb-4`,
      title:
        `font-heading text-6xl md:text-8xl uppercase tracking-tighter leading-none text-ink`,
      titleAccent: `text-purple`,
      metaRow:
        `flex flex-wrap items-center gap-3 mt-3 text-[10px] font-bold tracking-[0.3em] uppercase opacity-30`,
      metaDivider: `text-ink/20`,
    },
    card: {
      base: `brutalist-card p-8 md:p-10 border-l-4 transition-all duration-300`,
      basePurple:
        `brutalist-card p-8 md:p-10 border-l-4 border-l-purple transition-all duration-300`,
      baseCyan:
        `brutalist-card p-8 md:p-10 border-l-4 border-l-cyan transition-all duration-300`,
      baseOrange:
        `brutalist-card p-8 md:p-10 border-l-4 border-l-orange transition-all duration-300`,
      baseGreen:
        `brutalist-card p-8 md:p-10 border-l-4 border-l-green transition-all duration-300`,
      title:
        `font-heading text-3xl md:text-4xl uppercase tracking-tighter text-ink mb-2`,
      subtitle:
        `text-[8px] font-bold tracking-[0.3em] uppercase opacity-30 mb-6`,
      label: `text-[9px] font-bold tracking-[0.25em] uppercase opacity-40`,
    },
    profile: {
      avatarWrap:
        `w-16 h-16 md:w-20 md:h-20 rounded-lg bg-purple/10 border-2 border-purple/20 flex items-center justify-center overflow-hidden`,
      avatar: `w-full h-full object-cover`,
      verifiedBadge:
        `absolute -bottom-1 -right-1 w-6 h-6 bg-purple rounded-full flex items-center justify-center text-white text-xs border-2 border-white`,
      name:
        `font-heading text-2xl md:text-3xl uppercase tracking-tight text-ink`,
      email: `text-[10px] tracking-[0.2em] uppercase opacity-30 mt-1`,
      editButton:
        `w-full mt-6 py-3 border border-ink/10 hover:border-purple hover:bg-purple/5 font-heading text-xs tracking-widest uppercase transition-all flex items-center justify-center gap-2`,
    },
    performance: {
      metricRow: `flex items-end justify-between mb-3`,
      metricLabel: `text-[8px] font-bold tracking-[0.3em] uppercase opacity-30`,
      metricValue:
        `font-heading text-5xl md:text-6xl uppercase tracking-tighter text-ink`,
      progressBar: `dashboard-progress-bar mt-3`,
      progressFill: `dashboard-progress-fill`,
    },
    credits: {
      header: `flex items-center gap-3 mb-6`,
      icon: `w-6 h-6 text-cyan`,
      balanceRow: `mb-6`,
      balanceLabel:
        `text-[8px] font-bold tracking-[0.3em] uppercase opacity-30 block mb-2`,
      balanceValue:
        `font-heading text-5xl md:text-6xl uppercase tracking-tighter text-ink`,
      usageRow:
        `flex justify-between items-center text-[9px] font-bold tracking-[0.25em] uppercase opacity-40 mb-2`,
      usageLabel: `opacity-40`,
      usageValue: `text-ink`,
      progressBar: `dashboard-progress-bar mb-6`,
      progressFill:
        `dashboard-progress-fill bg-gradient-to-r from-purple to-cyan`,
      actionPrimary:
        `w-full py-3 bg-purple hover:bg-purple/90 text-white font-heading text-xs tracking-widest uppercase transition-all`,
      actionSecondary:
        `w-full py-3 border border-ink/10 hover:border-purple hover:bg-purple/5 font-heading text-xs tracking-widest uppercase transition-all mt-2`,
    },
    quickAccess: {
      grid: `grid grid-cols-2 gap-4`,
      item:
        `flex flex-col items-center justify-center p-6 border border-ink/10 hover:border-purple hover:bg-purple/5 transition-all group`,
      itemIcon:
        `w-8 h-8 mb-3 text-ink/30 group-hover:text-purple transition-colors`,
      itemLabel:
        `text-[9px] font-bold tracking-[0.25em] uppercase opacity-40 group-hover:opacity-100 transition-opacity`,
    },
    cta: {
      card:
        `dashboard-cta-gradient p-8 md:p-12 text-white flex flex-col items-start justify-between gap-6 min-h-[280px]`,
      title:
        `font-heading text-4xl md:text-5xl uppercase tracking-tighter leading-tight mb-3`,
      description: `text-sm tracking-wide uppercase opacity-80 mb-6`,
      button:
        `px-8 py-3 bg-white text-ink font-heading text-xs tracking-widest uppercase hover:scale-105 active:scale-95 transition-all`,
    },
    orders: {
      card: `brutalist-card p-8 md:p-10 border-l-4 border-l-green flex-grow`,
      header: `flex justify-between items-center mb-6`,
      title:
        `font-heading text-3xl md:text-4xl uppercase tracking-tighter text-ink`,
      badge:
        `text-[8px] font-bold tracking-[0.3em] uppercase px-3 py-1 bg-green/10 text-green border border-green/20`,
      viewAll:
        `text-[10px] font-bold tracking-[0.2em] uppercase text-purple hover:text-purple/70 transition-colors`,
      list: `space-y-4`,
      item:
        `flex items-center justify-between p-4 border border-ink/5 hover:border-purple/20 hover:bg-purple/5 transition-all group`,
      itemLeft: `flex items-center gap-4`,
      itemImageWrap:
        `w-12 h-12 bg-concrete border border-ink/5 flex items-center justify-center`,
      itemImage: `w-8 h-8 object-contain`,
      itemDetails: `flex flex-col`,
      itemId: `font-heading text-sm uppercase tracking-tight text-ink`,
      itemMeta: `text-[9px] tracking-[0.2em] uppercase opacity-30`,
      itemRight: `flex flex-col items-end gap-2`,
      itemPrice: `font-heading text-lg uppercase tracking-tight text-ink`,
      statusBadge:
        `text-[9px] font-bold tracking-widest uppercase px-2 py-1 border`,
      statusDelivered: `bg-green/5 text-green border-green/20`,
      statusShipped: `bg-cyan/5 text-cyan border-cyan/20`,
      statusProcessing: `bg-orange/5 text-orange border-orange/20`,
      statusPending: `bg-purple/5 text-purple border-purple/20`,
      statusCancelled: `bg-red/5 text-red border-red/20`,
      emptyState:
        `text-[10px] tracking-[0.2em] uppercase opacity-30 text-center py-8`,
    },
  },

  // Footer styles
  footer: {
    container:
      `relative bg-transparent border-t border-[#7C3AED]/35 dark:border-[#A78BFA]/35 pt-20 pb-12 mt-24 overflow-hidden`,
    inner: `max-w-[1376px] mx-auto px-4 md:px-8 lg:px-10 relative z-10 pb-12`,
    brandWrap: `flex flex-col items-center justify-center mb-8`,
    brandText:
      `text-4xl md:text-5xl font-heading font-bold uppercase bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent drop-shadow-sm`,
    brandDot:
      `inline-block mx-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] shadow-lg shadow-purple-500/30`,
    grid: `grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 mb-16`,
    missionTitle:
      `text-lg font-heading font-bold uppercase text-gray-900 dark:text-white mb-6`,
    missionText:
      `text-gray-600 dark:text-gray-400 text-base leading-relaxed max-w-xs font-sans`,
    sectionTitle:
      `text-lg font-heading font-bold uppercase text-gray-900 dark:text-white mb-6`,
    linkList: `space-y-3 text-base font-sans`,
    link:
      `block text-gray-600 dark:text-gray-400 hover:text-[#7C3AED] dark:hover:text-[#A78BFA] hover:translate-x-1 transition-all font-medium font-sans`,
    bottom:
      `pt-8 border-t border-gray-200/50 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-6`,
    copyright:
      `text-gray-500 dark:text-gray-500 text-sm font-bold uppercase tracking-widest font-sans`,
    socialRow: `flex gap-3`,
    socialButton:
      `w-10 h-10 flex items-center justify-center rounded-md bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-gradient-to-r hover:from-[#7C3AED] hover:to-[#06B6D4] hover:text-white hover:border-transparent hover:scale-110 dark:hover:bg-gradient-to-r transition-all shadow-sm hover:shadow-lg hover:shadow-purple-500/20`,
  },

  // Cart page styles
  cart: {
    page: {
      // Mobile: flex column with overflow, Desktop: normal min-h-screen
      container:
        `min-h-screen w-full  flex flex-col lg:block relative z-1 overflow-hidden lg:overflow-visible`,
      // Mobile: scrollable with fixed CTA space, Desktop: normal flow
      main:
        `flex-1 overflow-y-auto lg:overflow-visible pb-[160px] lg:pb-12 mx-auto w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:[scrollbar-width:auto] lg:[&::-webkit-scrollbar]:block`,
      // Desktop: 2-column grid
      grid: `hidden w-full lg:grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8`,
      itemsColumn: `lg:col-span-8 flex flex-col gap-4`,
      summaryColumn: `lg:col-span-4`,
      // Side dividers - mobile: edge of screen, desktop: inset
      sideDivider: `fixed top-0 bottom-0 w-px z-40 pointer-events-none`,
      sideDividerLeft:
        `left-0 lg:left-12 bg-black/5 lg:bg-[#E8E0F0] block lg:hidden xl:block`,
      sideDividerRight:
        `right-0 lg:right-12 bg-black/5 lg:bg-[#E8E0F0] block lg:hidden xl:block`,
    },
    hero: {
      container: `mb-8 lg:mb-10`,
      titleRow: `flex items-baseline gap-3 mb-1`,
      title:
        `text-3xl lg:text-5xl xl:text-6xl font-heading text-purple-600 lg:text-slate-900`,
      itemCount:
        `text-xs lg:text-sm font-heading text-slate-400 tracking-widest`,
      subtitle:
        `text-sm lg:text-sm text-slate-500 font-medium lg:font-bold lg:uppercase lg:tracking-widest lg:mt-2`,
    },
    item: {
      list: `flex flex-col gap-4 lg:hidden`,
      // Mobile: solid white card with subtle border, Desktop: glass effect
      card:
        `bg-white/95 backdrop-blur-none rounded-2xl lg:rounded-lg p-4 lg:p-6 overflow-hidden transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] border border-slate-200/80 shadow-sm lg:flex lg:flex-row lg:items-center lg:gap-6 lg:bg-white/75 lg:backdrop-blur-md lg:border-white/30 lg:shadow-md relative z-10`,
      cardRemoving: `opacity-50 translate-x-[100px]`,
      body: `flex gap-4 mb-4 lg:mb-0 lg:flex-1 lg:gap-6`,
      imageWrap:
        `w-24 h-24 lg:w-32 lg:h-32 bg-slate-100 lg:bg-white rounded-xl lg:rounded-md overflow-hidden shrink-0 border border-slate-200 lg:border-gray-100 lg:p-2 lg:flex lg:items-center lg:justify-center`,
      image: `w-full h-full object-cover lg:object-contain`,
      details: `flex-1`,
      header: `flex justify-between items-start`,
      title:
        `text-sm lg:text-xl font-heading text-slate-900 lg:uppercase lg:tracking-tight`,
      removeButton:
        `text-slate-300 hover:text-red-500 transition-colors lg:hidden`,
      meta:
        `text-xs lg:text-sm text-slate-500 mt-1 mb-3 lg:font-bold lg:uppercase lg:tracking-wider font-sans`,
      priceRow: `flex justify-between items-center lg:hidden`,
      price:
        `text-lg lg:text-xl font-heading text-purple-600 lg:text-slate-900`,
      // Mobile: pill style, Desktop: separate buttons
      qtyControl:
        `flex items-center gap-4 lg:gap-3 bg-white/50 lg:bg-transparent border border-slate-200 lg:border-0 rounded-full lg:rounded-none px-3 lg:px-0 py-1 lg:py-0`,
      qtyButton:
        `w-6 h-6 lg:h-8 lg:w-8 flex items-center justify-center text-slate-500 lg:border lg:border-[#E8E0F0] lg:bg-white lg:rounded-md lg:hover:border-[#7C3AED] lg:hover:text-[#7C3AED] active:scale-75 transition-transform lg:transition-colors`,
      qtyValue:
        `text-xs lg:text-base font-heading text-slate-900 lg:font-bold lg:w-4 lg:text-center`,
      // Desktop column for qty and price
      qtyPriceWrap:
        `hidden lg:flex lg:flex-col lg:items-end lg:gap-3 lg:min-w-[120px]`,
      remove:
        `hidden lg:block lg:text-xs lg:uppercase lg:font-bold lg:text-red-500 lg:hover:underline lg:tracking-widest`,
      // Mobile-only expandable section
      expandSection: `group lg:hidden`,
      expandSummary:
        `list-none flex items-center justify-center py-2 border-t border-slate-100 cursor-pointer`,
      expandLabel: `text-[10px] font-heading text-slate-400 tracking-widest`,
      expandIcon:
        `ml-2 text-xs text-slate-400 group-open:rotate-180 transition-transform`,
      expandBody: `pt-2 pb-1 flex flex-col gap-2`,
      expandRow: `flex justify-between text-[11px]`,
      expandKey: `text-slate-400`,
      expandVal: `text-slate-700 font-medium`,
      // Desktop-only chips row
      chipsRow:
        `hidden lg:flex lg:flex-wrap lg:gap-4 lg:text-sm lg:font-bold lg:mt-4`,
      chip: `lg:px-2 lg:py-1 lg:bg-gray-100 lg:rounded lg:text-slate-700`,
    },
    promo: {
      container: `mt-8 lg:hidden relative z-10`,
      row: `flex gap-2`,
      input:
        `flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-heading tracking-widest focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-colors uppercase placeholder:text-slate-400`,
      button:
        `bg-slate-900 text-white font-heading text-[10px] px-6 py-2.5 rounded-xl uppercase tracking-widest active:scale-95 transition-transform hover:bg-slate-800`,
    },
    summary: {
      // Mobile: solid white card, Desktop: glass effect sticky sidebar
      container:
        `mt-8 lg:mt-0 bg-white/95 backdrop-blur-none rounded-2xl lg:rounded-lg p-6 lg:p-8 border border-slate-200/80 shadow-sm lg:sticky lg:top-32 lg:bg-white/75 lg:backdrop-blur-md lg:border-white/30 lg:shadow-md relative z-10`,
      title: `hidden lg:block lg:text-3xl lg:font-heading lg:uppercase lg:mb-8`,
      rows: `flex flex-col gap-3 lg:space-y-4 lg:mb-8`,
      row: `flex justify-between items-center lg:text-base`,
      rowLabel:
        `text-xs lg:text-base font-heading lg:font-bold text-slate-400 lg:text-slate-500 lg:uppercase lg:tracking-wider`,
      rowValue:
        `text-sm lg:text-base font-heading lg:font-bold text-slate-900 uppercase`,
      freeValue:
        `text-sm lg:text-base font-heading lg:font-bold text-emerald-500 lg:text-green-600 uppercase`,
      taxLabel: `flex items-center gap-1`,
      taxValue:
        `text-[10px] lg:text-xs font-heading text-slate-400 uppercase italic`,
      divider: `h-px bg-slate-100 lg:bg-gray-100 my-2 lg:my-0`,
      totalRow:
        `flex justify-between items-baseline lg:border-t lg:border-gray-100 lg:pt-4 lg:mt-4`,
      totalLabel:
        `text-lg lg:text-xl font-heading lg:font-extrabold text-slate-900 lg:uppercase lg:tracking-tight`,
      totalValue:
        `text-2xl lg:text-3xl font-heading lg:font-extrabold text-purple-900 lg:text-purple-900`,
      // Desktop checkout button (in summary card)
      checkoutButton:
        `hidden lg:flex lg:w-full lg:py-5 lg:bg-primary lg:text-primary-foreground lg:font-heading lg:tracking-widest lg:rounded-md lg:shadow-2xl lg:shadow-purple-500/50 lg:hover:-translate-y-1.5 lg:hover:shadow-3xl lg:transition-all lg:duration-300 lg:items-center lg:justify-center lg:gap-3 lg:mt-6`,
      secureText:
        `hidden lg:block lg:text-xs lg:text-center lg:text-slate-400 lg:font-bold lg:uppercase lg:tracking-widest lg:leading-relaxed lg:mt-3`,
      arrivalWrap:
        `hidden lg:block lg:mt-10 lg:p-4 lg:bg-white/50 lg:rounded-lg lg:border lg:border-dashed lg:border-gray-200`,
      arrivalHeader: `lg:flex lg:items-center lg:gap-3 lg:mb-2`,
      arrivalLabel: `lg:text-xs lg:font-bold lg:uppercase lg:tracking-widest`,
      arrivalValue: `lg:text-sm lg:font-medium lg:text-slate-600`,
    },
    continueLink:
      `mt-8 mb-4 lg:mt-6 text-center lg:text-left block text-[10px] lg:text-sm font-heading text-slate-400 tracking-[0.2em] lg:tracking-normal uppercase hover:text-purple-600 lg:hover:underline transition-colors underline lg:no-underline underline-offset-4 decoration-slate-200 relative z-10`,
    cta: {
      // Mobile only: fixed bottom bar with more solid background
      bar:
        `fixed bottom-0 left-0 right-0 p-6 pb-10 bg-white/95 backdrop-blur-sm border-t border-slate-200 lg:hidden z-50`,
      button:
        `w-full h-16 flex items-center justify-center text-white font-heading text-sm tracking-widest gap-3 rounded-2xl active:scale-[0.98] transition-all bg-gradient-to-br from-purple-600 to-cyan-500 shadow-[0_8px_25px_-10px_rgba(124,58,237,0.6)] hover:shadow-[0_12px_30px_-10px_rgba(124,58,237,0.7)]`,
    },
    actions: {
      row:
        `hidden lg:flex lg:flex-col sm:flex-row lg:items-center lg:gap-4 lg:mt-6`,
      continueLink:
        `lg:w-full sm:w-auto lg:px-8 lg:py-4 lg:border-2 lg:border-gray-200 lg:hover:border-[#7C3AED] lg:hover:text-[#7C3AED] lg:font-bold lg:uppercase lg:tracking-widest lg:text-sm lg:rounded-lg lg:transition-soft lg:inline-flex lg:items-center lg:justify-center lg:gap-2`,
    },
    empty: {
      container:
        `flex flex-col items-center justify-center min-h-[400px] text-center px-4`,
      iconWrap:
        `w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6`,
      title: `text-5xl font-heading text-slate-900`,
      description: `text-lg text-slate-600 mt-2 mb-8 max-w-md`,
      action:
        `px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity`,
    },
  },

  // Orders page styles
  orders: {},

  // Checkout page styles
  checkout: {
    page: {
      container: "min-h-screen relative rounded-2xl pb-8",
      mainContent: "pb-16",
      grid: "flex flex-col lg:flex-row gap-10",
      formsColumn: "flex-1 space-y-8 lg:w-7/12",
      summaryColumn: "lg:w-5/12",
    },
    paymentSection: {
      container: "glass-card p-8 rounded-none",
      testModeContainer:
        "mb-6 flex items-center gap-3 border border-yellow-200 bg-yellow-50/80 px-4 py-3 rounded-lg",
      testModeLabel:
        "text-xs font-bold uppercase tracking-widest text-slate-600 cursor-pointer",
      emptyState: "text-center py-8",
      emptyStateText: "text-sm text-gray-600",
    },
    orderSummary: {
      shippingAddress: {
        container: "pt-6 pb-6 border-b border-slate-100",
        header: "flex justify-between items-start mb-3",
        heading: "text-sm font-bold uppercase tracking-widest text-slate-600",
        editButton:
          "h-auto p-0 text-xs font-bold uppercase tracking-widest text-purple-600",
        address: "text-sm text-slate-600 not-italic space-y-1",
        recipientName: "font-medium text-slate-900",
        addressLine: "text-sm text-gray-600",
      },
    },
    mobile: {
      layout: "flex flex-col min-h-screen relative px-4",
      header: {
        wrapper: "shrink-0 pt-12 px-5 pb-4 bg-white/20 backdrop-blur-sm",
        inner: "flex items-center justify-between mb-4",
        backButton:
          "glass-card w-10 h-10 rounded-full flex items-center justify-center shadow-sm",
        logo: "text-xl font-heading tracking-[0.15em] text-slate-900",
        progressWrapper:
          "sticky top-16 z-40 w-full bg-white/70 backdrop-blur-md rounded-lg px-2 py-2",
        progressLabel:
          "flex justify-between text-xs font-heading tracking-widest text-slate-400 uppercase mb-1.5",
        progressBar: "h-[3px] bg-black/5 w-full rounded-full overflow-hidden",
        progressFill:
          "h-full bg-[#7C3AED] transition-[width] duration-500 ease-in-out",
      },
      body: "flex-1 overflow-y-auto py-4 space-y-3 pb-32",
      summaryAccordion: {
        container: "glass-card rounded-2xl overflow-hidden",
        header: "w-full flex items-center justify-between px-5 py-4 h-auto",
        title:
          "text-sm font-heading tracking-[0.15em] text-slate-500 uppercase",
        total: "text-lg font-heading text-slate-900",
        chevron: "w-4 h-4 text-slate-400 transition-transform duration-300",
        body: "px-5 pb-4 border-t border-slate-100",
      },
      stepCard: {
        base:
          "glass-card rounded-2xl overflow-hidden transition-all duration-300 border",
        active: "border-[#7C3AED] shadow-[0_0_0_1px_#7C3AED]",
        complete: "border-emerald-400",
        incomplete: "border-slate-200",
      },
      stepHeader: {
        wrapper:
          "w-full flex items-center justify-start gap-3 px-5 py-4 h-auto",
        circleActive:
          "w-8 h-8 shrink-0 rounded-full border-2 border-[#7C3AED] flex items-center justify-center text-xs font-heading text-[#7C3AED]",
        circleComplete:
          "w-8 h-8 shrink-0 rounded-full border-2 border-emerald-500 bg-emerald-50 flex items-center justify-center",
        circleIncomplete:
          "w-8 h-8 shrink-0 rounded-full border-2 border-slate-200 flex items-center justify-center text-xs font-heading text-slate-400",
        info: "flex flex-col flex-1 text-left",
        title: "text-base font-heading tracking-[0.1em] text-slate-900",
        statusActive:
          "text-[11px] font-heading text-[#7C3AED] tracking-widest uppercase",
        statusComplete:
          "text-[11px] font-heading text-emerald-500 tracking-widest uppercase",
        statusIncomplete:
          "text-[11px] font-heading text-slate-400 tracking-widest uppercase",
        chevron: "w-4 h-4 text-slate-400 transition-transform duration-300",
      },
      stepContent: "px-5 pb-5 pt-1",
      stepCta:
        "w-full mt-5 h-12 rounded-xl font-heading tracking-[0.15em] text-base bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] text-white",
      footer: {
        wrapper:
          "fixed bottom-0 left-0 right-0 px-5 pb-10 pt-4 bg-white/80 backdrop-blur-2xl border-t border-slate-100",
        button:
          "w-full h-14 rounded-2xl font-heading tracking-[0.2em] text-base bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] text-white shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2",
      },
    },
    // Payment method selector styles
    paymentMethodSelector: {
      container: "flex gap-3 mb-6",
      button:
        "flex-1 flex items-center gap-3 py-4 px-4 rounded-xl border-2 transition-all duration-200",
      buttonActive: "border-[#7C3AED] bg-[#7C3AED]/5 shadow-sm",
      buttonInactive:
        "border-slate-200 hover:border-slate-300 hover:bg-slate-50",
      icon: "w-6 h-6 shrink-0",
      labelWrap: "flex flex-col text-left",
      label: "font-heading text-sm tracking-wider text-slate-900",
      description: "text-xs text-slate-500",
      checkmark:
        "ml-auto w-5 h-5 rounded-full bg-[#7C3AED] text-white text-xs flex items-center justify-center",
    },
    // PayPal button container styles
    paypalButton: {
      container: "min-h-[52px]",
      loading: "flex items-center justify-center py-4",
      error:
        "p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700",
    },
  },

  // Profile page styles
  profile: {
    page: {
      container: `flex-grow w-full max-w-5xl mx-auto pb-24 px-12 md:px-24`,
    },
    header: {
      card: `glass-card p-10 mb-10 rounded-3xl`,
      title:
        `text-5xl font-heading text-slate-900 mb-4 leading-none tracking-tight`,
      decorativeWrap: `flex items-center gap-4`,
      accentBar:
        `h-1 w-16 bg-linear-to-r from-[#7C3AED] via-[#4F46E5] to-[#06B6D4] rounded-sm`,
      description: `italic text-slate-500 font-medium`,
    },
    section: {
      card: `glass-card p-8 rounded-3xl`,
      header: `flex justify-between items-start mb-10`,
      iconTitleWrap: `flex gap-5`,
      iconBox:
        `w-14 h-14 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center text-slate-500`,
      titleWrap: `flex flex-col`,
      title:
        `text-xl font-bold text-slate-900 leading-tight uppercase tracking-tight`,
      subtitle: `text-slate-500 text-sm`,
      editButton:
        `px-6 py-2 border border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-[10px] rounded-lg hover:bg-white hover:border-slate-300 transition-all`,
    },
    personalInfo: {
      grid: `grid grid-cols-1 md:grid-cols-2 gap-8`,
      fieldWrap: `space-y-2`,
      fullWidth: `md:col-span-2 space-y-2`,
      label: `text-[10px] font-bold uppercase tracking-widest text-slate-400`,
      input:
        `w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#7C3AED] focus:outline-none focus:ring-4 focus:ring-[#7C3AED]/10 transition-all`,
      inputReadonly: `bg-slate-50/50`,
      hint: `text-[11px] text-slate-400 font-medium italic`,
    },
    password: {
      description: `text-sm text-slate-500 italic`,
    },
    address: {
      emptyText: `text-sm text-slate-500 italic`,
    },
  },

  // Product confirmation styles
  productConfirmation: {
    section: `space-y-4 sm:space-y-8 animate-[slideInUp_1s_ease-out]`,
    imageContainer: `max-w-lg sm:max-w-2xl mx-auto`,
    imageWrapper:
      `bg-linear-to-br from-gray-50/50 via-slate-50/50 to-gray-100/50 dark:from-gray-800/80 dark:via-slate-800/30 dark:to-gray-800/30 backdrop-blur-sm border border-gray-200 dark:border-gray-800/30 rounded-2xl overflow-hidden shadow-2xl shadow-slate-500/20 dark:shadow-slate-500/10`,
    image: `w-full h-auto object-contain max-h-[300px] sm:max-h-none`,
    buttonsContainer: `max-w-4xl mx-auto`,
    buttonsGrid: `grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6`,
    button: `w-full h-12 sm:h-14 text-base sm:text-lg font-semibold`,
    checkoutButton:
      `w-full h-12 sm:h-14 text-base sm:text-lg font-semibold shadow-xl shadow-purple-500/40 hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300`,
    icon: `w-5 h-5`,
  },

  // Mobile page header (back button + title + description)
  mobilePageHeader: {
    root:
      `md:hidden mb-6 bg-white/75 backdrop-blur-md border border-white/30 shadow-md rounded-xl`,
    inner: `mt-6 px-6 pb-6 flex flex-col gap-3`,
    row: `flex items-center gap-4`,
    backButton:
      `flex items-center justify-center w-10 h-10 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors shrink-0 bg-transparent`,
    title:
      `font-heading text-[2.5rem] leading-[0.9] tracking-widest font-extrabold uppercase bg-linear-to-r from-[#1A2340] via-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent`,
    descriptionRow: `flex items-center gap-4`,
    gradientBar:
      `h-1.5 w-24 bg-linear-to-r from-[#7C3AED] via-[#4F46E5] to-[#06B6D4] rounded-sm shadow-sm shrink-0`,
    description:
      `font-['Satoshi'] text-sm leading-relaxed max-w-2xl font-normal text-slate-500`,
  },

  // Payment success page styles
  paymentSuccess: {
    page: "min-h-screen relative flex justify-center",
    wrapper:
      "w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700",
    card:
      "glass-card p-12 md:p-16 rounded-none text-center relative overflow-hidden",
    topAccent:
      "absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500",
    iconWrapper:
      "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-10 shadow-lg shadow-green-500/20 text-white success-icon-animate bg-gradient-to-br from-green-400 to-emerald-500",
    title: "text-4xl md:text-5xl font-heading text-slate-900 mb-4",
    subtitle: "text-slate-500 max-w-sm mx-auto mb-12 leading-relaxed",
    grid:
      "grid grid-cols-2 gap-8 text-left border-y border-slate-100 py-8 mb-12",
    gridItem: "flex flex-col gap-1",
    gridLabel: "text-[10px] font-bold uppercase tracking-widest text-slate-400",
    gridValue: "text-base font-heading text-slate-900",
    statusBadge: "flex items-center gap-1.5",
    statusDot: "w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse",
    statusText: "text-xs font-bold uppercase tracking-widest text-green-600",
    ctaStack: "flex flex-col gap-4",
    primaryBtn:
      "w-full py-5 h-auto font-heading text-xs tracking-widest rounded-none uppercase bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] text-white hover:shadow-lg hover:shadow-purple-500/20 transition-shadow",
    secondaryBtn:
      "w-full py-5 h-auto font-heading text-xs tracking-widest rounded-none uppercase border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900 transition-colors",
    emailNote:
      "mt-12 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400",
  },

  // Payment error page styles
  paymentError: {
    page: "min-h-screen relative flex justify-center",
    wrapper:
      "w-full max-w-xl animate-in fade-in slide-in-from-bottom-8 duration-700",
    card:
      "glass-card p-12 md:p-16 rounded-none text-center relative overflow-hidden",
    topAccent:
      "absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-orange-500",
    iconWrapper:
      "error-icon-animate w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-10 shadow-lg shadow-red-500/10 text-red-500",
    icon: "w-12 h-12 error-icon-pulse",
    title: "text-4xl md:text-5xl font-heading text-slate-900 mb-4",
    subtitle: "text-slate-500 max-w-sm mx-auto mb-12 leading-relaxed",
    reasonCard:
      "text-left bg-white/40 p-6 mb-12 border border-red-100 rounded-sm",
    reasonRow: "flex items-start gap-3",
    reasonIcon: "text-red-400 mt-1 w-4 h-4 shrink-0",
    reasonLabel: "text-xs font-bold uppercase tracking-wider text-red-500",
    reasonText: "text-sm text-slate-700 font-medium leading-relaxed",
    ctaStack: "space-y-4",
    primaryBtn:
      "w-full py-5 h-auto text-white font-heading text-xs tracking-widest rounded-none uppercase bg-gradient-to-br from-red-500 to-orange-500 hover:shadow-lg hover:shadow-red-500/20 transition-all",
    secondaryBtn:
      "w-full py-5 h-auto rounded-none uppercase font-heading text-xs tracking-widest border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all",
    altMethodsBlock: "pt-4",
    altMethodsLabel:
      "text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4",
    altMethodsGrid: "grid grid-cols-3 gap-3",
    altMethodBtn:
      "alt-payment-pill flex items-center justify-center gap-1 py-3 bg-white/50 text-xs font-heading tracking-wide uppercase",
    supportLink:
      "block mt-8 text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-widest transition-colors",
  },

  // Buy Credits Dialog styles
  buyCredits: {
    // Package card
    packageCard: {
      base:
        `relative w-full h-auto min-h-26 flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200`,
      selected: `border-[#7C3AED] bg-[#7C3AED]/5 shadow-md`,
      unselected: `border-slate-200 hover:border-slate-300 hover:bg-slate-50`,
      creditsRow: `flex items-center gap-1.5 mb-1`,
      creditsIcon: `w-5 h-5`,
      creditsIconSelected: `text-[#FF8C42]`,
      creditsIconUnselected: `text-slate-400`,
      creditsValue: `text-2xl font-heading font-bold`,
      creditsValueSelected: `text-slate-900`,
      creditsValueUnselected: `text-slate-700`,
      price: `text-sm font-medium text-slate-500`,
    },
    popularBadge:
      `absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-linear-to-r from-[#7C3AED] to-[#06B6D4] text-white text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1`,
    selectedCheckmark:
      `absolute top-2 right-2 w-5 h-5 rounded-full bg-[#7C3AED] text-white flex items-center justify-center`,
    // Package selector
    packageSelector: {
      grid: `grid grid-cols-2 gap-3`,
    },
    // Custom input
    customInput: {
      container:
        `w-full h-auto min-h-18 p-4 rounded-xl border-2 transition-all duration-200 text-left`,
      containerSelected: `border-[#7C3AED] bg-[#7C3AED]/5`,
      containerUnselected: `border-slate-200 hover:border-slate-300`,
      row: `flex items-center gap-3`,
      iconBox: `w-10 h-10 rounded-lg flex items-center justify-center`,
      iconBoxSelected: `bg-[#7C3AED]/10`,
      iconBoxUnselected: `bg-slate-100`,
      price: `text-sm font-medium text-slate-600`,
      error: `text-xs text-red-500 mt-2`,
    },
    // Summary
    summary: {
      container: `p-4 rounded-xl bg-slate-50 border border-slate-200`,
      row: `flex justify-between items-center`,
      creditsWrap: `flex items-center gap-2`,
      creditsIcon: `w-5 h-5 text-[#FF8C42]`,
      creditsLabel: `font-heading font-bold text-slate-900`,
      priceValue: `text-xl font-heading font-bold text-slate-900`,
    },
    // Payment step
    paymentStep: {
      backButton:
        `text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1`,
    },
    // Selection step
    selectionStep: {
      container: `space-y-6`,
      submitButton:
        `w-full h-12 bg-linear-to-r from-[#7C3AED] to-[#06B6D4] text-white font-heading font-bold uppercase tracking-widest rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50`,
    },
    // Section label
    sectionLabel:
      `text-xs font-bold uppercase tracking-widest text-slate-500 mb-3 block`,
  },

  // 404 page styles
  notFound: {
    page: "pt-32 relative flex items-center justify-center px-12 md:px-24",
    wrapper:
      "w-full max-w-4xl text-center space-y-0 animate-in fade-in slide-in-from-bottom-12 duration-1000",
    titleRow: "mb-12",
    titleIconWrap: "lost-icon-404 text-[#7C3AED] mb-6 inline-block",
    titleIcon: "w-16 h-16 md:w-20 md:h-20",
    title:
      "text-4xl md:text-6xl font-heading tracking-[0.25em] uppercase bg-linear-to-r from-[#7C3AED] via-[#4F46E5] to-[#06B6D4] bg-clip-text text-transparent",
    numberWrap: "relative inline-block mb-0",
    numberGlow:
      "text-[180px] md:text-[240px] font-heading text-slate-900 leading-none block opacity-10 blur-xl absolute inset-0 select-none",
    numberMain:
      "text-[180px] md:text-[240px] font-heading text-slate-900 leading-none block glitch-text-404 relative z-10",
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
export const mobilePageHeaderTheme = componentThemes.mobilePageHeader;
export const cartTheme = componentThemes.cart;
export const dashboardTheme = componentThemes.dashboard;
export const ordersTheme = componentThemes.orders;
export const checkoutTheme = componentThemes.checkout;
export const profileTheme = componentThemes.profile;
export const productConfirmationTheme = componentThemes.productConfirmation;
export const paymentSuccessTheme = componentThemes.paymentSuccess;
export const paymentErrorTheme = componentThemes.paymentError;
export const notFoundTheme = componentThemes.notFound;
export const buyCreditsTheme = componentThemes.buyCredits;

// Utility functions
export const getButtonVariant = (
  variant: keyof typeof componentThemes.button,
) => componentThemes.button[variant];

export const getCardVariant = (variant: keyof typeof componentThemes.card) =>
  componentThemes.card[variant];

export const getTextVariant = (variant: keyof typeof componentThemes.text) =>
  componentThemes.text[variant];

export const combineClasses = (...classes: string[]) =>
  classes.filter(Boolean).join(" ");
