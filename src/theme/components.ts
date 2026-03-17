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
    container: `sticky top-0 z-50`,
    inner: `max-w-[1440px] mx-auto px-6`,
    content: `flex justify-between h-20 items-center`,

    desktop: {
      base: `hidden md:block sticky top-0 z-50 w-full transition-[background-color,backdrop-filter,border-color,box-shadow,transform] duration-500 ease-out`,
      scrolled: `bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-white/30 dark:border-gray-700/30 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05)]`,
      transparent: `bg-transparent`,
    },

    brand: {
      link: `flex items-center gap-3 group cursor-pointer`,
      text: `text-2xl font-heading tracking-widest uppercase`,
      dot: `inline-block mx-0.5 w-2 h-2 rounded-full [background:linear-gradient(45deg,#7C3AED,#06B6D4,#FF8C42)] [background-size:200%_200%] animate-[gradientPulse_3s_ease-in-out_infinite]`,
    },

    navigation: {
      container: `hidden md:flex items-center gap-4`,
      link: {
        base: `px-5 py-2 text-base font-heading tracking-widest rounded transition-soft`,
        active: `text-slate-900 bg-slate-50`,
        inactive: `text-slate-500 hover:text-slate-900 hover:bg-slate-50`,
      },
      stampButton: `w-full px-6 py-2.5 text-base font-heading tracking-widest text-white bg-[#7C3AED] rounded shadow-[0_4px_14px_rgba(124,58,237,0.3)] transition-soft hover:bg-[#6D28D9] hover:shadow-[0_6px_20px_rgba(124,58,237,0.4)] hover:-translate-y-0.5 flex-1`,
    },

    actions: {
      container: `flex items-center gap-3`,
      themeButton: `w-10 h-10 flex items-center justify-center text-slate-400 hover:text-[#7C3AED] hover:bg-[#F3ECFF] rounded-md transition-soft`,
      divider: `h-6 w-px bg-slate-200`,
      profileButton: `flex items-center gap-2 pl-2 group`,
      profileIcon: `w-10 h-10 rounded-md bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-[#F3ECFF] group-hover:text-[#7C3AED] transition-soft`,
      signOutButton: `ml-2 px-5 py-2 text-base font-heading tracking-widest text-white bg-[#FF4444] rounded transition-soft hover:bg-[#E03333] hover:shadow-[0_4px_14px_rgba(255,68,68,0.3)] hover:-translate-y-0.5`,
    },

    mobileHeader: {
      row: `h-16 px-4 flex items-center gap-3 max-w-screen`,
      stampCta: `h-9 flex items-center justify-center gap-1.5 text-lg sm:mx-4`,
      cartButton: `relative w-11 h-11 flex items-center justify-center text-slate-700 dark:text-slate-300`,
      badge: `absolute -top-0.5 -right-0.5 bg-linear-to-r from-purple-600 via-pink-600 to-red-600 text-white text-[10px] font-bold rounded-full min-w-4.25 h-4.25 px-0.5 flex items-center justify-center`,
      menuButton: `w-11 h-11 rounded-lg active:scale-95 transition-transform shrink-0`,
    },

    mobileSidebar: {
      root: `fixed inset-0 z-[100]`,
      backdrop: `absolute inset-0 bg-slate-900/40 backdrop-blur-sm`,
      panel: `absolute right-0 top-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-gray-900 shadow-2xl flex flex-col animate-[slideInRight_0.3s_cubic-bezier(0.4,0,0.2,1)]`,
      panelHeader: `flex justify-between items-center p-6 border-b border-slate-100 dark:border-gray-800`,
      closeButton: `w-10 h-10 rounded-full text-slate-400 bg-slate-50 dark:bg-gray-800 hover:bg-slate-100`,
      nav: `flex-1 overflow-y-auto px-6 py-8 space-y-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`,
      footer: `p-6 border-t border-slate-100 dark:border-gray-800`,
      themeToggle: {
        button: `w-full flex items-center justify-between py-4 px-4 text-slate-600 dark:text-slate-300 active:bg-slate-50 rounded-xl transition-colors`,
        switchTrack: `w-10 h-5 rounded-full relative transition-colors duration-300`,
        switchThumb: `absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all duration-300`,
      },
    },
  },

  // Dashboard styles
  dashboard: {
    page: {
      wrapper: `min-h-screen flex flex-col relative`,
      container: `flex-grow w-full max-w-[1440px] mx-auto relative z-1`,
      grid: `grid grid-cols-1 lg:grid-cols-12 gap-8`,
      leftColumn: `lg:col-span-4 flex flex-col gap-8`,
      rightColumn: `lg:col-span-8 flex flex-col gap-8`,
      sideDivider: `fixed top-0 bottom-0 w-px bg-[#E8E0F0]/60 z-40 hidden xl:block pointer-events-none`,
      sideDividerLeft: `left-12`,
      sideDividerRight: `right-12`,
    },
    header: {
      container: `mb-12`,
      title: `text-4xl md:text-5xl font-heading font-extrabold uppercase tracking-tighter text-gray-900 mb-2`,
      metaRow: `flex flex-wrap items-center gap-4 text-gray-500 uppercase tracking-widest text-xs font-bold`,
      metaDot: `w-1 h-1 bg-gray-300 rounded-full`,
    },
    card: {
      base: `glass-card p-6 rounded-lg`,
      title: `text-xs font-bold uppercase tracking-widest text-gray-400`,
      sectionTitle: `text-xl font-heading font-bold uppercase tracking-tight`,
    },
    profile: {
      avatarWrap: `w-16 h-16 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] p-1 shadow-lg`,
      avatar: `w-full h-full rounded-md bg-white object-cover`,
      name: `text-xl font-heading font-bold uppercase tracking-tight text-gray-900`,
      email: `text-sm text-gray-500`,
      editButton: `w-full py-3 bg-white/50 hover:bg-white text-gray-800 font-bold uppercase tracking-widest text-xs rounded-lg flex items-center justify-center gap-2 border border-gray-100 transition-all`,
    },
    performance: {
      rowLabel: `text-sm font-bold uppercase text-gray-600`,
      rowValue: `text-xl font-heading font-bold text-gray-900`,
      progressTrack: `w-full bg-gray-200/50 h-1.5 rounded-full overflow-hidden`,
    },
    credits: {
      iconWrap: `w-12 h-12 rounded-lg bg-gradient-to-br from-[#7C3AED]/10 to-[#06B6D4]/10 flex items-center justify-center border border-white/50 shadow-inner`,
      balanceLabel: `text-[10px] font-bold uppercase tracking-widest text-gray-400 block mb-0.5`,
      balanceValue: `text-3xl font-heading font-extrabold text-gray-900 tracking-tighter`,
      balanceUnit: `text-xs font-bold text-gray-400 uppercase tracking-widest`,
      usageRow: `flex justify-between items-center text-[10px] font-bold uppercase tracking-widest`,
      usageTrack: `w-full bg-gray-200/50 h-1.5 rounded-full overflow-hidden`,
      actionPrimary: `py-3 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-bold uppercase tracking-widest text-[9px] rounded-lg shadow-lg shadow-purple-500/20 transition-all`,
      actionSecondary: `py-3 border border-gray-200 text-gray-600 font-bold uppercase tracking-widest text-[9px] rounded-lg hover:bg-white transition-colors`,
    },
    quickAccess: {
      item: `flex flex-col items-center justify-center p-4 bg-white/40 hover:bg-white border border-white/50 rounded-lg transition-all group`,
      itemIcon: `text-2xl mb-2 text-gray-400 group-hover:text-[#7C3AED]`,
      itemLabel: `text-[10px] font-bold uppercase tracking-wider text-gray-600`,
    },
    cta: {
      card: `bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] p-8 md:p-12 rounded-lg text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl`,
      title: `text-3xl md:text-4xl font-heading font-extrabold uppercase tracking-tight mb-4`,
      description: `text-white/80 font-medium`,
      button: `whitespace-nowrap px-10 py-5 bg-white text-[#7C3AED] font-heading font-extrabold uppercase tracking-widest rounded-lg shadow-xl hover:scale-105 active:scale-95 transition-all`,
    },
    orders: {
      card: `glass-card p-8 rounded-lg flex-grow`,
      header: `flex justify-between items-center mb-8`,
      viewAll: `text-xs font-bold uppercase tracking-widest text-[#7C3AED] hover:underline`,
      item: `flex items-center gap-6 p-4 bg-white/40 rounded-lg border border-white/50 hover:border-[#7C3AED]/30 transition-all group`,
      itemImageWrap: `w-20 h-20 bg-white/60 rounded-lg flex-shrink-0 flex items-center justify-center relative`,
      itemImage: `w-14 h-14 object-contain group-hover:scale-110 transition-transform`,
      itemTitle: `font-heading font-bold text-sm uppercase tracking-tight text-gray-900`,
      itemMeta: `text-xs text-gray-500 font-medium mb-3`,
      itemPrice: `text-sm font-bold text-gray-900`,
      statusBadge: `px-2 py-1 text-[10px] font-bold uppercase rounded`,
      statusProcessing: `bg-yellow-100 text-yellow-700`,
      statusShipped: `bg-blue-100 text-blue-700`,
      statusDelivered: `bg-green-100 text-green-700`,
      statusCancelled: `bg-red-100 text-red-700`,
      emptyState: `text-sm text-gray-500`,
    },
  },

  // Footer styles
  footer: {
    container: `relative bg-white/30 dark:bg-gray-900/30 backdrop-blur-xl border-t border-white/50 dark:border-white/10 pt-20 pb-12 mt-24 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.5)] overflow-hidden`,
    inner: `max-w-[1440px] mx-auto px-10 md:px-16 xl:px-24 relative z-10`,
    brandWrap: `flex flex-col items-center justify-center mb-8`,
    brandText: `text-4xl md:text-5xl font-heading font-bold uppercase tracking-tighter bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] bg-clip-text text-transparent drop-shadow-sm`,
    brandDot: `inline-block mx-1.5 w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] shadow-lg shadow-purple-500/30`,
    grid: `grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-16 mb-16`,
    missionTitle: `text-base font-heading font-bold uppercase tracking-tight text-gray-900 dark:text-white mb-6`,
    missionText: `text-gray-600 dark:text-gray-400 text-sm leading-relaxed max-w-xs`,
    sectionTitle: `text-base font-heading font-bold uppercase tracking-tight text-gray-900 dark:text-white mb-6`,
    linkList: `space-y-3 text-sm`,
    link: `block text-gray-600 dark:text-gray-400 hover:text-[#7C3AED] dark:hover:text-[#A78BFA] hover:translate-x-1 transition-all font-medium`,
    bottom: `pt-8 border-t border-gray-200/50 dark:border-white/10 flex flex-col md:flex-row justify-between items-center gap-6`,
    copyright: `text-gray-500 dark:text-gray-500 text-xs font-bold uppercase tracking-widest`,
    socialRow: `flex gap-3`,
    socialButton: `w-10 h-10 flex items-center justify-center rounded-md bg-white/50 dark:bg-gray-800/50 border border-gray-200/50 dark:border-gray-700/50 text-gray-500 dark:text-gray-400 hover:bg-gradient-to-r hover:from-[#7C3AED] hover:to-[#06B6D4] hover:text-white hover:border-transparent hover:scale-110 dark:hover:bg-gradient-to-r transition-all shadow-sm hover:shadow-lg hover:shadow-purple-500/20`,
  },

  // Cart page styles
  cart: {
    page: {
      // Mobile: flex column with overflow, Desktop: normal min-h-screen
      container: `min-h-screen w-full  flex flex-col lg:block relative z-1 overflow-hidden lg:overflow-visible`,
      // Mobile: scrollable with fixed CTA space, Desktop: normal flow
      main: `flex-1 overflow-y-auto lg:overflow-visible lg:pt-12 pb-[160px] lg:pb-12 max-w-[1440px] mx-auto w-full [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:[scrollbar-width:auto] lg:[&::-webkit-scrollbar]:block`,
      // Desktop: 2-column grid
      grid: `hidden w-full lg:grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8`,
      itemsColumn: `lg:col-span-8 flex flex-col gap-4`,
      summaryColumn: `lg:col-span-4`,
      // Side dividers - mobile: edge of screen, desktop: inset
      sideDivider: `fixed top-0 bottom-0 w-px z-40 pointer-events-none`,
      sideDividerLeft: `left-0 lg:left-12 bg-black/5 lg:bg-[#E8E0F0] block lg:hidden xl:block`,
      sideDividerRight: `right-0 lg:right-12 bg-black/5 lg:bg-[#E8E0F0] block lg:hidden xl:block`,
    },
    hero: {
      container: `mb-8 lg:mb-10`,
      titleRow: `flex items-baseline gap-3 mb-1`,
      title: `text-3xl lg:text-5xl xl:text-6xl font-heading text-purple-600 lg:text-slate-900`,
      itemCount: `text-xs lg:text-sm font-heading text-slate-400 tracking-widest`,
      subtitle: `text-sm lg:text-sm text-slate-500 font-medium lg:font-bold lg:uppercase lg:tracking-widest lg:mt-2`,
    },
    item: {
      list: `flex flex-col gap-4 lg:hidden`,
      // Mobile: solid white card with subtle border, Desktop: glass effect
      card: `bg-white/95 backdrop-blur-none rounded-2xl lg:rounded-lg p-4 lg:p-6 overflow-hidden transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] border border-slate-200/80 shadow-sm lg:flex lg:flex-row lg:items-center lg:gap-6 lg:bg-white/75 lg:backdrop-blur-md lg:border-white/30 lg:shadow-md relative z-10`,
      cardRemoving: `opacity-50 translate-x-[100px]`,
      body: `flex gap-4 mb-4 lg:mb-0 lg:flex-1 lg:gap-6`,
      imageWrap: `w-24 h-24 lg:w-32 lg:h-32 bg-slate-100 lg:bg-white rounded-xl lg:rounded-md overflow-hidden shrink-0 border border-slate-200 lg:border-gray-100 lg:p-2 lg:flex lg:items-center lg:justify-center`,
      image: `w-full h-full object-cover lg:object-contain`,
      details: `flex-1`,
      header: `flex justify-between items-start`,
      title: `text-sm lg:text-xl font-heading text-slate-900 lg:uppercase lg:tracking-tight`,
      removeButton: `text-slate-300 hover:text-red-500 transition-colors lg:hidden`,
      meta: `text-xs lg:text-sm text-slate-500 mt-1 mb-3 lg:font-bold lg:uppercase lg:tracking-wider`,
      priceRow: `flex justify-between items-center lg:hidden`,
      price: `text-lg lg:text-xl font-heading text-purple-600 lg:text-slate-900`,
      // Mobile: pill style, Desktop: separate buttons
      qtyControl: `flex items-center gap-4 lg:gap-3 bg-white/50 lg:bg-transparent border border-slate-200 lg:border-0 rounded-full lg:rounded-none px-3 lg:px-0 py-1 lg:py-0`,
      qtyButton: `w-6 h-6 lg:h-8 lg:w-8 flex items-center justify-center text-slate-500 lg:border lg:border-[#E8E0F0] lg:bg-white lg:rounded-md lg:hover:border-[#7C3AED] lg:hover:text-[#7C3AED] active:scale-75 transition-transform lg:transition-colors`,
      qtyValue: `text-xs lg:text-base font-heading text-slate-900 lg:font-bold lg:w-4 lg:text-center`,
      // Desktop column for qty and price
      qtyPriceWrap: `hidden lg:flex lg:flex-col lg:items-end lg:gap-3 lg:min-w-[120px]`,
      remove: `hidden lg:block lg:text-xs lg:uppercase lg:font-bold lg:text-red-500 lg:hover:underline lg:tracking-widest`,
      // Mobile-only expandable section
      expandSection: `group lg:hidden`,
      expandSummary: `list-none flex items-center justify-center py-2 border-t border-slate-100 cursor-pointer`,
      expandLabel: `text-[10px] font-heading text-slate-400 tracking-widest`,
      expandIcon: `ml-2 text-xs text-slate-400 group-open:rotate-180 transition-transform`,
      expandBody: `pt-2 pb-1 flex flex-col gap-2`,
      expandRow: `flex justify-between text-[11px]`,
      expandKey: `text-slate-400`,
      expandVal: `text-slate-700 font-medium`,
      // Desktop-only chips row
      chipsRow: `hidden lg:flex lg:flex-wrap lg:gap-4 lg:text-sm lg:font-bold lg:mt-4`,
      chip: `lg:px-2 lg:py-1 lg:bg-gray-100 lg:rounded lg:text-slate-700`,
    },
    promo: {
      container: `mt-8 lg:hidden relative z-10`,
      row: `flex gap-2`,
      input: `flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs font-heading tracking-widest focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-colors uppercase placeholder:text-slate-400`,
      button: `bg-slate-900 text-white font-heading text-[10px] px-6 py-2.5 rounded-xl uppercase tracking-widest active:scale-95 transition-transform hover:bg-slate-800`,
    },
    summary: {
      // Mobile: solid white card, Desktop: glass effect sticky sidebar
      container: `mt-8 lg:mt-0 bg-white/95 backdrop-blur-none rounded-2xl lg:rounded-lg p-6 lg:p-8 border border-slate-200/80 shadow-sm lg:sticky lg:top-32 lg:bg-white/75 lg:backdrop-blur-md lg:border-white/30 lg:shadow-md relative z-10`,
      title: `hidden lg:block lg:text-2xl lg:font-heading lg:font-bold lg:uppercase lg:tracking-tight lg:mb-8`,
      rows: `flex flex-col gap-3 lg:space-y-4 lg:mb-8`,
      row: `flex justify-between items-center lg:text-base`,
      rowLabel: `text-xs lg:text-base font-heading lg:font-bold text-slate-400 lg:text-slate-500 lg:uppercase lg:tracking-wider`,
      rowValue: `text-sm lg:text-base font-heading lg:font-bold text-slate-900 uppercase`,
      freeValue: `text-sm lg:text-base font-heading lg:font-bold text-emerald-500 lg:text-green-600 uppercase`,
      taxLabel: `flex items-center gap-1`,
      taxValue: `text-[10px] lg:text-xs font-heading text-slate-400 uppercase italic`,
      divider: `h-px bg-slate-100 lg:bg-gray-100 my-2 lg:my-0`,
      totalRow: `flex justify-between items-baseline lg:border-t lg:border-gray-100 lg:pt-4 lg:mt-4`,
      totalLabel: `text-lg lg:text-xl font-heading lg:font-extrabold text-slate-900 lg:uppercase lg:tracking-tight`,
      totalValue: `text-2xl lg:text-3xl font-heading lg:font-extrabold text-purple-600 lg:text-[#7C3AED]`,
      // Desktop checkout button (in summary card)
      checkoutButton: `hidden lg:flex lg:w-full lg:py-5 lg:bg-gradient-to-br lg:from-[#7C3AED] lg:to-[#06B6D4] lg:text-white lg:font-heading lg:font-extrabold lg:uppercase lg:tracking-widest lg:rounded-lg lg:shadow-xl lg:hover:scale-[1.02] lg:active:scale-[0.98] lg:transition-all lg:items-center lg:justify-center lg:gap-3 lg:mt-6`,
      secureText: `hidden lg:block lg:text-xs lg:text-center lg:text-slate-400 lg:font-bold lg:uppercase lg:tracking-widest lg:leading-relaxed lg:mt-3`,
      arrivalWrap: `hidden lg:block lg:mt-10 lg:p-4 lg:bg-white/50 lg:rounded-lg lg:border lg:border-dashed lg:border-gray-200`,
      arrivalHeader: `lg:flex lg:items-center lg:gap-3 lg:mb-2`,
      arrivalLabel: `lg:text-xs lg:font-bold lg:uppercase lg:tracking-widest`,
      arrivalValue: `lg:text-sm lg:font-medium lg:text-slate-600`,
    },
    continueLink: `mt-8 mb-4 lg:mt-6 text-center lg:text-left block text-[10px] lg:text-sm font-heading text-slate-400 tracking-[0.2em] lg:tracking-normal uppercase hover:text-purple-600 lg:hover:underline transition-colors underline lg:no-underline underline-offset-4 decoration-slate-200 relative z-10`,
    cta: {
      // Mobile only: fixed bottom bar with more solid background
      bar: `fixed bottom-0 left-0 right-0 p-6 pb-10 bg-white/95 backdrop-blur-sm border-t border-slate-200 lg:hidden z-50`,
      button: `w-full h-16 flex items-center justify-center text-white font-heading text-sm tracking-widest gap-3 rounded-2xl active:scale-[0.98] transition-all bg-gradient-to-br from-purple-600 to-cyan-500 shadow-[0_8px_25px_-10px_rgba(124,58,237,0.6)] hover:shadow-[0_12px_30px_-10px_rgba(124,58,237,0.7)]`,
    },
    actions: {
      row: `hidden lg:flex lg:flex-col sm:flex-row lg:items-center lg:gap-4 lg:mt-6`,
      continueLink: `lg:w-full sm:w-auto lg:px-8 lg:py-4 lg:border-2 lg:border-gray-200 lg:hover:border-[#7C3AED] lg:hover:text-[#7C3AED] lg:font-bold lg:uppercase lg:tracking-widest lg:text-sm lg:rounded-lg lg:transition-soft lg:inline-flex lg:items-center lg:justify-center lg:gap-2`,
    },
    empty: {
      container: `flex flex-col items-center justify-center min-h-[400px] text-center px-4`,
      iconWrap: `w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6`,
      title: `text-5xl font-heading text-slate-900`,
      description: `text-lg text-slate-600 mt-2 mb-8 max-w-md`,
      action: `px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity`,
    },
  },

  // Orders page styles
  orders: {
    header: {
      container: `mb-10`,
      title: `text-6xl md:text-8xl font-heading text-slate-900 leading-none mb-4`,
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
      container: `px-8 py-6 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between -mt-4 pt-8 -z-1 rounded-lg`,
      info: `text-xs text-slate-400 font-medium font-accent italic`,
      controls: `flex items-center gap-2`,
      button: `w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 hover:text-slate-900 transition-colors disabled:opacity-50`,
      pageButton: `w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-xs text-slate-600 hover:border-[#7C3AED] transition-all`,
      pageButtonActive: `w-8 h-8 flex items-center justify-center rounded bg-[#7C3AED] text-white text-xs font-bold`,
    },
    mobileCard: {
      container: `glass-card rounded-xl overflow-hidden p-5 border border-white/60`,
      header: `flex justify-between items-start mb-2`,
      orderNumber: `font-bold text-slate-900 text-sm`,
      orderDate: `text-[10px] text-slate-400 mt-0.5`,
      infoRow: `flex items-center justify-between py-2 border-y border-slate-100/50`,
      itemsStack: `flex -space-x-4 overflow-hidden`,
      priceText: `font-bold text-slate-900 text-base leading-none mb-1`,
      itemCount: `text-xs font-bold text-slate-400 uppercase tracking-tight`,
      deliveryWrap: `flex items-center gap-1.5 mt-0.5`,
      deliveryText: `text-xs text-slate-500 font-medium italic`,
      actions: `grid grid-cols-2 gap-1 mt-3`,
      viewButton: `h-11 bg-[#7C3AED] text-white text-[10px] font-bold rounded-lg active:scale-95 transition-all uppercase tracking-widest`,
      reorderButton: `h-11 bg-white border border-slate-200 text-slate-600 text-[10px] font-bold rounded-lg active:scale-95 transition-all uppercase tracking-widest`,
    },
    mobileFilters: {
      container: `glass-card rounded-xl p-5 mb-6 space-y-4 border border-white/60 md:hidden`,
      sectionLabel: `text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2`,
      selectWrapper: `relative`,
      select: `w-full px-4 py-2 bg-white/50 border border-slate-200 rounded text-xs font-bold text-slate-700 focus:ring-2 focus:ring-[#7C3AED]/20 outline-none appearance-none cursor-pointer`,
      chipsRow: `flex gap-2 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x`,
      chipBase: `shrink-0 snap-start px-4 py-1.5 rounded-full text-[10px] font-bold border border-slate-200 bg-white/50`,
      chipActive: `shrink-0 snap-start px-4 py-1.5 rounded-full text-[10px] font-bold border bg-[#7C3AED] text-white border-[#7C3AED]`,
    },
    mobilePagination: {
      container: `mt-4 flex items-center justify-between glass-card rounded-xl p-2.5 md:hidden`,
      info: `text-[10px] text-slate-400 font-medium italic`,
      controls: `flex items-center gap-2`,
      navButton: `w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-slate-400 disabled:opacity-50`,
      pageButtonActive: `w-8 h-8 flex items-center justify-center rounded bg-[#7C3AED] text-white text-[10px] font-bold`,
      pageButton: `w-8 h-8 flex items-center justify-center rounded border border-slate-200 text-[10px] text-slate-600`,
    },
    sideBorders: {
      container: `flowing-border-container`,
      left: `side-border-left hidden xl:block`,
      right: `side-border-right hidden xl:block`,
    },
  },

  // Checkout page styles
  checkout: {
    page: {
      container: "min-h-screen relative rounded-2xl pb-8",
      mainContent: "max-w-360 mx-auto pb-16",
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
        title: "text-sm font-heading tracking-[0.15em] text-slate-500 uppercase",
        total: "text-lg font-heading text-slate-900",
        chevron: "w-4 h-4 text-slate-400 transition-transform duration-300",
        body: "px-5 pb-4 border-t border-slate-100",
      },
      stepCard: {
        base: "glass-card rounded-2xl overflow-hidden transition-all duration-300 border",
        active: "border-[#7C3AED] shadow-[0_0_0_1px_#7C3AED]",
        complete: "border-emerald-400",
        incomplete: "border-slate-200",
      },
      stepHeader: {
        wrapper: "w-full flex items-center justify-start gap-3 px-5 py-4 h-auto",
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
      container: `flex-grow w-full max-w-7xl mx-auto pt-32 pb-24 px-12 md:px-24`,
    },
    header: {
      card: `glass-card p-10 mb-10 rounded-3xl`,
      title: `text-5xl font-heading text-slate-900 mb-4 leading-none tracking-tight`,
      decorativeWrap: `flex items-center gap-4`,
      accentBar: `h-1 w-16 bg-linear-to-r from-[#7C3AED] via-[#4F46E5] to-[#06B6D4] rounded-sm`,
      description: `italic text-slate-500 font-medium`,
    },
    section: {
      card: `glass-card p-8 rounded-3xl`,
      header: `flex justify-between items-start mb-10`,
      iconTitleWrap: `flex gap-5`,
      iconBox: `w-14 h-14 bg-white shadow-sm border border-slate-100 rounded-2xl flex items-center justify-center text-slate-500`,
      titleWrap: `flex flex-col`,
      title: `text-xl font-bold text-slate-900 leading-tight uppercase tracking-tight`,
      subtitle: `text-slate-500 text-sm`,
      editButton: `px-6 py-2 border border-slate-200 text-slate-600 font-bold uppercase tracking-widest text-[10px] rounded-lg hover:bg-white hover:border-slate-300 transition-all`,
    },
    personalInfo: {
      grid: `grid grid-cols-1 md:grid-cols-2 gap-8`,
      fieldWrap: `space-y-2`,
      fullWidth: `md:col-span-2 space-y-2`,
      label: `text-[10px] font-bold uppercase tracking-widest text-slate-400`,
      input: `w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:border-[#7C3AED] focus:outline-none focus:ring-4 focus:ring-[#7C3AED]/10 transition-all`,
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
    imageWrapper: `bg-linear-to-br from-gray-50/50 via-slate-50/50 to-gray-100/50 dark:from-gray-800/80 dark:via-slate-800/30 dark:to-gray-800/30 backdrop-blur-sm border border-gray-200 dark:border-gray-800/30 rounded-2xl overflow-hidden shadow-2xl shadow-slate-500/20 dark:shadow-slate-500/10`,
    image: `w-full h-auto object-contain max-h-[300px] sm:max-h-none`,
    buttonsContainer: `max-w-4xl mx-auto`,
    buttonsGrid: `grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6`,
    button: `w-full h-12 sm:h-14 text-base sm:text-lg font-semibold`,
    checkoutButton: `w-full h-12 sm:h-14 text-base sm:text-lg font-semibold shadow-xl shadow-purple-500/40 hover:-translate-y-0.5 hover:shadow-2xl transition-all duration-300`,
    icon: `w-5 h-5`,
  },

  // Mobile page header (back button + title + description)
  mobilePageHeader: {
    root: `md:hidden mb-6 bg-white/75 backdrop-blur-md border border-white/30 shadow-md rounded-xl`,
    inner: `mt-6 px-6 pb-6 flex flex-col gap-3`,
    row: `flex items-center gap-4`,
    backButton: `flex items-center justify-center w-10 h-10 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 transition-colors shrink-0 bg-transparent`,
    title: `text-4xl font-normal font-heading text-slate-900 tracking-wide`,
    descriptionRow: `flex items-center gap-4`,
    gradientBar: `h-1.5 w-24 bg-linear-to-r from-[#7C3AED] via-[#4F46E5] to-[#06B6D4] rounded-sm shadow-sm shrink-0`,
    description: `text-md leading-relaxed max-w-2xl font-accent text-purple-950`,
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

// Utility functions
export const getButtonVariant = (variant: keyof typeof componentThemes.button) =>
  componentThemes.button[variant];

export const getCardVariant = (variant: keyof typeof componentThemes.card) =>
  componentThemes.card[variant];

export const getTextVariant = (variant: keyof typeof componentThemes.text) =>
  componentThemes.text[variant];

export const combineClasses = (...classes: string[]) =>
  classes.filter(Boolean).join(' ');